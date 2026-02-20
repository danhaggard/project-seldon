"use client";

import { useTransition, useOptimistic } from "react";
import { usePathname } from "next/navigation";
import { ArrowBigUp, ArrowBigDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { castValidationVote } from "@/actions/source-validation";

interface SourceValidationControlsProps {
  sourceId: string;
  url: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: boolean | null;
  isOwner: boolean;
}

// Helper to determine the Authority Label and Colors
function getAuthorityConfig(up: number, down: number) {
  const total = up + down;

  // Rule 1: Not enough votes to establish authority
  if (total < 3) {
    return {
      label: "Unverified",
      colorClass:
        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 ring-gray-500/10",
    };
  }

  const ratio = up / (down === 0 ? 1 : down);
  const reverseRatio = down / (up === 0 ? 1 : up);

  // Rule 2: Strong positive consensus (e.g., 2-to-1 ratio)
  if ((down === 0 && up >= 3) || ratio >= 2) {
    return {
      label: "Verified",
      colorClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-600/20",
    };
  }

  // Rule 3: Strong negative consensus
  if ((up === 0 && down >= 3) || reverseRatio >= 2) {
    return {
      label: "Refuted",
      colorClass:
        "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-red-600/20",
    };
  }

  // Rule 4: Mixed votes
  return {
    label: "Contested",
    colorClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-amber-600/20",
  };
}

export function SourceValidationControls({
  sourceId,
  url,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  isOwner,
}: SourceValidationControlsProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Set up optimistic state to handle instant UI updates
  const [optState, setOptState] = useOptimistic(
    { up: initialUpvotes, down: initialDownvotes, vote: initialUserVote },
    (state, newVote: boolean | null) => {
      // 1. Revert previous vote impact if they are switching sides
      let newUp = state.up - (state.vote === true ? 1 : 0);
      let newDown = state.down - (state.vote === false ? 1 : 0);

      // 2. Apply new vote impact
      newUp += newVote === true ? 1 : 0;
      newDown += newVote === false ? 1 : 0;

      return { up: newUp, down: newDown, vote: newVote };
    },
  );

  const handleVote = (selectedVote: boolean) => {
    // If clicking the same button, it toggles off (null). Otherwise, it sets to the selected vote.
    const resultingVote = optState.vote === selectedVote ? null : selectedVote;

    startTransition(async () => {
      // 1. Instantly update UI
      setOptState(resultingVote);

      // 2. Fire server action in background
      // Note: the action expects `true` or `false`. If resultingVote is null,
      // we pass the *original* button they clicked so the server knows which one to delete
      await castValidationVote(sourceId, selectedVote, pathname);
    });
  };

  const authority = getAuthorityConfig(optState.up, optState.down);

  return (
    // The right-side group. 'whitespace-nowrap' prevents elements inside from breaking into multiple lines.
    <div className="flex items-center gap-3 shrink-0 whitespace-nowrap overflow-x-auto w-full sm:w-auto justify-start sm:justify-end">
      {/* 1. Authority Indicator & Receipts */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ring-1 ring-inset",
            authority.colorClass,
          )}
        >
          {authority.label}
        </span>
      </div>

      {/* 2. Voting Controls (ONLY SHOW IF NOT OWNER) */}

      <div className="flex items-center bg-muted/30 p-0.5 rounded-md border border-border/50">
        {!isOwner && (
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={() => handleVote(true)}
            className={cn(
              "w-7 h-7 rounded-sm transition-all",
              optState.vote === true
                ? "text-emerald-700 bg-emerald-100/80 dark:bg-emerald-900/50 dark:text-emerald-400"
                : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
            )}
            title="Validate Source"
          >
            {/* fill-current makes the arrow solid when selected */}
            <ArrowBigUp
              className={cn(
                "w-4 h-4",
                optState.vote === true && "fill-current",
              )}
            />
            <span className="sr-only">Validate source</span>
          </Button>
        )}
        {/* The Receipts (+42 / -3) */}
        <div className="text-xs font-medium flex items-center gap-1">
          <span
            className="text-emerald-600 dark:text-emerald-500"
            title="Number of users validated"
          >
            +{optState.up}
            <span className="sr-only">Number of users validated</span>
          </span>
          <span className="text-border/60">/</span>
          <span
            className="text-red-600 dark:text-red-500"
            title="Number of users refuted"
          >
            -{optState.down}
            <span className="sr-only">Number of users refuted</span>
          </span>
        </div>
        {!isOwner && (
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={() => handleVote(false)}
            className={cn(
              "w-7 h-7 rounded-sm transition-all",
              optState.vote === false
                ? "text-red-700 bg-red-100/80 dark:bg-red-900/50 dark:text-red-400"
                : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
            )}
            title="Refute Source"
          >
            <ArrowBigDown
              className={cn(
                "w-4 h-4",
                optState.vote === false && "fill-current",
              )}
            />
            <span className="sr-only">Refute source</span>
          </Button>
        )}
      </div>

      {/* 3. View Link */}
      <div className="flex items-center gap-2">
        <div className="w-px h-4 bg-border hidden sm:block"></div>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-muted-foreground hover:text-foreground shrink-0"
          asChild
        >
          <a href={url} target="_blank" rel="noreferrer">
            View <ExternalLink className="ml-1 w-3.5 h-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
