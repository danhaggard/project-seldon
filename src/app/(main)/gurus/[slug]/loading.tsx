import { Skeleton } from "@/components/ui/skeleton";

export default function GuruDetailLoading() {
  return (
    <div className="container space-y-8">
      {/* 1. Header Skeleton */}
      <Skeleton className="w-full h-75 rounded-xl" />

      {/* 2. Feed Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-full h-12" /> {/* Tabs */}
        <Skeleton className="w-full h-32" /> {/* Card 1 */}
        <Skeleton className="w-full h-32" /> {/* Card 2 */}
      </div>
    </div>
  );
}
