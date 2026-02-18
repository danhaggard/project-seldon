import { jwtDecode } from "jwt-decode";
import { AppRole, ROLES } from "../definitions/auth";

/**
 * Extracts the user_role from the Supabase JWT
 */
export function getUserRoles(accessToken: string): AppRole[] {
  try {
    const decoded: { user_roles?: AppRole[] | null } = jwtDecode(accessToken);
    return decoded.user_roles || [ROLES.USER];
  } catch {
    return [ROLES.USER];
  }
}

export function getHasUserRoles(
  accessToken: string,
  requiredRoles: AppRole[],
  userRolesArg: AppRole[] | null = null,
): boolean {
  const userRoles = userRolesArg || getUserRoles(accessToken);
  const hasUserRoles = requiredRoles.some((role) => userRoles.includes(role));
  console.log("userRoles", userRoles);
  return hasUserRoles;
}
