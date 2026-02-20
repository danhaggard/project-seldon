import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GurusLoading() {
  return (
    <div className="container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gurus</h1>
          <p className="text-muted-foreground mt-2">
            Track the accuracy of the world&apos;s most vocal experts.
          </p>
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-[116px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="block group">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {/* Avatar Skeleton */}
                <Skeleton className="h-12 w-12 rounded-full" />
                
                {/* Name and Score Skeleton */}
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardHeader>
              <CardContent>
                {/* Bio Skeleton */}
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
