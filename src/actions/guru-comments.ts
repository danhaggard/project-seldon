"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkPermission } from "@/lib/supabase/rbac";
import { unauthorized } from "next/navigation";
import { z } from "zod";
import { GuruComment } from "@/lib/definitions/guru-comment";
import { Profile } from "@/lib/definitions/profile";

export type GuruCommentWithProfile = GuruComment & {
  profiles: Pick<Profile, "username" | "avatar_url">;
};

export async function fetchGuruComments(
  guruId: string,
): Promise<GuruCommentWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guru_comments")
    .select(
      `
      id,
      guru_id,
      user_id,
      parent_id,
      content,
      created_at,
      updated_at,
      profiles (username, avatar_url)
    `,
    )
    .eq("guru_id", guruId)
    .order("created_at", { ascending: true }); // Chronological order so parents generally appear before children

  if (error) {
    console.error("Error fetching guru comments:", error);
    throw new Error("Failed to load discussion.");
  }

  // Supabase's JS client returns joined tables as an array or single object depending on the relationship.
  // We know it's a 1-to-1/belongs-to from the comment to the profile.
  return (data as unknown as GuruCommentWithProfile[]) || [];
}

const createCommentSchema = z.object({
  guru_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable().optional(),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long"),
  pathname: z.string(),
});

export async function createGuruComment(
  prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { unauthenticated: true, message: "Please log in to comment." };
  }

  const rawData = {
    guru_id: formData.get("guru_id") as string,
    parent_id: formData.get("parent_id") as string | null,
    content: formData.get("content") as string,
    pathname: formData.get("pathname") as string,
  };

  const validatedFields = createCommentSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error. Please check your inputs.",
    };
  }

  const { guru_id, parent_id, content, pathname } = validatedFields.data;

  const { error } = await supabase.from("guru_comments").insert({
    guru_id,
    user_id: authData.user.id, // Implicitly trust server-side auth ID over form data
    parent_id: parent_id || null,
    content,
  });

  if (error) {
    console.error("Error creating comment:", error);
    return { message: "Failed to post comment. Please try again later." };
  }

  revalidatePath(pathname);
  return { message: null, success: true };
}

export async function deleteGuruComment(
  commentId: string,
  ownerId: string,
  pathname: string,
) {
  // 1. RBAC authorization check on the Server
  const { isPermitted } = await checkPermission("comments.delete", ownerId);

  if (!isPermitted) {
    unauthorized();
  }

  // 2. Perform DB deletion
  const supabase = await createClient();
  const { error } = await supabase
    .from("guru_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    return { error: "Failed to delete comment." };
  }

  // 3. Revalidate
  revalidatePath(pathname);
  return { success: true };
}
