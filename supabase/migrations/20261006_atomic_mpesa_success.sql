-- Make successful M-Pesa payment application atomic across payment and order state.
-- Provider verification happens in the API layer; this function owns the financial state transition.

CREATE OR REPLACE FUNCTION public.apply_mpesa_success(
  p_payment_id UUID,
  p_transaction_id TEXT,
  p_phone_number TEXT,
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
  SELECT id, order_id, status
    INTO v_payment
    FROM public.payments
    WHERE id = p_payment_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  IF v_payment.status NOT IN ('requested', 'pending', 'success') THEN
    RETURN FALSE;
  END IF;

  IF v_payment.order_id IS NULL THEN
    RAISE EXCEPTION 'Payment is not attached to an order';
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
  SET status = 'success',
      transaction_id = p_transaction_id,
      phone_number = p_phone_number,
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

REVOKE ALL ON FUNCTION public.apply_mpesa_success(UUID, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_mpesa_success(UUID, TEXT, TEXT, JSONB) TO service_role;
