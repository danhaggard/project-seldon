import { AppRole, APP_ROLE } from "@/lib/definitions/auth";
import { Home, Users, ShieldCheck, CircleUser, LucideIcon } from "lucide-react";

export type SiteConfig = {
  name: string;
  description: string;
  nav: {
    title: string;
    href: string;
    icon: LucideIcon; // <--- Store the component itself, not a string
    protected?: boolean;
    roles?: AppRole[];
  }[];
  protectedPaths: (this: SiteConfig) => string[];
  protectedRoutes: string[];
};

export const siteConfig: SiteConfig = {
  name: "Project Seldon",
  description: "Tracking the accuracy of public predictions.",
  nav: [
    {
      title: "Home",
      href: "/",
      icon: Home,
      protected: false,
    },
    {
      title: "Gurus",
      href: "/gurus",
      icon: Users,
      protected: false,
    },
    {
      title: "Admin Panel",
      href: "/admin",
      icon: ShieldCheck,
      protected: true,
      roles: [APP_ROLE.ADMIN],
    },
    {
      title: "Account",
      href: "/account",
      protected: true,
      icon: CircleUser,
    },
  ],
  protectedPaths: function (this: SiteConfig) {
    return this.nav.filter((item) => item.protected).map((item) => item.href);
  },
  protectedRoutes: [
    "/dashboard",
    "/settings",
    "/gurus/*/edit",
    "/gurus/*/predictions/*/edit",
  ],
};
