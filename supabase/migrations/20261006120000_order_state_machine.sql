-- Central order state machine. All administrative status changes go through one
-- locked transition so concurrent requests cannot bypass transition rules.

CREATE OR REPLACE FUNCTION public.transition_order_status(
  p_order_id UUID,
  p_next_status TEXT,
  p_tracking_number TEXT DEFAULT NULL,
  p_carrier TEXT DEFAULT NULL,
  p_estimated_delivery TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(previous_status TEXT, next_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current TEXT;
BEGIN
  SELECT status
    INTO v_current
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF p_next_status = v_current THEN
    RETURN QUERY SELECT v_current, v_current;
    RETURN;
  END IF;

  IF NOT (
    (v_current = 'pending' AND p_next_status IN ('confirmed', 'cancelled'))
    OR (v_current = 'confirmed' AND p_next_status IN ('processing', 'cancelled'))
    OR (v_current = 'processing' AND p_next_status IN ('shipped', 'cancelled'))
    OR (v_current = 'paid' AND p_next_status IN ('processing', 'cancelled', 'refunded'))
    OR (v_current = 'shipped' AND p_next_status = 'delivered')
    OR (v_current = 'delivered' AND p_next_status = 'returned')
    OR (v_current = 'cancelled' AND p_next_status = 'refunded')
  ) THEN
    RAISE EXCEPTION 'Invalid order transition from % to %', v_current, p_next_status;
  END IF;

  UPDATE public.orders
  SET status = p_next_status,
      tracking_number = COALESCE(p_tracking_number, tracking_number),
      shipping_carrier = COALESCE(p_carrier, shipping_carrier),
      estimated_delivery = COALESCE(p_estimated_delivery, estimated_delivery),
      notes = COALESCE(p_notes, notes),
      shipped_date = CASE WHEN p_next_status = 'shipped' THEN NOW() ELSE shipped_date END,
      delivered_date = CASE WHEN p_next_status = 'delivered' THEN NOW() ELSE delivered_date END,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.order_status_history (
    order_id, status, tracking_number, carrier, notes, created_at
  )
  VALUES (
    p_order_id, p_next_status, p_tracking_number, p_carrier, p_notes, NOW()
  );

  IF p_next_status = 'cancelled' THEN
    PERFORM public.release_order_inventory(p_order_id);
  END IF;

  RETURN QUERY SELECT v_current, p_next_status;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_order_status(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_order_status(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
