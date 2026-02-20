"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getClaims } from "@/lib/supabase/rbac";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

const CastVoteSchema = z.object({
  sourceId: z.uuid(),
  vote: z.boolean(), // Uses SOURCE_VALIDATION_STATE constants
  pathname: z.string(), // We pass this so Next.js knows exactly which page cache to purge
});

export async function castValidationVote(
  sourceId: string,
  vote: boolean,
  pathname: string,
) {
  // 1. Validate Input
  const validated = CastVoteSchema.safeParse({ sourceId, vote, pathname });
  if (!validated.success) {
    return { error: "Invalid voting parameters provided." };
  }

  const supabase = await createClient();

  // 2. Auth Check
  const claims = await getClaims();

  if (!claims) {
    redirect(routes.auth.signUp);
  }

  try {
    // 3. Check for existing vote
    const { data: existingVote } = await supabase
      .from("source_validations")
      .select("id, is_valid")
      .eq("source_id", validated.data.sourceId)
      .eq("user_id", claims.sub)
      .single();

    if (existingVote) {
      if (existingVote.is_valid === validated.data.vote) {
        // A. Toggle OFF: User clicked the same button they already had active
        const { error: deleteError } = await supabase
          .from("source_validations")
          .delete()
          .eq("id", existingVote.id);

        if (deleteError) throw deleteError;
      } else {
        // B. FLIP VOTE: User clicked the opposite button
        const { error: updateError } = await supabase
          .from("source_validations")
          .update({ is_valid: validated.data.vote })
          .eq("id", existingVote.id);

        if (updateError) throw updateError;
      }
    } else {
      // C. NEW VOTE: Insert record
      const { error: insertError } = await supabase
        .from("source_validations")
        .insert({
          source_id: validated.data.sourceId,
          user_id: claims.sub,
          is_valid: validated.data.vote,
        });

      if (insertError) {
        // Handle the specific RLS failure (User trying to vote on their own source)
        if (
          insertError.code === "42501" ||
          insertError.message.includes("row-level security")
        ) {
          return { error: "You cannot validate a source that you submitted." };
        }
        throw insertError;
      }
    }

    // 4. Revalidate the UI to instantly show the updated +42 / -3 counters
    revalidatePath(validated.data.pathname);
    return { success: true };
  } catch (error: unknown) {
    console.error("Validation Vote Error:", error);
    return { error: "Failed to register validation. Please try again." };
  }
}
