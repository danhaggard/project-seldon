"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  AuthCard,
  FormContent,
  FormGroup,
} from "@/components/auth/form-layout";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, action, isPending] = useActionState(forgotPassword, undefined);

  return (
    <div className={className} {...props}>
      {state?.success ? (
        /* --- 1. Success View --- */
        <AuthCard
          title="Check Your Email"
          description="Password reset instructions have been sent to your email."
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, you will receive a link to
              reset your password shortly.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </AuthCard>
      ) : (
        /* --- 2. Input View --- */
        <form action={action}>
          <AuthCard
            title="Reset Your Password"
            description="Type in your email and we'll send you a link to reset your password"
            footer={
              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Login
                </Link>
              </div>
            }
          >
            <FormContent>
              {/* Email Field */}
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  defaultValue={state?.inputs?.email}
                  required
                />
                {state?.errors?.email && (
                  <p className="text-sm text-red-500">
                    {state.errors.email[0]}
                  </p>
                )}
              </FormGroup>

              {/* Global API Error */}
              {state?.message && (
                <p className="text-sm text-red-500 font-medium">
                  {state.message}
                </p>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending..." : "Send reset email"}
              </Button>
            </FormContent>
          </AuthCard>
        </form>
      )}
    </div>
  );
}
