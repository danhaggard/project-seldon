import { SmartLink } from "@/components/ui/smart-link";
import { siteConfig } from "@/config/site";
import * as Icons from "lucide-react";

export function SidebarContent() {
  return (
    <nav className="flex flex-col gap-2 p-4">
      {siteConfig.nav.map((item) => {
        // Dynamically get the icon
        const Icon = Icons[item.icon as keyof typeof Icons] || Icons.Circle;

        return (
          /* SmartLink automatically HIDES this if the user isn't allowed */
          <SmartLink
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm font-medium"
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </SmartLink>
        );
      })}

      {/* Example of a manually protected link not in config */}
      <SmartLink
        href="/admin/secret-dashboard"
        isProtected={true}
        roles={["admin"]}
        className="text-red-500 font-bold"
      >
        Secret Admin Link
      </SmartLink>
    </nav>
  );
}
