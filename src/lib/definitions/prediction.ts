export type PredictionStatus = "pending" | "correct" | "incorrect" | "void";

export interface Prediction {
  id: string;
  guru_id: string;
  title: string;
  category: string;
  confidence_level: number;
  status: PredictionStatus;
  prediction_date: string; // ISO String
  resolution_date: string | null; // ISO String
  source_url: string | null;
  description: string | null;
  gurus?: {
    slug: string;
    name?: string;
  };
}
