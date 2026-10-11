import React from "react"
import { Check, ChevronRight, BookOpen, Clock, Code, Award, CheckCircle2 } from "lucide-react"
import type { RoadmapStage } from "../../types/roadmap"

interface RoadmapTimelineListProps {
  stages: RoadmapStage[]
  onStageClick: (stage: RoadmapStage) => void
}

export default function RoadmapTimelineList({
  stages,
  onStageClick,
}: RoadmapTimelineListProps) {
  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-emerald-500">
      {stages.map((stage, idx) => {
        const isCompleted = stage.completed
        const color = stage.color || "#3B82F6"

        return (
          <div
            key={stage.stage_number}
            className="relative group cursor-pointer"
            onClick={() => onStageClick(stage)}
          >
            {/* Timeline Milestone Dot */}
            <div
              className={`absolute -left-6 sm:-left-8 top-5 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                isCompleted
                  ? "bg-emerald-500 border-white text-white"
                  : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 group-hover:scale-110"
              }`}
              style={{ borderColor: isCompleted ? "#10B981" : color }}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <span className="text-[11px] font-bold font-mono">
                  {stage.stage_number}
                </span>
              )}
            </div>

            {/* Stage Card */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                isCompleted
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${color}18`,
                      color: color,
                    }}
                  >
                    {stage.badge_text || `STEP ${String(stage.stage_number).padStart(2, "0")}`}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stage.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {stage.estimated_hours}
                  </span>
                </div>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Phase Completed
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">
                    {stage.topics.length} Key Skills
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {stage.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {stage.description}
              </p>

              {/* Subtopics Checklist Preview */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {stage.topics.map((topic, tIdx) => {
                  const isChecked = stage.completed_subtopics?.includes(topic) || isCompleted
                  return (
                    <div
                      key={tIdx}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                    >
                      <div
                        className={`w-4 h-4 rounded shrink-0 flex items-center justify-center ${
                          isChecked
                            ? "bg-emerald-500 text-white"
                            : "border border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{topic}</span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                  Open Stage Details <ChevronRight className="w-3.5 h-3.5" />
                </span>

                {stage.tutorial_link && (
                  <span className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Tutorials Available
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

