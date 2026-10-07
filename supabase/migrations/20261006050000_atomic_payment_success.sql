-- Generic atomic payment-success transition for providers that have already
-- independently verified the provider event and amount.

CREATE OR REPLACE FUNCTION public.apply_payment_success(
  p_payment_id UUID,
  p_transaction_id TEXT,
  p_status TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_metadata JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_order_status TEXT;
BEGIN
  IF p_status NOT IN ('success', 'completed') THEN
    RAISE EXCEPTION 'Invalid successful payment status';
  END IF;

  SELECT id, order_id, status
    INTO v_payment
    FROM public.payments
    WHERE id = p_payment_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  IF v_payment.status NOT IN ('requested', 'pending', 'success', 'completed') THEN
    RETURN FALSE;
  END IF;

  SELECT status
    INTO v_order_status
    FROM public.orders
    WHERE id = v_payment.order_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order_status IN ('cancelled', 'refunded', 'returned') THEN
    RAISE EXCEPTION 'Cannot mark a cancelled or closed order as paid';
  END IF;

  UPDATE public.payments
  SET status = p_status,
      transaction_id = p_transaction_id,
      amount = p_amount,
      currency = p_currency,
      metadata = COALESCE(p_metadata, '{}'::jsonb),
      updated_at = NOW()
  WHERE id = v_payment.id;

  UPDATE public.orders
  SET status = 'paid',
      payment_date = NOW(),
      updated_at = NOW()
  WHERE id = v_payment.order_id
    AND status <> 'paid';

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_payment_success(UUID, TEXT, TEXT, NUMERIC, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_payment_success(UUID, TEXT, TEXT, NUMERIC, TEXT, JSONB) TO service_role;
