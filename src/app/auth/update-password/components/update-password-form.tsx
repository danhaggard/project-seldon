"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthCard,
  FormContent,
  FormGroup,
} from "@/components/auth/form-layout";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, action, isPending] = useActionState(updatePassword, undefined);

  return (
    <div className={className} {...props}>
      <form action={action}>
        <AuthCard
          title="Update Your Password"
          description="Please enter your new password below."
        >
          <FormContent>
            {/* New Password Field */}
            <FormGroup>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="New password"
                required
              />
              {state?.errors?.password && (
                <ul className="text-sm text-red-500 list-disc list-inside">
                  {state.errors.password.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              )}
            </FormGroup>

            {/* Repeat Password Field */}
            <FormGroup>
              <Label htmlFor="repeatPassword">Confirm password</Label>
              <Input
                id="repeatPassword"
                name="repeatPassword"
                type="password"
                placeholder="Confirm new password"
                required
              />
              {state?.errors?.repeatPassword && (
                <p className="text-sm text-red-500">
                  {state.errors.repeatPassword[0]}
                </p>
              )}
            </FormGroup>

            {/* Global Error */}
            {state?.message && (
              <p className="text-sm text-red-500 font-medium">
                {state.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving..." : "Save new password"}
            </Button>
          </FormContent>
        </AuthCard>
      </form>
    </div>
  );
}
