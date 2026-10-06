-- Harden store settings: never persist SMTP credentials in the application database.
-- Settings are admin-only and SMTP secrets must remain server-side environment variables.

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

ALTER TABLE public.store_settings
  DROP COLUMN IF EXISTS smtp_host,
  DROP COLUMN IF EXISTS smtp_port,
  DROP COLUMN IF EXISTS smtp_user,
  DROP COLUMN IF EXISTS smtp_password;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can view store settings" ON public.store_settings;
CREATE POLICY "Managers can view store settings"
  ON public.store_settings
  FOR SELECT
  TO authenticated
  USING (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can update store settings" ON public.store_settings;
CREATE POLICY "Managers can update store settings"
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

REVOKE ALL ON TABLE public.store_settings FROM anon;
REVOKE ALL ON TABLE public.store_settings FROM PUBLIC;
GRANT SELECT, UPDATE ON TABLE public.store_settings TO authenticated;
