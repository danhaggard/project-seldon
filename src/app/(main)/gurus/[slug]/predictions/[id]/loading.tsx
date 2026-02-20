import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function PredictionLoading() {
  return (
    <div className="container max-w-2xl">
      <div className="mb-6 flex items-center h-10 text-muted-foreground">
        <ChevronLeft className="mr-2 h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="bg-card border rounded-xl p-8 shadow-sm">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-20 rounded-full" /> {/* Badge */}
              <Skeleton className="h-5 w-32" /> {/* Author string */}
            </div>
            <Skeleton className="h-8 w-3/4" /> {/* Title */}
          </div>

          {/* Action Button Skeleton */}
          <Skeleton className="h-10 w-[90px]" />

          {/* Main Stats Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[88px] w-full rounded-lg" /> {/* Status Box */}
            <Skeleton className="h-[88px] w-full rounded-lg" /> {/* Date Box */}
          </div>

          {/* Description Skeleton */}
          <div className="pt-2">
            <Skeleton className="h-6 w-24 mb-2" /> {/* "Description" title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Sources Skeleton */}
          <div className="pt-2">
            <Skeleton className="h-6 w-40 mb-3" /> {/* "Sources & Evidence" title */}
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded border" />
              <Skeleton className="h-12 w-full rounded border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
