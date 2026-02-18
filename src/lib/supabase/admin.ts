import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/definitions/database.types"; // Adjust path to your types

/**
 * WARNING: This client uses the SERVICE_ROLE_KEY.
 * It bypasses all RLS policies.
 * Only use this in Server Actions or API Routes that have
 * explicit admin-check logic.
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Admin client requested but SUPABASE_SERVICE_ROLE_KEY is missing.",
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
