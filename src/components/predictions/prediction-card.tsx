import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Vote,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PredictionWithRelations } from "@/lib/data/gurus";
import {
  PREDICTION_STATUS,
  PredictionStatus,
} from "@/lib/definitions/prediction";
import React, { JSX } from "react";

function getPredictionSlug(prediction: PredictionWithRelations) {
  const guruSlug = prediction.gurus?.slug;
  return guruSlug ? `/gurus/${guruSlug}/predictions/${prediction.id}` : `#`;
}

export function PredictionCard({
  prediction,
}: {
  prediction: PredictionWithRelations;
}) {
  console.log("prediction", prediction);
  // 2. Updated Status Logic to handle 'in_evaluation' and 'vague'
  const isPending = prediction.status === "pending";
  const isVoting = prediction.status === "in_evaluation";

  const getStatusColor = (status: PredictionStatus) => {
    switch (status) {
      case "correct":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
      case "incorrect":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
      case "in_evaluation":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
      case "vague":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
    }
  };

  const statusIcon: Partial<Record<PredictionStatus, JSX.Element>> = {
    correct: <CheckCircle2 className="w-3 h-3 mr-1" />,
    incorrect: <XCircle className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
    in_evaluation: <Vote className="w-3 h-3 mr-1" />, // New Icon
    vague: <AlertTriangle className="w-3 h-3 mr-1" />, // New Icon
  };

  // 3. Helper to find the best source link (Primary > Secondary > First Available)
  const primarySource =
    prediction.prediction_sources?.find((s) => s.type === "primary") ||
    prediction.prediction_sources?.[0];

  return (
    <Card
      className={cn(
        "relative block group hover:shadow-md transition-all duration-200 border-l-4",
        prediction.status === "correct"
          ? "border-l-green-500"
          : prediction.status === "incorrect"
            ? "border-l-red-500"
            : prediction.status === "in_evaluation"
              ? "border-l-purple-500" // Voting Highlight
              : "border-l-transparent",
      )}
    >
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 space-y-2">
            {/* Meta Row (Category Name + Date) */}
            <div className="flex items-center gap-2 text-xs">
              {prediction.categories?.name && (
                <Badge variant="secondary" className="font-medium">
                  {prediction.categories.name}
                </Badge>
              )}
              {prediction.created_at && (
                <span className="text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(prediction.created_at))}{" "}
                  ago
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight text-foreground">
              <Link
                href={getPredictionSlug(prediction)}
                scroll={false}
                className="focus:outline-none"
              >
                <span className="absolute inset-0" aria-hidden="true" />
                {prediction.title}
              </Link>
            </h3>

            {/* Details Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
              {/* 4. Use resolution_window_end instead of resolution_date */}
              {prediction.resolution_window_end && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {isPending
                      ? "Deadline: "
                      : isVoting
                        ? "Voting Ends: "
                        : "Resolved: "}
                    {format(
                      new Date(prediction.resolution_window_end),
                      "MMM d, yyyy",
                    )}
                  </span>
                </div>
              )}

              {/* Confidence (if stored) */}
              {/* Note: In V2 schema, confidence is on the 'vote' or 'prediction' depending on implementation. 
                  If you kept 'confidence_level' on prediction for initial seeding, use it. */}

              {prediction.confidence_level ||
                (0 > 0 && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Probability: {prediction.confidence_level}%</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Side: Status & Action */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border",
                getStatusColor(prediction.status || PREDICTION_STATUS.PENDING),
              )}
            >
              {statusIcon[prediction.status || PREDICTION_STATUS.PENDING]}
              {(prediction.status || "").replace("_", " ")}
            </span>

            {/* 5. Render the Source Link from the new relations */}
            {primarySource && (
              <a
                href={primarySource.url}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 flex items-center text-xs font-medium text-primary hover:underline mt-auto"
              >
                View Source
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
