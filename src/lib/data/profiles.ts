import { createClient } from "@/lib/supabase/server";
import { Profile } from "../definitions/profile";

/**
 * Fetches a single Guru by their URL slug.
 * Returns null if not found or if an error occurs.
 */
export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient();

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, username, website, avatar_url")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database Error (getProfile):", error);
      return null;
    }

    return profile as Profile;
  } catch (error) {
    console.error("Unexpected Error (getProfile):", error);
    throw new Error("Failed to fetch profile.");
  }
}
