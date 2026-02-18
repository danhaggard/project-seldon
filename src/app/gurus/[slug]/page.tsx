import { Suspense } from "react";
import { GuruHeader } from "@/components/guru/guru-header";
import { PredictionFeedContainer } from "@/components/predictions/prediction-feed-container";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";

/* --- Skeletons --- */
function HeaderSkeleton() {
  return <Skeleton className="w-full h-[300px] rounded-xl" />;
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-12" /> {/* Tabs */}
      <Skeleton className="w-full h-32" /> {/* Card 1 */}
      <Skeleton className="w-full h-32" /> {/* Card 2 */}
    </div>
  );
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GuruDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Parse URL Params
  const page = Number(resolvedSearchParams.page) || 1;
  const tab = (resolvedSearchParams.tab as "pending" | "history") || "pending";

  return (
    <div className="container space-y-8">
      {/* 1. Header Section */}
      {/* If this fails, we show a red error box where the header should be */}

      <Suspense fallback={<HeaderSkeleton />}>
        <GuruHeader slug={slug} />
      </Suspense>

      {/* 2. Feed Section */}
      {/* Feed (Key added to force re-render on tab/page change) */}
      <SectionErrorBoundary>
        <Suspense key={`${tab}-${page}`} fallback={<FeedSkeleton />}>
          <PredictionFeedContainer slug={slug} page={page} tab={tab} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
