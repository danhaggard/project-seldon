-- 1. Add caching counters to the sources table for instant UI rendering
ALTER TABLE public.prediction_sources 
ADD COLUMN upvotes_count integer DEFAULT 0 NOT NULL,
ADD COLUMN downvotes_count integer DEFAULT 0 NOT NULL;

-- 2. Create the validations junction table
CREATE TABLE public.source_validations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id uuid NOT NULL REFERENCES public.prediction_sources(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_valid boolean NOT NULL, -- TRUE = ArrowBigUp (Validate), FALSE = ArrowBigDown (Refute)
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  -- Ensure a user can only cast one vote per source
  UNIQUE(source_id, user_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.source_validations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read validations
CREATE POLICY "Anyone can view validations" 
ON public.source_validations FOR SELECT 
USING (true);

-- Policy: Authenticated users can vote, BUT ONLY if they didn't create the source
-- OPTIMIZED: Using (select auth.uid()) to prevent per-row execution
CREATE POLICY "Users can insert validations on others' sources" 
ON public.source_validations FOR INSERT 
TO authenticated 
WITH CHECK (
  (select auth.uid()) = user_id AND
  EXISTS (
    SELECT 1 FROM public.prediction_sources 
    WHERE id = source_id AND created_by != (select auth.uid())
  )
);

-- Policy: Users can update their own vote
-- OPTIMIZED: Using (select auth.uid())
CREATE POLICY "Users can update their own validations" 
ON public.source_validations FOR UPDATE 
TO authenticated 
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Policy: Users can delete their own vote
-- OPTIMIZED: Using (select auth.uid())
CREATE POLICY "Users can delete their own validations" 
ON public.source_validations FOR DELETE 
TO authenticated 
USING ((select auth.uid()) = user_id);

-- 4. Create Database Triggers to automatically update the counters
CREATE OR REPLACE FUNCTION public.update_source_validation_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF (TG_OP = 'INSERT') THEN
    IF NEW.is_valid = true THEN
      UPDATE public.prediction_sources SET upvotes_count = upvotes_count + 1 WHERE id = NEW.source_id;
    ELSE
      UPDATE public.prediction_sources SET downvotes_count = downvotes_count + 1 WHERE id = NEW.source_id;
    END IF;
  
  -- Handle DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.is_valid = true THEN
      UPDATE public.prediction_sources SET upvotes_count = upvotes_count - 1 WHERE id = OLD.source_id;
    ELSE
      UPDATE public.prediction_sources SET downvotes_count = downvotes_count - 1 WHERE id = OLD.source_id;
    END IF;
  
  -- Handle UPDATE (changing vote from up to down, or down to up)
  ELSIF (TG_OP = 'UPDATE' AND OLD.is_valid IS DISTINCT FROM NEW.is_valid) THEN
    IF NEW.is_valid = true THEN
      UPDATE public.prediction_sources SET upvotes_count = upvotes_count + 1, downvotes_count = downvotes_count - 1 WHERE id = NEW.source_id;
    ELSE
      UPDATE public.prediction_sources SET upvotes_count = upvotes_count - 1, downvotes_count = downvotes_count + 1 WHERE id = NEW.source_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_validation_change
AFTER INSERT OR UPDATE OR DELETE ON public.source_validations
FOR EACH ROW EXECUTE FUNCTION public.update_source_validation_counts();