-- Inventory and guest/WhatsApp order foundation.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;

ALTER TABLE products
  ADD CONSTRAINT products_stock_quantity_nonnegative
  CHECK (stock_quantity >= 0);

ALTER TABLE products
  ADD CONSTRAINT products_low_stock_threshold_nonnegative
  CHECK (low_stock_threshold >= 0);

ALTER TABLE orders
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS checkout_token UUID DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_checkout_token
  ON orders(checkout_token);

DROP INDEX IF EXISTS idx_orders_user_idempotency_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_inventory
  ON products(track_inventory, stock_quantity);

CREATE OR REPLACE FUNCTION create_order_atomic(
  p_items JSONB,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_idempotency_key UUID
)
RETURNS TABLE (id UUID, total NUMERIC, status TEXT, created_at TIMESTAMPTZ, checkout_token UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_id UUID;
  v_checkout_token UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_quantity INTEGER;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN RAISE EXCEPTION 'At least one order item is required'; END IF;
  IF p_payment_method NOT IN ('cash_on_delivery', 'mpesa', 'card') THEN RAISE EXCEPTION 'Invalid payment method'; END IF;
  IF p_idempotency_key IS NULL THEN RAISE EXCEPTION 'Idempotency key is required'; END IF;

  SELECT o.id, o.total, o.status, o.created_at, o.checkout_token
    INTO id, total, status, created_at, checkout_token
    FROM orders o WHERE o.idempotency_key = p_idempotency_key LIMIT 1;
  IF FOUND THEN RETURN NEXT; RETURN; END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 100 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;

    SELECT p.id, p.name, p.price, p.images, p.status, p.track_inventory, p.stock_quantity
      INTO v_product
      FROM products p
      WHERE p.id = (v_item->>'productId')::UUID AND p.status = 'active'
      FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'Product is unavailable'; END IF;
    IF v_product.price IS NULL OR v_product.price < 0 THEN RAISE EXCEPTION 'Invalid product price'; END IF;
    IF v_product.track_inventory AND v_product.stock_quantity < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock';
    END IF;
    v_total := v_total + (v_product.price * v_quantity);
  END LOOP;

  v_total := round(v_total, 2);

  INSERT INTO orders (user_id, customer_email, total, status, shipping_address, payment_method, idempotency_key)
  VALUES (v_user_id, NULLIF(p_shipping_address->>'email','')::TEXT, v_total, 'pending', p_shipping_address, p_payment_method, p_idempotency_key)
  RETURNING orders.id, orders.checkout_token INTO v_order_id, v_checkout_token;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT p.id, p.name, p.price, p.images, p.track_inventory
      INTO v_product
      FROM products p WHERE p.id = (v_item->>'productId')::UUID FOR UPDATE;

    v_quantity := (v_item->>'quantity')::INTEGER;

    INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, attributes)
    VALUES (
      v_order_id, v_product.id, v_product.name,
      CASE WHEN jsonb_typeof(to_jsonb(v_product.images)) = 'array' THEN to_jsonb(v_product.images)->>0 ELSE NULL END,
      v_quantity, v_product.price, COALESCE(v_item->'attributes', '{}'::JSONB)
    );

    IF v_product.track_inventory THEN
      UPDATE products SET stock_quantity = stock_quantity - v_quantity, updated_at = NOW()
      WHERE id = v_product.id;
    END IF;
  END LOOP;

  RETURN QUERY SELECT o.id, o.total, o.status, o.created_at, o.checkout_token FROM orders o WHERE o.id = v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_guest_order_atomic(
  p_items JSONB,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_idempotency_key UUID
)
RETURNS TABLE (id UUID, total NUMERIC, status TEXT, created_at TIMESTAMPTZ, checkout_token UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_checkout_token UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_quantity INTEGER;
  v_email TEXT := lower(trim(p_shipping_address->>'email'));
BEGIN
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN RAISE EXCEPTION 'At least one order item is required'; END IF;
  IF p_payment_method <> 'mpesa' THEN RAISE EXCEPTION 'Invalid payment method'; END IF;
  IF p_idempotency_key IS NULL THEN RAISE EXCEPTION 'Idempotency key is required'; END IF;
  IF v_email = '' OR v_email IS NULL THEN RAISE EXCEPTION 'Email is required'; END IF;

  SELECT o.id, o.total, o.status, o.created_at, o.checkout_token
    INTO id, total, status, created_at, checkout_token
    FROM orders o WHERE o.idempotency_key = p_idempotency_key LIMIT 1;
  IF FOUND THEN RETURN NEXT; RETURN; END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 100 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;

    SELECT p.id, p.name, p.price, p.images, p.status, p.track_inventory, p.stock_quantity
      INTO v_product
      FROM products p WHERE p.id = (v_item->>'productId')::UUID AND p.status = 'active' FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'Product is unavailable'; END IF;
    IF v_product.price IS NULL OR v_product.price < 0 THEN RAISE EXCEPTION 'Invalid product price'; END IF;
    IF v_product.track_inventory AND v_product.stock_quantity < v_quantity THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
    v_total := v_total + (v_product.price * v_quantity);
  END LOOP;

  v_total := round(v_total, 2);

  INSERT INTO orders (user_id, customer_email, total, status, shipping_address, payment_method, idempotency_key)
  VALUES (NULL, v_email, v_total, 'pending', p_shipping_address, 'mpesa', p_idempotency_key)
  RETURNING orders.id, orders.checkout_token INTO v_order_id, v_checkout_token;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT p.id, p.name, p.price, p.images, p.track_inventory
      INTO v_product
      FROM products p WHERE p.id = (v_item->>'productId')::UUID FOR UPDATE;
    v_quantity := (v_item->>'quantity')::INTEGER;

    INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, attributes)
    VALUES (
      v_order_id, v_product.id, v_product.name,
      CASE WHEN jsonb_typeof(to_jsonb(v_product.images)) = 'array' THEN to_jsonb(v_product.images)->>0 ELSE NULL END,
      v_quantity, v_product.price, COALESCE(v_item->'attributes', '{}'::JSONB)
    );

    IF v_product.track_inventory THEN
      UPDATE products SET stock_quantity = stock_quantity - v_quantity, updated_at = NOW()
      WHERE id = v_product.id;
    END IF;
  END LOOP;

  RETURN QUERY SELECT o.id, o.total, o.status, o.created_at, o.checkout_token FROM orders o WHERE o.id = v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION create_guest_order_atomic(JSONB, JSONB, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_guest_order_atomic(JSONB, JSONB, TEXT, UUID) TO service_role;
