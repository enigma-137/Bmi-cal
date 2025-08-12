"use client"

import { motion } from "framer-motion"

interface GaugeChartProps {
  value: number
}

export default function GaugeChart({ value }: GaugeChartProps) {
  const radius = 100
  const centerX = 150
  const centerY = 120

  // Helper to get arc path
  const getArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`
  }

  const polarToCartesian = (angle: number) => {
    const radians = (angle - 90) * (Math.PI / 180)
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    }
  }

  // Calculate needle angle based on BMI value
  const calculateNeedleAngle = (bmi: number): number => {
    if (bmi <= 0) return -90
    if (bmi < 18.5) return -90 + (bmi / 18.5) * 60
    if (bmi < 25) return -30 + ((bmi - 18.5) / 6.5) * 60
    if (bmi < 30) return 30 + ((bmi - 25) / 5) * 30
    return Math.min(60 + ((bmi - 30) / 10) * 30, 90)
  }

  const needleAngle = calculateNeedleAngle(value)

  return (
    <div className="relative mx-auto" style={{ width: 300, height: 170 }}>
      <svg width="300" height="150" viewBox="0 0 300 150" className="mx-auto">
        {/* Background arc */}
        <path d={getArcPath(-90, 90)} stroke="#4b5563" strokeWidth="20" fill="none" />

        {/* Segments */}
        <path d={getArcPath(-90, -30)} stroke="#3b82f6" strokeWidth="18" fill="none" />
        <path d={getArcPath(-30, 30)} stroke="#10b981" strokeWidth="18" fill="none" />
        <path d={getArcPath(30, 60)} stroke="#f59e0b" strokeWidth="18" fill="none" />
        <path d={getArcPath(60, 90)} stroke="#ef4444" strokeWidth="18" fill="none" />

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: needleAngle }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        >
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - radius + 15}
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={centerX} cy={centerY} r="7" fill="#1f2937" />
        </motion.g>
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 w-full flex justify-between px-2 text-xs text-gray-600">
        <div className="text-left">
          <div className="font-medium">Underweight</div>
          <div>&lt; 18.5</div>
        </div>
        <div className="text-center -translate-x-2">
          <div className="font-medium">Normal</div>
          <div>18.5-24.9</div>
        </div>
        <div className="text-center translate-x-2">
          <div className="font-medium">Overweight</div>
          <div>25-29.9</div>
        </div>
        <div className="text-right">
          <div className="font-medium">Obese</div>
          <div>≥ 30</div>
        </div>
      </div>
    </div>
  )
}
