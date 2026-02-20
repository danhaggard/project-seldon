import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { AppPermission, PermissionClaims } from "@/lib/definitions/rbac";
import { getClaims, hasPermission } from "@/lib/supabase/rbac";
import type { ComponentProps } from "react";

interface SmartLinkProps extends ComponentProps<typeof Link> {
  requireAuth?: boolean;
  requiredPermission?: AppPermission;
  claims?: PermissionClaims | null;
}

export async function SmartLink({
  href,
  className,
  children,
  requireAuth: manualRequireAuth,
  requiredPermission: manualPermission,
  claims: passedClaims,
  ...props
}: SmartLinkProps) {
  // 1. Use the passed claims if they exist, otherwise fetch them (fallback)
  let claims = passedClaims;
  if (claims === undefined) {
    claims = await getClaims();
  }

  const isLoggedIn = !!claims?.sub;

  // 2. Resolve Config Rules
  const configItem = siteConfig.nav.find((item) => item.href === href);
  const requiresAuth = manualRequireAuth ?? configItem?.requireAuth ?? false;
  const requiredPermission = manualPermission ?? configItem?.requiredPermission;

  // --- CHECK 1: AUTHENTICATION ---
  if (requiresAuth && !isLoggedIn) {
    return null;
  }

  // --- CHECK 2: RBAC PERMISSIONS ---
  if (requiredPermission) {
    if (!hasPermission(claims, requiredPermission)) {
      return null;
    }
  }

  return (
    <Link href={href} className={cn(className)} {...props}>
      {children}
    </Link>
  );
}
