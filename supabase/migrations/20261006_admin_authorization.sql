-- Centralize manager/admin authorization and prevent customer self-promotion.
-- Safe to run against an existing database: policies are replaced by name.

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('manager', 'admin')
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_manager_or_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin() TO authenticated;

-- Replace recursive manager policies with the security-definer helper.
DROP POLICY IF EXISTS "Managers can manage pages" ON public.pages;
CREATE POLICY "Managers can manage pages" ON public.pages
  FOR ALL TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can manage page sections" ON public.page_sections;
CREATE POLICY "Managers can manage page sections" ON public.page_sections
  FOR ALL TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can manage FAQs" ON public.faqs;
CREATE POLICY "Managers can manage FAQs" ON public.faqs
  FOR ALL TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can manage contact info" ON public.contact_info;
CREATE POLICY "Managers can manage contact info" ON public.contact_info
  FOR ALL TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can manage site settings" ON public.site_settings;
CREATE POLICY "Managers can manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
CREATE POLICY "Managers can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Managers can update profiles" ON public.profiles;
CREATE POLICY "Managers can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

-- A customer may edit their own profile, but cannot use this policy to
-- grant themselves manager/admin privileges.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only active admins can change user roles';
    END IF;

    IF NEW.id = auth.uid() THEN
      RAISE EXCEPTION 'You cannot change your own role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_unauthorized_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_unauthorized_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_role_change();

REVOKE ALL ON FUNCTION public.prevent_unauthorized_role_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_unauthorized_role_change() TO authenticated;
