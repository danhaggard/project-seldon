-- ==============================================================================
-- FIX: Missing Foreign Key Indexes
-- Best Practice Rule: schema-foreign-key-indexes.md (Index Foreign Key Columns)
-- Problem: Postgres does not automatically index foreign key columns, causing slow JOINs and CASCADE operations.
-- ==============================================================================

-- 1. Rectifying missing indexes from: 20260218075558_remote_schema.sql
CREATE INDEX IF NOT EXISTS idx_gurus_created_by ON public.gurus(created_by);
CREATE INDEX IF NOT EXISTS idx_predictions_created_by ON public.predictions(created_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 2. Rectifying missing indexes from: 20260218115227_upgrade_to_v2_schema.sql
CREATE INDEX IF NOT EXISTS idx_predictions_category_id ON public.predictions(category_id);
CREATE INDEX IF NOT EXISTS idx_predictions_resolved_by ON public.predictions(resolved_by);
CREATE INDEX IF NOT EXISTS idx_prediction_sources_prediction_id ON public.prediction_sources(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_sources_created_by ON public.prediction_sources(created_by);

-- Note: prediction_votes has a UNIQUE(prediction_id, user_id) constraint which creates an index on prediction_id.
-- However, queries filtering only by user_id cannot efficiently use that composite index. This fix adds the missing index.
CREATE INDEX IF NOT EXISTS idx_prediction_votes_user_id ON public.prediction_votes(user_id);

-- Note: prediction_quality_ratings has a UNIQUE(prediction_id, user_id) constraint which creates an index on prediction_id.
-- Similar to above, this adds the missing index for user_id.
CREATE INDEX IF NOT EXISTS idx_prediction_quality_ratings_user_id ON public.prediction_quality_ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_prediction_comments_prediction_id ON public.prediction_comments(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_comments_user_id ON public.prediction_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_comments_parent_id ON public.prediction_comments(parent_id);

-- 3. Rectifying missing indexes from: 20260220090944_add_source_validations.sql
-- Note: source_validations has a UNIQUE(source_id, user_id) constraint which creates an index on source_id.
-- This adds the missing index for user_id.
CREATE INDEX IF NOT EXISTS idx_source_validations_user_id ON public.source_validations(user_id);

