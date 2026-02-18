import { getIsAdminModCreator } from "@/lib/supabase/auth-helpers";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type EditDetailsButtonProps = {
  createdById: string;
  guruSlug: string;
};

export async function EditDetailsButton({
  createdById,
  guruSlug,
}: EditDetailsButtonProps) {
  const canEdit = await getIsAdminModCreator(createdById || "");

  return canEdit ? (
    <Button variant="outline" size="sm" asChild className="mb-2">
      <Link href={`/gurus/${guruSlug}/edit`}>
        <Pencil className="w-4 h-4 mr-2" />
        Edit Details
      </Link>
    </Button>
  ) : null;
}
