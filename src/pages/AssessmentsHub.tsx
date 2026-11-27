import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  FileCheck2,
  Filter,
  HelpCircle,
  Lock,
  Play,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  XCircle,
} from "lucide-react"
import {
  CodingAssessmentItem,
  CodingSubmissionRecord,
  LANGUAGE_LABELS,
  getCodingAssessments,
  getMyCodingSubmissions,
} from "../api/codingAssessments"
import { getApiErrorMessage } from "../api/client"
import { useAuth } from "../auth"

type HubTab = "all" | "mcq" | "technical" | "coding" | "company" | "submissions"

const TAB_CONFIG: Array<{
  id: HubTab
  label: string
  description: string
  icon: typeof Code2
}> = [
  {
    id: "all",
    label: "All Assessments",
    description: "Every scheduled and practice test",
    icon: Sparkles,
  },
  {
    id: "mcq",
    label: "MCQ Assessment",
    description: "Conceptual & aptitude multiple-choice tests",
    icon: HelpCircle,
  },
  {
    id: "technical",
    label: "Technical Assessment",
    description: "CS core, debugging, and hybrid rounds",
    icon: Cpu,
  },
  {
    id: "coding",
    label: "Coding Assessment",
    description: "HackerRank/Amazon-style algorithmic rounds",
    icon: Code2,
  },
  {
    id: "company",
    label: "Company-Specific",
    description: "Mock tests matching company blueprints",
    icon: Building2,
  },
  {
    id: "submissions",
    label: "My Submissions",
    description: "Your judged code execution history",
    icon: Terminal,
  },
]

const STATUS_BADGE: Record<string, string> = {
  Accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  "Partial Accepted":
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "Wrong Answer": "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  "Compilation Error":
    "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  "Runtime Error": "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  "Time Limit Exceeded":
    "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  "Memory Limit Exceeded":
    "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
}

const SCHEDULE_BADGE: Record<string, { label: string; cls: string }> = {
  live: {
    label: "Live Now",
    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  upcoming: {
    label: "Upcoming",
    cls: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  },
  ended: {
    label: "Window Closed",
    cls: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  },
  inactive: {
    label: "Paused",
    cls: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  },
}

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60",
  Medium:
    "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60",
  Hard: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60",
}

export default function AssessmentsHub() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState<HubTab>("all")
  const [assessments, setAssessments] = useState<CodingAssessmentItem[]>([])
  const [submissions, setSubmissions] = useState<CodingSubmissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [subLoading, setSubLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All")

  const loadAssessments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCodingAssessments()
      setAssessments(data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load assessments. Sign in to view assigned tests."))
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async () => {
    setSubLoading(true)
    try {
      const rows = await getMyCodingSubmissions()
      setSubmissions(rows)
    } catch {
      setSubmissions([])
    } finally {
      setSubLoading(false)
    }
  }

  useEffect(() => {
    loadAssessments()
  }, [])

  useEffect(() => {
    if (activeTab === "submissions" && submissions.length === 0) {
      loadSubmissions()
    }
  }, [activeTab])

  const countsByType = useMemo(() => {
    return {
      all: assessments.length,
      mcq: assessments.filter((a) => a.assessment_type === "mcq").length,
      technical: assessments.filter((a) => a.assessment_type === "technical").length,
      coding: assessments.filter((a) => a.assessment_type === "coding").length,
      company: assessments.filter((a) => a.assessment_type === "company").length,
    }
  }, [assessments])

  const completedCount = useMemo(
    () =>
      assessments.filter((a) =>
        ["completed", "timed_out"].includes(a.latest_attempt?.status || "")
      ).length,
    [assessments]
  )

  const passedCount = useMemo(
    () => assessments.filter((a) => a.latest_attempt?.passed).length,
    [assessments]
  )

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      if (activeTab !== "all" && activeTab !== "submissions") {
        if (item.assessment_type !== activeTab) return false
      }
      if (difficultyFilter !== "All" && item.difficulty !== difficultyFilter) {
        return false
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          (item.description || "").toLowerCase().includes(q) ||
          (item.company_tag || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [assessments, activeTab, difficultyFilter, search])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                SkilTrix Assessment Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Assessments &amp; Online Coding Challenges
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Attempt proctored MCQ, Technical, HackerRank-style Coding, and
                Company-Specific evaluations with real-time sandbox judging across Python 3,
                Java, C, C++, and JavaScript.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3.5">
                <div className="text-xs text-slate-300">Available Tests</div>
                <div className="text-2xl font-bold mt-0.5">{assessments.length}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3.5">
                <div className="text-xs text-slate-300">Completed</div>
                <div className="text-2xl font-bold mt-0.5 text-indigo-300">
                  {completedCount}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3.5 col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-300">Cleared</div>
                <div className="text-2xl font-bold mt-0.5 text-emerald-300">
                  {passedCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const badgeCount =
              tab.id === "submissions"
                ? submissions.length
                : countsByType[tab.id as keyof typeof countsByType]
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left rounded-xl border p-3.5 transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-indigo-500"
                    }`}
                  />
                  {badgeCount !== undefined && tab.id !== "submissions" && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-sm mt-2">{tab.label}</div>
                <div
                  className={`text-[11px] mt-0.5 line-clamp-1 ${
                    isActive ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.description}
                </div>
              </button>
            )
          })}
        </div>

        {activeTab === "submissions" ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  My Judged Code Submissions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Private submission log visible only to your authenticated account.
                </p>
              </div>
              <button
                onClick={loadSubmissions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${subLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {subLoading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading your submissions...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Terminal className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  No coding submissions recorded yet.
                </p>
                <p className="text-xs text-slate-500">
                  Start any Coding Assessment and submit code to see test case scores here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Problem</th>
                      <th className="px-4 py-3 text-left">Assessment</th>
                      <th className="px-4 py-3 text-left">Language</th>
                      <th className="px-4 py-3 text-left">Verdict</th>
                      <th className="px-4 py-3 text-left">Test Cases</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Runtime / Memory</th>
                      <th className="px-4 py-3 text-left">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {submissions.map((sub) => (
                      <tr
                        key={sub.submission_id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {sub.problem_title}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {sub.assessment_title || "Practice"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                            {LANGUAGE_LABELS[sub.language] || sub.language}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              STATUS_BADGE[sub.status] ||
                              "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {sub.passed_test_cases}/{sub.total_test_cases}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                          {sub.score}/{sub.max_score}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {sub.execution_time_ms} ms •{" "}
                          {(sub.memory_kb / 1024).toFixed(1)} MB
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(sub.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Search + Difficulty Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assessments by title, company, or topic..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      difficultyFilter === diff
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
                <span>{error}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => void login("/assessments")}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <Link
                    to="/placement-preparation"
                    className="underline font-semibold text-xs"
                  >
                    Placement Prep
                  </Link>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No matching assessments found
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Switch assessment categories or clear your search filter to view
                  available assessments.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAssessments.map((asmt) => {
                  const sched = SCHEDULE_BADGE[asmt.schedule_status] || SCHEDULE_BADGE.live
                  const att = asmt.latest_attempt
                  const isCompleted =
                    att && ["completed", "timed_out"].includes(att.status)
                  const isInProgress = att?.status === "in_progress"
                  const canStart =
                    asmt.schedule_status === "live" || isInProgress

                  return (
                    <div
                      key={asmt.assessment_id}
                      className="flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-400/70 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                              {asmt.assessment_type}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                DIFFICULTY_BADGE[asmt.difficulty] ||
                                DIFFICULTY_BADGE.Medium
                              }`}
                            >
                              {asmt.difficulty}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sched.cls}`}
                          >
                            {sched.label}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {asmt.title}
                          </h3>
                          {asmt.company_tag && (
                            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                              {asmt.company_tag}
                            </div>
                          )}
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                            {asmt.description ||
                              "Timed assessment with automated evaluation and analytics."}
                          </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{asmt.duration_minutes} mins</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{asmt.total_marks} Marks</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{asmt.question_count} Qs</span>
                          </div>
                        </div>

                        {/* Feature Flags / Languages */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {asmt.coding_problem_count > 0 &&
                            (asmt.supported_languages || []).map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                              >
                                {LANGUAGE_LABELS[lang] || lang}
                              </span>
                            ))}
                          {asmt.proctoring_enabled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                              <Shield className="w-3 h-3 text-indigo-500" />
                              Proctored
                            </span>
                          )}
                          {asmt.negative_marking && (
                            <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-[10px] font-medium text-rose-600 dark:text-rose-300">
                              -{asmt.negative_marking_percentage || 25}% Neg.
                            </span>
                          )}
                        </div>

                        {asmt.effective_start_time && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              Window: {new Date(asmt.effective_start_time).toLocaleDateString()}
                              {asmt.effective_end_time
                                ? ` – ${new Date(asmt.effective_end_time).toLocaleDateString()}`
                                : ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer / Latest Attempt */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        {isCompleted && att && (
                          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/70">
                            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                              {att.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500" />
                              )}
                              {att.results_released
                                ? `Score: ${att.total_score}/${att.max_possible_score} (${att.percentage}%)`
                                : "Submitted (Results Pending)"}
                            </span>
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            disabled={!canStart && !isCompleted}
                            onClick={() =>
                              navigate(`/assessments/coding/${asmt.assessment_id}`)
                            }
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isInProgress
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : canStart
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                : isCompleted
                                ? "bg-slate-800 hover:bg-slate-700 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isInProgress ? (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Resume Assessment
                              </>
                            ) : isCompleted ? (
                              <>
                                <Trophy className="w-3.5 h-3.5" />
                                View Analytics &amp; Details
                              </>
                            ) : canStart ? (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Start Assessment
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                {sched.label}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
