export interface Guru {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  twitter_handle: string | null;
  youtube_channel: string | null;
  website: string | null;
  credibility_score: number;
  total_predictions: number;
  correct_prediction_count: number;
}
