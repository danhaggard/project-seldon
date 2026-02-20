-- Allow users to insert a profile row, but ONLY if the ID matches their authenticated user ID.
CREATE POLICY "Users can insert their own profile." 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());