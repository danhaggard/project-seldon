import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountForm } from "./components/account-form";

export default async function AccountPage() {
  const supabase = await createClient();

  // 1. Get User
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  // 2. Get Profile Data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, username, website, avatar_url")
    .eq("id", user.id)
    .single();

  // Handle case where profile doesn't exist yet (first login)
  const profileData = profile || {
    full_name: "",
    username: "",
    website: "",
    avatar_url: "",
  };

  // Combine user email with profile data
  const combinedData = {
    ...profileData,
    email: user.email!,
  };

  return (
    <div className="container">
      <AccountForm profile={combinedData} />
    </div>
  );
}
