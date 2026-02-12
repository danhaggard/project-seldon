import Link, { LinkProps } from "next/link";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface SmartLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  // Optional: Allow manual overrides for links NOT in siteConfig
  isProtected?: boolean;
  roles?: string[];
}

export async function SmartLink({
  href,
  className,
  children,
  isProtected: manualProtected,
  roles: manualRoles,
  ...props
}: SmartLinkProps) {
  // 1. Get the current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Find the config rule for this specific link (if it exists)
  // We only look up string hrefs. Object hrefs are skipped.
  const configHref = typeof href === "string" ? href : null;
  const configItem = configHref
    ? siteConfig.nav.find((item) => item.href === configHref)
    : null;

  // 3. Merge Config Rules with Manual Props
  // Manual props take precedence if provided
  const requiresAuth = manualProtected ?? configItem?.protected ?? false;
  const requiredRoles = manualRoles ?? configItem?.roles ?? [];

  // --- CHECK 1: AUTHENTICATION ---
  // If it's protected and we have no user -> Hide it
  if (requiresAuth && !user) {
    return null;
  }

  // --- CHECK 2: RBAC (Role Based Access) ---
  // We assume roles are stored in user_metadata.role
  if (requiredRoles.length > 0) {
    const userRole = user?.user_metadata?.role;

    // If user has no role, or their role isn't in the allowed list -> Hide it
    if (!userRole || !requiredRoles.includes(userRole)) {
      return null;
    }
  }

  // --- SUCCESS: RENDER THE LINK ---
  return (
    <Link href={href} className={cn(className)} {...props}>
      {children}
    </Link>
  );
}
