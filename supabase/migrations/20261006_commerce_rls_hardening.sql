-- Lock down core commerce tables while preserving the existing browser flows.
-- Business mutations happen through SECURITY DEFINER functions/server APIs.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategory_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Managers can manage products" ON public.products;
CREATE POLICY "Managers can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can manage categories" ON public.categories;
CREATE POLICY "Managers can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Public can view subcategories" ON public.subcategories;
CREATE POLICY "Public can view subcategories"
  ON public.subcategories
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can manage subcategories" ON public.subcategories;
CREATE POLICY "Managers can manage subcategories"
  ON public.subcategories
  FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Public can view subcategory attributes" ON public.subcategory_attributes;
CREATE POLICY "Public can view subcategory attributes"
  ON public.subcategory_attributes
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can manage subcategory attributes" ON public.subcategory_attributes;
CREATE POLICY "Managers can manage subcategory attributes"
  ON public.subcategory_attributes
  FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_manager_or_admin());

-- Orders are read-only from the browser. Status/payment changes use server APIs and RPCs.
DROP POLICY IF EXISTS "Managers can manage orders" ON public.orders;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_manager_or_admin())
    )
  );

DROP POLICY IF EXISTS "Managers can manage order items" ON public.order_items;
CREATE POLICY "Managers can manage order items"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

-- Payment records contain provider identifiers and must never be exposed to the browser.
REVOKE ALL ON TABLE public.payments FROM PUBLIC;
REVOKE ALL ON TABLE public.payments FROM anon;
REVOKE ALL ON TABLE public.payments FROM authenticated;
