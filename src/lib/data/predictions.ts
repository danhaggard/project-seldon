import { createClient } from "@/lib/supabase/server";
import { Guru } from "@/lib/definitions/guru";
import { Prediction } from "@/lib/definitions/prediction";
import { Category } from "../definitions/category";
import { PredictionSource } from "../definitions/prediction-source";

export type PredictionByIdWithRelations = Prediction & {
  categories: Pick<Category, "name"> | null;
  gurus: Pick<Guru, "slug" | "name"> | null;
  prediction_sources: Pick<PredictionSource, "url" | "type">[];
};

export async function getPredictionById(
  id: string,
): Promise<PredictionByIdWithRelations> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("predictions")
    .select("*, gurus(*), categories (name), prediction_sources (url, type)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Database Error (getPredictionById):", error);
    throw new Error("Failed to fetch prediction details.");
  }

  if (!data) {
    throw new Error("Prediction not found");
  }

  return data as PredictionByIdWithRelations;
}
