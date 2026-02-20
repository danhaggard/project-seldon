import { EditPredictionForm } from "@/app/(main)/gurus/[slug]/predictions/[id]/edit/_components/edit-prediction-form";
import { notFound, redirect } from "next/navigation";
import { getPredictionByIdWithSources } from "@/lib/data/predictions";
import { checkPermission, getClaims } from "@/lib/supabase/rbac";
import { PERMISSION_BASE } from "@/lib/definitions/rbac";
import { getCategories } from "@/lib/data/categories";
import { routes } from "@/config/routes";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function EditPredictionPage({ params }: PageProps) {
  const { id, slug } = await params;
  const claims = await getClaims();
  if (!claims) {
    redirect(routes.auth.login);
  }

  // 1. Fetch Prediction
  const prediction = await getPredictionByIdWithSources(id);

  if (!prediction) return notFound();

  const { isPermitted } = !prediction.created_by
    ? { isPermitted: false }
    : await checkPermission(
        PERMISSION_BASE.PREDICTIONS_UPDATE,
        prediction.created_by,
        claims,
      );

  if (!isPermitted) {
    redirect(routes.forbidden);
  }

  // 2. Fetch Categories (for the dropdown)
  const categories = await getCategories();

  return (
    <div className="container">
      <EditPredictionForm
        prediction={prediction}
        categories={categories || []}
        guruSlug={slug}
      />
    </div>
  );
}
