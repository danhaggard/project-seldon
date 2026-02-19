import {
  AppPermission,
  APP_PERMISSION,
  PERMISSION_BASE,
  PermissionBase,
} from "@/lib/definitions/rbac";
import { Home, Users, ShieldCheck, CircleUser, LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
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
      href: "/",
      icon: Home,
    },
    {
      title: "Gurus",
      href: "/gurus",
      icon: Users,
    },
    {
      title: "Admin Panel",
      href: "/admin",
      icon: ShieldCheck,
      requireAuth: true,
      requiredPermission: APP_PERMISSION.USERS_MANAGE, // Clear, explicit intent
    },
    {
      title: "Account",
      href: "/account",
      icon: CircleUser,
      requireAuth: true, // Just needs a logged-in user
    },
  ],

  authRequiredPaths: function (this: SiteConfig) {
    return this.nav.filter((item) => item.requireAuth).map((item) => item.href);
  },

  routePermissions: {
    "/admin": APP_PERMISSION.USERS_MANAGE,
    // If you add a global categories page later:
    // "/categories/manage": APP_PERMISSION.CATEGORIES_MANAGE,
  },

  // DYNAMIC RESOURCE ROUTES (Wildcards)
  // The middleware will verify the user has AT LEAST the base permission (e.g. .own or .any)
  dynamicRoutePermissions: {
    "/gurus/*/edit": PERMISSION_BASE.GURUS_UPDATE,
    "/gurus/*/predictions/*/edit": PERMISSION_BASE.PREDICTIONS_UPDATE,
  } as Record<string, PermissionBase>,
};
