"use client";

import { createGuru } from "@/actions/guru";
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

export function CreateGuruForm() {
  const [state, action, isPending] = useActionState(createGuru, undefined);

  return (
    <form action={action} className="space-y-6 max-w-2xl">
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
            />
            {state?.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name[0]}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will automatically generate their URL slug.
            </p>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="A brief description of who they are and what they predict..."
              defaultValue={state?.inputs?.bio || ""}
              rows={4}
            />
            {state?.errors?.bio && (
              <p className="text-sm text-red-500">{state.errors.bio[0]}</p>
            )}
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
                placeholder="ARKInvest"
                defaultValue={state?.inputs?.youtube_channel || ""}
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
              placeholder="https://ark-invest.com"
              defaultValue={state?.inputs?.website || ""}
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
              <Link href="/gurus">Cancel</Link>
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
