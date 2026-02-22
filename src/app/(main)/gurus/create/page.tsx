import { CreateGuruForm } from "./_components/create-guru-form";
import { redirect } from "next/navigation";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
import { APP_PERMISSION } from "@/lib/definitions/rbac";
import { routes } from "@/config/routes";
import { PageStack } from "@/components/layout/page-stack";

export default async function CreateGuruPage() {
  const claims = await getClaims();

  if (!claims) {
    redirect(routes.auth.login);
  }

  // Verify the user has the global create capability
  const { isPermitted } = await checkPermission(
    APP_PERMISSION.GURUS_CREATE,
    claims,
  );

  if (!isPermitted) {
    redirect(routes.forbidden);
  }

  return (
    <PageStack>
      <CreateGuruForm />
    </PageStack>
  );
}
