interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  accent?: boolean;
  className?: string;
}

const MetricCard = ({ label, value, subtext, accent, className = "" }: MetricCardProps) => {
  return (
    <div className={`rounded-xl bg-card border border-border p-4 animate-fade-in hover:border-foreground/10 transition-all duration-300 ${className}`}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-2xl font-bold tabular-nums transition-score ${accent ? "text-foreground" : "text-foreground"}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
};

export default MetricCard;
