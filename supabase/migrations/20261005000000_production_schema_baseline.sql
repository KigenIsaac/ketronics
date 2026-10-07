-- Production schema reconciliation baseline.
-- The production project predates the repository migration history. This migration
-- upgrades the existing schema in-place, preserving existing catalog/content/users.
-- It intentionally runs before the 20261006+ hardening/commerce migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles: fields required by the current application/security model.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;
UPDATE public.profiles SET preferences = '{}'::jsonb WHERE preferences IS NULL;

-- Products: current catalog lifecycle + inventory model.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;

UPDATE public.products SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE public.products SET track_inventory = false WHERE track_inventory IS NULL;
UPDATE public.products SET stock_quantity = 0 WHERE stock_quantity IS NULL;
UPDATE public.products SET low_stock_threshold = 5 WHERE low_stock_threshold IS NULL;

-- Inventory constraints are added by the canonical 20261006 inventory migration.
-- Keeping them there avoids duplicate-constraint failures when this baseline
-- is followed by the normal migration chain.

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_inventory ON public.products(track_inventory, stock_quantity);

-- Dynamic subcategory attributes used by the current admin/catalog UI.
ALTER TABLE public.subcategory_attributes
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS options TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS display_in_card BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subcategory_id UUID;

UPDATE public.subcategory_attributes
SET type = 'text' WHERE type IS NULL;
UPDATE public.subcategory_attributes
SET options = ARRAY[]::TEXT[] WHERE options IS NULL;
UPDATE public.subcategory_attributes
SET display_in_card = false WHERE display_in_card IS NULL;

CREATE INDEX IF NOT EXISTS idx_subcategory_attributes_subcategory_id
  ON public.subcategory_attributes(subcategory_id);

-- Orders required by checkout, payments, inventory and admin workflows.
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  customer_email TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  idempotency_key UUID,
  checkout_token UUID DEFAULT gen_random_uuid(),
  inventory_released_at TIMESTAMPTZ,
  tracking_number TEXT,
  shipping_carrier TEXT,
  estimated_delivery TEXT,
  notes TEXT,
  shipped_date TIMESTAMPTZ,
  delivered_date TIMESTAMPTZ,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS total NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'mpesa',
  ADD COLUMN IF NOT EXISTS idempotency_key UUID,
  ADD COLUMN IF NOT EXISTS checkout_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS inventory_released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_checkout_token
  ON public.orders(checkout_token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON public.orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Order items required by checkout and order display.
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_image TEXT,
  ADD COLUMN IF NOT EXISTS attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Payment records required by Stripe/M-Pesa flows.
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  transaction_id TEXT,
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  phone_number TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS order_id UUID,
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'requested',
  ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS merchant_request_id TEXT,
  ADD COLUMN IF NOT EXISTS checkout_request_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Order history and shipping events used by current admin/callback flows.
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON public.order_status_history(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.shipping_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  carrier TEXT,
  estimated_delivery TEXT,
  signature TEXT,
  photos JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_updates_order_id
  ON public.shipping_updates(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipping_updates_tracking_number
  ON public.shipping_updates(tracking_number);

-- Preserve the old content tables and make their common lookup indexes explicit.
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON public.page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
