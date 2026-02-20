-- Add the title column to prediction_sources
ALTER TABLE public.prediction_sources 
ADD COLUMN title text;

-- Optional: If you want to backfill existing rows where the title is null
-- by extracting the domain from the existing URL, you can run this safe regex:
UPDATE public.prediction_sources
SET title = COALESCE(
  SUBSTRING(url FROM '^(?:https?://)?(?:www\.)?([^/]+)'), 
  url
)
WHERE title IS NULL;