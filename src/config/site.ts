import {
  AppPermission,
  APP_PERMISSION,
  PERMISSION_BASE,
  PermissionBase,
} from "@/lib/definitions/rbac";
import { Home, Users, ShieldCheck, CircleUser, LucideIcon } from "lucide-react";
import { routes, StaticAppRoute } from "@/config/routes";

export type NavItem = {
  title: string;
  href: StaticAppRoute;
  icon: LucideIcon;
  requireAuth?: boolean;
  requiredPermission?: AppPermission;
};

export type SiteConfig = {
  name: string;
  description: string;
  nav: NavItem[];
  // Helper to grab all nav links that require login
  authRequiredPaths: (this: SiteConfig) => string[];
  // Explicit mapping of route prefixes to required JWT permissions (for Middleware)
  routePermissions: Record<string, AppPermission>;
  dynamicRoutePermissions: Record<string, AppPermission | PermissionBase>;
};

export const siteConfig: SiteConfig = {
  name: "Project Seldon",
  description: "Tracking the accuracy of public predictions.",
  nav: [
    {
      title: "Home",
      href: routes.home,
      icon: Home,
    },
    {
      title: "Gurus",
      href: routes.gurus.index,
      icon: Users,
    },
    {
      title: "Admin Panel",
      href: routes.admin,
      icon: ShieldCheck,
      requireAuth: true,  
      requiredPermission: APP_PERMISSION.USERS_MANAGE, // Clear, explicit intent
    },
    {
      title: "Account",
      href: routes.account,
      icon: CircleUser,
      requireAuth: true, // Just needs a logged-in user
    },
  ],

  authRequiredPaths: function (this: SiteConfig) {
    return this.nav.filter((item) => item.requireAuth).map((item) => item.href);
  },

  routePermissions: {
    [routes.admin]: APP_PERMISSION.USERS_MANAGE,
    // If you add a global categories page later:
    // "/categories/manage": APP_PERMISSION.CATEGORIES_MANAGE,
  },

  // DYNAMIC RESOURCE ROUTES (Wildcards)
  // The middleware will verify the user has AT LEAST the base permission (e.g. .own or .any)
  dynamicRoutePermissions: {
// Generates: "/gurus/*/edit"
    [routes.gurus.edit("*")]: PERMISSION_BASE.GURUS_UPDATE,
    
    // Generates: "/gurus/*/predictions/*/edit"
    [routes.gurus.predictionEdit("*", "*")]: PERMISSION_BASE.PREDICTIONS_UPDATE,
  } as Record<string, PermissionBase>,
};
