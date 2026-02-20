"use client";

import { useActionState } from "react";
import { signup } from "@/actions/auth";
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

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, action, isPending] = useActionState(signup, undefined);

  return (
    <div className={className} {...props}>
      <form action={action} aria-busy={isPending}>
        <FormCard
          title={<h1>Sign up</h1>}
          description={<p>Create a new account</p>}
          footer={
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
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
                autoComplete="email"
                className={cn(state?.errors?.email && "border-red-500")}
                aria-invalid={!!state?.errors?.email}
                aria-describedby="emailError"
              />
              <FormError id="emailError" errors={state?.errors?.email} />
            </FormGroup>

            {/* Password Field */}
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="new-password"
                className={cn(state?.errors?.password && "border-red-500")}
                aria-invalid={!!state?.errors?.password}
                aria-describedby="passwordError"
              />
              {state?.errors?.password && (
                <div id="passwordError" aria-live="polite" className="text-sm text-red-500">
                  <ul className="list-disc pl-5">
                    {state.errors.password.map((error: string) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </FormGroup>

            {/* Repeat Password Field */}
            <FormGroup>
              <Label htmlFor="repeat-password">Repeat Password</Label>
              <Input
                id="repeat-password"
                name="repeat-password"
                type="password"
                autoComplete="new-password"
                className={cn(state?.errors?.repeatPassword && "border-red-500")}
                aria-invalid={!!state?.errors?.repeatPassword}
                aria-describedby="repeatPasswordError"
              />
              <FormError id="repeatPasswordError" errors={state?.errors?.repeatPassword} />
            </FormGroup>

            {/* Global Error Message */}
            <FormAlert message={state?.message} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Sign up"}
            </Button>
          </FormContent>
        </FormCard>
      </form>
    </div>
  );
}
