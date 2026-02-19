"use client";

import { updateGuru } from "@/actions/guru";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import {
  FormCard,
  FormContent,
  FormGroup,
} from "@/components/layout/form-card";
import Link from "next/link";
import { Guru } from "@/lib/definitions/guru";

export function EditGuruForm({ guru }: { guru: Guru }) {
  const [state, action, isPending] = useActionState(updateGuru, undefined);

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      <FormCard
        className="border-none py-0 shadow-none"
        title={<h1>Edit Guru</h1>}
        description={<p>Update profile details for {guru.name}.</p>}
      >
        <FormContent>
          {/* Hidden Fields for ID and Slug (needed for the action) */}
          <input type="hidden" name="id" value={guru.id} />
          <input type="hidden" name="slug" value={guru.slug} />

          {/* Read-Only Name Field */}
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={guru.name}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Names cannot be changed to preserve URL structure.
            </p>
          </FormGroup>

          {/* Editable Fields */}
          <FormGroup>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={state?.inputs?.bio || guru.bio || ""}
              rows={4}
              className={state?.errors?.bio ? "border-red-500" : ""}
              aria-describedby="bioError"
            />
            <p aria-live="polite" id="bioError" className="text-sm text-red-500">{state?.errors?.bio && state.errors.bio[0]}</p>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="twitter_handle">Twitter Handle</Label>
            <div className="flex items-center">
              <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                @
              </span>
              <Input
                id="twitter_handle"
                name="twitter_handle"
                defaultValue={
                  state?.inputs?.twitter_handle || guru.twitter_handle || ""
                }
                className="rounded-l-none"
              />
            </div>
            {state?.errors?.twitter_handle && (
              <p className="text-sm text-red-500">
                {state.errors.twitter_handle[0]}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="youtube_channel">Youtube Channel</Label>
            <div className="flex items-center">
              <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                @
              </span>
              <Input
                id="youtube_channel"
                name="youtube_channel"
                defaultValue={
                  state?.inputs?.youtube_channel || guru.youtube_channel || ""
                }
                className="rounded-l-none"
              />
            </div>
            {state?.errors?.youtube_channel && (
              <p className="text-sm text-red-500">
                {state.errors.youtube_channel[0]}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              defaultValue={state?.inputs?.website || guru.website || ""}
            />
            {state?.errors?.website && (
              <p className="text-sm text-red-500">{state.errors.website[0]}</p>
            )}
          </FormGroup>

          {/* Global Error Message */}
          {state?.message && (
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild disabled={isPending}>
              <Link href={`/gurus/${guru.slug}`}>Cancel</Link>
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
