"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  FormCard,
  FormContent,
  FormGroup,
  FormError,
  FormAlert,
} from "@/components/layout/form-card";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, action, isPending] = useActionState(forgotPassword, undefined);

  return (
    <div className={className} {...props}>
      {state?.success ? (
        /* --- 1. Success View --- */
        <FormCard
          title={<h1>Check Your Email</h1>}
          description={<p>Password reset instructions have been sent to your email.</p>}
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
        </FormCard>
      ) : (
        /* --- 2. Input View --- */
        <form action={action} aria-busy={isPending}>
          <FormCard
            title={<h1>Reset Your Password</h1>}
            description={<p>Type in your email and we&apos;ll send you a link to reset your password</p>}
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
                  autoComplete="email"
                  className={cn(state?.errors?.email && "border-red-500")}
                  aria-invalid={!!state?.errors?.email}
                  aria-describedby="emailError"
                />
                <FormError id="emailError" errors={state?.errors?.email} />
              </FormGroup>

              {/* Global API Error */}
              <FormAlert message={state?.message} />

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending..." : "Send reset email"}
              </Button>
            </FormContent>
          </FormCard>
        </form>
      )}
    </div>
  );
}
