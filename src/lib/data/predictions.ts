import { createClient } from "@/lib/supabase/server";
import { Guru } from "@/lib/definitions/guru";
import { Prediction } from "@/lib/definitions/prediction";
import { Category } from "../definitions/category";
import { PredictionSource } from "../definitions/prediction-source";
import { getClaims } from "../supabase/rbac";
// ... your other imports (Prediction, Category, Guru, PredictionSource)

export type PredictionByIdWithRelations = Prediction & {
  categories: Pick<Category, "name"> | null;
  gurus: Pick<Guru, "slug" | "name"> | null;
  prediction_sources: (Pick<
    PredictionSource,
    | "url"
    | "type"
    | "title"
    | "media_type"
    | "id"
    | "upvotes_count"
    | "downvotes_count"
    | "created_by"
  > & {
    // true = ArrowBigUp, false = ArrowBigDown, null = User hasn't voted
    user_vote: boolean | null;
    is_owner: boolean;
  })[];
};

export async function getPredictionById(
  id: string,
): Promise<PredictionByIdWithRelations> {
  const supabase = await createClient();

  // 1. Fetch the Prediction and the Source caching counts
  const { data, error } = await supabase
    .from("predictions")
    .select(
      "*, gurus(*), categories (name), prediction_sources (id, url, type, title, media_type, upvotes_count, downvotes_count, created_by)",
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Database Error (getPredictionById):", error);
    throw new Error("Failed to fetch prediction details.");
  }

  if (!data) {
    throw new Error("Prediction not found");
  }

  const claims = await getClaims();

  // 2. Determine if we have an active user to fetch their specific votes
  let userValidationsMap: Record<string, boolean> = {};

  if (claims && data.prediction_sources && data.prediction_sources.length > 0) {
    const sourceIds = data.prediction_sources.map((s: { id: string }) => s.id);

    // 3. Fetch ONLY this user's votes for these specific sources
    const { data: validations } = await supabase
      .from("source_validations")
      .select("source_id, is_valid")
      .in("source_id", sourceIds)
      .eq("user_id", claims.sub);

    if (validations) {
      // Create a quick lookup map: { "source-uuid": true/false }
      userValidationsMap = validations.reduce(
        (acc, val) => {
          acc[val.source_id] = val.is_valid;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    }
  }

  type MappedSource = {
    type: string;
    id: string;
    created_by: string;
    title: string;
  };
  // 4. Merge the user's vote status into the sources array before returning, and enforce a stable sort
  const mappedSources =
    data.prediction_sources
      ?.map((source: MappedSource) => ({
        ...source,
        user_vote: userValidationsMap[source.id] ?? null,
        is_owner: claims ? source.created_by === claims.sub : false,
      }))
      .sort((a: MappedSource, b: MappedSource) => {
        // 1st Priority: Sort by type (Primary goes above Secondary)
        if (a.type !== b.type) {
          return a.type === "primary" ? -1 : 1;
        }
        // 2nd Priority:  sort by title to prevent jumping on updates
        if (a.title !== b.title) {
          return a.title.localeCompare(b.title);
        }
        // 3rd Priority: Stable sort by id to prevent jumping on updates
        return a.id.localeCompare(b.id);
      }) || [];

  return {
    ...data,
    prediction_sources: mappedSources,
  } as PredictionByIdWithRelations;
}

export type PredictionByIdWithSources = Prediction & {
  prediction_sources: PredictionSource[];
};

export async function getPredictionByIdWithSources(
  id: string,
): Promise<PredictionByIdWithSources> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("predictions")
    .select("*, prediction_sources(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Database Error (getPredictionByIdWithSources):", error);
    throw new Error("Failed to fetch prediction details.");
  }

  if (!data) {
    throw new Error("Prediction not found");
  }

  return data as PredictionByIdWithSources;
}
