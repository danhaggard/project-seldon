import { redirect } from "next/navigation";
import { AccountForm } from "./components/account-form";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getClaims } from "@/lib/supabase/rbac";
import { getProfile } from "@/lib/data/profiles";

export default async function AccountPage() {
  const claims = await getClaims();

  if (!claims) {
    redirect("/login");
  }
  // 2. Get Profile Data
  const profile = await getProfile(claims.sub);

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
    email: claims.email!,
  };

  return (
    <div className="container">
      <AccountForm profile={combinedData} />
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
        <p>Theme Toggle</p>
        <ThemeSwitcher />
      </footer>
    </div>
  );
}
