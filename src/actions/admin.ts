"use server";

import { createClient } from "@/lib/supabase/server"; // Standard client for RLS checks
import { createAdminClient } from "@/lib/supabase/admin"; // Client with Service Role Key
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();

  // 1. Verify the current user is an admin via JWT claims
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user.app_metadata.user_role !== "admin") {
    throw new Error("Unauthorized: Admin clearance required.");
  }

  // 2. Update the role in the public.user_roles table
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });

  if (error) throw error;

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
