-- ==============================================================================
-- GURU COMMENTS MIGRATION
-- Adds a nested, threaded discussion system to Guru profiles.
-- ==============================================================================

-- 1. Create the table using an adjacency list pattern
CREATE TABLE public.guru_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guru_id uuid NOT NULL REFERENCES public.gurus(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.guru_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Performance Indexes
-- Essential for fast JOINs and CASCADE operations (Supabase Best Practice)
CREATE INDEX IF NOT EXISTS idx_guru_comments_guru_id ON public.guru_comments(guru_id);
CREATE INDEX IF NOT EXISTS idx_guru_comments_user_id ON public.guru_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_guru_comments_parent_id ON public.guru_comments(parent_id);

-- 3. Row Level Security
ALTER TABLE public.guru_comments ENABLE ROW LEVEL SECURITY;

-- Select: Anyone can read comments
CREATE POLICY "Public read guru comments" 
ON public.guru_comments 
FOR SELECT USING (true);

-- Insert: Any authenticated user can comment
CREATE POLICY "Users can create guru comments" 
ON public.guru_comments 
FOR INSERT TO authenticated 
WITH CHECK (user_id = (select auth.uid()));

-- Update: Only the owner can update their comment
CREATE POLICY "Users can update own guru comments" 
ON public.guru_comments 
FOR UPDATE TO authenticated 
USING (user_id = (select auth.uid())) 
WITH CHECK (user_id = (select auth.uid()));

-- Delete: The owner can delete it, or an Admin/Moderator with the comments.delete.any permission can override
CREATE POLICY "Users or Mods can delete guru comments" 
ON public.guru_comments 
FOR DELETE TO authenticated 
USING (
  user_id = (select auth.uid()) 
  OR 
  (auth.jwt() -> 'app_metadata' -> 'permissions') ? 'comments.delete.any'
);
