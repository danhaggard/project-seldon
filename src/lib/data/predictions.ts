import { createClient } from "@/lib/supabase/server";
import { Prediction } from "@/lib/definitions/prediction";
import { Guru } from "@/lib/definitions/guru";

export interface PredictionWithGuru extends Prediction {
  gurus: Guru; // Supabase joins return the joined table name as the key
}

export async function getPredictionById(
  id: string,
): Promise<PredictionWithGuru> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("predictions")
    .select("*, gurus(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Database Error (getPredictionById):", error);
    throw new Error("Failed to fetch prediction details.");
  }

  if (!data) {
    throw new Error("Prediction not found");
  }

  return data as PredictionWithGuru;
}
