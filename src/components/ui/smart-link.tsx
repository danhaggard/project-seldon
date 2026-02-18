import Link, { LinkProps } from "next/link";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getHasUserRoles } from "@/lib/supabase/auth-helpers";
import { AppRole } from "@/lib/definitions/auth";

interface SmartLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  isProtected?: boolean;
  roles?: AppRole[];
}

export async function SmartLink({
  href,
  className,
  children,
  isProtected: manualProtected,
  roles: manualRoles,
  ...props
}: SmartLinkProps) {
  const supabase = await createClient();

  // 1. Get the session to access the JWT claims
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // 2. Resolve Config Rules
  const configHref = typeof href === "string" ? href : null;
  const configItem = configHref
    ? siteConfig.nav.find((item) => item.href === configHref)
    : null;

  const requiresAuth = manualProtected ?? configItem?.protected ?? false;
  const requiredRoles = manualRoles ?? configItem?.roles ?? [];

  // --- CHECK 1: AUTHENTICATION ---
  if (requiresAuth && !user) {
    return null;
  }

  // --- CHECK 2: RBAC (Role Based Access) ---
  if (requiredRoles.length > 0) {
    const hasUserRoles = getHasUserRoles(
      session?.access_token || "",
      requiredRoles,
    );

    if (!hasUserRoles) {
      return null;
    }
  }

  return (
    <Link href={href} className={cn(className)} {...props}>
      {children}
    </Link>
  );
}
