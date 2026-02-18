"use server";

import { PredictionSource } from "@/lib/definitions/prediction-source";
import { getIsAdminModCreator } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema matching your V2 database structure
const UpdatePredictionSchema = z.object({
  id: z.string().uuid(),
  guru_slug: z.string(), // Needed for redirect
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  category_id: z.coerce
    .number()
    .int()
    .positive("Please select a valid category"),
  resolution_window_end: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date",
  }),
  confidence_level: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["pending", "correct", "incorrect", "in_evaluation", "vague"]),
  sources_json: z.string(),
});

export type UpdatePredictionFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        category_id?: string[];
        resolution_window_end?: string[];
        confidence_level?: string[];
        status?: string[];
        sources_json?: string[];
      };
      message?: string;
      inputs?: {
        title: string;
        description: string;
        category_id: string;
        resolution_window_end: string;
        confidence_level: string;
        status: string;
        sources_json: string;
      };
    }
  | undefined;

export async function updatePrediction(
  state: UpdatePredictionFormState,
  formData: FormData,
): Promise<UpdatePredictionFormState> {
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to update a prediction." };
  }

  // 2. Parse Data
  const rawData = {
    id: formData.get("id") as string,
    guru_slug: formData.get("guru_slug") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category_id: formData.get("category_id") as string,
    resolution_window_end: formData.get("resolution_window_end") as string,
    confidence_level: formData.get("confidence_level") as string,
    status: formData.get("status") as string,
    sources_json: formData.get("sources_json") as string,
  };
  const validated = UpdatePredictionSchema.safeParse(rawData);

  if (!validated.success) {
    // Console log the actual errors so you can debug them
    console.log("Validation Errors:", validated.error.flatten().fieldErrors);

    return {
      errors: validated.error.flatten().fieldErrors,
      inputs: rawData,
    };
  }

  let submittedSources: Partial<PredictionSource>[] = [];

  try {
    submittedSources = JSON.parse(validated.data?.sources_json || "");
  } catch (e) {
    return { message: "Invalid sources data" };
  }

  // 3. Permission Check
  // Fetch prediction to check creator
  const { data: prediction } = await supabase
    .from("predictions")
    .select("created_by")
    .eq("id", validated.data.id)
    .single();

  const canEdit = await getIsAdminModCreator(prediction?.created_by);
  if (!canEdit) {
    return { message: "You do not have permission to edit this prediction." };
  }

  // 4. Update Database
  // Note: We handle the primary source URL update here for simplicity.
  // Ideally, source management might be a separate array operation, but we'll update the first one or just the prediction fields for now.
  const { error: predError } = await supabase
    .from("predictions")
    .update({
      title: validated.data.title,
      description: validated.data.description,
      category_id: validated.data.category_id,
      resolution_window_end: validated.data.resolution_window_end,
      confidence_level: validated.data.confidence_level,
      status: validated.data.status, // Cast because Zod enum vs DB enum
      // For V2, we might not have source_url on the prediction table anymore depending on your specific migration.
      // If you moved it to a separate table, remove this line or handle the relation update separately.
      // Assuming legacy support or a view:
    })
    .eq("id", validated.data.id);

  if (predError) {
    return { message: predError.message, inputs: rawData };
  }

  // 3. Handle Sources (The "Diffing" Logic)

  // A. Fetch current DB sources to find deletions
  const { data: currentDbSources } = await supabase
    .from("prediction_sources")
    .select("id")
    .eq("prediction_id", validated.data.id);

  const currentIds = currentDbSources?.map((s) => s.id) || [];
  const submittedSourcesToInsert: Partial<PredictionSource>[] = [];
  const submittedSourcesToUpdate = submittedSources.filter((s) => {
    const isTemp = s.id && s.id.startsWith("temp-");
    if (isTemp) {
      submittedSourcesToInsert.push(s);
    }
    return !isTemp;
  });
  const submittedIds = submittedSourcesToUpdate.map((s) => s.id);

  // B. DELETE: IDs in DB but not in submission
  const idsToDelete = currentIds.filter((id) => !submittedIds.includes(id));
  if (idsToDelete.length > 0) {
    await supabase.from("prediction_sources").delete().in("id", idsToDelete);
  }

  // C. UPSERT: Handle Adds and Edits
  // We clean the data to remove temp IDs and ensure prediction_id is set
  const sourcesToInsert = submittedSourcesToInsert.map((s) => ({
    prediction_id: validated.data.id,
    url: s.url,
    type: s.type,
    status: s.status,
    media_type: s.media_type,
    // created_by is handled automatically by Postgres default or ignored on update
  }));

  const sourcesToUpdate = submittedSourcesToUpdate.map((s) => ({
    id: s.id, // Keep the ID for updates
    prediction_id: validated.data.id,
    url: s.url,
    type: s.type,
    status: s.status,
    media_type: s.media_type,
    // created_by is handled automatically by Postgres default or ignored on update
  }));

  // 2. Run Database Operations
  const promises = [];

  if (sourcesToInsert.length > 0) {
    promises.push(supabase.from("prediction_sources").insert(sourcesToInsert));
  }

  if (sourcesToUpdate.length > 0) {
    promises.push(supabase.from("prediction_sources").upsert(sourcesToUpdate));
  }

  // Wait for all ops to finish
  const results = await Promise.all(promises);

  // Check for errors in any of the results
  const errorResult = results.find((r) => r.error);
  if (errorResult) {
    console.error("Source Error", errorResult.error);
    return { message: "Failed to update sources.", inputs: rawData };
  }

  // 5. Redirect
  const predictionPath = `/gurus/${validated.data.guru_slug}/predictions/${validated.data.id}`;
  revalidatePath(predictionPath);
  redirect(`${predictionPath}?status=updated`);
}
