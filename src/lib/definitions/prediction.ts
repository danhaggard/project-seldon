import { Database, Constants } from "@/lib/definitions/database.types";

export type Prediction = Database["public"]["Tables"]["predictions"]["Row"];

export type PredictionStatus = Database["public"]["Enums"]["prediction_status"];

export const predictionStatuses = Constants.public.Enums.prediction_status;

export const PREDICTION_STATUS = predictionStatuses.reduce(
  (acc, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
  },
  {} as Record<string, string>,
) as {
  [K in (typeof predictionStatuses)[number] as Uppercase<K>]: K;
};

// 2. Derive the type from the object (optional but recommended)
export type PredictionStatusType = typeof PREDICTION_STATUS;
