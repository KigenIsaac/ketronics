-- Restrict privileged-account activation changes to active admins.
-- Managers may still activate/deactivate customer accounts, but cannot
-- disable an existing manager/admin account through the browser profile policy.

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_staff_activation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active IS DISTINCT FROM OLD.is_active
     AND OLD.role IN ('manager', 'admin') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only active admins can change staff activation status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_unauthorized_staff_activation_change ON public.profiles;
CREATE TRIGGER prevent_unauthorized_staff_activation_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_staff_activation_change();

REVOKE ALL ON FUNCTION public.prevent_unauthorized_staff_activation_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_unauthorized_staff_activation_change() TO authenticated;
