export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Project Seldon",
  description: "Tracking the accuracy of public predictions.",
  nav: [
    {
      title: "Home",
      href: "/",
      icon: "Home", // We store the icon name as a string to avoid hydration mismatch
      protected: false,
    },
    {
      title: "Trending",
      href: "/trending",
      icon: "TrendingUp",
      protected: false,
    },
    {
      title: "Gurus",
      href: "/gurus",
      icon: "Users",
      protected: false,
    },
    {
      title: "My Predictions", // Only visible to logged-in users
      href: "/protected/predictions",
      icon: "LineChart",
      protected: true,
    },
    {
      title: "Settings",
      href: "/protected/settings",
      icon: "Settings",
      protected: true,
      // Future RBAC hook:
      // roles: ["admin", "moderator"]
    },
    {
      title: "Admin Panel",
      href: "/admin",
      icon: "ShieldCheck",
      protected: true,
      roles: ["admin"], // Only admins can see this
    },
    {
      title: "Account",
      href: "/account",
      protected: true,
      icon: "CircleUser",
    },
  ],
  // Helper to get just the protected paths for middleware
  protectedPaths: function () {
    return this.nav.filter((item) => item.protected).map((item) => item.href);
  },
};
