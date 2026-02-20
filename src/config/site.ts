import {
  AppPermission,
  APP_PERMISSION,
  PERMISSION_BASE,
  PermissionBase,
} from "@/lib/definitions/rbac";
import {
  Home,
  Users,
  ShieldCheck,
  Video,
  Mic,
  FileText,
  MessageSquare,
  LucideIcon,
} from "lucide-react";
import { routes, StaticAppRoute } from "@/config/routes";
import {
  PREDICTION_SOURCE_MEDIA_TYPE,
  PredictionSourceMediaTypes,
} from "@/lib/definitions/prediction-source";

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
  prediction_sources: {
    media_type: Record<
      PredictionSourceMediaTypes,
      {
        icon: LucideIcon;
        badgeClassName: string; // Combined for easier passing to cn()
      }
    >;
  };
  // Helper to grab all nav links that require login
  authRequiredPaths: (this: SiteConfig) => string[];
  // Explicit mapping of route prefixes to required JWT permissions (for Middleware)
  routePermissions: Record<string, AppPermission>;
  dynamicRoutePermissions: Record<string, AppPermission | PermissionBase>;
};

export const siteConfig: SiteConfig = {
  name: "Project Seldon",
  description: "Tracking the accuracy of public predictions.",
  prediction_sources: {
    media_type: {
      [PREDICTION_SOURCE_MEDIA_TYPE.AUDIO]: {
        icon: Mic,
        // Purple for podcasts/audio
        badgeClassName:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      },
      [PREDICTION_SOURCE_MEDIA_TYPE.SOCIAL]: {
        icon: MessageSquare,
        // Sky blue for social media
        badgeClassName:
          "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
      },
      [PREDICTION_SOURCE_MEDIA_TYPE.TEXT]: {
        icon: FileText,
        // Neutral slate for articles/journals
        badgeClassName:
          "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
      },
      [PREDICTION_SOURCE_MEDIA_TYPE.VIDEO]: {
        icon: Video,
        // Rose/Red for video recording
        badgeClassName:
          "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
      },
    },
  },
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
