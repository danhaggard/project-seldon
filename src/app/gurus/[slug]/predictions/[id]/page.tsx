import { getPredictionById } from "@/lib/data/predictions";
import { notFound } from "next/navigation";
import { PredictionDetail } from "@/components/predictions/prediction-detail";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function PredictionPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params; // <--- Await here as well
  const prediction = await getPredictionById(id);

  if (!prediction) notFound();

  return (
    <div className="container max-w-2xl py-10">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
        asChild
      >
        <Link href={`/gurus/${slug}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Guru
        </Link>
      </Button>

      <div className="bg-card border rounded-xl p-8 shadow-sm">
        <PredictionDetail prediction={prediction} />
      </div>
    </div>
  );
}
