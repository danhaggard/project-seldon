import { CreatePredictionForm } from "./_components/create-prediction-form";
import { notFound, redirect } from "next/navigation";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
import { APP_PERMISSION } from "@/lib/definitions/rbac";
import { getCategories } from "@/lib/data/categories";
import { getGuruBySlug } from "@/lib/data/gurus";
import { routes } from "@/config/routes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CreatePredictionPage({ params }: PageProps) {
  const { slug } = await params;
  const claims = await getClaims();

  if (!claims) {
    redirect(routes.auth.login);
  }

  // 1. Check Global Create Permission
  const { isPermitted } = await checkPermission(
    APP_PERMISSION.PREDICTIONS_CREATE,
    claims,
  );

  if (!isPermitted) {
    redirect(routes.forbidden);
  }

  // 2. Fetch required relational data
  const guru = await getGuruBySlug(slug);
  if (!guru) return notFound();

  const categories = await getCategories();

  return (
    <div className="container">
      <CreatePredictionForm
        guruId={guru.id}
        guruSlug={slug}
        guruName={guru.name}
        categories={categories || []}
      />
    </div>
  );
}
