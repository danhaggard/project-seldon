"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormCard,
  FormContent,
  FormGroup,
  FormAlert,
  FormError,
} from "@/components/layout/form-card";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, action, isPending] = useActionState(updatePassword, undefined);

  return (
    <div className={className} {...props}>
      <form action={action} aria-busy={isPending}>
        <FormCard
          title={<h1>Update Your Password</h1>}
          description={<p>Please enter your new password below.</p>}
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
                autoComplete="new-password"
                className={cn(state?.errors?.password && "border-red-500")}
                aria-invalid={!!state?.errors?.password}
                aria-describedby="passwordError"
              />
              {state?.errors?.password && (
                <div id="passwordError" aria-live="polite" className="text-sm text-red-500">
                  <ul className="list-disc list-inside">
                    {state.errors.password.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
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
                autoComplete="new-password"
                className={cn(state?.errors?.repeatPassword && "border-red-500")}
                aria-invalid={!!state?.errors?.repeatPassword}
                aria-describedby="repeatPasswordError"
              />
              <FormError id="repeatPasswordError" errors={state?.errors?.repeatPassword} />
            </FormGroup>

            {/* Global Error */}
            <FormAlert message={state?.message} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving..." : "Save new password"}
            </Button>
          </FormContent>
        </FormCard>
      </form>
    </div>
  );
}
