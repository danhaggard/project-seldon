import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function PredictionNotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Prediction Not Found
        </h1>
        <p className="text-muted-foreground max-w-100">
          We couldn&apos;t find a prediction with that id. It might have been
          removed, or the URL might be incorrect.
        </p>
      </div>
      <Button asChild className="mt-4">
        <Link href="/gurus">Browse All Gurus</Link>
      </Button>
    </div>
  );
}
