CREATE OR REPLACE FUNCTION "public"."handle_new_user_onboarding"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- A. Create the profile (Now including the username)
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', -- Extracts the username we passed from Next.js
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );

  -- B. Assign the default 'user' role (for Project Seldon RBAC)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$;

-- 1. Create the function that checks if the username is changing
CREATE OR REPLACE FUNCTION public.prevent_username_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the incoming username is different from the existing one
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    RAISE EXCEPTION 'Username is immutable and cannot be changed.';
  END IF;
  
  -- Otherwise, allow the update to proceed
  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to the profiles table
CREATE TRIGGER ensure_username_immutable
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_username_update();