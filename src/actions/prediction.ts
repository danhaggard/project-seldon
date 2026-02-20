"use server";

import { PredictionSource } from "@/lib/definitions/prediction-source";
import { APP_PERMISSION, PERMISSION_BASE } from "@/lib/definitions/rbac";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { routes } from "@/config/routes";

const CommonPredictionSchema = {
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
};

// Schema matching your V2 database structure
const UpdatePredictionSchema = z.object({
  id: z.uuid(),
  ...CommonPredictionSchema,
});

// Helper to extract clean domain name
function getDomainRoot(urlString: string | undefined | null): string {
  if (!urlString) return "Unknown Source";
  try {
    const url = new URL(urlString);
    return url.hostname.replace(/^www\./, "");
  } catch (e) {
    return urlString; // Fallback to raw string if parsing fails
  }
}

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
  const claims = await getClaims();

  // 1. Auth Check
  if (!claims) {
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

  // 3. Permission Check
  // Fetch prediction to check creator
  const supabase = await createClient();
  const { data: prediction } = await supabase
    .from("predictions")
    .select("created_by")
    .eq("id", validated.data.id)
    .single();

  if (!prediction) {
    return { message: "Prediction not found. It may have been deleted." };
  }

  const { isPermitted } = await checkPermission(
    PERMISSION_BASE.PREDICTIONS_UPDATE,
    prediction?.created_by,
    claims,
  );

  if (!isPermitted) {
    return { message: "You do not have permission to edit this prediction." };
  }

  // 4. Update Database
  const { error: predError } = await supabase
    .from("predictions")
    .update({
      title: validated.data.title,
      description: validated.data.description,
      category_id: validated.data.category_id,
      resolution_window_end: validated.data.resolution_window_end,
      confidence_level: validated.data.confidence_level,
      status: validated.data.status, // Cast because Zod enum vs DB enum
    })
    .eq("id", validated.data.id);

  if (predError) {
    return { message: predError.message, inputs: rawData };
  }

  // 3. Handle Sources (The "Diffing" Logic)
  let submittedSources: Partial<PredictionSource>[] = [];

  try {
    submittedSources = JSON.parse(validated.data?.sources_json || "");
  } catch {
    return { message: "Invalid sources data" };
  }

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
    title: s.title?.trim() ? s.title.trim() : getDomainRoot(s.url),
    type: s.type,
    status: s.status,
    media_type: s.media_type,
    // created_by is handled automatically by Postgres default or ignored on update
  }));

  const sourcesToUpdate = submittedSourcesToUpdate.map((s) => ({
    id: s.id, // Keep the ID for updates
    prediction_id: validated.data.id,
    title: s.title?.trim() ? s.title.trim() : getDomainRoot(s.url), // <-- ADD THIS
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
  const predictionPath = routes.gurus.predictionDetail(
    validated.data.guru_slug,
    validated.data.id,
  );
  revalidatePath(predictionPath);
  redirect(`${predictionPath}?status=updated`);
}

const CreatePredictionSchema = z.object({
  guru_id: z.uuid(),
  prediction_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid prediction date",
  }),
  ...CommonPredictionSchema,
});

export type CreatePredictionFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        category_id?: string[];
        prediction_date?: string[];
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
        prediction_date?: string;
        resolution_window_end: string;
        confidence_level: string;
        status: string;
        sources_json: string;
      };
    }
  | undefined;

export async function createPrediction(
  state: CreatePredictionFormState,
  formData: FormData,
): Promise<CreatePredictionFormState> {
  const claims = await getClaims();

  // 1. Auth & Permission Check
  if (!claims) {
    return { message: "You must be logged in to create a prediction." };
  }

  const { isPermitted } = await checkPermission(
    APP_PERMISSION.PREDICTIONS_CREATE,
    claims,
  );

  if (!isPermitted) {
    return { message: "You do not have permission to add predictions." };
  }

  // 2. Parse Data
  const rawData = {
    guru_id: formData.get("guru_id") as string,
    guru_slug: formData.get("guru_slug") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category_id: formData.get("category_id") as string,
    prediction_date: formData.get("prediction_date") as string,
    resolution_window_end: formData.get("resolution_window_end") as string,
    confidence_level: formData.get("confidence_level") as string,
    status: formData.get("status") as string,
    sources_json: formData.get("sources_json") as string,
  };

  const validated = CreatePredictionSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      inputs: rawData,
    };
  }

  const supabase = await createClient();

  // 3. Insert Prediction Row
  const { data: newPrediction, error: predError } = await supabase
    .from("predictions")
    .insert({
      guru_id: validated.data.guru_id,
      title: validated.data.title,
      description: validated.data.description || null,
      category_id: validated.data.category_id || null,
      prediction_date: validated.data.prediction_date,
      // Handle empty string from date input
      resolution_window_end: validated.data.resolution_window_end
        ? validated.data.resolution_window_end
        : null,
      confidence_level: validated.data.confidence_level || null,
      status: validated.data.status,
      created_by: claims.sub,
      // created_by is typically handled by Supabase auth defaults, or explicitly insert `claims.sub` if your policy requires it.
    })
    .select("id")
    .single();

  if (predError || !newPrediction) {
    return {
      message: predError?.message || "Failed to insert prediction",
      inputs: rawData,
    };
  }

  // 4. Handle Sources Insert (No diffing required for creation!)
  let submittedSources: Partial<PredictionSource>[] = [];
  try {
    submittedSources = JSON.parse(validated.data.sources_json || "[]");
  } catch {
    // If sources fail to parse, the prediction still created, so we might not want to hard fail.
    console.error("Invalid sources JSON");
  }

  if (submittedSources.length > 0) {
    const sourcesToInsert = submittedSources.map((s) => ({
      prediction_id: newPrediction.id, // Link to the newly created row
      url: s.url,
      title: s.title?.trim() ? s.title.trim() : getDomainRoot(s.url), // <-- ADD THIS
      type: s.type,
      status: s.status,
      media_type: s.media_type,
    }));

    const { error: sourceError } = await supabase
      .from("prediction_sources")
      .insert(sourcesToInsert);

    if (sourceError) {
      console.error("Failed to insert sources:", sourceError);
      // We don't return here because the core prediction was successfully created.
      // You could handle this more elegantly depending on your UX needs.
    }
  }

  // 5. Redirect
  const guruPath = routes.gurus.detail(validated.data.guru_slug);
  revalidatePath(guruPath);
  redirect(`${guruPath}?status=prediction_created`);
}
