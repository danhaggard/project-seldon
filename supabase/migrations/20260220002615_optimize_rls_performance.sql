-- ==========================================
-- 1. CONSOLIDATE PUBLIC SELECT POLICIES
-- Resolves "multiple_permissive_policies" warnings
-- ==========================================

-- Categories
-- 1. Drop the overlapping policies
DROP POLICY IF EXISTS "Categories Manage" ON public.categories;
DROP POLICY IF EXISTS "Manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;

-- 2. Create the single, universal Read policy
CREATE POLICY "Categories Select" ON public.categories FOR SELECT USING (true);

-- 3. Explicitly define the mutation policies (No overlap with SELECT!)
CREATE POLICY "Categories Insert" ON public.categories FOR INSERT WITH CHECK (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'categories.manage')
);

CREATE POLICY "Categories Update" ON public.categories FOR UPDATE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'categories.manage')
);

CREATE POLICY "Categories Delete" ON public.categories FOR DELETE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'categories.manage')
);

-- ==========================================
-- PREDICTION SOURCES
-- ==========================================
DROP POLICY IF EXISTS "Manage prediction sources" ON public.prediction_sources;
DROP POLICY IF EXISTS "Public read sources" ON public.prediction_sources;
DROP POLICY IF EXISTS "Sources Select" ON public.prediction_sources;

-- 1. Read (Public)
CREATE POLICY "Sources Select" ON public.prediction_sources FOR SELECT USING (true);

-- 2. Mutations (Inherited from predictions)
CREATE POLICY "Sources Insert" ON public.prediction_sources FOR INSERT WITH CHECK (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.any')
  OR (
    (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.own') 
    AND (select created_by from public.predictions where id = prediction_id) = (select auth.uid())
  )
);

CREATE POLICY "Sources Update" ON public.prediction_sources FOR UPDATE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.any')
  OR (
    (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.own') 
    AND (select created_by from public.predictions where id = prediction_id) = (select auth.uid())
  )
);

CREATE POLICY "Sources Delete" ON public.prediction_sources FOR DELETE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.any')
  OR (
    (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.own') 
    AND (select created_by from public.predictions where id = prediction_id) = (select auth.uid())
  )
);


-- ==========================================
-- PREDICTION VOTES
-- ==========================================
DROP POLICY IF EXISTS "Public read votes" ON public.prediction_votes;
DROP POLICY IF EXISTS "Users can manage their own votes" ON public.prediction_votes;
DROP POLICY IF EXISTS "Votes Select" ON public.prediction_votes;

-- 1. Read (Public)
CREATE POLICY "Votes Select" ON public.prediction_votes FOR SELECT USING (true);

-- 2. Mutations (Strict Ownership)
CREATE POLICY "Votes Insert" ON public.prediction_votes FOR INSERT WITH CHECK (
  user_id = (select auth.uid())
);

CREATE POLICY "Votes Update" ON public.prediction_votes FOR UPDATE USING (
  user_id = (select auth.uid())
);

CREATE POLICY "Votes Delete" ON public.prediction_votes FOR DELETE USING (
  user_id = (select auth.uid())
);


-- ==========================================
-- PREDICTION QUALITY RATINGS
-- ==========================================
DROP POLICY IF EXISTS "Public read quality ratings" ON public.prediction_quality_ratings;
DROP POLICY IF EXISTS "Users can manage their own quality ratings" ON public.prediction_quality_ratings;
DROP POLICY IF EXISTS "Quality Ratings Select" ON public.prediction_quality_ratings;

-- 1. Read (Public)
CREATE POLICY "Quality Ratings Select" ON public.prediction_quality_ratings FOR SELECT USING (true);

-- 2. Mutations (Strict Ownership)
CREATE POLICY "Quality Ratings Insert" ON public.prediction_quality_ratings FOR INSERT WITH CHECK (
  user_id = (select auth.uid())
);

CREATE POLICY "Quality Ratings Update" ON public.prediction_quality_ratings FOR UPDATE USING (
  user_id = (select auth.uid())
);

CREATE POLICY "Quality Ratings Delete" ON public.prediction_quality_ratings FOR DELETE USING (
  user_id = (select auth.uid())
);

-- ==========================================
-- 2. OPTIMIZE RBAC & OWNERSHIP POLICIES
-- Resolves "auth_rls_initplan" warnings
-- ==========================================

-- Gurus
DROP POLICY IF EXISTS "Create gurus" ON public.gurus;
DROP POLICY IF EXISTS "Update gurus" ON public.gurus;
DROP POLICY IF EXISTS "Delete gurus" ON public.gurus;

CREATE POLICY "Create gurus" ON public.gurus FOR INSERT WITH CHECK (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'gurus.create')
);
CREATE POLICY "Update gurus" ON public.gurus FOR UPDATE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'gurus.update.any')
  OR ((((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'gurus.update.own') AND created_by = (select auth.uid()))
);
CREATE POLICY "Delete gurus" ON public.gurus FOR DELETE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'gurus.delete.any')
  OR ((((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'gurus.delete.own') AND created_by = (select auth.uid()))
);


-- Predictions
DROP POLICY IF EXISTS "Create predictions" ON public.predictions;
DROP POLICY IF EXISTS "Update predictions" ON public.predictions;
DROP POLICY IF EXISTS "Delete predictions" ON public.predictions;

CREATE POLICY "Create predictions" ON public.predictions FOR INSERT WITH CHECK (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.create')
);
CREATE POLICY "Update predictions" ON public.predictions FOR UPDATE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.any')
  OR ((((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.update.own') AND created_by = (select auth.uid()))
);
CREATE POLICY "Delete predictions" ON public.predictions FOR DELETE USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.delete.any')
  OR ((((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'predictions.delete.own') AND created_by = (select auth.uid()))
);


-- Profiles
DROP POLICY IF EXISTS "Users can update own profile, Admins can manage all" ON public.profiles;

CREATE POLICY "Users can update own profile, Admins can manage all" ON public.profiles FOR UPDATE USING (
  id = (select auth.uid()) 
  OR (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'users.manage')
);


-- Comments
DROP POLICY IF EXISTS "Users can create own comments" ON public.prediction_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.prediction_comments;
DROP POLICY IF EXISTS "Users or Mods can delete comments" ON public.prediction_comments;

CREATE POLICY "Users can create own comments" ON public.prediction_comments FOR INSERT WITH CHECK (
  user_id = (select auth.uid())
);
CREATE POLICY "Users can update own comments" ON public.prediction_comments FOR UPDATE USING (
  user_id = (select auth.uid())
);
CREATE POLICY "Users or Mods can delete comments" ON public.prediction_comments FOR DELETE USING (
  user_id = (select auth.uid()) 
  OR (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'comments.delete.any')
);


-- User Roles (Admin Only)
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (
  (((select auth.jwt()) -> 'app_metadata' -> 'permissions') ? 'users.manage')
);

-- Lock the search path for the prediction votes trigger
ALTER FUNCTION public.update_prediction_vote_counts() SET search_path = public;

-- Lock the search path for the guru stats trigger
ALTER FUNCTION public.update_guru_stats() SET search_path = public;