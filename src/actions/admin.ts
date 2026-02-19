"use server";

import { createAdminClient } from "@/lib/supabase/admin"; // Client with Service Role Key
import { revalidatePath } from "next/cache";
import { APP_PERMISSION, AppRole } from "@/lib/definitions/rbac";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";

export type User = {
  id: string;
  email: string | undefined;
  display_name: string;
  roles: AppRole[];
};

export async function fetchUsers(): Promise<User[]> {
  const adminClient = createAdminClient();

  // 1. Get all users from Auth
  const {
    data: { users },
    error: authError,
  } = await adminClient.auth.admin.listUsers();
  if (authError) throw authError;

  // 2. Get all role mappings
  const { data: roleRows, error: rolesError } = await adminClient
    .from("user_roles")
    .select("user_id, role");
  if (rolesError) throw rolesError;

  // 3. Transform roleRows into a lookup map: { userId: ["admin", "moderator"] }
  const roleMap = roleRows.reduce(
    (acc, row) => {
      if (!acc[row.user_id]) acc[row.user_id] = [];
      acc[row.user_id].push(row.role);
      return acc;
    },
    {} as Record<string, AppRole[]>,
  );

  // 4. Merge into the user objects
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name || user.email?.split("@")[0],
    // Ensure this is ALWAYS an array, even if empty
    roles: roleMap[user.id] || [],
  }));
}

export async function toggleUserRole(
  userId: string,
  role: AppRole,
  active: boolean,
) {
  const claims = await getClaims();

  if (!claims) {
    throw new Error("Authentication required.");
  }

  const { isPermitted } = await checkPermission(
    APP_PERMISSION.USERS_MANAGE,
    claims,
  );

  if (!isPermitted) {
    throw new Error("Forbidden: You do not have permission to manage roles.");
  }

  // 3. Initialize the Admin Client to perform the write
  // (Because only the Service Role Key can modify the user_roles table usually)
  const adminClient = createAdminClient();

  if (active) {
    const { error } = await adminClient
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    if (error) throw error;
  } else {
    const { error } = await adminClient
      .from("user_roles")
      .delete()
      .match({ user_id: userId, role });
    if (error) throw error;
  }

  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  const claims = await getClaims();

  if (!claims) {
    throw new Error("Authentication required.");
  }

  const { isPermitted } = await checkPermission(
    APP_PERMISSION.USERS_MANAGE,
    claims,
  );

  if (!isPermitted) {
    throw new Error("Forbidden: You do not have permission to delete users.");
  }

  const adminClient = await createAdminClient(); // Needs SUPABASE_SERVICE_ROLE_KEY

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath("/admin");
}
