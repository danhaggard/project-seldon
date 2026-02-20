import { Suspense } from "react";
import { GuruHeader } from "@/app/(main)/gurus/[slug]/_components/guru-header";
import { PredictionFeedContainer } from "@/components/predictions/prediction-feed-container";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";
import { GuruToastListener } from "./_components/guru-toast-listener";
import { DiscussionTab } from "./_components/discussion/discussion-tab";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* --- Skeletons --- */
function HeaderSkeleton() {
  return <Skeleton className="w-full h-75 rounded-xl" />;
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
  const tab =
    (resolvedSearchParams.tab as "pending" | "history" | "discussion") ||
    "pending";

  const isDiscussion = tab === "discussion";
  const isPendingTab = tab === "pending";

  return (
    <article className="container space-y-4">
      <GuruToastListener />
      {/* 1. Header Section */}
      {/* If this fails, we show a red error box where the header should be */}

      <Suspense fallback={<HeaderSkeleton />}>
        <GuruHeader slug={slug} />
      </Suspense>

      {/* 2. Content Tabs */}
      <div className="border-b flex flex-row overflow-x-auto no-scrollbar justify-between">
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
              tab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
            )}
          >
            Prediction History
          </Link>

          <Link
            href={`?tab=discussion`}
            scroll={false}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              isDiscussion
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
            )}
          >
            Discussion
          </Link>
        </nav>
      </div>

      {/* 3. Feed/Discussion Section */}
      {/* Key added to force re-render on tab/page change */}
      <SectionErrorBoundary>
        <Suspense key={`${tab}-${page}`} fallback={<FeedSkeleton />}>
          {isDiscussion ? (
            <DiscussionTab slug={slug} />
          ) : (
            <PredictionFeedContainer slug={slug} page={page} tab={tab} />
          )}
        </Suspense>
      </SectionErrorBoundary>
    </article>
  );
}
