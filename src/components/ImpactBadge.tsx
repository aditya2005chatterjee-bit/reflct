import { ImpactSeverity } from "@/lib/financial";

const config: Record<ImpactSeverity, { label: string; className: string }> = {
  none: { label: "No Impact", className: "bg-score-blue/15 text-score-blue border-score-blue/20" },
  minor: { label: "Minor Impact", className: "bg-score-orange/10 text-score-orange/80 border-score-orange/15" },
  moderate: { label: "Moderate Impact", className: "bg-score-orange/15 text-score-orange border-score-orange/20" },
  major: { label: "Major Impact", className: "bg-score-red/15 text-score-red border-score-red/20" },
};

const ImpactBadge = ({ severity }: { severity: ImpactSeverity }) => {
  const { label, className } = config[severity];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border animate-fade-in ${className}`}>
      {label}
    </span>
  );
};

export default ImpactBadge;
