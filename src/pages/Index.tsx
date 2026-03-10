import React from "react";

interface ProgressRingProps {
  value: number; // Progress value from 0 to 100
  size?: number; // Diameter of the ring in pixels
  thickness?: number; // Thickness of the ring stroke
  color?: string; // Stroke color of the progress ring
}

const ProgressRing = ({
  value,
  size = 128,
  thickness = 14,
  color = "#3b82f6"
}: ProgressRingProps) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressLength = (value / 100) * circumference;
  const adjustedLength = Math.max(progressLength - thickness * 0.6, 0);
  const dashArray = `${adjustedLength} ${circumference}`;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        stroke="rgba(255,255,255,0.12)"
        fill="transparent"
        strokeWidth={thickness}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: "stroke-dasharray 0.35s" }}
      />
    </svg>
  );
};

export default ProgressRing;
