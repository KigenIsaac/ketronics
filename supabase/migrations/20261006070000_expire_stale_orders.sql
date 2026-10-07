-- Automatically expire stale unpaid orders so inventory reservations cannot live forever.
-- The job is intentionally service-role only and is safe to run repeatedly.

CREATE OR REPLACE FUNCTION public.expire_stale_pending_orders(
  p_max_age_minutes INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_order_id UUID;
BEGIN
  IF p_max_age_minutes < 5 OR p_max_age_minutes > 1440 THEN
    RAISE EXCEPTION 'Invalid pending-order age';
  END IF;

  FOR v_order_id IN
    SELECT id
    FROM public.orders
    WHERE status = 'pending'
      AND inventory_released_at IS NULL
      AND created_at < NOW() - make_interval(mins => p_max_age_minutes)
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.orders
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = v_order_id
      AND status = 'pending';

    IF FOUND AND public.release_order_inventory(v_order_id) THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_pending_orders(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_stale_pending_orders(INTEGER) TO service_role;
