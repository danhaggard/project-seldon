import { createClient } from "./server";

import {
  AppPermission,
  PermissionBase,
  PermissionClaims,
} from "../definitions/rbac";

export async function getClaims() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims;
}

/**
 * A single, unified function to check permissions synchronously.
 * Pass the Supabase User object, the required permission, and optionally the resource owner's ID.
 */
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permissionBase: PermissionBase,
  resourceOwnerId: string,
): boolean;
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permission: AppPermission,
): boolean;
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permissionOrBase: string,
  resourceOwnerId?: string,
): boolean {
  if (!claims || !claims.sub) return false;

  const userPermissions: string[] = claims.app_metadata?.permissions || [];

  // 1. If we are checking an "Own vs Any" permission
  if (resourceOwnerId) {
    const anyPerm = `${permissionOrBase}.any`;
    const ownPerm = `${permissionOrBase}.own`;

    if (userPermissions.includes(anyPerm)) return true;
    if (userPermissions.includes(ownPerm) && claims.sub === resourceOwnerId)
      return true;

    return false;
  }

  // 2. If it's a standard permission check
  return userPermissions.includes(permissionOrBase);
}

/**
 * Checks if a user has ANY capability (either .own or .any) for a given base permission.
 * Used primarily by edge middleware where resource ownership cannot be evaluated.
 */
export function hasPermissionBase(
  claims: PermissionClaims | null | undefined,
  permissionBase: PermissionBase,
): boolean {
  if (!claims || !claims.sub) return false;

  const userPermissions: string[] = claims.app_metadata?.permissions || [];

  const anyPerm = `${permissionBase}.any`;
  const ownPerm = `${permissionBase}.own`;

  return userPermissions.includes(anyPerm) || userPermissions.includes(ownPerm);
}

type CheckPermissionReturn = {
  isPermitted: boolean;
  claims: PermissionClaims | null | undefined;
};

export async function checkPermission(
  permissionBase: PermissionBase,
  resourceOwnerId: string,
  passedClaims?: PermissionClaims | null,
): Promise<CheckPermissionReturn>;
export async function checkPermission(
  permission: AppPermission,
  passedClaims?: PermissionClaims | null,
): Promise<CheckPermissionReturn>;
// Implementation signature acts as a catch-all
export async function checkPermission(
  permissionOrBase: string,
  arg2?: string | PermissionClaims | null,
  arg3?: PermissionClaims | null,
): Promise<CheckPermissionReturn> {
  // 1. Unpack the arguments based on their type
  let resourceOwnerId: string | undefined = undefined;
  let passedClaims: PermissionClaims | null | undefined = undefined;

  if (typeof arg2 === "string") {
    // It matches Overload 1
    resourceOwnerId = arg2;
    passedClaims = arg3;
  } else {
    // It matches Overload 2
    passedClaims = arg2;
  }

  // 2. Resolve claims
  let claims = passedClaims;
  if (claims === undefined) {
    claims = await getClaims();
  }

  // 3. Delegate to the synchronous helper
  if (resourceOwnerId !== undefined) {
    // We have an ID, target the Own vs Any overload
    return {
      isPermitted: hasPermission(
        claims,
        permissionOrBase as PermissionBase,
        resourceOwnerId,
      ),
      claims,
    };
  }

  // No ID, target the standard permission overload
  return {
    isPermitted: hasPermission(claims, permissionOrBase as AppPermission),
    claims,
  };
}
