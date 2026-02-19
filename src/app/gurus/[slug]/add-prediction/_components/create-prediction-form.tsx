"use client";

import { createPrediction } from "@/actions/prediction";
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
import { useActionState, useState } from "react";
import {
  FormCard,
  FormContent,
  FormGroup,
} from "@/components/layout/form-card";
import { SourceManager } from "@/components/predictions/source-manager";
import { format } from "date-fns";
import { PredictionByIdWithSources } from "@/lib/data/predictions";
import { Category } from "@/lib/definitions/category";

interface CreatePredictionFormProps {
  guruId: string;
  guruSlug: string;
  guruName: string;
  categories: Category[];
}
type PredictionSource = PredictionByIdWithSources["prediction_sources"][number];
type PredictionSources = Partial<PredictionSource>[];

export function CreatePredictionForm({
  guruId,
  guruSlug,
  guruName,
  categories,
}: CreatePredictionFormProps) {
  const [state, action, isPending] = useActionState(
    createPrediction,
    undefined,
  );

  // Start with empty sources since this is a new prediction
  const [sources, setSources] = useState<PredictionSources>([]);

  // Default the prediction date to today
  const todayDate = format(new Date(), "yyyy-MM-dd");

  return (
    <form action={action} className="max-w-2xl">
      <FormCard
        className="border-none py-0 shadow-none"
        title={<h1>Log a Prediction for {guruName}</h1>}
        description={
          <p>Add a new claim to the database to begin tracking it.</p>
        }
      >
        <FormContent>
          {/* Hidden Foreign Keys & Context */}
          <input type="hidden" name="guru_id" value={guruId} />
          <input type="hidden" name="guru_slug" value={guruSlug} />
          <input
            type="hidden"
            name="sources_json"
            value={JSON.stringify(sources)}
          />

          <FormGroup>
            <Label htmlFor="title">Title / The Claim</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Bitcoin will reach $250k by 2030"
              defaultValue={state?.inputs?.title || ""}
              required
            />
            {state?.errors?.title && (
              <p className="text-sm text-red-500">{state.errors.title[0]}</p>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category_id">Category</Label>
            <Select
              name="category_id"
              defaultValue={state?.inputs?.category_id || undefined}
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

          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <Label htmlFor="prediction_date">Date Made</Label>
              <Input
                id="prediction_date"
                name="prediction_date"
                type="date"
                defaultValue={state?.inputs?.prediction_date || todayDate}
                required
              />
              {state?.errors?.prediction_date && (
                <p className="text-sm text-red-500">
                  {state.errors.prediction_date[0]}
                </p>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="resolution_window_end">Deadline</Label>
              <Input
                id="resolution_window_end"
                name="resolution_window_end"
                type="date"
                defaultValue={state?.inputs?.resolution_window_end || ""}
              />
              {state?.errors?.resolution_window_end && (
                <p className="text-sm text-red-500">
                  {state.errors.resolution_window_end[0]}
                </p>
              )}
            </FormGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                defaultValue={state?.inputs?.status || "pending"}
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
              <Label htmlFor="confidence_level">
                Guru&apos;s Confidence (%)
              </Label>
              <Input
                id="confidence_level"
                name="confidence_level"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 90"
                defaultValue={state?.inputs?.confidence_level || ""}
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor="description">Description / Reasoning</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Any additional context provided by the guru..."
              defaultValue={state?.inputs?.description || ""}
            />
          </FormGroup>

          {/* Mount the SourceManager with an empty array */}
          <SourceManager initialSources={sources} onChange={setSources} />

          {state?.message && (
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" asChild disabled={isPending}>
              <a href={`/gurus/${guruSlug}`}>Cancel</a>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create Prediction"}
            </Button>
          </div>
        </FormContent>
      </FormCard>
    </form>
  );
}
