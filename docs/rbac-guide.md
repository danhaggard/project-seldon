# Role-Based Access Control (RBAC) Guide

This document outlines the workflow for adding or modifying permissions in the Project Seldon RBAC system. 

Our RBAC system is database-first, using a Supabase Auth Hook to inject permissions directly into the user's JWT. The frontend relies on auto-generated types and a universal `ActionGuard` component to enforce these rules.

## How to Add or Change a Permission

When transitioning a resource from a global permission (e.g., `gurus.update`) to an ownership-based model (e.g., `gurus.update.own` and `gurus.update.any`), follow these exact steps.

### Step 1: Create the Database Migration
Create a new Supabase migration file to update the database schema and Row Level Security (RLS) policies.

1. **Update the ENUM:** Add the new permissions to the `app_permission` enum.
```sql
CREATE TYPE public.app_permission AS ENUM (
  -- Gurus
  'gurus.create',
  'gurus.update.own',
  'gurus.update.any',
  'gurus.delete.own',
  'gurus.delete.any',
  
   --and so on...
);
```
2. **Update Seed Data:** Assign the new permissions to the appropriate roles in the `role_permissions` table.
```sql
INSERT INTO public.role_permissions (role, permission) VALUES
  ('user', 'gurus.create'),
  ('user', 'gurus.update.own'),
  ('user', 'gurus.delete.own')
```
3. **Rewrite RLS Policies:** Update the table's RLS policies to check the injected JWT permissions, utilizing the "Own vs. Any" paradigm.  Own meaning they
can only satisfy the policy if they created the object.

```sql
-- Example RLS Policy for Own vs. Any
CREATE POLICY "Update resource" ON public.my_table FOR UPDATE USING (
  ((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'my_table.update.any')
  OR 
  (((auth.jwt() -> 'app_metadata' -> 'permissions') ? 'my_table.update.own') AND created_by = auth.uid())
);
```

### Step 2: Apply and Generate Types
Apply the migration to your local database and regenerate the TypeScript types. This is the crucial step that syncs the backend changes with the frontend.

```bash
pnpm supabase db reset
pnpm run update-types-local
# or if not using local supabase:
pnpm run update-types

```

*Note: Because our frontend types (`AppPermission`, `PermissionBase`, `PERMISSION_BASE`) are strictly derived from `database.types.ts`, they will automatically update to reflect the new `.own` and `.any` string literals. You do not need to manually update the type definitions.*

### Step 3: Update Route Configuration (`siteConfig.ts`)
If the updated permission protects a route, update `siteConfig.ts`.

Use `PERMISSION_BASE` for checking dynamic ownership permissions, use `APP_PERMISSION` for checking static global permissions.

If moving from a static global permission to a dynamic ownership permission, move the route from `routePermissions` to `dynamicRoutePermissions` and check against  `PERMISSION_BASE` from @/lib/definitions/rbac.ts.  If moving to a static global permission, then move route from `dynamicRoutePermissions` to `routePermissions` and check against `APP_PERMISSION`.

```typescript
  dynamicRoutePermissions: {
    // The middleware will now check if the user has AT LEAST 
    // my_table.update.own OR my_table.update.any
    "/my-table/*/edit": PERMISSION_BASE.MY_TABLE_UPDATE, 
  }
```

### Step 4: Update UI and Action Guards
Locate the UI components (buttons, links) and React components that govern access to the resource. 

Switch the permission check from the exact `APP_PERMISSION` to the `PERMISSION_BASE`, and pass the `resourceOwnerId` so the `ActionGuard` knows to evaluate ownership.

```tsx
<ActionGuard 
  permission={PERMISSION_BASE.MY_TABLE_UPDATE} 
  resourceOwnerId={resource.created_by}
>
  <EditButton />
</ActionGuard>
```

### Step 5: Secure the Server Actions
Finally, ensure the corresponding Server Actions use the `checkPermission` helper to enforce the same ownership rules on the backend before executing database mutations.

```typescript
export async function updateResource(resourceId: string, ownerId: string) {
  const canEdit = await checkPermission(PERMISSION_BASE.MY_TABLE_UPDATE, ownerId);
  
  if (!canEdit) {
    throw new Error("Unauthorized");
  }
  
  // Proceed with mutation...
}
```