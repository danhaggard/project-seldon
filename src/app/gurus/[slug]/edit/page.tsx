import { EditGuruForm } from "./_components/edit-guru-form";
import { notFound, redirect } from "next/navigation";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
import { PERMISSION_BASE } from "@/lib/definitions/rbac";
import { getGuruBySlug } from "@/lib/data/gurus";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditGuruPage({ params }: PageProps) {
  const { slug } = await params;
  const claims = await getClaims();

  if (!claims) {
    redirect("/login");
  }

  const guru = await getGuruBySlug(slug);

  if (!guru) return notFound();

  const { isPermitted } = !guru.created_by
    ? { isPermitted: false }
    : await checkPermission(
        PERMISSION_BASE.GURUS_UPDATE,
        guru.created_by,
        claims,
      );

  if (!isPermitted) {
    redirect("/403-forbidden");
  }

  return (
    <div className="container">
      <EditGuruForm guru={guru} />
    </div>
  );
}
