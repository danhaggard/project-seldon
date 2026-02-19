import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PERMISSION_BASE } from "@/lib/definitions/rbac";
import { ActionGuard } from "@/components/rbac/action-guard";

type EditDetailsButtonProps = {
  createdById: string;
  guruSlug: string;
};

export async function EditDetailsButton({
  createdById,
  guruSlug,
}: EditDetailsButtonProps) {
  return (
    <ActionGuard
      permission={PERMISSION_BASE.GURUS_UPDATE}
      resourceOwnerId={createdById}
    >
      <Button variant="outline" size="sm" asChild className="mb-2">
        <Link href={`/gurus/${guruSlug}/edit`}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Details
        </Link>
      </Button>
    </ActionGuard>
  );
}
