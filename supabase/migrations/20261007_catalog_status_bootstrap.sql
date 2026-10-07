-- Normalize legacy catalog rows so products created before the status field was
-- consistently populated remain visible in the public storefront.
-- New products should use the database default for status.

UPDATE public.products
SET status = 'active'
WHERE status IS NULL;

ALTER TABLE public.products
  ALTER COLUMN status SET DEFAULT 'active';
