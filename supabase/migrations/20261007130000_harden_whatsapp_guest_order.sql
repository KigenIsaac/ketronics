-- Harden the guest order RPC used by WhatsApp checkout.
-- This is intentionally a new forward migration so production databases whose
-- migration history already contains the earlier RPC fix are rebuilt as well.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS checkout_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_image TEXT,
  ADD COLUMN IF NOT EXISTS attributes JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_checkout_token
  ON public.orders(checkout_token);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON public.orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_guest_order_atomic(
  p_items JSONB,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_idempotency_key UUID
)
RETURNS TABLE (
  id UUID,
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  checkout_token UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_quantity INTEGER;
  v_email TEXT := lower(trim(COALESCE(p_shipping_address->>'email', '')));
BEGIN
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  IF p_payment_method <> 'mpesa' THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'Idempotency key is required';
  END IF;

  IF v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Return an already-created order before touching inventory.
  SELECT o.id, o.total, o.status, o.created_at, o.checkout_token
    INTO id, total, status, created_at, checkout_token
    FROM public.orders AS o
   WHERE o.idempotency_key = p_idempotency_key
   LIMIT 1;

  IF FOUND THEN
    RETURN NEXT;
    RETURN;
  END IF;

  -- Lock and validate every product using explicit table qualification.
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;

    IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 100 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT p.id, p.name, p.price, p.images, p.status,
           p.track_inventory, p.stock_quantity
      INTO v_product
      FROM public.products AS p
     WHERE p.id = (v_item->>'productId')::UUID
       AND p.status = 'active'
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product is unavailable';
    END IF;

    IF v_product.price IS NULL OR v_product.price < 0 THEN
      RAISE EXCEPTION 'Invalid product price';
    END IF;

    IF v_product.track_inventory
       AND COALESCE(v_product.stock_quantity, 0) < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock';
    END IF;

    v_total := v_total + (v_product.price * v_quantity);
  END LOOP;

  v_total := round(v_total, 2);

  -- The unique idempotency index protects concurrent retries. If another
  -- request won the race, return that order and do not reserve inventory twice.
  INSERT INTO public.orders (
    user_id,
    customer_email,
    total,
    status,
    shipping_address,
    payment_method,
    idempotency_key
  )
  VALUES (
    NULL,
    v_email,
    v_total,
    'pending',
    p_shipping_address,
    'mpesa',
    p_idempotency_key
  )
  ON CONFLICT DO NOTHING
  RETURNING public.orders.id INTO v_order_id;

  IF v_order_id IS NULL THEN
    SELECT o.id, o.total, o.status, o.created_at, o.checkout_token
      INTO id, total, status, created_at, checkout_token
      FROM public.orders AS o
     WHERE o.idempotency_key = p_idempotency_key
     LIMIT 1;

    IF FOUND THEN
      RETURN NEXT;
      RETURN;
    END IF;

    RAISE EXCEPTION 'Unable to create order';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT p.id, p.name, p.price, p.images, p.track_inventory
      INTO v_product
      FROM public.products AS p
     WHERE p.id = (v_item->>'productId')::UUID
     FOR UPDATE;

    v_quantity := (v_item->>'quantity')::INTEGER;

    INSERT INTO public.order_items (
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
      v_quantity,
      v_product.price,
      COALESCE(v_item->'attributes', '{}'::JSONB)
    );

    IF v_product.track_inventory THEN
      UPDATE public.products AS p
         SET stock_quantity = p.stock_quantity - v_quantity,
             updated_at = NOW()
       WHERE p.id = v_product.id;
    END IF;
  END LOOP;

  RETURN QUERY
  SELECT o.id, o.total, o.status, o.created_at, o.checkout_token
    FROM public.orders AS o
   WHERE o.id = v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_guest_order_atomic(JSONB, JSONB, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_guest_order_atomic(JSONB, JSONB, TEXT, UUID) TO service_role;
