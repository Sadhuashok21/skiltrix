import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Search,
  BookOpen,
  ArrowRight,
  Flame,
  Trophy,
  Code2,
  Layers,
  Sparkles,
  Compass,
  CheckCircle2,
  Terminal,
  Cpu,
  Database,
  Globe,
  Server,
  Cloud,
} from "lucide-react"
import {
  TUTORIAL_CATEGORIES,
  TUTORIAL_TRACKS,
  LEARNING_PATHS,
  TutorialTrackItem,
} from "../../data/tutorialsCatalog"
import { getStreakData, getStoredProgress } from "../../api/tutorialsApi"
import DailyStreakWidget from "../../components/tutorials/DailyStreakWidget"
import GlobalSearchModal from "../../components/tutorials/GlobalSearchModal"

export default function TutorialHub() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchFilter, setSearchFilter] = useState("")
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const streak = getStreakData()
  const progress = getStoredProgress()
  const navigate = useNavigate()

  // Track category counts
  const filteredTracks = TUTORIAL_TRACKS.filter((track) => {
    const matchesCategory = selectedCategory === "all" || track.category === selectedCategory
    const matchesSearch =
      !searchFilter.trim() ||
      track.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      track.description.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Calculate resume lesson if user was learning
  const recentTrackIds = Object.keys(progress).filter(
    (k) => progress[k]?.completedLessons?.length > 0 || progress[k]?.lastLessonSlug
  )
  const recentTrack = recentTrackIds.length > 0
    ? TUTORIAL_TRACKS.find((t) => t.id === recentTrackIds[0])
    : null

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case "languages":
        return <Code2 className="w-4 h-4" />
      case "web":
        return <Globe className="w-4 h-4" />
      case "backend":
        return <Server className="w-4 h-4" />
      case "databases":
        return <Database className="w-4 h-4" />
      case "computer_science":
        return <Cpu className="w-4 h-4" />
      case "cloud_devops":
        return <Cloud className="w-4 h-4" />
      default:
        return <Layers className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="relative border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 border border-indigo-200/50 dark:border-indigo-800/50">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Original Interactive Learning Experience</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Master Programming with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  SkilTrix Tutorials
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Step-by-step interactive tutorials across 60+ programming languages, web technologies, backend architectures, databases, and computer science fundamentals. Code in real-time, test your logic, and earn certificates.
              </p>

              {/* Search Bar & Trigger */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <div
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-500 cursor-pointer transition-colors shadow-xs"
                >
                  <Search className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-400 flex-1">
                    Search tutorials, topics & syntax (e.g. Java Variables, Python Dicts, React Hooks)...
                  </span>
                  <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Ctrl + K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Daily Streak & XP Quick Card */}
            <div className="w-full lg:w-80 shrink-0">
              <DailyStreakWidget />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Continue Learning Resume Banner (if available) */}
        {recentTrack && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg text-indigo-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-indigo-300">
                  Continue Learning
                </span>
                <h3 className="text-lg font-bold">
                  {recentTrack.title} Tutorial
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Pick up right where you left off.
                </p>
              </div>
            </div>
            <Link
              to={`/tutorials/${recentTrack.id}/${progress[recentTrack.id]?.lastLessonSlug || "intro"}`}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs"
            >
              <span>Resume Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-slate-200 dark:border-slate-800 mb-8">
          {TUTORIAL_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tracks Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {selectedCategory === "all"
                  ? "Explore All Technologies"
                  : TUTORIAL_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Showing {filteredTracks.length} comprehensive interactive tutorials
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => {
              const firstLessonSlug = track.modules[0]?.lessons[0]?.slug || "intro"
              const totalLessonsCount = track.modules.reduce((sum, m) => sum + m.lessons.length, 0)
              const completedCount = progress[track.id]?.completedLessons?.length || 0
              const percent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0

              return (
                <div
                  key={track.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between hover:shadow-lg hover:border-indigo-400/60 dark:hover:border-indigo-600/60 transition-all group"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm uppercase">
                        {track.title.slice(0, 3)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {track.popularBadge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold text-[10px] border border-amber-200/50 dark:border-amber-800/50">
                            {track.popularBadge}
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {track.category.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-xs font-medium text-indigo-600/90 dark:text-indigo-400/90 mt-0.5">
                      {track.tagline}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {track.description}
                    </p>

                    {/* Quick Lesson Snippets */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                        Core Curriculum:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {track.modules.slice(0, 4).map((mod) => (
                          <span
                            key={mod.id}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
                          >
                            {mod.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Progress & Link */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {completedCount > 0 ? (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {percent}% completed
                        </span>
                      ) : (
                        <span>{totalLessonsCount} lessons</span>
                      )}
                    </div>

                    <Link
                      to={`/tutorials/${track.id}/${firstLessonSlug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all"
                    >
                      <span>Start Learning</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Structured Learning Paths Section */}
        <div className="mb-14">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Career Roadmaps</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Recommended Learning Paths
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Follow curated tracks from beginner to production-ready engineer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEARNING_PATHS.map((path) => (
              <div
                key={path.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shadow-xs hover:border-cyan-500/60 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-semibold text-[10px]">
                      {path.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{path.duration}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {path.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {path.description}
                  </p>

                  {/* Steps */}
                  <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {path.steps.map((step) => (
                      <div key={step.stepNumber} className="flex items-center gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                          {step.stepNumber}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/tutorials/${path.steps[0]?.trackId}`}
                  className="mt-5 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Start Path</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Search Modal Triggerable with Ctrl+K */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  )
}

