"use client";

import { useActionState } from "react";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  AuthCard,
  FormContent,
  FormGroup,
} from "@/components/auth/form-layout";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, action, isPending] = useActionState(signup, undefined);

  return (
    <div className={className} {...props}>
      <form action={action}>
        <AuthCard
          title="Sign up"
          description="Create a new account"
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
              />
              {state?.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </FormGroup>

            {/* Password Field */}
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
              {state?.errors?.password && (
                <div className="text-sm text-red-500">
                  <ul>
                    {state.errors.password.map((error: string) => (
                      <li key={error}>- {error}</li>
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
              />
              {state?.errors?.repeatPassword && (
                <p className="text-sm text-red-500">
                  {state.errors.repeatPassword[0]}
                </p>
              )}
            </FormGroup>

            {/* Global Error Message */}
            {state?.message && (
              <p className="text-sm text-red-500 font-medium">
                {state.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Sign up"}
            </Button>
          </FormContent>
        </AuthCard>
      </form>
    </div>
  );
}
