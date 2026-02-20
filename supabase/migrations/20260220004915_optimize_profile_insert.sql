-- Drop the unoptimized policy
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;

-- Recreate it with the (select auth.uid()) initPlan optimization
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (
  id = (select auth.uid())
);