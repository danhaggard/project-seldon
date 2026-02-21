"use client";

import { updatePrediction } from "@/actions/prediction";
import { cn } from "@/lib/utils";
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
  FormContent,
  FormGroup,
  FormError,
  FormAlert,
  FormHeader,
} from "@/components/layout/form-card";
import { format } from "date-fns";
import { SourceManager } from "../../../../../../../../components/predictions/source-manager";
import { useState } from "react";
import { PredictionByIdWithSources } from "@/lib/data/predictions";
import Link from "next/link";
import { Category } from "@/lib/definitions/category";
import { routes } from "@/config/routes";

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
    <form
      action={action}
      aria-busy={isPending}
      className="flex flex-col gap-8 w-full"
    >
      {/* 1. Standard Page Header (Replaces CardHeader) */}
      <FormHeader
        title="Edit Prediction"
        description="Update details for this prediction."
      />
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
            className={cn(state?.errors?.title && "border-red-500")}
            aria-invalid={!!state?.errors?.title}
            aria-describedby="titleError"
          />
          <FormError id="titleError" errors={state?.errors?.title} />
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
            <SelectTrigger
              className={cn(state?.errors?.category_id && "border-red-500")}
              aria-invalid={!!state?.errors?.category_id}
              aria-describedby="categoryError"
            >
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
          <FormError id="categoryError" errors={state?.errors?.category_id} />
        </FormGroup>

        {/* Resolution Date */}
        <FormGroup>
          <Label htmlFor="resolution_window_end">Resolution Deadline</Label>
          <Input
            id="resolution_window_end"
            name="resolution_window_end"
            type="date"
            defaultValue={state?.inputs?.resolution_window_end || defaultDate}
            className={cn(
              state?.errors?.resolution_window_end && "border-red-500",
            )}
            aria-invalid={!!state?.errors?.resolution_window_end}
            aria-describedby="resolutionWindowEndError"
          />
          <FormError
            id="resolutionWindowEndError"
            errors={state?.errors?.resolution_window_end}
          />
        </FormGroup>

        {/* Status & Confidence Row */}
        <div className="grid grid-cols-2 gap-4">
          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              defaultValue={state?.inputs?.status || prediction.status || ""}
            >
              <SelectTrigger
                className={cn(state?.errors?.status && "border-red-500")}
                aria-invalid={!!state?.errors?.status}
                aria-describedby="statusError"
              >
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
            <FormError id="statusError" errors={state?.errors?.status} />
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
              className={cn(
                state?.errors?.confidence_level && "border-red-500",
              )}
              aria-invalid={!!state?.errors?.confidence_level}
              aria-describedby="confidenceLevelError"
            />
            <FormError
              id="confidenceLevelError"
              errors={state?.errors?.confidence_level}
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
            className={cn(state?.errors?.description && "border-red-500")}
            aria-invalid={!!state?.errors?.description}
            aria-describedby="descriptionError"
          />
          <FormError
            id="descriptionError"
            errors={state?.errors?.description}
          />
        </FormGroup>

        {/* Insert Source Manager Here */}
        <SourceManager initialSources={sources} onChange={setSources} />

        {/* Global Error */}
        <FormAlert message={state?.message} />

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild disabled={isPending}>
            <Link href={routes.gurus.predictionDetail(guruSlug, prediction.id)}>
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </FormContent>
    </form>
  );
}
