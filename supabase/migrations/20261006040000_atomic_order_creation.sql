-- Atomic and idempotent order creation for checkout.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_user_idempotency_key
  ON orders(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
-- Run this migration in the production Supabase database before deploying
-- the corresponding application endpoint.

CREATE OR REPLACE FUNCTION create_order_atomic(
  p_items JSONB,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_idempotency_key UUID
)
RETURNS TABLE (
  id UUID,
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_id UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_quantity INTEGER;
  v_price NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  IF p_payment_method NOT IN ('cash_on_delivery', 'mpesa', 'card') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'Idempotency key is required';
  END IF;

  SELECT o.id, o.total, o.status, o.created_at
    INTO id, total, status, created_at
    FROM orders o
   WHERE o.user_id = v_user_id
     AND o.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN NEXT;
    RETURN;
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;

    IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 100 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT p.id, p.name, p.price, p.images, p.status
      INTO v_product
      FROM products p
     WHERE p.id = (v_item->>'productId')::UUID
       AND status = 'active';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product is unavailable';
    END IF;

    v_price := v_product.price;

    IF v_price IS NULL OR v_price < 0 THEN
      RAISE EXCEPTION 'Invalid product price';
    END IF;

    v_total := v_total + (v_price * v_quantity);
  END LOOP;

  v_total := round(v_total, 2);

  BEGIN
    INSERT INTO orders (
      user_id,
      total,
      status,
      shipping_address,
      payment_method,
      idempotency_key
    )
    VALUES (
      v_user_id,
      v_total,
      'pending',
      p_shipping_address,
      p_payment_method,
      p_idempotency_key
    )
    RETURNING orders.id INTO v_order_id;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT o.id, o.total, o.status, o.created_at
        INTO id, total, status, created_at
        FROM orders o
       WHERE o.user_id = v_user_id
         AND o.idempotency_key = p_idempotency_key;

      IF FOUND THEN
        RETURN NEXT;
        RETURN;
      END IF;

      RAISE;
  END;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT p.id, p.name, p.price, p.images
      INTO v_product
      FROM products p
     WHERE p.id = (v_item->>'productId')::UUID
       AND status = 'active';

    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      product_image,
      quantity,
      price,
      attributes
    )
    VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      CASE
        WHEN jsonb_typeof(to_jsonb(v_product.images)) = 'array'
          THEN to_jsonb(v_product.images)->>0
        ELSE NULL
      END,
      (v_item->>'quantity')::INTEGER,
      v_product.price,
      COALESCE(v_item->'attributes', '{}'::JSONB)
    );
  END LOOP;

  RETURN QUERY
  SELECT o.id, o.total, o.status, o.created_at
    FROM orders o
   WHERE o.id = v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION create_order_atomic(JSONB, JSONB, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order_atomic(JSONB, JSONB, TEXT, UUID) TO authenticated;
