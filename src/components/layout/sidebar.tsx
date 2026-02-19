import { SmartLink } from "@/components/ui/smart-link";
import { siteConfig } from "@/config/site";
import { getClaims } from "@/lib/supabase/rbac";

// Turn into an async component
export async function SidebarContent() {
  const claims = await getClaims();
  return (
    <nav className="flex flex-col gap-2 pr-4">
      {siteConfig.nav.map((item) => {
        const Icon = item.icon;

        return (
          <SmartLink
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm font-medium"
            requireAuth={item.requireAuth}
            requiredPermission={item.requiredPermission}
            claims={claims}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </SmartLink>
        );
      })}
    </nav>
  );
}
