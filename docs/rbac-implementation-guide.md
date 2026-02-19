# Role-Based Access Control (RBAC) Implementation Guide

This document provides a comprehensive overview of how Role-Based Access Control (RBAC) is implemented in Project Seldon. The system uses a **database-first** approach where user permissions are injected directly into their JSON Web Token (JWT) by Supabase. This allows the Next.js frontend to securely and synchronously verify access at the Edge, on the Server, and in the UI without requiring additional database queries.

---

## 1. Type Definitions & Enums

**File:** `src/lib/definitions/rbac.ts`

This file bridges the gap between the PostgreSQL database schema and the TypeScript frontend. It dynamically extracts permissions from the auto-generated Supabase types. Notably, it uses advanced TypeScript conditional types (`ExtractBase`) to separate global static permissions (e.g., `USERS_MANAGE`) from resource-specific "Own vs. Any" permissions (e.g., `predictions.update.own` becoming just `PREDICTIONS_UPDATE`).

```typescript
import { Constants } from "@/lib/definitions/database.types";
import { ReplaceAll, TupleToUnion } from "@/types/utils";
import { User } from "@supabase/supabase-js";
import { JwtPayload } from "jwt-decode";

export const appPermission = Constants.public.Enums.app_permission;
export type AppPermission = TupleToUnion<typeof appPermission>;

export const APP_PERMISSION = appPermission.reduce(
  (acc, key) => {
    acc[key.toUpperCase().replaceAll(".", "_")] = key;
    return acc;
  },
  {} as Record<string, string>,
) as {
  [K in (typeof appPermission)[number] as Uppercase<
    ReplaceAll<K, ".", "_">
  >]: K;
};

export type AppPermissionType = typeof APP_PERMISSION;

// Extracts the base string from any permission ending in .own or .any
type ExtractBase<T> = T extends `${infer Base}.own`
  ? Base
  : T extends `${infer Base}.any`
    ? Base
    : never;

// This will automatically resolve to "predictions.update" | "predictions.delete" | "comments.delete"
export type PermissionBase = ExtractBase<AppPermission>;

export const PERMISSION_BASE = Object.values(APP_PERMISSION).reduce(
  (acc, value) => {
    // Check for the period as well to be completely safe
    if (value.endsWith(".own") || value.endsWith(".any")) {
      // slice(0, -4) chops off exactly ".own" or ".any"
      const strippedValue = value.slice(0, -4) as PermissionBase;
      const strippedKey = strippedValue
        .toUpperCase()
        .replaceAll(".", "_") as Uppercase<
        ReplaceAll<PermissionBase, ".", "_">
      >;

      // We safely cast acc to any here because we know the final shape is guaranteed
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (acc as any)[strippedKey] = strippedValue;
    }
    return acc;
  },
  // This strong typing gives you perfect intellisense for your base permissions!
  {} as { [K in PermissionBase as Uppercase<ReplaceAll<K, ".", "_">>]: K },
);

// 2. Define the exact shape of the Supabase Claims object we care about
export type JwtClaims = {
  sub: string; // This is the user.id
  app_metadata?: {
    permissions?: string[];
    [key: string]: unknown;
  };
};

export const appRole = Constants.public.Enums.app_role;
export type AppRole = TupleToUnion<typeof appRole>;

export const APP_ROLE = appRole.reduce(
  (acc, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
  },
  {} as Record<string, string>,
) as {
  [K in (typeof appRole)[number] as Uppercase<K>]: K;
};

export type AppRoleType = typeof APP_ROLE;

export type PermissionUser = Pick<User, "id"> & {
  app_metadata: Pick<User["app_metadata"], "permissions">;
};

export type PermissionClaims = JwtPayload & JwtClaims;
```

---

## 2. Core RBAC Logic

**File:** `src/lib/supabase/rbac.ts`

This utility file contains the core logic for evaluating user permissions against the claims extracted from their JWT. It includes:

- **`hasPermission`**: A synchronous function to evaluate exact permissions or verify resource ownership.
- **`hasPermissionBase`**: A specialized edge function used by the middleware to verify if a user has any capability (own or any) to modify a resource, since the Edge cannot query the database to verify true ownership.
- **`checkPermission`**: An overloaded asynchronous wrapper that automatically fetches the JWT claims if they aren't provided, streamlining Server Actions and Server Components.

```typescript
import { createClient } from "./server";

import {
  AppPermission,
  PermissionBase,
  PermissionClaims,
} from "../definitions/rbac";

export async function getClaims() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims;
}

/**
 * A single, unified function to check permissions synchronously.
 * Pass the Supabase User object, the required permission, and optionally the resource owner's ID.
 */
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permissionBase: PermissionBase,
  resourceOwnerId: string,
): boolean;
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permission: AppPermission,
): boolean;
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permissionOrBase: string,
  resourceOwnerId?: string,
): boolean {
  if (!claims || !claims.sub) return false;

  const userPermissions: string[] = claims.app_metadata?.permissions || [];

  // 1. If we are checking an "Own vs Any" permission
  if (resourceOwnerId) {
    const anyPerm = `${permissionOrBase}.any`;
    const ownPerm = `${permissionOrBase}.own`;

    if (userPermissions.includes(anyPerm)) return true;
    if (userPermissions.includes(ownPerm) && claims.sub === resourceOwnerId)
      return true;

    return false;
  }

  // 2. If it's a standard permission check
  return userPermissions.includes(permissionOrBase);
}

/**
 * Checks if a user has ANY capability (either .own or .any) for a given base permission.
 * Used primarily by edge middleware where resource ownership cannot be evaluated.
 */
export function hasPermissionBase(
  claims: PermissionClaims | null | undefined,
  permissionBase: PermissionBase,
): boolean {
  if (!claims || !claims.sub) return false;

  const userPermissions: string[] = claims.app_metadata?.permissions || [];

  const anyPerm = `${permissionBase}.any`;
  const ownPerm = `${permissionBase}.own`;

  return userPermissions.includes(anyPerm) || userPermissions.includes(ownPerm);
}

type CheckPermissionReturn = {
  isPermitted: boolean;
  claims: PermissionClaims | null | undefined;
};

export async function checkPermission(
  permissionBase: PermissionBase,
  resourceOwnerId: string,
  passedClaims?: PermissionClaims | null,
): Promise<CheckPermissionReturn>;
export async function checkPermission(
  permission: AppPermission,
  passedClaims?: PermissionClaims | null,
): Promise<CheckPermissionReturn>;
// Implementation signature acts as a catch-all
export async function checkPermission(
  permissionOrBase: string,
  arg2?: string | PermissionClaims | null,
  arg3?: PermissionClaims | null,
): Promise<CheckPermissionReturn> {
  // 1. Unpack the arguments based on their type
  let resourceOwnerId: string | undefined = undefined;
  let passedClaims: PermissionClaims | null | undefined = undefined;

  if (typeof arg2 === "string") {
    // It matches Overload 1
    resourceOwnerId = arg2;
    passedClaims = arg3;
  } else {
    // It matches Overload 2
    passedClaims = arg2;
  }

  // 2. Resolve claims
  let claims = passedClaims;
  if (claims === undefined) {
    claims = await getClaims();
  }

  // 3. Delegate to the synchronous helper
  if (resourceOwnerId !== undefined) {
    // We have an ID, target the Own vs Any overload
    return {
      isPermitted: hasPermission(
        claims,
        permissionOrBase as PermissionBase,
        resourceOwnerId,
      ),
      claims,
    };
  }

  // No ID, target the standard permission overload
  return {
    isPermitted: hasPermission(claims, permissionOrBase as AppPermission),
    claims,
  };
}import { createClient } from "./server";

import {
  AppPermission,
  PermissionBase,
  PermissionClaims,
} from "../definitions/rbac";

export async function getClaims() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims;
}

/**
 * A single, unified function to check permissions synchronously.
 * Pass the Supabase User object, the required permission, and optionally the resource owner's ID.
 */
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permissionBase: PermissionBase,
  resourceOwnerId: string,
): boolean;
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permission: AppPermission,
): boolean;
export function hasPermission(
  claims: PermissionClaims | null | undefined,
  permissionOrBase: string,
  resourceOwnerId?: string,
): boolean {
  if (!claims || !claims.sub) return false;

  const userPermissions: string[] = claims.app_metadata?.permissions || [];

  // 1. If we are checking an "Own vs Any" permission
  if (resourceOwnerId) {
    const anyPerm = `${permissionOrBase}.any`;
    const ownPerm = `${permissionOrBase}.own`;

    if (userPermissions.includes(anyPerm)) return true;
    if (userPermissions.includes(ownPerm) && claims.sub === resourceOwnerId)
      return true;

    return false;
  }

  // 2. If it's a standard permission check
  return userPermissions.includes(permissionOrBase);
}

/**
 * Checks if a user has ANY capability (either .own or .any) for a given base permission.
 * Used primarily by edge middleware where resource ownership cannot be evaluated.
 */
export function hasPermissionBase(
  claims: PermissionClaims | null | undefined,
  permissionBase: PermissionBase,
): boolean {
  if (!claims || !claims.sub) return false;

  const userPermissions: string[] = claims.app_metadata?.permissions || [];

  const anyPerm = `${permissionBase}.any`;
  const ownPerm = `${permissionBase}.own`;

  return userPermissions.includes(anyPerm) || userPermissions.includes(ownPerm);
}

type CheckPermissionReturn = {
  isPermitted: boolean;
  claims: PermissionClaims | null | undefined;
};

export async function checkPermission(
  permissionBase: PermissionBase,
  resourceOwnerId: string,
  passedClaims?: PermissionClaims | null,
): Promise<CheckPermissionReturn>;
export async function checkPermission(
  permission: AppPermission,
  passedClaims?: PermissionClaims | null,
): Promise<CheckPermissionReturn>;
// Implementation signature acts as a catch-all
export async function checkPermission(
  permissionOrBase: string,
  arg2?: string | PermissionClaims | null,
  arg3?: PermissionClaims | null,
): Promise<CheckPermissionReturn> {
  // 1. Unpack the arguments based on their type
  let resourceOwnerId: string | undefined = undefined;
  let passedClaims: PermissionClaims | null | undefined = undefined;

  if (typeof arg2 === "string") {
    // It matches Overload 1
    resourceOwnerId = arg2;
    passedClaims = arg3;
  } else {
    // It matches Overload 2
    passedClaims = arg2;
  }

  // 2. Resolve claims
  let claims = passedClaims;
  if (claims === undefined) {
    claims = await getClaims();
  }

  // 3. Delegate to the synchronous helper
  if (resourceOwnerId !== undefined) {
    // We have an ID, target the Own vs Any overload
    return {
      isPermitted: hasPermission(
        claims,
        permissionOrBase as PermissionBase,
        resourceOwnerId,
      ),
      claims,
    };
  }

  // No ID, target the standard permission overload
  return {
    isPermitted: hasPermission(claims, permissionOrBase as AppPermission),
    claims,
  };
}
```

---

## 3. Global Route Configuration

**File:** `src/config/site.ts`

This configuration maps the application's URL structures to required RBAC capabilities. It splits global strict permissions (`routePermissions`) from wildcard routes that require base modification capabilities (`dynamicRoutePermissions`). This mapping is consumed by the Edge Middleware to enforce security before pages even render.

```typescript
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
```

---

## 4. Edge Middleware Protection

**File:** `src/lib/supabase/proxy.ts`

The middleware intercepts incoming requests and utilizes the mappings from `siteConfig.ts` to block unauthorized users. This saves server processing resources by verifying the user's JWT at the Edge without needing a database round-trip.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";
import { siteConfig } from "@/config/site";
import { hasPermission, hasPermissionBase } from "./rbac";
import { PermissionBase } from "../definitions/rbac";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const isLoggedIn = !!claims;
  const pathname = request.nextUrl.pathname;

  // 2. Check Basic Auth Routes (e.g., /account)
  const requiresAuth = siteConfig.authRequiredPaths().includes(pathname);
  if (requiresAuth && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 3. Check Strict Global Permissions (e.g., /admin)
  const requiredGlobalPerm = siteConfig.routePermissions[pathname];
  if (requiredGlobalPerm) {
    if (!isLoggedIn || !hasPermission(claims, requiredGlobalPerm)) {
      const url = request.nextUrl.clone();
      url.pathname = "/403-forbidden";
      return NextResponse.redirect(url);
    }
  }

  // 4. Check Dynamic Wildcard Routes (e.g., /gurus/*/edit)
  for (const [routePattern, requiredBasePerm] of Object.entries(
    siteConfig.dynamicRoutePermissions,
  )) {
    const regexPattern = new RegExp(
      "^" + routePattern.replace(/\*/g, "[^/]+") + "$",
    );

    if (regexPattern.test(pathname)) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Check if they have the base capability
      const hasBaseCapability = hasPermissionBase(
        claims,
        requiredBasePerm as PermissionBase,
      );

      if (!hasBaseCapability) {
        return NextResponse.redirect(new URL("/403-forbidden", request.url));
      }

      // Let them through! Page components do final 'own' vs 'any' check.
      break;
    }
  }

  return supabaseResponse;
}
```

---

## 5. UI Wrappers (Action Guard & Smart Links)

**Files:** `src/components/rbac/action-guard.tsx` & `src/components/ui/smart-link.tsx`

These Server Components provide a declarative way to secure UI elements.

- **Action Guard:** Wraps interactive elements (like an "Edit" button) and only renders its children if the user meets the permission requirements.
- **Smart Link:** Evaluates routing rules against the user's JWT to selectively show navigation items, keeping the UI clean of unauthorized paths.

### `action-guard.tsx`

```typescript
import React from "react";
import {
  AppPermission,
  PermissionBase,
  PermissionClaims,
} from "@/lib/definitions/rbac";
import { getClaims, hasPermission } from "@/lib/supabase/rbac";

// We use a discriminated union here so TypeScript forces you to provide
// a resourceOwnerId ONLY if you are using a PermissionBase like "predictions.update"
type ActionGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  claims?: PermissionClaims | null; // Optional: Pass this down in loops for performance
} & (
  | { permission: AppPermission; resourceOwnerId?: never }
  | { permission: PermissionBase; resourceOwnerId: string }
);

export async function ActionGuard({
  children,
  fallback = null,
  permission,
  resourceOwnerId,
  claims: passedClaims,
}: ActionGuardProps) {
  // 1. Resolve claims (use passed claims, or fetch if not provided)
  let claims = passedClaims;
  if (claims === undefined) {
    claims = await getClaims();
  }

  // 2. Evaluate the permission
  let canPerformAction = false;

  if (resourceOwnerId !== undefined) {
    // 3-argument overload for Own vs Any
    canPerformAction = hasPermission(
      claims,
      permission as PermissionBase,
      resourceOwnerId,
    );
  } else {
    // 2-argument overload for standard global permissions
    canPerformAction = hasPermission(claims, permission as AppPermission);
  }

  // 3. Render accordingly
  if (!canPerformAction) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### `smart-link.tsx`

```typescript
import Link, { LinkProps } from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { AppPermission, PermissionClaims } from "@/lib/definitions/rbac";
import { getClaims, hasPermission } from "@/lib/supabase/rbac";

interface SmartLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  children: React.ReactNode;
  className?: string;
  requireAuth?: boolean;
  requiredPermission?: AppPermission;
  claims?: PermissionClaims | null;
}

export async function SmartLink({
  href,
  className,
  children,
  requireAuth: manualRequireAuth,
  requiredPermission: manualPermission,
  claims: passedClaims,
  ...props
}: SmartLinkProps) {
  // 1. Use the passed claims if they exist, otherwise fetch them (fallback)
  let claims = passedClaims;
  if (claims === undefined) {
    claims = await getClaims();
  }

  const isLoggedIn = !!claims?.sub;

  // 2. Resolve Config Rules
  const configItem = siteConfig.nav.find((item) => item.href === href);
  const requiresAuth = manualRequireAuth ?? configItem?.requireAuth ?? false;
  const requiredPermission = manualPermission ?? configItem?.requiredPermission;

  // --- CHECK 1: AUTHENTICATION ---
  if (requiresAuth && !isLoggedIn) {
    return null;
  }

  // --- CHECK 2: RBAC PERMISSIONS ---
  if (requiredPermission) {
    if (!hasPermission(claims, requiredPermission)) {
      return null;
    }
  }

  return (
    <Link href={href} className={cn(className)} {...props}>
      {children}
    </Link>
  );
}
```
