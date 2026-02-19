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

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
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

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  console.log("claims", claims);
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
      url.pathname = "/403-forbidden"; // Or "/403-forbidden" if you have that page
      return NextResponse.redirect(url);
    }
  }

  // 4. Check Dynamic Wildcard Routes (e.g., /gurus/*/edit)
  for (const [routePattern, requiredBasePerm] of Object.entries(
    siteConfig.dynamicRoutePermissions,
  )) {
    // Convert "/gurus/*/edit" to a Regex: "^/gurus/[^/]+/edit$"
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

      // If they DO have the base capability, let them through!
      // The Page component will do the final 'own' vs 'any' check using the resource DB row.
      break;
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
