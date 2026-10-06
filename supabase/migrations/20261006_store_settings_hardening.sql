-- Harden store settings: never persist SMTP credentials in the application database.
-- Settings are admin-only and SMTP secrets must remain server-side environment variables.

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
