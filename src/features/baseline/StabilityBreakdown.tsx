import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StabilityBreakdown as BreakdownType } from "@/lib/engine/financial";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface Props {
  breakdown: BreakdownType;
  previousBreakdown?: BreakdownType;
}

const PillarBar = ({
  label,
  score,
  previousScore,
  max,
}: {
  label: string;
  score: number;
  previousScore?: number;
  max: number;
}) => {
  const animated = useAnimatedNumber(score);
  const dropped = previousScore !== undefined && score < previousScore;
  const delta = previousScore !== undefined ? score - previousScore : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold tabular-nums ${dropped ? "text-score-red" : "text-foreground"}`}>
            {animated.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">/ {max}</span>
          {dropped && delta !== 0 && (
            <span className="text-xs font-medium text-score-red animate-fade-in">
              {delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${dropped ? "bg-score-red" : "bg-foreground/40"}`}
          style={{ width: `${(animated / max) * 100}%` }}
        />
      </div>
    </div>
  );
};

const StabilityBreakdown = ({ breakdown, previousBreakdown }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground/70 transition-colors"
      >
        <span>Why this score?</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-4 space-y-3">
          <PillarBar
            label="Emergency Strength"
            score={breakdown.emergencyScore}
            previousScore={previousBreakdown?.emergencyScore}
            max={33}
          />
          <PillarBar
            label="Savings Discipline"
            score={breakdown.savingsScore}
            previousScore={previousBreakdown?.savingsScore}
            max={33}
          />
          <PillarBar
            label="Expense Burden"
            score={breakdown.expenseScore}
            previousScore={previousBreakdown?.expenseScore}
            max={33}
          />
        </div>
      </div>
    </div>
  );
};

export default StabilityBreakdown;
