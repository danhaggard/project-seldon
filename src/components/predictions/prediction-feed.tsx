"use client";

import { useState } from "react";
import { Prediction } from "@/lib/definitions/prediction";
import { PredictionCard } from "./prediction-card";
import { cn } from "@/lib/utils";

export function PredictionFeed({ predictions }: { predictions: Prediction[] }) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Filter data based on active tab
  const filteredPredictions = predictions.filter((p) =>
    activeTab === "pending" ? p.status === "pending" : p.status !== "pending",
  );

  return (
    <div className="space-y-6">
      {/* --- Tabs Header --- */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
            )}
          >
            Pending Predictions
            <span
              className={cn(
                "ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium inline-block",
                activeTab === "pending"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {predictions.filter((p) => p.status === "pending").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
            )}
          >
            Prediction History
          </button>
        </nav>
      </div>

      {/* --- The List --- */}
      <div className="space-y-4">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No {activeTab} predictions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
