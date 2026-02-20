"use client";

import { createGuru } from "@/actions/guru";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import {
  FormCard,
  FormContent,
  FormGroup,
  FormError,
  FormFieldDescription,
  FormAlert,
} from "@/components/layout/form-card";
import Link from "next/link";
import { routes } from "@/config/routes";

export function CreateGuruForm() {
  const [state, action, isPending] = useActionState(createGuru, undefined);

  return (
    <form action={action} className="space-y-6 max-w-2xl" aria-busy={isPending}>
      <FormCard
        className="border-none py-0 shadow-none"
        title={<h1>Add a New Guru</h1>}
        description={<p>Create a new profile to track public predictions.</p>}
      >
        <FormContent>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Cathie Wood"
              defaultValue={state?.inputs?.name || ""}
              required
              className={cn(state?.errors?.name && "border-red-500")}
              aria-describedby="nameError nameDescription"
              aria-invalid={!!state?.errors?.name}
            />
            <FormError id="nameError" errors={state?.errors?.name} />
            <FormFieldDescription id="nameDescription">
              This will automatically generate their URL slug.
            </FormFieldDescription>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="A brief description of who they are and what they predict..."
              defaultValue={state?.inputs?.bio || ""}
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
                placeholder="CathieDWood"
                defaultValue={state?.inputs?.twitter_handle || ""}
                className={cn("rounded-l-none", state?.errors?.twitter_handle && "border-red-500")}
                aria-describedby="twitterHandleError"
                aria-invalid={!!state?.errors?.twitter_handle}
              />
            </div>
            <FormError id="twitterHandleError" errors={state?.errors?.twitter_handle} />
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
                placeholder="ARKInvest"
                defaultValue={state?.inputs?.youtube_channel || ""}
                className={cn("rounded-l-none", state?.errors?.youtube_channel && "border-red-500")}
                aria-describedby="youtubeChannelError"
                aria-invalid={!!state?.errors?.youtube_channel}
              />
            </div>
            <FormError id="youtubeChannelError" errors={state?.errors?.youtube_channel} />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://ark-invest.com"
              defaultValue={state?.inputs?.website || ""}
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
              <Link href={routes.gurus.index}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Guru"}
            </Button>
          </div>
        </FormContent>
      </FormCard>
    </form>
  );
}
