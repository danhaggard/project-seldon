import Link from "next/link";
import { PredictionCard } from "./prediction-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getPredictionsByGuruSlug } from "@/lib/data/gurus";
import { cn } from "@/lib/utils";

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
      {/* --- Tabs (Now powered by Links/URL) --- */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href={`?tab=pending`}
            scroll={false}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              isPendingTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
            )}
          >
            Pending Predictions
          </Link>

          <Link
            href={`?tab=history`}
            scroll={false}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              !isPendingTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
            )}
          >
            Prediction History
          </Link>
        </nav>
      </div>

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
        baseUrl={`/gurus/${slug}`}
        scroll={false}
      />
    </div>
  );
}
