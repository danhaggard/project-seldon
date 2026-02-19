import React from "react";
import {
  AppPermission,
  PermissionBase,
  PermissionClaims,
} from "@/lib/definitions/rbac";
import { getClaims, hasPermission } from "@/lib/supabase/rbac";

// We use a discriminated union here so TypeScript forces you to provide
// a resourceOwnerId ONLY if you are using a PermissionBase like "predictions.update"
type ActionGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  claims?: PermissionClaims | null; // Optional: Pass this down in loops for performance
} & (
  | { permission: AppPermission; resourceOwnerId?: never }
  | { permission: PermissionBase; resourceOwnerId: string }
);

export async function ActionGuard({
  children,
  fallback = null,
  permission,
  resourceOwnerId,
  claims: passedClaims,
}: ActionGuardProps) {
  console.log("permission", permission);
  console.log("resourceOwnerId", resourceOwnerId);

  // 1. Resolve claims (use passed claims, or fetch if not provided)
  let claims = passedClaims;
  if (claims === undefined) {
    claims = await getClaims();
  }

  // 2. Evaluate the permission
  let canPerformAction = false;

  if (resourceOwnerId !== undefined) {
    // 3-argument overload for Own vs Any
    canPerformAction = hasPermission(
      claims,
      permission as PermissionBase,
      resourceOwnerId,
    );
  } else {
    // 2-argument overload for standard global permissions
    canPerformAction = hasPermission(claims, permission as AppPermission);
  }

  // 3. Render accordingly
  if (!canPerformAction) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
