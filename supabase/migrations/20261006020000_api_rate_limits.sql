-- Small database-backed rate limiter for public server endpoints.
-- It is intentionally callable only with the service role.

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.api_rate_limits FROM PUBLIC;
REVOKE ALL ON TABLE public.api_rate_limits FROM anon;
REVOKE ALL ON TABLE public.api_rate_limits FROM authenticated;

CREATE OR REPLACE FUNCTION public.consume_api_rate_limit(
  p_rate_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.api_rate_limits%ROWTYPE;
BEGIN
  IF p_limit < 1 OR p_limit > 1000 OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate-limit configuration';
  END IF;

  INSERT INTO public.api_rate_limits (rate_key, window_started_at, request_count)
  VALUES (p_rate_key, NOW(), 1)
  ON CONFLICT (rate_key) DO NOTHING;

  SELECT *
    INTO v_row
    FROM public.api_rate_limits
    WHERE rate_key = p_rate_key
    FOR UPDATE;

  IF v_row.window_started_at + make_interval(secs => p_window_seconds) <= NOW() THEN
    UPDATE public.api_rate_limits
    SET window_started_at = NOW(), request_count = 1
    WHERE rate_key = p_rate_key;
    RETURN TRUE;
  END IF;

  IF v_row.request_count >= p_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE public.api_rate_limits
  SET request_count = request_count + 1
  WHERE rate_key = p_rate_key;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_api_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_api_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_api_rate_limits()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM public.api_rate_limits
    WHERE window_started_at < NOW() - INTERVAL '24 hours'
    RETURNING 1
  )
  SELECT COUNT(*)::INTEGER FROM deleted;
$$;

REVOKE ALL ON FUNCTION public.cleanup_api_rate_limits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_api_rate_limits() TO service_role;
