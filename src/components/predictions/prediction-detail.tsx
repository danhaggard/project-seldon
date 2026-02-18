import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { PredictionWithGuru } from "@/lib/data/predictions";

export function PredictionDetail({
  prediction,
}: {
  prediction: PredictionWithGuru;
}) {
  const guru = prediction.gurus; // Joined data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{prediction.category}</Badge>
          <span className="text-sm text-muted-foreground">
            Prediction by {guru?.name}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">{prediction.title}</h1>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Target Date</span>
          </div>
          <p className="font-semibold">
            {prediction.resolution_date
              ? format(new Date(prediction.resolution_date), "PPP")
              : "No Date Set"}
          </p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Probability</span>
          </div>
          <p className="font-semibold">{prediction.confidence_level}%</p>
        </div>
      </div>

      {/* Status Section */}
      <div className="p-4 border rounded-lg flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground block">
            Current Status
          </span>
          <span className="font-bold capitalize flex items-center gap-2 mt-1">
            {prediction.status === "correct" && (
              <CheckCircle2 className="text-green-500" />
            )}
            {prediction.status === "incorrect" && (
              <XCircle className="text-red-500" />
            )}
            {prediction.status === "pending" && (
              <Clock className="text-blue-500" />
            )}
            {prediction.status}
          </span>
        </div>
        {prediction.source_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={prediction.source_url} target="_blank" rel="noreferrer">
              Source <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </Button>
        )}
      </div>

      {/* Description / Reasoning */}
      {prediction.description && (
        <div className="pt-2">
          <h3 className="font-semibold mb-2">Context & Reasoning</h3>
          <p className="text-muted-foreground leading-relaxed">
            {prediction.description}
          </p>
        </div>
      )}
    </div>
  );
}
