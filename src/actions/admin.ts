"use server";

import { createClient } from "@/lib/supabase/server"; // Standard client for RLS checks
import { createAdminClient } from "@/lib/supabase/admin"; // Client with Service Role Key
import { revalidatePath } from "next/cache";
import { AppRole } from "@/lib/definitions/auth";

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
  // 1. Initialize the standard client to check the CALLER'S session
  const supabase = await createClient();

  // 2. Extract the JWT claims to check the caller's permissions
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Security Check: Is the caller logged in?
  if (authError || !user) {
    throw new Error("Authentication required.");
  }

  // Security Check: Does the caller have the 'admin' role in their JWT?
  // We check the 'user_roles' array we set up in the custom hook.
  const callerRoles = (user.app_metadata?.user_roles as string[]) || [];
  if (!callerRoles.includes("admin")) {
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
  const supabase = await createClient();
  const adminClient = await createAdminClient(); // Needs SUPABASE_SERVICE_ROLE_KEY

  // 1. Verify Admin Clearance
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user.app_metadata.user_role !== "admin") {
    throw new Error("Unauthorized");
  }

  // 2. Delete from Auth (irreversible)
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath("/admin");
}
