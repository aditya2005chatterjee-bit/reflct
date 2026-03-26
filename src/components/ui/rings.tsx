import React from "react";

interface RingItem {
  label: string;
  value: number; // 0–100
}

interface RingsProps {
  data: RingItem[];
  size?: number;
  strokeWidth?: number;
}

const getColor = (value: number) => {
  if (value >= 75) return "#22c55e"; // green
  if (value >= 50) return "#eab308"; // yellow
  return "#ef4444"; // red
};

const SingleRing: React.FC<{
  value: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
}> = ({ value, size, strokeWidth, color, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Allow full completion at 100%, otherwise keep gap style
  const progress = value >= 100 ? 1 : (value / 100) * 0.85;

  const dash = progress * circumference;
  const offset = circumference - dash;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Background */}
        <circle
          stroke="rgba(255,255,255,0.08)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Progress */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Value */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-white text-sm font-semibold"
        >
          {Math.round(value)}%
        </text>
      </svg>

      <span className="mt-2 text-xs text-gray-400">{label}</span>
    </div>
  );
};

const Rings: React.FC<RingsProps> = ({
  data,
  size = 130,
  strokeWidth = 16,
}) => {
  return (
    <div className="flex justify-center gap-6 flex-wrap">
      {data.map((item, index) => (
        <SingleRing
          key={index}
          value={item.value}
          size={size}
          strokeWidth={strokeWidth}
          color={getColor(item.value)}
          label={item.label}
        />
      ))}
    </div>
  );
};

export default Rings;