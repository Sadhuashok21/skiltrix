import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Building2,
  Trophy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Star,
  Zap,
  Filter,
  BarChart2,
  Lock,
  Layers,
  Search,
  Package,
  Briefcase,
  Compass,
  Cpu,
  LayoutGrid,
  Globe,
  Terminal,
} from "lucide-react"
import { getCompanyPreparationStats, type CompanyMockStat } from "../api/practice"

const COMPANY_PATTERNS = [
  { name: "Amazon", tag: "amazon", badge: "DSA + Debugging + Low-Latency", accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30" },
  { name: "Deloitte", tag: "deloitte", badge: "Aptitude + Business Logic + SQL", accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30" },
  { name: "TCS", tag: "tcs", badge: "Quant + Reasoning + NQT Coding", accent: "from-blue-500/20 to-sky-500/10 border-blue-500/30" },
  { name: "Accenture", tag: "accenture", badge: "Cognitive + Technical + Coding", accent: "from-purple-500/20 to-violet-500/10 border-purple-500/30" },
  { name: "Infosys", tag: "infosys", badge: "Mathematical + Logical + Pseudo-code", accent: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30" },
  { name: "Cognizant", tag: "cognizant", badge: "Analytical + Automata Fix + GenC", accent: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30" },
  { name: "Wipro", tag: "wipro", badge: "NLTH Pattern + Coding + Verbal", accent: "from-rose-500/20 to-red-500/10 border-rose-500/30" },
  { name: "Capgemini", tag: "capgemini", badge: "Game-based + Pseudo-code + Coding", accent: "from-amber-600/20 to-yellow-500/10 border-amber-600/30" },
  { name: "Microsoft", tag: "microsoft", badge: "High-Caliber DSA + Optimization", accent: "from-blue-600/20 to-indigo-500/10 border-blue-600/30" },
  { name: "Google", tag: "google", badge: "Complex Graphs + Dynamic Programming", accent: "from-red-500/20 to-yellow-500/10 border-red-500/30" },
  { name: "General SDE", tag: "general", badge: "Full-Stack + Multi-Section Placement", accent: "from-slate-700/40 to-slate-800/20 border-slate-700/50" },
]

function getCompanyPatternIcon(tag: string) {
  switch (tag) {
    case "amazon":
      return <Package className="w-5 h-5 text-amber-400" />
    case "deloitte":
      return <Briefcase className="w-5 h-5 text-emerald-400" />
    case "tcs":
      return <Building2 className="w-5 h-5 text-sky-400" />
    case "accenture":
      return <Sparkles className="w-5 h-5 text-purple-400" />
    case "infosys":
      return <Compass className="w-5 h-5 text-cyan-400" />
    case "cognizant":
      return <Cpu className="w-5 h-5 text-indigo-400" />
    case "wipro":
      return <Layers className="w-5 h-5 text-rose-400" />
    case "capgemini":
      return <ShieldCheck className="w-5 h-5 text-amber-500" />
    case "microsoft":
      return <LayoutGrid className="w-5 h-5 text-blue-400" />
    case "google":
      return <Globe className="w-5 h-5 text-red-400" />
    default:
      return <Terminal className="w-5 h-5 text-slate-300" />
  }
}


export default function PlacementPreparation() {
  const [stats, setStats] = useState<CompanyMockStat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const res = await getCompanyPreparationStats()
        setStats(res)
      } catch (err) {
        console.error("Failed to load company preparation stats", err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const filteredStats = stats.filter((s) => {
    const matchesSearch =
      s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.recommended_topics || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Free" && s.tier === "free") ||
      (selectedCategory === "Pro" && s.tier === "pro") ||
      (selectedCategory === "MNC Service" && ["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "Accenture"].some((c) => s.company_name.includes(c))) ||
      (selectedCategory === "Product / Big Tech" && ["Amazon", "Microsoft", "Google", "General SDE"].some((c) => s.company_name.includes(c))) ||
      (selectedCategory === "Consulting & FinTech" && ["Deloitte"].some((c) => s.company_name.includes(c)))

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Legal Branding Disclaimer Notice */}
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-bold">Independent Practice Mock Disclaimer: </strong>
            These mock assessments are independently developed by SkilTrix for candidate placement preparation.
            They are inspired by standard industry hiring formats and curriculum patterns. They are{" "}
            <strong>NOT official recruitment examinations</strong> and are not affiliated with, endorsed by, or sponsored by
            Amazon, Deloitte, Accenture, TCS, Infosys, Cognizant, Wipro, Capgemini, Microsoft, Google, or any other trademark owner.
            All questions and test cases are 100% original.
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/70 via-slate-900 to-[#0e1628] border border-indigo-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4 text-indigo-300" /> SkilTrix Placement Preparation
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Master Company-Style Placement Assessments
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Step into simulated recruitment drives with realistic multi-section rounds: Quantitative Aptitude, Logical Reasoning,
              Automated Code Testing, Backend Debugging, and SQL. Evaluated with server countdowns and privacy-first integrity telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4" /> Privacy-Safe Screen Verification (No Camera / Audio Recording)
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-800/60 px-3 py-1.5 rounded-xl">
                <Zap className="w-4 h-4 text-amber-400" /> Server-Verified Hidden Test Evaluation
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["All", "Free", "Pro", "Product / Big Tech", "MNC Service", "Consulting & FinTech"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pattern, company or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Company Assessment Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStats.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-base font-semibold">No company mocks found matching your search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStats.map((item) => {
              const patternMeta = COMPANY_PATTERNS.find((cp) => item.company_name.toLowerCase().includes(cp.name.toLowerCase())) || COMPANY_PATTERNS[0]
              const targetAssessmentId = item.assessment_id || "asmt_amazon_sde1"

              return (
                <div
                  key={item.blueprint_id}
                  className="bg-gradient-to-b from-slate-900 to-[#0c121e] border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 group relative overflow-hidden"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {getCompanyPatternIcon(patternMeta.tag)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {item.company_name}
                          </h3>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {patternMeta.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.tier === "pro" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> PRO
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Round Structure & Duration */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" /> Duration:
                        </span>
                        <strong className="text-slate-200">{item.duration_minutes} Minutes</strong>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" /> Sections:
                        </span>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {(item.sections_summary || []).map((sec, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                            >
                              {sec.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Placement Topics */}
                    <div className="mb-5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Core Placement Focus:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(item.recommended_topics || []).slice(0, 4).map((topic, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Performance Statistics & CTA */}
                  <div>
                    {item.total_attempts > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                        <div>
                          <div className="text-[10px] text-slate-500">Your Best Score</div>
                          <div className="text-sm font-bold text-emerald-400">{item.best_score}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Attempts</div>
                          <div className="text-sm font-bold text-slate-300">{item.total_attempts}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 mb-4 text-center">
                        Not attempted yet • Be the first to test!
                      </div>
                    )}

                    <Link
                      to={`/codelab/assessment/${targetAssessmentId}`}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/25 group-hover:shadow-indigo-600/40"
                    >
                      <span>Take Practice Mock</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
