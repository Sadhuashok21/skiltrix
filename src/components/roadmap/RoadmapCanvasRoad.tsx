import React, { useMemo } from "react"
import { Check, ChevronRight, BookOpen, Clock, Sparkles } from "lucide-react"
import type { RoadmapStage } from "../../types/roadmap"

interface RoadmapCanvasRoadProps {
  stages: RoadmapStage[]
  onStageClick: (stage: RoadmapStage) => void
}

export default function RoadmapCanvasRoad({
  stages,
  onStageClick,
}: RoadmapCanvasRoadProps) {
  // SVG viewBox dimensions
  const width = 860
  const stageCount = stages.length
  const itemHeight = 180
  const height = Math.max(stageCount * itemHeight + 120, 1100)

  // Calculate winding serpentine road path coordinates matching Android RoadmapView.java
  const { pathD, stagePositions, treePositions } = useMemo(() => {
    if (stageCount === 0) return { pathD: "", stagePositions: [], treePositions: [] }

    const paddingX = width * 0.28
    const leftX = paddingX
    const rightX = width - paddingX
    const midX = width / 2
    const startY = 90
    const endY = height - 90
    const availableH = endY - startY
    const turns = Math.max(stageCount - 1, 5)
    const turnH = availableH / turns

    let d = `M ${midX} ${startY}`
    let currentY = startY
    let goRight = true

    for (let i = 0; i < turns; i++) {
      const nextY = currentY + turnH
      const targetX = goRight ? rightX : leftX
      const endPointX = goRight ? leftX : rightX
      const controlY1 = currentY + turnH * 0.4
      const controlY2 = nextY - turnH * 0.4

      d += ` C ${targetX} ${controlY1}, ${targetX} ${controlY2}, ${endPointX} ${nextY}`
      currentY = nextY
      goRight = !goRight
    }

    // Distribute stage positions along the curve
    const stagePos: Array<{ x: number; y: number; isRightOfCenter: boolean }> = []
    const treePos: Array<{ x: number; y: number }> = []

    for (let i = 0; i < stageCount; i++) {
      const fraction = stageCount > 1 ? i / (stageCount - 1) : 0.5
      // y follows a smooth linear progression from startY to endY
      const y = startY + fraction * (endY - startY)

      // Calculate x matching the serpentine sine-like oscillation
      // In Android cubicTo swings from leftX to rightX
      const angle = (i % 2 === 0 ? 1 : -1) * (i === 0 || i === stageCount - 1 ? 0.3 : 0.95)
      const x = midX + angle * (width * 0.22)

      const isRightOfCenter = x > midX
      stagePos.push({ x, y, isRightOfCenter })

      // Decorative trees near milestones matching Android RoadmapView drawDecorativeTree
      if (i % 2 === 0) {
        treePos.push({ x: x - 64, y: y - 28 })
      } else {
        treePos.push({ x: x + 64, y: y + 20 })
      }
    }

    return { pathD: d, stagePositions: stagePos, treePositions: treePos }
  }, [stageCount, height, width])

  return (
    <div className="relative w-full overflow-x-auto py-6 bg-slate-900/50 dark:bg-slate-950/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="min-w-[760px] max-w-[900px] mx-auto relative px-4">
        {/* Helper Instructions Pill */}
        <div className="flex items-center justify-between mb-4 px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-white">Interactive 3D Serpentine Journey</span>
            <span className="text-slate-400 hidden sm:inline">— Tap any milestone platform to view curriculum &amp; mark progress</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress
            </span>
          </div>
        </div>

        {/* SVG Drawing of the Road, Platforms, Trees, and Badges */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          style={{ minHeight: `${height * 0.7}px` }}
        >
          <defs>
            {/* Road Drop Shadow filter */}
            <filter id="roadShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.7" />
            </filter>
            <filter id="platformGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
            </filter>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* 1. Outer Road Border / Asphalt Base (width 48) */}
          <path
            d={pathD}
            fill="none"
            stroke="#1E293B"
            strokeWidth="52"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#roadShadow)"
          />

          {/* 2. Main Asphalt Surface (width 40) */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#roadGradient)"
            strokeWidth="40"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Center Dashed Lane Divider (width 3.5, dash 14 12) */}
          <path
            d={pathD}
            fill="none"
            stroke="#F8FAFC"
            strokeWidth="3.5"
            strokeDasharray="14 12"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* 4. Decorative Evergreen Pine Trees along the serpentine curves */}
          {treePositions.map((t, idx) => (
            <g key={`tree-${idx}`} transform={`translate(${t.x}, ${t.y})`} opacity="0.9">
              {/* Pine tree layers */}
              <polygon points="0,-24 -10,-8 10,-8" fill="#15803D" />
              <polygon points="0,-16 -12,4 12,4" fill="#166534" />
              <polygon points="0,-8 -14,14 14,14" fill="#14532D" />
              <rect x="-2" y="14" width="4" height="6" fill="#78350F" />
            </g>
          ))}

          {/* 5. Milestones & Platforms along the road */}
          {stages.map((stage, idx) => {
            const pos = stagePositions[idx] || { x: width / 2, y: 100, isRightOfCenter: false }
            const isCompleted = stage.completed
            const color = stage.color || "#3B82F6"

            // Card placement matching Android RoadmapView:
            // If milestone is on right side of screen, card is on left side (x - cardW - gap)
            // If milestone is on left side of screen, card is on right side (x + gap)
            const cardW = 240
            const cardH = 88
            const cardX = pos.isRightOfCenter ? pos.x - cardW - 44 : pos.x + 44
            const cardY = pos.y - cardH / 2

            return (
              <g
                key={`stage-group-${stage.stage_number}`}
                className="cursor-pointer group"
                onClick={() => onStageClick(stage)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onStageClick(stage)
                  }
                }}
              >
                {/* 3D Platform shadow */}
                <ellipse
                  cx={pos.x}
                  cy={pos.y + 14}
                  rx="36"
                  ry="16"
                  fill="#020617"
                  opacity="0.6"
                />

                {/* 3D Isometric Platform (Rounded platform base) */}
                <rect
                  x={pos.x - 32}
                  y={pos.y - 14}
                  width="64"
                  height="28"
                  rx="14"
                  fill={color}
                  className="transition-transform duration-300 group-hover:scale-110"
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  filter="url(#platformGlow)"
                />

                {/* Connecting Platform Rings */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="24"
                  fill="#0F172A"
                  stroke={color}
                  strokeWidth="3.5"
                  className="transition-all duration-300 group-hover:stroke-white"
                />

                {/* Inner Milestone Number or Checkmark */}
                {isCompleted ? (
                  <g transform={`translate(${pos.x - 10}, ${pos.y - 10})`}>
                    <circle cx="10" cy="10" r="10" fill="#16A34A" />
                    <path
                      d="M6 10 L9 13 L14 7"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : (
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontWeight="bold"
                    fontSize="13"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                  >
                    {String(stage.stage_number).padStart(2, "0")}
                  </text>
                )}

                {/* Top Badge Pill (e.g. STEP 01) matching Android */}
                <g transform={`translate(${pos.x}, ${pos.y - 36})`}>
                  <rect
                    x="-34"
                    y="-11"
                    width="68"
                    height="20"
                    rx="10"
                    fill={color}
                    className="shadow"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontWeight="800"
                    fontSize="10"
                    letterSpacing="0.05em"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                  >
                    {stage.badge_text || `STEP ${String(stage.stage_number).padStart(2, "0")}`}
                  </text>
                </g>

                {/* Completed Check Pill above node if completed */}
                {isCompleted && (
                  <circle
                    cx={pos.x + 18}
                    cy={pos.y - 16}
                    r="8"
                    fill="#16A34A"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}

                {/* Connecting Dotted Line from Platform to Info Card */}
                <line
                  x1={pos.isRightOfCenter ? pos.x - 30 : pos.x + 30}
                  y1={pos.y}
                  x2={pos.isRightOfCenter ? cardX + cardW : cardX}
                  y2={pos.y}
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />

                {/* Milestone Info Card (ForeignObject for rich responsive HTML styling) */}
                <foreignObject
                  x={cardX}
                  y={cardY}
                  width={cardW}
                  height={cardH + 16}
                  className="overflow-visible"
                >
                  <div
                    className={`p-3 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-lg text-left ${
                      isCompleted
                        ? "bg-slate-900/95 border-emerald-500/60 shadow-emerald-950/20"
                        : "bg-slate-900/95 border-slate-700/80 hover:border-slate-500 group-hover:scale-[1.03] group-hover:shadow-2xl"
                    }`}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: color,
                    }}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${color}25`,
                          color: color,
                        }}
                      >
                        {stage.difficulty} • {stage.estimated_hours}
                      </span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Done
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {stage.topics.length} Skills
                        </span>
                      )}
                    </div>

                    <h4
                      className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-1 leading-snug group-hover:text-white"
                      title={stage.title}
                    >
                      {stage.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {stage.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-indigo-400 font-medium group-hover:text-indigo-300">
                      <span>View Skills Checklist</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

