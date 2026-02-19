import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PERMISSION_BASE } from "@/lib/definitions/rbac";
import { ActionGuard } from "@/components/rbac/action-guard";

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
  return (
    <ActionGuard
      permission={PERMISSION_BASE.PREDICTIONS_UPDATE}
      resourceOwnerId={createdById}
    >
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href={`/gurus/${guruSlug}/predictions/${predictionId}/edit`}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Prediction
        </Link>
      </Button>
    </ActionGuard>
  );
}
