"use server";

import { PERMISSION_BASE } from "@/lib/definitions/rbac";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const UpdateGuruSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  bio: z.string().optional(),
  twitter_handle: z.string().optional(),
  youtube_channel: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export type UpdateGuruFormState =
  | {
      errors?: {
        bio?: string[];
        twitter_handle?: string[];
        website?: string[];
        youtube_channel?: string[];
      };
      message?: string;
      success?: boolean;
      inputs?: {
        bio: string;
        twitter_handle: string;
        youtube_channel: string;
        website: string;
      };
    }
  | undefined;

export async function updateGuru(
  state: UpdateGuruFormState,
  formData: FormData,
): Promise<UpdateGuruFormState> {
  const claims = await getClaims();

  if (!claims) {
    return { message: "You must be logged in to update guru details." };
  }

  // 2. Parse Data
  const rawData = {
    id: formData.get("id") as string,
    slug: formData.get("slug") as string,
    bio: formData.get("bio") as string,
    twitter_handle: formData.get("twitter_handle") as string,
    youtube_channel: formData.get("youtube_channel") as string,
    website: formData.get("website") as string,
  };

  const validatedFields = UpdateGuruSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      inputs: {
        bio: rawData.bio,
        twitter_handle: rawData.twitter_handle,
        youtube_channel: rawData.youtube_channel,
        website: rawData.website,
      },
    };
  }

  const supabase = await createClient();

  // 3. Authorization Check (Server Side)
  // Fetch the guru to check ownership, AND fetch user roles
  const { data: guru } = await supabase
    .from("gurus")
    .select("created_by")
    .eq("id", validatedFields.data.id)
    .single();

  if (!guru) {
    return { message: "Guru not found. It may have been deleted." };
  }

  const { isPermitted } = await checkPermission(
    PERMISSION_BASE.GURUS_UPDATE,
    guru?.created_by,
    claims,
  );
  if (!isPermitted) {
    return {
      message: "You do not have the required permissions to edit this guru.",
    };
  }

  // 4. Update Database
  const { error } = await supabase
    .from("gurus")
    .update({
      bio: validatedFields.data.bio,
      twitter_handle: validatedFields.data.twitter_handle,
      youtube_channel: validatedFields.data.youtube_channel,
      website: validatedFields.data.website,
    })
    .eq("id", validatedFields.data.id);

  if (error) {
    return {
      message: error.message,
      inputs: {
        bio: rawData.bio,
        twitter_handle: rawData.twitter_handle,
        youtube_channel: rawData.youtube_channel,
        website: rawData.website,
      },
    };
  }

  // 5. Revalidate & Redirect
  revalidatePath(`/gurus/${validatedFields.data.slug}`);
  redirect(`/gurus/${validatedFields.data.slug}?status=updated`);
}
