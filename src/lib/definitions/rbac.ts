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
      /*  eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
