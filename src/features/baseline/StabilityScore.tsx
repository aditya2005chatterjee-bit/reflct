import { useState, useEffect } from "react";
import { getScoreTailwindColor } from "@/lib/engine/financial";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface StabilityScoreProps {
  score: number;
  level: string;
  label?: string;
  previousScore?: number;
}

const StabilityScore = ({ score, level, label = "Stability Score", previousScore }: StabilityScoreProps) => {
  const animatedScore = useAnimatedNumber(score);
  const colorClass = getScoreTailwindColor(score);
  const [pulse, setPulse] = useState(false);

  const delta = previousScore !== undefined ? score - previousScore : 0;
  const showDelta = previousScore !== undefined && Math.abs(delta) >= 0.1;

  useEffect(() => {
    if (previousScore !== undefined && previousScore !== score) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [score, previousScore]);

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-fade-in">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="flex items-end gap-3">
        <span
          className={`text-5xl font-bold tabular-nums transition-score ${colorClass} ${
            pulse ? "scale-110" : "scale-100"
          } transition-transform duration-300`}
        >
          {animatedScore.toFixed(0)}
        </span>
        <span className="text-sm text-muted-foreground pb-2">/ 100</span>
        {showDelta && (
          <span
            className={`text-sm font-semibold pb-2 animate-fade-in ${
              delta < 0 ? "text-score-red" : "text-score-green"
            }`}
          >
            {delta > 0 ? "+" : ""}{delta.toFixed(1)} pts
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full transition-score ${
          score <= 35 ? "bg-score-red" :
          score <= 65 ? "bg-score-orange" :
          score <= 85 ? "bg-score-blue" :
          "bg-score-green"
        }`} />
        <span className={`text-sm font-medium transition-score ${colorClass}`}>
          {level}
        </span>
      </div>
      {/* Score bar */}
      <div className="mt-4 h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            score <= 35 ? "bg-score-red" :
            score <= 65 ? "bg-score-orange" :
            score <= 85 ? "bg-score-blue" :
            "bg-score-green"
          }`}
          style={{ width: `${animatedScore}%` }}
        />
      </div>
    </div>
  );
};

export default StabilityScore;
