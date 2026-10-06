-- Safely return reserved stock when an unpaid order fails or is cancelled.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS inventory_released_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION release_order_inventory(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_released_at TIMESTAMPTZ;
  v_status TEXT;
  v_item RECORD;
BEGIN
  SELECT inventory_released_at, status
    INTO v_released_at, v_status
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_released_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  -- Only unpaid reservations may be returned automatically.
  IF v_status NOT IN ('pending', 'cancelled') THEN
    RETURN FALSE;
  END IF;

  FOR v_item IN
    SELECT oi.product_id, oi.quantity, p.track_inventory
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
    FOR UPDATE OF p
  LOOP
    IF v_item.track_inventory THEN
      UPDATE products
      SET stock_quantity = stock_quantity + v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.product_id;
    END IF;
  END LOOP;

  UPDATE orders
  SET inventory_released_at = NOW(), updated_at = NOW()
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION release_order_inventory(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION release_order_inventory(UUID) TO service_role;
