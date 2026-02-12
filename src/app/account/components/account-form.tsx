"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  AuthCard,
  FormContent,
  FormGroup,
} from "@/components/auth/form-layout";

// Define the shape of the data we expect from Supabase
interface ProfileData {
  full_name: string | null;
  username: string | null;
  website: string | null;
  email: string;
}

export function AccountForm({ profile }: { profile: ProfileData }) {
  const [state, action, isPending] = useActionState(updateProfile, undefined);

  return (
    <form action={action}>
      <AuthCard
        title="Profile Settings"
        description="Update your personal information."
      >
        <FormContent>
          {/* Email (Read Only) */}
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </FormGroup>

          {/* Full Name */}
          <FormGroup>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Your full name"
              defaultValue={profile.full_name || ""}
            />
            {state?.errors?.fullName && (
              <p className="text-sm text-red-500">{state.errors.fullName[0]}</p>
            )}
          </FormGroup>

          {/* Username */}
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="username"
              defaultValue={profile.username || ""}
            />
            {state?.errors?.username && (
              <p className="text-sm text-red-500">{state.errors.username[0]}</p>
            )}
          </FormGroup>

          {/* Website */}
          <FormGroup>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              defaultValue={profile.website || ""}
            />
            {state?.errors?.website && (
              <p className="text-sm text-red-500">{state.errors.website[0]}</p>
            )}
          </FormGroup>

          {/* Success / Error Message */}
          {state?.message && (
            <div
              className={`text-sm font-medium ${
                state.success ? "text-green-600" : "text-red-500"
              }`}
            >
              {state.message}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Update Profile"}
          </Button>
        </FormContent>
      </AuthCard>
    </form>
  );
}
