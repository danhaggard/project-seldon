import { createClient } from "@/lib/supabase/server";
import { Guru } from "@/lib/definitions/guru";
import { Prediction } from "@/lib/definitions/prediction";
import { Category } from "../definitions/category";
import { PredictionSource } from "../definitions/prediction-source";

/**
 * Fetches a single Guru by their URL slug.
 * Returns null if not found or if an error occurs.
 */
export async function getGuruBySlug(slug: string): Promise<Guru | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("gurus")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Database Error (getGuruBySlug):", error);
      return null;
    }

    return data as Guru;
  } catch (error) {
    console.error("Unexpected Error (getGuruBySlug):", error);
    throw new Error("Failed to fetch guru.");
  }
}

// Define the return type for pagination
interface PagedResult<T> {
  data: T[];
  count: number;
}

export type PredictionWithRelations = Prediction & {
  categories: Pick<Category, "name"> | null;
  gurus: Pick<Guru, "slug"> | null;
  prediction_sources: Pick<PredictionSource, "url" | "type">[];
};

/**
 * Fetches all predictions for a specific Guru by their slug.
 * Uses an inner join to filter by the related Guru table.
 */
export async function getPredictionsByGuruSlug(
  slug: string,
  page: number = 1,
  pageSize: number = 5,
  statusFilter: "pending" | "resolved" = "pending",
): Promise<PagedResult<PredictionWithRelations>> {
  const supabase = await createClient();

  // Calculate range for Supabase (0-based index)
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // Build the query
    let query = supabase
      .from("predictions")
      .select(
        "*, gurus!inner(slug), categories (name), prediction_sources (url, type)",
        { count: "exact" },
      ) // Request exact count
      .eq("gurus.slug", slug)
      .range(from, to)
      .order("prediction_date", { ascending: false });

    // Apply Status Filter
    if (statusFilter === "pending") {
      query = query.eq("status", "pending");
    } else {
      // "Resolved" means anything NOT pending (correct, incorrect, void)
      query = query.neq("status", "pending");
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as PredictionWithRelations[],
      count: count || 0,
    };
  } catch (error) {
    console.error("Unexpected Error (getPredictionsByGuruSlug):", error);
    throw new Error("Failed to load prediction feed.");
  }
}
