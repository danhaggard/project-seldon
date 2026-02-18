import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
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
import { EditPredictionDetailsButton } from "@/app/gurus/[slug]/predictions/[id]/edit/_components/edit-prediction-details-button";

function getGuruSlug(prediction: PredictionByIdWithRelations) {
  const guruSlug = prediction.gurus?.slug;
  return guruSlug ? `/gurus/${guruSlug}` : `#`;
}

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
            <Link href={getGuruSlug(prediction)} scroll={false}>
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

      {/* V2: Sources List (Handling multiple sources) */}
      {prediction.prediction_sources &&
        prediction.prediction_sources.length > 0 && (
          <div className="pt-2">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Sources & Evidence
            </h3>
            <div className="space-y-2">
              {prediction.prediction_sources.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded border"
                >
                  <span className="text-muted-foreground capitalize truncate max-w-50 sm:max-w-xs">
                    {source.type} Source
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    asChild
                  >
                    <a href={source.url} target="_blank" rel="noreferrer">
                      Open Link <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
