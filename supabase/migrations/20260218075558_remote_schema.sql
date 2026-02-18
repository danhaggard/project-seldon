SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."app_permission" AS ENUM (
    'gurus.delete',
    'predictions.delete',
    'users.manage'
);

ALTER TYPE "public"."app_permission" OWNER TO "postgres";

CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator',
    'user'
);

ALTER TYPE "public"."app_role" OWNER TO "postgres";

CREATE TYPE "public"."prediction_status" AS ENUM (
    'pending',
    'correct',
    'incorrect',
    'void'
);

ALTER TYPE "public"."prediction_status" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."authorize"("requested_permission" "public"."app_permission") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  has_permission int;
BEGIN
  -- Check if any role in the JWT's 'user_roles' array has the permission
  SELECT count(*)
  INTO has_permission
  FROM public.role_permissions
  WHERE role_permissions.permission = requested_permission
  AND role_permissions.role::text = ANY (
    SELECT jsonb_array_elements_text(auth.jwt() -> 'user_roles')
  );

  RETURN has_permission > 0;
END;
$$;

ALTER FUNCTION "public"."authorize"("requested_permission" "public"."app_permission") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  claims jsonb;
  user_roles_array jsonb;
BEGIN
  -- 1. Fetch all roles for this user and aggregate into a JSON array
  SELECT jsonb_agg(role) INTO user_roles_array 
  FROM public.user_roles 
  WHERE user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- 2. Set the custom claim. Default to ['user'] if no roles found.
  if user_roles_array is not null then
    claims := jsonb_set(claims, '{user_roles}', user_roles_array);
  else
    claims := jsonb_set(claims, '{user_roles}', '["user"]'::jsonb);
  end if;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user_onboarding"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- A. Create the profile (from your starter code)
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );

  -- B. Assign the default 'user' role (for Project Seldon RBAC)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$;

ALTER FUNCTION "public"."handle_new_user_onboarding"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."gurus" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "bio" "text",
    "avatar_url" "text",
    "twitter_handle" "text",
    "youtube_channel" "text",
    "website" "text",
    "credibility_score" numeric(5,2) DEFAULT 50.00,
    "total_predictions" integer DEFAULT 0,
    "correct_prediction_count" integer DEFAULT 0,
    "created_by" "uuid" DEFAULT "auth"."uid"()
);

ALTER TABLE "public"."gurus" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "guru_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "tags" "text"[],
    "confidence_level" integer,
    "source_url" "text",
    "prediction_date" timestamp with time zone NOT NULL,
    "resolution_date" timestamp with time zone,
    "status" "public"."prediction_status" DEFAULT 'pending'::"public"."prediction_status",
    "created_by" "uuid",
    CONSTRAINT "predictions_confidence_level_check" CHECK ((("confidence_level" >= 0) AND ("confidence_level" <= 100)))
);

ALTER TABLE "public"."predictions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL
);

ALTER TABLE "public"."role_permissions" OWNER TO "postgres";

ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL
);

ALTER TABLE "public"."user_roles" OWNER TO "postgres";

ALTER TABLE "public"."user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."gurus"
    ADD CONSTRAINT "gurus_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."gurus"
    ADD CONSTRAINT "gurus_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."gurus"
    ADD CONSTRAINT "gurus_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");


CREATE INDEX "idx_gurus_slug" ON "public"."gurus" USING "btree" ("slug");
CREATE INDEX "idx_predictions_guru" ON "public"."predictions" USING "btree" ("guru_id");
CREATE INDEX "idx_predictions_status" ON "public"."predictions" USING "btree" ("status");

ALTER TABLE ONLY "public"."gurus"
    ADD CONSTRAINT "gurus_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "public"."gurus"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

CREATE POLICY "Admins can manage all roles" ON "public"."user_roles" USING ("public"."authorize"('users.manage'::"public"."app_permission"));
CREATE POLICY "Allow auth admin to read user roles" ON "public"."user_roles" FOR SELECT TO "supabase_auth_admin" USING (true);
CREATE POLICY "Allow authenticated users to read permissions" ON "public"."role_permissions" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "Auth insert gurus" ON "public"."gurus" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));
CREATE POLICY "Auth insert predictions" ON "public"."predictions" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));
CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);
CREATE POLICY "Public read gurus" ON "public"."gurus" FOR SELECT USING (true);
CREATE POLICY "Public read predictions" ON "public"."predictions" FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));
CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));
CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."gurus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."predictions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";

GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission") TO "anon";
GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission") TO "authenticated";
GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission") TO "service_role";

REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";

GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "service_role";

GRANT ALL ON TABLE "public"."gurus" TO "anon";
GRANT ALL ON TABLE "public"."gurus" TO "authenticated";
GRANT ALL ON TABLE "public"."gurus" TO "service_role";

GRANT ALL ON TABLE "public"."predictions" TO "anon";
GRANT ALL ON TABLE "public"."predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."predictions" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_roles" TO "service_role";
GRANT ALL ON TABLE "public"."user_roles" TO "supabase_auth_admin";

GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

drop extension if exists "pg_net";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_onboarding();

create policy "Anyone can upload an avatar."
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'avatars'::text));

create policy "Avatar images are publicly accessible."
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));
