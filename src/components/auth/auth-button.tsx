import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { routes } from "@/config/routes";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="icon" className="rounded-full">
        <Link href={routes.account} title="Account">
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="sr-only">Account</span>
        </Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href={routes.auth.login}>Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href={routes.auth.signUp}>Sign up</Link>
      </Button>
    </div>
  );
}

export function AuthButtonSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      <div className="h-9 w-16 bg-muted rounded-md" />
      <div className="h-9 w-16 bg-muted rounded-md" />
    </div>
  );
}
