import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  X,
  Check,
  CheckCircle2,
  BookOpen,
  Terminal,
  ExternalLink,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react"
import type { RoadmapStage } from "../../types/roadmap"

interface StageDetailModalProps {
  stage: RoadmapStage | null
  roadmapKey: string
  isOpen: boolean
  onClose: () => void
  onToggleComplete: (stageNumber: number, completed: boolean, subtopics: string[]) => void
}

export default function StageDetailModal({
  stage,
  roadmapKey,
  isOpen,
  onClose,
  onToggleComplete,
}: StageDetailModalProps) {
  if (!isOpen || !stage) return null

  const color = stage.color || "#3B82F6"
  const [completed, setCompleted] = useState<boolean>(stage.completed)
  const [subtopicsDone, setSubtopicsDone] = useState<string[]>(
    stage.completed_subtopics || (stage.completed ? [...stage.topics] : [])
  )

  useEffect(() => {
    setCompleted(stage.completed)
    setSubtopicsDone(
      stage.completed_subtopics || (stage.completed ? [...stage.topics] : [])
    )
  }, [stage])

  // Handle individual subtopic checkbox toggle
  const toggleSubtopic = (topic: string) => {
    let nextSubtopics: string[]
    if (subtopicsDone.includes(topic)) {
      nextSubtopics = subtopicsDone.filter((t) => t !== topic)
    } else {
      nextSubtopics = [...subtopicsDone, topic]
    }
    setSubtopicsDone(nextSubtopics)

    // If all subtopics are checked, auto-mark stage as completed
    const allChecked = stage.topics.every((t) => nextSubtopics.includes(t))
    if (allChecked && !completed) {
      setCompleted(true)
      onToggleComplete(stage.stage_number, true, nextSubtopics)
    } else {
      onToggleComplete(stage.stage_number, completed, nextSubtopics)
    }
  }

  // Handle Mark Phase Complete button click matching Android StageDetailBottomSheet
  const handleMainToggle = () => {
    const nextState = !completed
    setCompleted(nextState)
    const nextSubtopics = nextState ? [...stage.topics] : []
    setSubtopicsDone(nextSubtopics)
    onToggleComplete(stage.stage_number, nextState, nextSubtopics)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Stage Color Banner */}
        <div
          className="p-6 relative text-white"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, #0F172A 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-sm text-white">
              {stage.badge_text || `STEP ${String(stage.stage_number).padStart(2, "0")}`}
            </span>
            <span className="text-xs text-white/80 font-medium">
              {stage.difficulty} • {stage.estimated_hours}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {stage.title}
          </h2>

          <p className="text-sm text-white/85 mt-1 leading-relaxed">
            {stage.description}
          </p>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Subtopics Checklist Section matching Android lay_stage_detail_bottom_sheet */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Skills &amp; Learning Objectives ({subtopicsDone.length}/{stage.topics.length})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Check off as you master
              </span>
            </div>

            <div className="space-y-2.5">
              {stage.topics.map((topic, idx) => {
                const isChecked = subtopicsDone.includes(topic)
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSubtopic(topic)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <span className="text-sm font-medium leading-relaxed select-none">
                      {topic}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Deep link integration to SkilTrix Tutorials & Practice */}
          {(stage.tutorial_link || stage.practice_link) && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Recommended SkilTrix Learning Resources
              </h4>
              <div className="flex flex-wrap gap-2">
                {stage.tutorial_link && (
                  <Link
                    to={stage.tutorial_link}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Open Step Tutorial <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                {stage.practice_link && (
                  <Link
                    to={stage.practice_link}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" /> Hands-on Practice / CodeLab
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Action Buttons matching Android updateButtonState */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleMainToggle}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
              completed
                ? "bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02]"
            }`}
          >
            {completed ? (
              <>Mark as Incomplete</>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Mark Phase Complete
              </>

            )}
          </button>
        </div>
      </div>
    </div>
  )
}

