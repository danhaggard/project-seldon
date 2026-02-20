"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  FormCard,
  FormContent,
  FormGroup,
  FormError,
  FormAlert,
  FormFieldDescription,
} from "@/components/layout/form-card";

interface ProfileData {
  full_name: string | null;
  username: string | null;
  website: string | null;
  email: string;
}

export function AccountForm({ profile }: { profile: ProfileData }) {
  const [state, action, isPending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} aria-busy={isPending}>
      <FormCard
        className="border-none py-0 shadow-none"
        title={<h1>Profile Settings</h1>}
        description={<p>Update your personal information.</p>}
      >
        <FormContent>
          {/* Username (Read Only) */}
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              defaultValue={profile.username || ""}
              disabled
              autoComplete="username"
              className="bg-muted text-muted-foreground"
              aria-describedby="usernameDesc"
            />
            <FormFieldDescription id="usernameDesc">
              Your username is your unique identity and cannot be changed.
            </FormFieldDescription>
          </FormGroup>

          {/* Email (Read Only) */}
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              defaultValue={profile.email}
              disabled
              autoComplete="email"
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
              autoComplete="name"
              className={cn(state?.errors?.fullName && "border-red-500")}
              aria-invalid={!!state?.errors?.fullName}
              aria-describedby="fullNameError"
            />
            <FormError id="fullNameError" errors={state?.errors?.fullName} />
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
              autoComplete="url"
              className={cn(state?.errors?.website && "border-red-500")}
              aria-invalid={!!state?.errors?.website}
              aria-describedby="websiteError"
            />
            <FormError id="websiteError" errors={state?.errors?.website} />
          </FormGroup>

          {/* Success / Error Message */}
          <FormAlert 
            message={state?.message} 
            type={state?.success ? "success" : "error"} 
          />

          {/* Submit Button */}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Update Profile"}
          </Button>
        </FormContent>
      </FormCard>
    </form>
  );
}