"use client";

import { useActionState, useEffect } from "react";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  FormContent,
  FormGroup,
  FormError,
  FormAlert,
} from "@/components/layout/form";
import { FormCard } from "@/components/layout/form-card";

import { routes } from "@/config/routes";

export function LoginForm({
  className,
  isModal = false,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { isModal?: boolean }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(login, undefined);

  useEffect(() => {
    if (state?.success) {
      // 1. Close the modal by popping the intercepted route
      router.back();
      // 2. Refresh the underlying page to update the AuthButton state
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <div className={className} {...props}>
      <form action={action} aria-busy={isPending}>
        {isModal && <input type="hidden" name="isModal" value="true" />}
        <FormCard
          title={<h1>Login</h1>}
          description={<p>Enter your email below to login to your account</p>}
          footer={
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={routes.auth.signUp}
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </Link>
            </div>
          }
        >
          <FormContent>
            {/* Email Group */}
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

            {/* Password Group */}
            <FormGroup>
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href={routes.auth.forgotPassword}
                  className="ml-auto inline-block text-sm underline-offset-4 hover:text-primary"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={cn(state?.errors?.password && "border-red-500")}
                aria-invalid={!!state?.errors?.password}
                aria-describedby="passwordError"
              />
              <FormError id="passwordError" errors={state?.errors?.password} />
            </FormGroup>

            {/* Global Error */}
            <FormAlert message={state?.message} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </FormContent>
        </FormCard>
      </form>
    </div>
  );
}
