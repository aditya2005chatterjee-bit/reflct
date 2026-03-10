interface ProgressRingProps {
  value: number
  size?: number
  thickness?: number
  color?: string
}

const ProgressRing = ({
  value,
  size = 128,
  thickness = 12,
  color = "#3b82f6"
}: ProgressRingProps) => {

  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const progressLength = (value / 100) * circumference
  const dashArray = `${progressLength} ${circumference}`

  return (
    <svg
      width={size}
      height={size}
      className="block"
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={thickness}
        fill="transparent"
      />

      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray={dashArray}
        strokeDashoffset={0}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  )
}

export default ProgressRing