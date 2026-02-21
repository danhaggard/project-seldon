"use client";

import { updateGuru } from "@/actions/guru";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import {
  FormContent,
  FormGroup,
  FormError,
  FormFieldDescription,
  FormAlert,
} from "@/components/layout/form";
import { FormCard } from "@/components/layout/form-card";

import Link from "next/link";
import { Guru } from "@/lib/definitions/guru";
import { routes } from "@/config/routes";

export function EditGuruForm({ guru }: { guru: Guru }) {
  const [state, action, isPending] = useActionState(updateGuru, undefined);

  return (
    <form action={action} className="space-y-6 max-w-2xl" aria-busy={isPending}>
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
              aria-describedby="nameDescription"
            />
            <FormFieldDescription id="nameDescription">
              Names cannot be changed to preserve URL structure.
            </FormFieldDescription>
          </FormGroup>

          {/* Editable Fields */}
          <FormGroup>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={state?.inputs?.bio || guru.bio || ""}
              rows={4}
              className={cn(state?.errors?.bio && "border-red-500")}
              aria-describedby="bioError"
              aria-invalid={!!state?.errors?.bio}
            />
            <FormError id="bioError" errors={state?.errors?.bio} />
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
                className={cn(
                  "rounded-l-none",
                  state?.errors?.twitter_handle && "border-red-500",
                )}
                aria-describedby="twitterHandleError"
                aria-invalid={!!state?.errors?.twitter_handle}
              />
            </div>
            <FormError
              id="twitterHandleError"
              errors={state?.errors?.twitter_handle}
            />
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
                className={cn(
                  "rounded-l-none",
                  state?.errors?.youtube_channel && "border-red-500",
                )}
                aria-describedby="youtubeChannelError"
                aria-invalid={!!state?.errors?.youtube_channel}
              />
            </div>
            <FormError
              id="youtubeChannelError"
              errors={state?.errors?.youtube_channel}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              defaultValue={state?.inputs?.website || guru.website || ""}
              className={cn(state?.errors?.website && "border-red-500")}
              aria-describedby="websiteError"
              aria-invalid={!!state?.errors?.website}
            />
            <FormError id="websiteError" errors={state?.errors?.website} />
          </FormGroup>

          {/* Global Error Message */}
          <FormAlert message={state?.message} />

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild disabled={isPending}>
              <Link href={routes.gurus.detail(guru.slug)}>Cancel</Link>
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
