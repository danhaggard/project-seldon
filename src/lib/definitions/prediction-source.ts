import { Database, Constants } from "@/lib/definitions/database.types";
import { TupleToUnion } from "@/types/utils";

export type PredictionSource =
  Database["public"]["Tables"]["prediction_sources"]["Row"];

export const predictionSourceMediaTypes = Constants.public.Enums.media_type;
export type PredictionSourceMediaTypes = TupleToUnion<
  typeof predictionSourceMediaTypes
>;

export const predictionSourceTypes = Constants.public.Enums.source_type;
export type PredictionSourceTypes = TupleToUnion<typeof predictionSourceTypes>;

export const predictionSourceStatuses = Constants.public.Enums.source_status;
export type PredictionSourceStatuses = TupleToUnion<
  typeof predictionSourceStatuses
>;

export const PREDICTION_SOURCE_MEDIA_TYPE = predictionSourceMediaTypes.reduce(
  (acc, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
  },
  {} as Record<string, string>,
) as {
  [K in (typeof predictionSourceMediaTypes)[number] as Uppercase<K>]: K;
};

export type PredictionSourceMediaType = typeof PREDICTION_SOURCE_MEDIA_TYPE;

export const PREDICTION_SOURCE_TYPE = predictionSourceTypes.reduce(
  (acc, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
  },
  {} as Record<string, string>,
) as {
  [K in (typeof predictionSourceTypes)[number] as Uppercase<K>]: K;
};

export type PredictionSourceType = typeof PREDICTION_SOURCE_TYPE;

export const PREDICTION_SOURCE_STATUS = predictionSourceStatuses.reduce(
  (acc, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
  },
  {} as Record<string, string>,
) as {
  [K in (typeof predictionSourceStatuses)[number] as Uppercase<K>]: K;
};

export type PredictionSourceStatus = typeof PREDICTION_SOURCE_STATUS;
