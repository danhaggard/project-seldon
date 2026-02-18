import { getPredictionById } from "@/lib/data/predictions";
import { notFound } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { PredictionDetail } from "@/components/predictions/prediction-detail";

export default async function InterceptedPredictionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // <--- This await is critical in Next.js 15/16
  const prediction = await getPredictionById(id);

  if (!prediction) notFound();

  return (
    <Modal
      title="Prediction Details"
      description="Detailed view of the prediction"
    >
      <PredictionDetail prediction={prediction} />
    </Modal>
  );
}
