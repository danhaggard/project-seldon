"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { signup, checkUsername } from "@/actions/auth";
import { useRouter } from "next/navigation";
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
  FormFieldDescription,
} from "@/components/layout/form-card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { routes } from "@/config/routes";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(signup, undefined);

  useEffect(() => {
    if (state?.success) {
      router.back();
      router.refresh();
    }
  }, [state?.success, router]);

  // Custom Username State
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isUnique, setIsUnique] = useState<boolean | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // The new onChange handler
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.toLowerCase();
    setUsername(newUsername);

    // 1. Clear the previous timer immediately
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 2. Handle empty input
    if (!newUsername) {
      setIsUnique(null);
      setIsChecking(false);
      return;
    }

    // 3. Set loading state
    setIsChecking(true);
    setIsUnique(null);

    // 4. Start the new timer
    debounceTimerRef.current = setTimeout(async () => {
      const isValidFormat = /^[a-zA-Z0-9_]{3,20}$/.test(newUsername);

      if (isValidFormat) {
        const unique = await checkUsername(newUsername);
        setIsUnique(unique);
      } else {
        setIsUnique(false);
      }
      setIsChecking(false);
    }, 500);
  };

  return (
    <div className={className} {...props}>
      <form action={action} aria-busy={isPending}>
        <input type="hidden" name="isModal" value="true" />
        <FormCard
          title={<h1>Sign up</h1>}
          description={<p>Create a new account</p>}
          footer={
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={routes.auth.login}
                className="underline underline-offset-4 hover:text-primary"
              >
                Login
              </Link>
            </div>
          }
        >
          <FormContent>
            <FormGroup>
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                  @
                </span>
                <Input
                  id="username"
                  name="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className={cn(
                    "pl-8",
                    state?.errors?.username || isUnique === false
                      ? "border-red-500"
                      : "",
                    isUnique === true ? "border-green-500" : "",
                  )}
                  aria-invalid={!!state?.errors?.username || isUnique === false}
                  aria-describedby="usernameError usernameDesc"
                />

                <div className="absolute right-3 top-2.5">
                  {isChecking && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {!isChecking && isUnique === true && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {!isChecking && isUnique === false && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              <FormError id="usernameError" errors={state?.errors?.username} />
              {!isChecking &&
                isUnique === false &&
                !state?.errors?.username && (
                  <p className="text-sm text-red-500">
                    Username is taken or invalid.
                  </p>
                )}

              <FormFieldDescription id="usernameDesc">
                This will be your public identity. It cannot be changed later.
              </FormFieldDescription>
            </FormGroup>
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
                <div
                  id="passwordError"
                  aria-live="polite"
                  className="text-sm text-red-500"
                >
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
                className={cn(
                  state?.errors?.repeatPassword && "border-red-500",
                )}
                aria-invalid={!!state?.errors?.repeatPassword}
                aria-describedby="repeatPasswordError"
              />
              <FormError
                id="repeatPasswordError"
                errors={state?.errors?.repeatPassword}
              />
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
