-- The shared payment transition supersedes the provider-specific implementation.
DROP FUNCTION IF EXISTS public.apply_mpesa_success(UUID, TEXT, TEXT, TEXT, JSONB);
