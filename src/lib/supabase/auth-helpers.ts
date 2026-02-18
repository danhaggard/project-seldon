import { jwtDecode } from "jwt-decode";
import { UserRole } from "../definitions/user-role";

/**
 * Extracts the user_role from the Supabase JWT
 */
export function getUserRole(accessToken: string): UserRole {
  try {
    const decoded: { user_role?: UserRole | null } = jwtDecode(accessToken);
    return decoded.user_role || "user";
  } catch {
    return "user";
  }
}
