import { createClient } from "@/lib/supabase/server";
import { EditPredictionForm } from "@/components/predictions/edit-prediction-form";
import { notFound } from "next/navigation";
import { getIsAdminModCreator } from "@/lib/supabase/auth-helpers";
import { getPredictionByIdWithSources } from "@/lib/data/predictions";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function EditPredictionPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id, slug } = await params;

  // 1. Fetch Prediction
  const prediction = await getPredictionByIdWithSources(id);

  if (!prediction) return notFound();

  // 2. Fetch Categories (for the dropdown)
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // 3. Authorization Check
  const canEdit = await getIsAdminModCreator(prediction.created_by || "");

  if (!canEdit) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have permission to edit this prediction.</p>
      </div>
    );
  }

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
