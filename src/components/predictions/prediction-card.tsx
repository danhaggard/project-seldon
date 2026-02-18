import { Prediction } from "@/lib/definitions/prediction";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

function getPredictionSlug(prediction: Prediction) {
  const guruSlug = prediction.gurus?.slug;

  // Fallback: If for some reason slug is missing, linking to root /predictions might be a safe fallback,
  // but for now let's assume data integrity is good.
  const href = guruSlug
    ? `/gurus/${guruSlug}/predictions/${prediction.id}`
    : `#`;
  return href;
}

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const isPending = prediction.status === "pending";

  // Helper for Status Badge Styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "correct":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
      case "incorrect":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
    }
  };

  const statusIcon = {
    correct: <CheckCircle2 className="w-3 h-3 mr-1" />,
    incorrect: <XCircle className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
    void: null,
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-200 border-l-4",
        prediction.status === "correct"
          ? "border-l-green-500"
          : prediction.status === "incorrect"
            ? "border-l-red-500"
            : "border-l-transparent",
      )}
    >
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 space-y-2">
            {/* Meta Row (Category + Date) */}
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="font-medium">
                {prediction.category}
              </Badge>
              <span className="text-muted-foreground">
                Posted{" "}
                {formatDistanceToNow(new Date(prediction.prediction_date))} ago
              </span>
            </div>

            {/* Title */}
            <Link
              href={getPredictionSlug(prediction)}
              scroll={false}
              className="block group"
            >
              <h3 className="text-lg font-bold leading-tight text-foreground">
                {prediction.title}
              </h3>
            </Link>

            {/* Details Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
              {prediction.resolution_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {isPending ? "Deadline: " : "Resolved: "}
                    {format(
                      new Date(prediction.resolution_date),
                      "MMM d, yyyy",
                    )}
                  </span>
                </div>
              )}
              {prediction.confidence_level > 0 && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Probability: {prediction.confidence_level}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Status & Action */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border",
                getStatusColor(prediction.status),
              )}
            >
              {statusIcon[prediction.status]}
              {prediction.status}
            </span>

            {prediction.source_url && (
              <a
                href={prediction.source_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-xs font-medium text-primary hover:underline mt-auto"
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
