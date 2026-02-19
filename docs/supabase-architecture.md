# Project Seldon: Supabase Database & Security Architecture

This document provides a comprehensive overview of the Supabase PostgreSQL database structure, the custom Role-Based Access Control (RBAC) implementation, and the Row Level Security (RLS) policies that secure Project Seldon.

---

## 1. Data Structure & Entity Relationships

The database is built on a highly relational schema designed to track predictions, their sources, and community consensus. 

### Core Tables
* **`profiles`**: Maps 1:1 with Supabase Auth users. Stores standard user data (username, full name, avatar, website). Created automatically via the `handle_new_user_onboarding` trigger when a user signs up.
* **`gurus`**: The subjects of the platform. Includes a generated `credibility_score` that automatically updates mathematically based on their prediction track record.
* **`predictions`**: The central entity. Belongs to a Guru and a Category. Includes start/end resolution windows, confidence levels, and automated vote-count columns.
* **`prediction_sources`**: Child records of predictions. Categorized by `type` (primary/secondary) and `media_type` (text, video, audio, social).
* **`categories`**: A lookup table for organizing predictions.

### Community Interaction Tables
* **`prediction_votes`**: A ledger tracking community consensus (True/False). Constrained to one vote per user per prediction (`UNIQUE(prediction_id, user_id)`).
* **`prediction_quality_ratings`**: Tracks whether a prediction is clear and verifiable. Also constrained to one per user per prediction.
* **`prediction_comments`**: A threaded discussion table featuring a `parent_id` column for nested replies.

---

## 2. Role-Based Access Control (RBAC) 

Project Seldon uses a strict, database-driven RBAC system that completely avoids querying permission tables from the frontend. 

### Enums as the Source of Truth
Roles and permissions are strictly typed using PostgreSQL ENUMs to prevent typos and ensure referential integrity:
* **`app_role`**: `admin`, `moderator`, `user`.
* **`app_permission`**: Implements the "Own vs. Any" paradigm (e.g., `predictions.update.own`, `predictions.update.any`, `categories.manage`).

### The JWT Injection Hook
The centerpiece of the security model is the `custom_access_token_hook`. 
1.  When a user logs in, Supabase Auth fires this internal function.
2.  The function queries `user_roles` and `role_permissions` to aggregate the user's exact capabilities.
3.  These capabilities are permanently injected into the user's JSON Web Token (JWT) under `app_metadata.permissions`.
4.  If a user has no assigned role, they default to basic permissions: `["predictions.create", "predictions.update.own", "predictions.delete.own"]`.

---

## 3. Row Level Security (RLS) Implementation

Because permissions live inside the JWT, RLS policies are synchronous and highly performant. They do not require costly database `JOIN` operations.

### The "Own vs. Any" Policy Pattern
Most feature tables (Gurus, Predictions) follow a dual-condition UPDATE/DELETE policy:
* **Condition 1 (Any)**: The JWT contains the `.any` permission (e.g., Admins/Moderators).
* **Condition 2 (Own)**: The JWT contains the `.own` permission AND the `created_by` column matches `auth.uid()`.

### Inherited Security (Prediction Sources)
`prediction_sources` uses an inherited security model. You cannot manage a source simply because you created it; you must have permission to manage the *parent prediction*. The RLS policy explicitly checks the `predictions` table to ensure the user owns the parent prediction or possesses the `predictions.update.any` capability.

### Strict Ownership Tables
Votes, Ratings, and Comments completely ignore Admin overrides for core CRUD actions. The RLS policies dictate that `user_id = auth.uid()`. Even an Admin cannot alter another user's vote. (Admins *do*, however, have a specific override to delete comments via the `comments.delete.any` permission).

---

## 4. Advanced Database Automation

To reduce the need for complex API logic and background cron jobs, the database uses native PostgreSQL Triggers and Generated Columns.

* **Real-time Vote Counting**: The `update_prediction_vote_counts()` trigger fires `AFTER INSERT OR UPDATE OR DELETE` on the `prediction_votes` table. It automatically increments or decrements the `community_vote_true_count` and `community_vote_false_count` on the parent prediction row.
* **Guru Credibility Math**: The `update_guru_stats()` trigger monitors the `predictions` table. When a prediction status changes to 'correct', it updates the Guru's `correct_prediction_count`.
* **Stored Generated Columns**: The `credibility_score` on the Gurus table is not manually written. It is a `GENERATED ALWAYS AS` column that instantly recalculates `(correct_prediction_count / total_predictions) * 100` at the database level.

---

## 5. Known Issues & Future Fixes

Based on the current migration state, the following items require attention in future development cycles:

* **Missing Profile INSERT Policy**: In the `20260219010421_rbac_policies.sql` cleanup migration, the legacy `"Users can insert their own profile."` policy was dropped, but only SELECT and UPDATE policies were recreated. **Fix:** A new `FOR INSERT` policy must be added to `profiles` to allow user creation (or upserts) to function without throwing a `42501` error.
* **Hardcoded JWT Defaults**: The `custom_access_token_hook` falls back to a hardcoded string `'["predictions.create", "predictions.update.own", "predictions.delete.own"]'::jsonb` if no roles are found. If the ENUMs change in the future, this hardcoded string could cause conflicts. **Fix:** Consider dynamically querying the default 'user' permissions even for the fallback, or ensuring the onboarding trigger always guarantees a `user_roles` row.
* **Source Authorship Misalignment**: The `prediction_sources` table captures a `created_by` UUID, but the RLS policies only check parent prediction ownership. A user could theoretically add a source to a public prediction via an unprotected RPC, but would immediately lose access to edit their own source because they don't own the prediction. **Fix:** Reevaluate if community members should be able to submit sources to predictions they don't own, and if so, update the RLS to allow `created_by = auth.uid()` for sources.