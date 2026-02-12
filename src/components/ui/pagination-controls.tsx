"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  baseUrl: string; // e.g., "/gurus/marc-andreessen"
  scroll?: boolean;
}

export function PaginationControls({
  totalItems,
  pageSize,
  currentPage,
  baseUrl,
  scroll = true,
}: PaginationControlsProps) {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalItems / pageSize);

  // Helper to build URL with existing params (like ?tab=history)
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t px-2 py-4 mt-6">
      {/* Text Info */}
      <p className="text-sm text-muted-foreground hidden sm:block">
        Showing{" "}
        <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * pageSize, totalItems)}
        </span>{" "}
        of <span className="font-medium">{totalItems}</span> results
      </p>

      {/* Buttons */}
      <div className="flex items-center space-x-2 ml-auto">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          asChild={currentPage > 1}
        >
          {currentPage > 1 ? (
            <Link href={createPageUrl(currentPage - 1)} scroll={scroll}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                p === currentPage && "pointer-events-none",
              )}
              asChild
            >
              <Link href={createPageUrl(p)}>{p}</Link>
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          asChild={currentPage < totalPages}
        >
          {currentPage < totalPages ? (
            <Link href={createPageUrl(currentPage + 1)} scroll={scroll}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Link>
          ) : (
            <span>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
