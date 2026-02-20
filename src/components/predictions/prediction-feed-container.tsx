import { PredictionCard } from "./prediction-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getPredictionsByGuruSlug } from "@/lib/data/gurus";
import { routes } from "@/config/routes";

interface Props {
  slug: string;
  page?: number;
  tab?: "pending" | "history";
}

export async function PredictionFeedContainer({
  slug,
  page = 1,
  tab = "pending",
}: Props) {
  const pageSize = 5;
  const isPendingTab = tab === "pending";

  // 1. Fetch Data (Server Side Pagination)
  const { data: predictions, count } = await getPredictionsByGuruSlug(
    slug,
    page,
    pageSize,
    isPendingTab ? "pending" : "resolved",
  );

  return (
    <div className="space-y-6">
      {/* --- List of Cards --- */}
      <div className="space-y-4">
        {predictions.length > 0 ? (
          predictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No {isPendingTab ? "pending" : "resolved"} predictions found.
            </p>
          </div>
        )}
      </div>

      {/* --- Pagination Controls --- */}
      <PaginationControls
        totalItems={count}
        pageSize={pageSize}
        currentPage={page}
        baseUrl={routes.gurus.detail(slug)}
        scroll={false}
      />
    </div>
  );
}
