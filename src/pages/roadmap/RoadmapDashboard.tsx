import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Compass,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  Layers,
  Terminal,
  Coffee,
  Smartphone,
  Shield,
  RotateCcw,
  TrendingUp,
  Award,
} from "lucide-react"
import { fetchCareerRoadmaps } from "../../api/roadmapApi"
import type { RoadmapSummaryItem } from "../../types/roadmap"

const CATEGORIES = [
  "All",
  "Web Development",
  "Backend Development",
  "Full Stack Development",
  "Enterprise Development",
  "Mobile Development",
  "Cyber Security",
]

function getCategoryIcon(cat: string) {
  switch (cat.toLowerCase()) {
    case "web development":
      return <Code2 className="w-4 h-4 text-amber-500" />
    case "backend development":
      return <Terminal className="w-4 h-4 text-emerald-500" />
    case "full stack development":
      return <Layers className="w-4 h-4 text-cyan-500" />
    case "enterprise development":
      return <Coffee className="w-4 h-4 text-amber-600" />
    case "mobile development":
      return <Smartphone className="w-4 h-4 text-green-500" />
    case "cyber security":
      return <Shield className="w-4 h-4 text-purple-500" />
    default:
      return <Compass className="w-4 h-4 text-indigo-500" />
  }
}

export default function RoadmapDashboard() {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchCareerRoadmaps(
        selectedCategory === "All" ? undefined : selectedCategory,
        searchQuery.trim() || undefined
      )
      setRoadmaps(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCategory, searchQuery])

  // Summary statistics
  const totalRoadmaps = roadmaps.length
  const totalStages = roadmaps.reduce((acc, r) => acc + r.total_stages, 0)
  const completedStages = roadmaps.reduce((acc, r) => acc + r.completed_stages, 0)
  const overallPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 lg:py-12 transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              SkilTrix Career Roadmaps
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Master Modern Tech with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400">
                Interactive 3D Paths
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Step-by-step career pathways faithfully reproduced from the SkilTrix mobile app.
              Follow ordered milestones, track verified skills, and bridge theory with hands-on practice.
            </p>
          </div>

          {/* Progress Overview Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Career Tracks</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">7 Paths</p>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Total Milestones</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">42 Steps</p>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Completed Milestones</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                {completedStages} <span className="text-sm text-slate-400 font-normal">/ 42</span>
              </p>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Overall Progress</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1">
                {overallPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search roadmaps &amp; skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Roadmaps Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800/50 animate-pulse border border-slate-300/40 dark:border-slate-700/40"
              />
            ))}
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Compass className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No roadmaps match your criteria
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Try choosing another category or clearing your search term to see the 7 official learning tracks.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All")
                setSearchQuery("")
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => {
              const color = roadmap.accent_color || "#3B82F6"
              const percent = roadmap.progress_percent || 0
              const isStarted = roadmap.completed_stages > 0
              const isCompleted = roadmap.completed_stages === roadmap.total_stages

              return (
                <div
                  key={roadmap.key}
                  className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Accent Stripe & Category Header */}
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                          {getCategoryIcon(roadmap.category)}
                          {roadmap.category}
                        </span>

                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {roadmap.estimated_weeks}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {roadmap.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {roadmap.description}
                        </p>
                      </div>

                      {/* Stages preview checklist summary */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Curriculum Preview (6 Phases)
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                          {roadmap.stages_summary.slice(0, 4).map((st) => (
                            <div
                              key={st.stage_number}
                              className="flex items-center gap-1.5 truncate"
                            >
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  st.completed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                }`}
                              />
                              <span className="truncate">{st.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Actions Footer */}
                  <div className="p-6 pt-0 space-y-4">
                    {/* Progress indicator */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {roadmap.completed_stages} of {roadmap.total_stages} Steps Completed
                        </span>
                        <span
                          className="font-black"
                          style={{ color: percent > 0 ? color : undefined }}
                        >
                          {percent}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action button */}
                    <Link
                      to={`/roadmaps/${roadmap.key}`}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isCompleted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                          : isStarted
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Review Completed Path
                        </>
                      ) : isStarted ? (
                        <>
                          Continue Stage {roadmap.current_stage}{" "}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          Start Roadmap Journey{" "}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

