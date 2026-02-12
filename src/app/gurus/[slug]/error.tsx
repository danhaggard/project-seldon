"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Something went wrong!
        </h1>
        <p className="text-muted-foreground max-w-[400px]">
          We encountered an error while loading this guru profile. Please try
          again later.
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/gurus")}
        >
          Back to Gurus
        </Button>
      </div>
    </div>
  );
}
