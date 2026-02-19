-- ==============================================================================
-- 0. CLEANUP LEGACY POLICIES
-- ==============================================================================
-- User Roles & Permissions
DROP POLICY IF EXISTS "Admins can manage all roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Allow auth admin to read user roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can view their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can read own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Allow authenticated users to read permissions" ON "public"."role_permissions";

-- Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON "public"."categories";

-- Gurus
DROP POLICY IF EXISTS "Auth insert gurus" ON "public"."gurus";
DROP POLICY IF EXISTS "Public read gurus" ON "public"."gurus";
DROP POLICY IF EXISTS "Enable update for creators and admins" ON "public"."gurus";

-- Predictions
DROP POLICY IF EXISTS "Auth insert predictions" ON "public"."predictions";
DROP POLICY IF EXISTS "Public read predictions" ON "public"."predictions";
DROP POLICY IF EXISTS "Enable update for creators and admins" ON "public"."predictions";

-- Prediction Sources
DROP POLICY IF EXISTS "Sources are viewable by everyone" ON "public"."prediction_sources";
DROP POLICY IF EXISTS "Authenticated users can add sources" ON "public"."prediction_sources";
DROP POLICY IF EXISTS "Public read access" ON "public"."prediction_sources";
DROP POLICY IF EXISTS "Manage sources if prediction owner or admin" ON "public"."prediction_sources";

-- Votes
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON "public"."prediction_votes";
DROP POLICY IF EXISTS "Users can vote once" ON "public"."prediction_votes";
DROP POLICY IF EXISTS "Users can change their vote" ON "public"."prediction_votes";

-- Ratings
DROP POLICY IF EXISTS "Ratings viewable by everyone" ON "public"."prediction_quality_ratings";
DROP POLICY IF EXISTS "Users can rate quality" ON "public"."prediction_quality_ratings";

-- Comments
DROP POLICY IF EXISTS "Comments viewable by everyone" ON "public"."prediction_comments";
DROP POLICY IF EXISTS "Users can comment" ON "public"."prediction_comments";
DROP POLICY IF EXISTS "Users can edit own comments" ON "public"."prediction_comments";

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can insert their own profile." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile." ON "public"."profiles";


-- ==============================================================================
-- 1. PREDICTIONS
-- ==============================================================================
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- (Add other DROP POLICY statements here if you have older ones)

CREATE POLICY "Public read predictions" ON public.predictions FOR SELECT USING (true);

CREATE POLICY "Create predictions" ON public.predictions FOR INSERT WITH CHECK (
  (auth.jwt() -> 'app_metadata' -> 'permissions') ? 'predictions.create'
);

CREATE POLICY "Update predictions" ON public.predictions FOR UPDATE USING (
  ((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'predictions.update.any')
  OR 
  (((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'predictions.update.own') AND created_by = auth.uid())
);

CREATE POLICY "Delete predictions" ON public.predictions FOR DELETE USING (
  ((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'predictions.delete.any')
  OR 
  (((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'predictions.delete.own') AND created_by = auth.uid())
);

-- ==============================================================================
-- 2. PREDICTION SOURCES (Inherits from Predictions)
-- ==============================================================================
ALTER TABLE public.prediction_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sources" ON public.prediction_sources FOR SELECT USING (true);

-- Users can manage sources if they have permission to update the parent prediction
CREATE POLICY "Manage prediction sources" ON public.prediction_sources FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.predictions p
    WHERE p.id = prediction_sources.prediction_id
    AND (
      ((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'predictions.update.any')
      OR 
      (((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'predictions.update.own') AND p.created_by = auth.uid())
    )
  )
);

-- ==============================================================================
-- 3. GURUS
-- ==============================================================================
ALTER TABLE public.gurus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gurus" ON public.gurus FOR SELECT USING (true);

CREATE POLICY "Create gurus" ON public.gurus FOR INSERT WITH CHECK (
  (auth.jwt() -> 'app_metadata' -> 'permissions') ? 'gurus.create'
);

CREATE POLICY "Update gurus" ON public.gurus FOR UPDATE USING (
  ((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'gurus.update.any')
  OR 
  (((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'gurus.update.own') AND created_by = auth.uid())
);

CREATE POLICY "Delete gurus" ON public.gurus FOR DELETE USING (
  ((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'gurus.delete.any')
  OR 
  (((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'gurus.delete.own') AND created_by = auth.uid())
);

-- ==============================================================================
-- 4. CATEGORIES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

CREATE POLICY "Manage categories" ON public.categories FOR ALL USING (
  (auth.jwt() -> 'app_metadata' -> 'permissions') ? 'categories.manage'
);

-- ==============================================================================
-- 5. PROFILES (Users)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile, Admins can manage all" ON public.profiles FOR UPDATE USING (
  id = auth.uid() OR ((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'users.manage')
);

-- ==============================================================================
-- 6. PREDICTION VOTES
-- ==============================================================================
ALTER TABLE public.prediction_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can see the votes to calculate scores
CREATE POLICY "Public read votes" ON public.prediction_votes FOR SELECT USING (true);

-- You can only create, update, or delete a vote if it belongs to you.
-- No admin override here—even admins shouldn't manipulate other people's votes!
CREATE POLICY "Users can manage their own votes" ON public.prediction_votes
FOR ALL USING (user_id = auth.uid());

-- ==============================================================================
-- 7. PREDICTION QUALITY RATINGS
-- ==============================================================================
ALTER TABLE public.prediction_quality_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings
CREATE POLICY "Public read quality ratings" ON public.prediction_quality_ratings FOR SELECT USING (true);

-- Same as votes: strict ownership only.
CREATE POLICY "Users can manage their own quality ratings" ON public.prediction_quality_ratings
FOR ALL USING (user_id = auth.uid());

-- ==============================================================================
-- 8. PREDICTION COMMENTS
-- ==============================================================================
ALTER TABLE public.prediction_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Public read comments" ON public.prediction_comments FOR SELECT USING (true);

-- Users can write their own comments
CREATE POLICY "Users can create own comments" ON public.prediction_comments
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can edit their own comments
CREATE POLICY "Users can update own comments" ON public.prediction_comments
FOR UPDATE USING (user_id = auth.uid());

-- Deletion: The owner can delete it, OR a Moderator/Admin can override using our new JWT permission.
CREATE POLICY "Users or Mods can delete comments" ON public.prediction_comments
FOR DELETE USING (
  user_id = auth.uid() 
  OR 
  (auth.jwt() -> 'app_metadata' -> 'permissions') ? 'comments.delete.any'
);