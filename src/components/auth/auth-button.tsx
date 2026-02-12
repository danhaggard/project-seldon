import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "../logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

export function AuthButtonSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      {/* Mimic the "Sign in" button size */}
      <div className="h-9 w-16 bg-muted rounded-md" />
      {/* Mimic the "Sign up" button size */}
      <div className="h-9 w-16 bg-muted rounded-md" />
    </div>
  );
}
