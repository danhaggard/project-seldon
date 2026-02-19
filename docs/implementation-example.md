# Update Predictions: Implementation Guide

This document outlines the end-to-end implementation for updating a prediction within Project Seldon. It demonstrates the recommended Next.js App Router pattern for complex forms, utilizing a Server Component for initial data fetching and authorization, a Client Component for interactive form state, and a Server Action for secure database mutations.



---

## 1. The Server Action (Mutation & Validation)

The Server Action (`updatePrediction`) acts as the secure API endpoint for the form. It operates under the assumption that all incoming data is untrusted. 

**Key Responsibilities:**
* **Authentication & Validation:** Verifies the user's session and uses Zod to ensure the incoming `FormData` strictly matches the V2 database schema.
* **Authorization (RBAC):** Re-fetches the target prediction to confirm its ownership and evaluates it against the user's JWT claims using our custom `checkPermission` utility.
* **Relational Data Diffing:** Handles the complexity of updating a parent record (the prediction) alongside a dynamic list of child records (the sources). It parses the hidden JSON input, compares it against the database's current state, and orchestrates the necessary `DELETE`, `INSERT`, and `UPSERT` operations to keep everything in sync.

### `src/actions/prediction.ts`

```typescript
"use server";

import { PredictionSource } from "@/lib/definitions/prediction-source";
import { PERMISSION_BASE } from "@/lib/definitions/rbac";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
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
```

## 2. The Page Component (Server-Side Rendering & Auth)
The Page component represents the route entry point. By running exclusively on the server, it prevents unauthorized users from ever downloading the form's JavaScript bundle or seeing sensitive layout data.

**Key Responsibilities:**

* **Data Fetching:** Retrieves the requested prediction (including its relational sources) and populates the necessary dropdown data (e.g., categories).

* **Early Authorization Blocking:** Re-uses the checkPermission utility. If a user maliciously accesses this URL without owning the prediction, they are immediately redirected to /403-forbidden.

### src/app/gurus/[slug]/predictions/[id]/edit/page.tsx

```typescript
import { EditPredictionForm } from "@/components/predictions/edit-prediction-form";
import { notFound, redirect } from "next/navigation";
import { getPredictionByIdWithSources } from "@/lib/data/predictions";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
import { PERMISSION_BASE } from "@/lib/definitions/rbac";
import { getCategories } from "@/lib/data/categories";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function EditPredictionPage({ params }: PageProps) {
  const { id, slug } = await params;
  const claims = await getClaims();
  if (!claims) {
    redirect("/login");
  }

  // 1. Fetch Prediction
  const prediction = await getPredictionByIdWithSources(id);

  if (!prediction) return notFound();

  const { isPermitted } = !prediction.created_by
    ? { isPermitted: false }
    : await checkPermission(
        PERMISSION_BASE.PREDICTIONS_UPDATE,
        prediction.created_by,
        claims,
      );

  if (!isPermitted) {
    redirect("/403-forbidden");
  }

  // 2. Fetch Categories (for the dropdown)
  const categories = await getCategories();

  return (
    <div className="container">
      <EditPredictionForm
        prediction={prediction}
        categories={categories || []}
        guruSlug={slug}
      />
    </div>
  );
}
```

## 3. The Client Form Component (Interactivity)
This Client Component handles user input and connects the UI to the backend logic.

Key Responsibilities:

* **Progressive Enhancement**: Utilizes React's useActionState hook. This binds the Server Action to the form submission, managing pending states (isPending) and displaying validation errors returned from the server automatically.

* **State Preservation:** Pre-populates the fields with the prediction prop initially. If validation fails, it falls back to state?.inputs so the user doesn't lose their typed data.

* **Complex Data Serialization:** Standard HTML forms cannot naturally submit arrays of objects (like the sources list). This component stores the sources in React state (useState) and dynamically converts them to a JSON string in a hidden input <input type="hidden" name="sources_json" /> just before submission.

### src/components/predictions/edit-prediction-form.tsx

```typescript
"use client";

import { updatePrediction } from "@/actions/prediction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionState } from "react";
import {
  FormCard,
  FormContent,
  FormGroup,
} from "@/components/layout/form-card";
import { Database } from "@/lib/definitions/database.types";
import { format } from "date-fns";
import { SourceManager } from "./source-manager";
import { useState } from "react";
import { PredictionByIdWithSources } from "@/lib/data/predictions";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface EditPredictionFormProps {
  prediction: PredictionByIdWithSources;
  categories: Category[];
  guruSlug: string;
}

type PredictionSource = PredictionByIdWithSources["prediction_sources"][number];
type PredictionSources = Partial<PredictionSource>[];

export function EditPredictionForm({
  prediction,
  categories,
  guruSlug,
}: EditPredictionFormProps) {
  const [state, action, isPending] = useActionState(
    updatePrediction,
    undefined,
  );

  // Helper to format date for HTML date input (YYYY-MM-DD)
  const defaultDate = prediction.resolution_window_end
    ? format(new Date(prediction.resolution_window_end), "yyyy-MM-dd")
    : "";

  // Initialize Sources State from DB data
  // We expect prediction.prediction_sources to be populated by your fetch query
  const [sources, setSources] = useState<PredictionSources>(
    prediction.prediction_sources || [],
  );

  return (
    <form action={action} className="max-w-2xl">
      <FormCard
        className="border-none py-0 shadow-none"
        title={<h1>Edit Prediction</h1>}
        description={<p>Update details for this prediction.</p>}
      >
        <FormContent>
          {/* Hidden Fields */}
          <input type="hidden" name="id" value={prediction.id} />
          <input type="hidden" name="guru_slug" value={guruSlug} />
          {/* HIDDEN INPUT: This transfers the state to the server action */}
          <input
            type="hidden"
            name="sources_json"
            value={JSON.stringify(sources)}
          />

          {/* Title */}
          <FormGroup>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={state?.inputs?.title || prediction.title}
            />
            {state?.errors?.title && (
              <p className="text-sm text-red-500">{state.errors.title[0]}</p>
            )}
          </FormGroup>

          {/* Category */}
          <FormGroup>
            <Label htmlFor="category_id">Category</Label>
            <Select
              name="category_id"
              defaultValue={
                state?.inputs?.category_id ||
                prediction?.category_id?.toString() ||
                undefined
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.category_id && (
              <p className="text-sm text-red-500">
                {state.errors.category_id[0]}
              </p>
            )}
          </FormGroup>

          {/* Resolution Date */}
          <FormGroup>
            <Label htmlFor="resolution_window_end">Resolution Deadline</Label>
            <Input
              id="resolution_window_end"
              name="resolution_window_end"
              type="date"
              defaultValue={state?.inputs?.resolution_window_end || defaultDate}
            />
            {state?.errors?.resolution_window_end && (
              <p className="text-sm text-red-500">
                {state.errors.resolution_window_end[0]}
              </p>
            )}
          </FormGroup>

          {/* Status & Confidence Row */}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                defaultValue={state?.inputs?.status || prediction.status || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_evaluation">In Evaluation</SelectItem>
                  <SelectItem value="correct">Correct</SelectItem>
                  <SelectItem value="incorrect">Incorrect</SelectItem>
                  <SelectItem value="vague">Vague</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confidence_level">Confidence (%)</Label>
              <Input
                id="confidence_level"
                name="confidence_level"
                type="number"
                min="0"
                max="100"
                defaultValue={
                  state?.inputs?.confidence_level ??
                  prediction.confidence_level ??
                  50
                }
              />
            </FormGroup>
          </div>

          {/* Description */}
          <FormGroup>
            <Label htmlFor="description">Description / Reasoning</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={
                state?.inputs?.description || prediction.description || ""
              }
            />
          </FormGroup>

          {/* Insert Source Manager Here */}
          <SourceManager initialSources={sources} onChange={setSources} />

          {/* Global Error */}
          {state?.message && (
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild disabled={isPending}>
              <a href={`/gurus/${guruSlug}/predictions/${prediction.id}`}>
                Cancel
              </a>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </FormContent>
      </FormCard>
    </form>
  );
}
```