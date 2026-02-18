import { jwtDecode } from "jwt-decode";
import { AppRole, APP_ROLE } from "../definitions/auth";

/**
 * Extracts the user_role from the Supabase JWT
 */
export function getUserRoles(accessToken: string): AppRole[] {
  try {
    const decoded: { user_roles?: AppRole[] | null } = jwtDecode(accessToken);
    return decoded.user_roles || [APP_ROLE.USER];
  } catch {
    return [APP_ROLE.USER];
  }
}

export function getHasUserRoles(
  accessToken: string,
  requiredRoles: AppRole[],
  userRolesArg: AppRole[] | null = null,
): boolean {
  const userRoles = userRolesArg || getUserRoles(accessToken);
  const hasUserRoles = requiredRoles.some((role) => userRoles.includes(role));
  return hasUserRoles;
}
