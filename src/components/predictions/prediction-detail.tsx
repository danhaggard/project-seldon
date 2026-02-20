import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Vote,
  AlertTriangle,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import { PredictionByIdWithRelations } from "@/lib/data/predictions";
import {
  PREDICTION_STATUS,
  PredictionStatus,
} from "@/lib/definitions/prediction";
import Link from "next/link";
import { Suspense } from "react";
import { EditPredictionDetailsButton } from "@/app/(main)/gurus/[slug]/predictions/[id]/edit/_components/edit-prediction-details-button";
import { routes } from "@/config/routes";
import { getMediaBadgeClassName, getMediaIcon } from "@/config/getters";
import { cn } from "@/lib/utils";
import { SourceValidationControls } from "./source-validation-controls";

export function PredictionDetail({
  prediction,
}: {
  prediction: PredictionByIdWithRelations;
}) {
  const guru = prediction.gurus;

  // Status Logic
  const getStatusConfig = (status: PredictionStatus) => {
    switch (status) {
      case "correct":
        return {
          color: "text-green-500",
          icon: CheckCircle2,
          label: "Correct",
        };
      case "incorrect":
        return { color: "text-red-500", icon: XCircle, label: "Incorrect" };
      case "in_evaluation":
        return { color: "text-purple-500", icon: Vote, label: "In Evaluation" };
      case "vague":
        return {
          color: "text-amber-500",
          icon: AlertTriangle,
          label: "Vague / Disputed",
        };
      default:
        return { color: "text-blue-500", icon: Clock, label: "Pending" };
    }
  };

  const statusConfig = getStatusConfig(
    prediction.status || PREDICTION_STATUS.PENDING,
  );
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2 mb-2">
          {/* V2: Use categories.name instead of prediction.category */}
          {prediction.categories?.name && (
            <Badge variant="outline">{prediction.categories.name}</Badge>
          )}

          <span className="text-sm text-muted-foreground">
            Prediction by{" "}
            <Link
              href={routes.gurus.detail(prediction.gurus?.slug || "")}
              scroll={false}
            >
              <span className="font-medium text-foreground">{guru?.name}</span>
            </Link>
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">{prediction.title}</h1>
      </div>

      <Suspense>
        <EditPredictionDetailsButton
          createdById={prediction.created_by || ""}
          guruSlug={prediction.gurus?.slug || ""}
          predictionId={prediction.id}
        />
      </Suspense>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Status Section */}
        <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground block">
              Current Status
            </span>
            <div
              className={`font-bold capitalize flex items-center gap-2 mt-1 ${statusConfig.color}`}
            >
              <StatusIcon className="w-5 h-5" />
              {statusConfig.label}
            </div>
          </div>

          {/* V2: Quality Score (Optional Addition) */}
          {prediction.quality_score !== null && (
            <div className="text-right">
              <span className="text-sm text-muted-foreground block">
                Quality Score
              </span>
              <span className="font-bold">{prediction.quality_score}/100</span>
            </div>
          )}
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            {/* V2: Logic for date label */}
            <span className="text-sm">
              {prediction.status === "pending" ? "Deadline" : "Resolution Date"}
            </span>
          </div>
          <p className="font-semibold">
            {/* V2: Use resolution_window_end */}
            {prediction.resolution_window_end
              ? format(new Date(prediction.resolution_window_end), "PPP")
              : "No Date Set"}
          </p>
        </div>
      </div>

      {/* Description / Reasoning */}
      {prediction.description && (
        <div className="pt-2">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            {prediction.description}
          </p>
        </div>
      )}

      {prediction.prediction_sources &&
        prediction.prediction_sources.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-foreground/80">
              <LinkIcon className="w-4 h-4" /> Sources & Evidence
            </h3>
            <div className="space-y-2">
              {prediction.prediction_sources.map((source, idx) => (
                <div
                  key={source.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between text-sm p-3 bg-card rounded-lg border shadow-sm gap-3 transition-colors hover:bg-muted/10"
                >
                  {/* LEFT SIDE: Clean Metadata and Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* 1. Colored Media Badge */}
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md font-medium text-xs shrink-0 border border-transparent",
                        getMediaBadgeClassName(source.media_type),
                      )}
                    >
                      {/* Pass custom sizing, color inherits from the wrapper */}
                      {getMediaIcon(source.media_type, "w-3.5 h-3.5")}
                      <span className="capitalize">{source.media_type}</span>
                    </div>

                    {/* 2. Primary/Secondary Tag (Demoted to clean text) */}
                    <div className="hidden sm:flex items-center gap-2 text-muted-foreground shrink-0">
                      <span className="uppercase tracking-wider font-semibold text-[10px]">
                        {source.type}
                      </span>
                      <span className="text-border text-[10px]">•</span>
                    </div>

                    {/* 3. Title */}
                    <span
                      className="font-medium truncate text-foreground/90"
                      title={source.title || source.url}
                    >
                      {source.title || source.url}
                    </span>
                  </div>

                  {/* RIGHT SIDE: The new component! */}
                  <SourceValidationControls
                    sourceId={source.id}
                    url={source.url}
                    initialUpvotes={source.upvotes_count}
                    initialDownvotes={source.downvotes_count}
                    initialUserVote={source.user_vote}
                    isOwner={source.is_owner}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
