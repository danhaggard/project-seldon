import { cn } from "@/lib/utils";

interface CredibilityRingProps {
  score: number;
  size?: "sm" | "lg";
}

export function CredibilityRing({ score, size = "lg" }: CredibilityRingProps) {
  // Logic: Green > 60, Yellow > 40, Red < 40
  const getColor = (s: number) => {
    if (s >= 60) return "text-green-500";
    if (s >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const colorClass = getColor(score);
  const radius = 56;
  const circumference = 2 * Math.PI * radius; // ~351.86
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Ring */}
          <circle
            className="text-muted/20"
            cx="64"
            cy="64"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
          />
          {/* Progress Ring */}
          <circle
            className={cn("transition-all duration-1000 ease-out", colorClass)}
            cx="64"
            cy="64"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{score}</span>
          <span className="text-xs font-medium text-muted-foreground mt-1">
            SCORE
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-medium">Credibility Score</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {score > 80
            ? "Top 5% of all Gurus"
            : score > 50
              ? "Average Accuracy"
              : "Below Average"}
        </p>
      </div>
    </div>
  );
}
