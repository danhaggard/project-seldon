import { SmartLink } from "@/components/ui/smart-link";
import { siteConfig } from "@/config/site";

export function SidebarContent() {
  return (
    <nav className="flex flex-col gap-2 pr-4">
      {siteConfig.nav.map((item) => {
        const Icon = item.icon;

        return (
          <SmartLink
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm font-medium"
            isProtected={item.protected}
            roles={item.roles}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </SmartLink>
        );
      })}
    </nav>
  );
}
