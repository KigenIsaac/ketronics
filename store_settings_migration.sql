-- LEGACY COMPATIBILITY SCRIPT
-- Canonical migrations live under supabase/migrations/.
-- This file is retained for older deployments that still execute it manually.
-- SMTP credentials are intentionally not stored in the database.

CREATE TABLE IF NOT EXISTS public.store_settings (
  id SERIAL PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT 'Ketronics LTD',
  store_description TEXT NOT NULL DEFAULT 'Tech Products & Expert Services',
  contact_email TEXT NOT NULL DEFAULT 'support@ketronics.co.ke',
  contact_phone TEXT,
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'KES',
  timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  allow_guest_checkout BOOLEAN NOT NULL DEFAULT true,
  require_email_verification BOOLEAN NOT NULL DEFAULT true,
  enable_notifications BOOLEAN NOT NULL DEFAULT true,
  payment_methods TEXT[] NOT NULL DEFAULT ARRAY['mpesa', 'card'],
  shipping_methods TEXT[] NOT NULL DEFAULT ARRAY['standard', 'express'],
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 16.00,
  free_shipping_threshold DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.store_settings (
  id, store_name, store_description, contact_email, contact_phone, address,
  currency, timezone, maintenance_mode, allow_guest_checkout,
  require_email_verification, enable_notifications, payment_methods,
  shipping_methods, tax_rate, free_shipping_threshold
)
VALUES (
  1, 'Ketronics LTD', 'Tech Products & Expert Services', 'info@ketronics.co.ke',
  '+254 XXX XXX XXX', 'AA building 1st floor room F6A', 'KES', 'Africa/Nairobi',
  false, true, true, true, ARRAY['mpesa', 'card'], ARRAY['standard', 'express'],
  16.00, 5000.00
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can view store settings" ON public.store_settings;
CREATE POLICY "Managers can view store settings"
  ON public.store_settings FOR SELECT TO authenticated
  USING (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can update store settings" ON public.store_settings;
CREATE POLICY "Managers can update store settings"
  ON public.store_settings FOR UPDATE TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());
