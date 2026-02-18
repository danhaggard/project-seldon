import { getIsAdminModCreator } from "@/lib/supabase/auth-helpers";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type EditPredictionDetailsButtonProps = {
  createdById: string;
  guruSlug: string;
  predictionId: string;
};

export async function EditPredictionDetailsButton({
  createdById,
  guruSlug,
  predictionId,
}: EditPredictionDetailsButtonProps) {
  const canEdit = await getIsAdminModCreator(createdById || "");

  return canEdit ? (
    <Button variant="outline" size="sm" asChild className="mb-6">
      <Link href={`/gurus/${guruSlug}/predictions/${predictionId}/edit`}>
        <Pencil className="w-4 h-4 mr-2" />
        Edit Prediction
      </Link>
    </Button>
  ) : null;
}
