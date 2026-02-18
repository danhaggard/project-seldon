import { jwtDecode } from "jwt-decode";
import { AppRole, APP_ROLE } from "../definitions/auth";
import { createClient } from "./server";

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

export async function getIsAdminModCreator(createdById = "") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdminModCreator = false;
  if (user) {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdminOrMod = roles?.some((r) =>
      [APP_ROLE.ADMIN, APP_ROLE.MODERATOR].includes(r.role),
    );
    const isCreator = createdById === user.id;
    isAdminModCreator = isAdminOrMod || isCreator;
  }
  return isAdminModCreator;
}
