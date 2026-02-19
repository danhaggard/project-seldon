"use server";

import { createClient } from "@/lib/supabase/server";
import { ProfileFormSchema, ProfileFormState } from "@/lib/definitions/profile";
import { revalidatePath } from "next/cache";
import { getClaims } from "@/lib/supabase/rbac";

export async function updateProfile(
  state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const claims = await getClaims();

  if (!claims) {
    return { message: "You must be logged in to update your profile." };
  }

  // 2. Extract and Validate
  const rawData = {
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    website: formData.get("website"),
  };

  const validatedFields = ProfileFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  // 3. Update Database
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: validatedFields.data.fullName,
      username: validatedFields.data.username,
      website: validatedFields.data.website,
      updated_at: new Date().toISOString(),
    })
    .eq("id", claims.sub); // Must explicitly match the row

  if (error) {
    console.error(error);
    return { message: "Database Error: Failed to update profile." };
  }

  // 4. Revalidate to show new data immediately
  revalidatePath("/account");

  return { success: true, message: "Profile updated successfully!" };
}
