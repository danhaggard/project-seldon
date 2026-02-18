-- 1. Enable RLS on gurus (if not already enabled)
ALTER TABLE "public"."gurus" ENABLE ROW LEVEL SECURITY;

-- 2. Create the UPDATE policy
CREATE POLICY "Enable update for creators and admins"
ON "public"."gurus"
FOR UPDATE
USING (
  -- Rule 1: The user is the creator
  auth.uid() = created_by
  OR
  -- Rule 2: The user is an admin or moderator
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- 3. Grant SELECT permission to authenticated users
-- Without this, the RLS policy on 'gurus' crashes when it tries to check this table.
GRANT SELECT ON TABLE "public"."user_roles" TO "authenticated";

-- 4. Secure the table (Enable RLS on user_roles itself)
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

-- 5. Add a Policy: "Users can read their own role"
-- This ensures that while they can Select from the table, they can ONLY see their own row.
CREATE POLICY "Users can read own roles"
ON "public"."user_roles"
FOR SELECT
TO authenticated
USING ( auth.uid() = user_id );

-- Enable RLS (if not already)
ALTER TABLE "public"."predictions" ENABLE ROW LEVEL SECURITY;

-- Create Update Policy
CREATE POLICY "Enable update for creators and admins"
ON "public"."predictions"
FOR UPDATE
USING (
  -- Creator
  auth.uid() = created_by
  OR
  -- Admin/Mod
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- 1. Enable RLS (Ensure it's explicitly on)
ALTER TABLE "public"."prediction_sources" ENABLE ROW LEVEL SECURITY;

-- 2. READ POLICY: Allow everyone to see sources (Public)
CREATE POLICY "Public read access"
ON "public"."prediction_sources"
FOR SELECT
USING (true);

-- 3. WRITE POLICY: Allow Insert/Update/Delete based on Parent Permission
-- Logic: You can modify a source IF you own the parent prediction OR are an admin.
CREATE POLICY "Manage sources if prediction owner or admin"
ON "public"."prediction_sources"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.predictions p
    WHERE p.id = prediction_sources.prediction_id -- Match the parent prediction
    AND (
      p.created_by = auth.uid() -- 1. You created the prediction
      OR 
      EXISTS (                  -- 2. OR you are an Admin/Mod
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'moderator')
      )
    )
  )
);