import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Compass,
  ArrowLeft,
  RotateCcw,
  LayoutList,
  GitCommit,
  CheckCircle2,
  Sparkles,
  Share2,
  ChevronRight,
  BookOpen,
  Layers,
  Clock,
  Award,
} from "lucide-react"
import {
  fetchCareerRoadmapDetail,
  toggleStageProgress,
  resetRoadmapProgressApi,
} from "../../api/roadmapApi"
import { OFFICIAL_ROADMAPS_DATA } from "../../data/roadmapData"
import type { RoadmapTrack, RoadmapStage } from "../../types/roadmap"
import RoadmapCanvasRoad from "../../components/roadmap/RoadmapCanvasRoad"
import RoadmapTimelineList from "../../components/roadmap/RoadmapTimelineList"
import StageDetailModal from "../../components/roadmap/StageDetailModal"

export default function RoadmapDetail() {
  const { roadmapKey } = useParams<{ roadmapKey: string }>()
  const navigate = useNavigate()

  const [roadmap, setRoadmap] = useState<RoadmapTrack | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"road" | "timeline">("road")
  const [selectedStage, setSelectedStage] = useState<RoadmapStage | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const activeKey = roadmapKey || "frontend_roadmap"

  const loadRoadmap = async () => {
    setLoading(true)
    try {
      const data = await fetchCareerRoadmapDetail(activeKey)
      setRoadmap(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoadmap()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeKey])

  // Handle stage click from canvas or timeline list
  const handleStageClick = (stage: RoadmapStage) => {
    setSelectedStage(stage)
    setModalOpen(true)
  }

  // Handle stage completion toggle from modal
  const handleToggleComplete = async (
    stageNumber: number,
    completed: boolean,
    subtopics: string[]
  ) => {
    if (!roadmap) return

    // Optimistic UI update
    const updatedStages = roadmap.stages.map((st) => {
      if (st.stage_number === stageNumber) {
        return {
          ...st,
          completed,
          completed_subtopics: subtopics,
        }
      }
      return st
    })

    const completedCount = updatedStages.filter((s) => s.completed).length
    const totalCount = updatedStages.length
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const updatedRoadmap: RoadmapTrack = {
      ...roadmap,
      stages: updatedStages,
      completed_stages: completedCount,
      progress_percent: percent,
    }
    setRoadmap(updatedRoadmap)

    if (selectedStage && selectedStage.stage_number === stageNumber) {
      setSelectedStage({
        ...selectedStage,
        completed,
        completed_subtopics: subtopics,
      })
    }

    // Call API / local sync
    await toggleStageProgress(activeKey, stageNumber, completed, subtopics)
  }

  // Handle Reset Progress
  const handleResetProgress = async () => {
    if (!roadmap) return
    await resetRoadmapProgressApi(activeKey)
    const resetStages = roadmap.stages.map((st) => ({
      ...st,
      completed: false,
      completed_subtopics: [],
    }))
    setRoadmap({
      ...roadmap,
      stages: resetStages,
      completed_stages: 0,
      progress_percent: 0,
    })
    setResetConfirmOpen(false)
  }

  if (loading && !roadmap) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading Career Roadmap...</span>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-md">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Roadmap Not Found</h2>
          <p className="text-sm text-slate-500">
            The requested career learning pathway was not found.
          </p>
          <Link
            to="/roadmaps"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
          >
            Back to All Roadmaps
          </Link>
        </div>
      </div>
    )
  }

  const color = roadmap.accent_color || "#3B82F6"
  const percent = roadmap.progress_percent || 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10 transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/roadmaps"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Roadmaps
          </Link>

          {/* Other Roadmaps dropdown / pills */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Switch Path:</span>
            {OFFICIAL_ROADMAPS_DATA.filter((r) => r.key !== roadmap.key)
              .slice(0, 3)
              .map((r) => (
                <Link
                  key={r.key}
                  to={`/roadmaps/${r.key}`}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 transition-colors font-medium truncate max-w-[130px]"
                >
                  {r.title.replace(" Roadmap", "")}
                </Link>
              ))}
          </div>
        </div>

        {/* Header Card matching Android bg_roadmap_header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800"
          style={{
            background: `linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, ${color}66 100%)`,
          }}
        >
          <div className="relative z-10 space-y-3 max-w-2xl">
            {/* Infographics Timeline Badge matching Android TextView */}
            <span className="inline-block px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-widest bg-white/20 text-white backdrop-blur-md">
              {roadmap.badge || "INFOGRAPHICS TIMELINE"}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              {roadmap.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {roadmap.description}
            </p>
          </div>
        </div>

        {/* Progress Dashboard Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Progress Counters */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {roadmap.completed_stages} of {roadmap.total_stages} Steps Completed
              </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {percent}% Completed
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-emerald-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Controls: View Switcher & Reset Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("road")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === "road"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Winding 3D Serpentine Road (Android View)"
              >
                <GitCommit className="w-3.5 h-3.5" /> 3D Road
              </button>

              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === "timeline"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Structured Curriculum Checklist"
              >
                <LayoutList className="w-3.5 h-3.5" /> Curriculum
              </button>
            </div>

            {/* Reset Progress Button matching Android ProgressManager.resetProgress */}
            {roadmap.completed_stages > 0 && (
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-transparent hover:border-red-200"
                title="Reset roadmap progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary View: Serpentine 3D Road OR Structured Curriculum */}
        <div className="space-y-4">
          {viewMode === "road" ? (
            <RoadmapCanvasRoad
              stages={roadmap.stages}
              onStageClick={handleStageClick}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <RoadmapTimelineList
                stages={roadmap.stages}
                onStageClick={handleStageClick}
              />
            </div>
          )}
        </div>

        {/* Modal: Stage Detail Checklist matching Android StageDetailBottomSheet */}
        <StageDetailModal
          stage={selectedStage}
          roadmapKey={activeKey}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onToggleComplete={handleToggleComplete}
        />

        {/* Confirmation Modal for Resetting Progress */}
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reset Roadmap Progress?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to reset your completion status for{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {roadmap.title}
                </span>
                ? This will uncheck all phases.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Reset Progress
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

