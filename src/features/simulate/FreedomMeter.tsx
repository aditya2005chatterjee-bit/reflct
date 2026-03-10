import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface Props {
  before: number;
  after: number;
  reductionPercent: number;
  freedomDays: number;
}

const FreedomMeter = ({ before, after, reductionPercent, freedomDays }: Props) => {
  const animBefore = useAnimatedNumber(before);
  const animAfter = useAnimatedNumber(after);
  const maxMonths = Math.max(before, 12);

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-fade-in">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Safety Runway
      </p>
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Before</span>
            <span className="tabular-nums">{animBefore.toFixed(1)} mo</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/40 transition-all duration-700"
              style={{ width: `${(animBefore / maxMonths) * 100}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>After</span>
            <span className="tabular-nums">{animAfter.toFixed(1)} mo</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-score-red transition-all duration-700"
              style={{ width: `${(animAfter / maxMonths) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Safety reduced by <span className="text-score-red font-medium">{reductionPercent.toFixed(1)}%</span>
        </p>
        {freedomDays > 0 && (
          <p className="text-xs text-score-red font-medium">
            {freedomDays} days lost
          </p>
        )}
      </div>
    </div>
  );
};

export default FreedomMeter;
