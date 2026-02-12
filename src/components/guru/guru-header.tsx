import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Globe, Youtube, Twitter } from "lucide-react";
import { CredibilityRing } from "./credibility-ring";
import { notFound } from "next/navigation";
import { getGuruBySlug } from "@/lib/data/gurus";

export async function GuruHeader({ slug }: { slug: string }) {
  // 1. Fetch data using the Data Layer
  const guru = await getGuruBySlug(slug);

  // 2. Handle 404 (Data layer returns null on error/missing)
  if (!guru) {
    notFound();
  }

  // Calculate accuracy safely to avoid divide by zero
  const accuracy =
    guru.total_predictions > 0
      ? Math.round(
          (guru.correct_prediction_count / guru.total_predictions) * 100,
        )
      : 0;

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* --- LEFT COLUMN: Identity & Bio --- */}
        <div className="flex-1">
          <div className="flex items-start gap-6">
            {/* Large Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border bg-muted">
              <AvatarImage
                src={guru.avatar_url || ""}
                alt={guru.name}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl font-bold text-muted-foreground rounded-2xl">
                {guru.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col justify-between h-full py-1">
              <div>
                <h1 className="text-3xl font-bold mb-2">{guru.name}</h1>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  {guru.bio || "No biography available."}
                </p>
              </div>

              {/* Social Links Row */}
              <div className="flex gap-3 mt-4">
                {guru.twitter_handle && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-muted/50 hover:text-blue-400"
                    asChild
                  >
                    <a
                      href={`https://twitter.com/${guru.twitter_handle}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {guru.youtube_channel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-muted/50 hover:text-red-500"
                    asChild
                  >
                    <a
                      href={guru.youtube_channel}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {guru.website && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-muted/50 hover:text-blue-500"
                    asChild
                  >
                    <a href={guru.website} target="_blank" rel="noreferrer">
                      <Globe className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* --- BOTTOM ROW: Stats Grid --- */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Total Predictions
              </span>
              <span className="text-xl font-bold">
                {guru.total_predictions}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Accuracy Rate
              </span>
              <span className="text-xl font-bold">{accuracy}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Avg. Horizon
              </span>
              {/* Placeholder for now, can calculate later */}
              <span className="text-xl font-bold">6 Months</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: The Score Ring --- */}
        <div className="md:w-64 flex flex-col items-center justify-center border-l-0 md:border-l pl-0 md:pl-8 pt-6 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
          <CredibilityRing score={guru.credibility_score} />
        </div>
      </div>
    </div>
  );
}
