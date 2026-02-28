import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { formatCurrency } from "@/lib/financial";

interface ProjectionChartProps {
  data: Array<{
    month: number;
    label: string;
    current: number;
    afterPurchase?: number;
  }>;
  hasPurchase: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg bg-card border border-border p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const ProjectionChart = ({ data, hasPurchase }: ProjectionChartProps) => {
  const filtered = data.filter((_, i) => i % 6 === 0 || i === data.length - 1);

  // Calculate 5-year difference
  const lastPoint = data[data.length - 1];
  const fiveYearDiff = hasPurchase && lastPoint?.afterPurchase !== undefined
    ? lastPoint.current - lastPoint.afterPurchase
    : 0;

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          5-Year Savings Projection
        </p>
        {hasPurchase && fiveYearDiff > 0 && (
          <p className="text-xs font-semibold text-score-red animate-fade-in">
            5-Year Difference: {formatCurrency(fiveYearDiff)}
          </p>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(0 0% 40%)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(0 0% 15%)" }}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fill: "hsl(0 0% 40%)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="current"
              name="Current Path"
              stroke="hsl(0 0% 65%)"
              strokeWidth={2}
              fill="hsl(0 0% 65%)"
              fillOpacity={0.05}
              dot={false}
              activeDot={{ r: 3, fill: "hsl(0 0% 65%)" }}
              animationDuration={800}
            />
            {hasPurchase && (
              <Area
                type="monotone"
                dataKey="afterPurchase"
                name="After Purchase"
                stroke="hsl(0 72% 51%)"
                strokeWidth={2}
                strokeDasharray="6 3"
                fill="hsl(0 72% 51%)"
                fillOpacity={0.08}
                dot={false}
                activeDot={{ r: 3, fill: "hsl(0 72% 51%)" }}
                animationDuration={800}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {hasPurchase && (
        <div className="flex gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-secondary-foreground" />
            <span className="text-xs text-muted-foreground">Current path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-score-red" style={{ borderTop: "2px dashed" }} />
            <span className="text-xs text-muted-foreground">After purchase</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionChart;
