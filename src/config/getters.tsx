import { PredictionSourceMediaTypes } from "@/lib/definitions/prediction-source";
import { siteConfig } from "./site";
import { cn } from "@/lib/utils";

export function getMediaIcon(
  mediaType?: PredictionSourceMediaTypes,
  className?: string,
) {
  if (!mediaType) {
    return null;
  }
  const Icon = siteConfig.prediction_sources.media_type[mediaType]?.icon;

  return <Icon className={cn("shrink-0", className || "w-4 h-4")} />;
}

export function getMediaBadgeClassName(mediaType?: PredictionSourceMediaTypes) {
  if (!mediaType) {
    return null;
  }
  return (
    siteConfig.prediction_sources.media_type[mediaType]?.badgeClassName || ""
  );
}
