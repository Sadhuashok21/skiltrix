import { useState } from "react"
import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapCourse, type CourseCardData } from "../data/apiAdapters"
import { getStImageUrl } from "../utils/cdn"
import {
  courses as mockCourses,
  technologies as mockTechnologies,
  discussions as mockDiscussions,
  companies as mockCompanies,
} from "../data/mockData"
import { TechIcon } from "../components/TechIcons"
import PromoVideoModal from "../components/PromoVideoModal"
import { getAllRoadmapsWithLocalProgress } from "../data/roadmapData"

import {
  Play,
  BookOpen,
  Clock,
  Star,
  Terminal,
  Code2,
  Target,
  Compass,
  Briefcase,
  BarChart3,
  MessageSquare,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Award,
  Flame,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Zap,
  Globe,
  Check,
} from "lucide-react"
import logoImg from "../assets/logo.png"

function ProgressBar({
  value,
  className = "",
}: {
  value: number
  className?: string
}) {
  const safePercent = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div
      className={`h-1.5 bg-slate-100 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
        style={{ width: `${safePercent}%` }}
      />
    </div>
  )
}

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced: "bg-red-100 text-red-700",
  }
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[level] || "bg-slate-100 text-slate-600"}`}
    >
      {level}
    </span>
  )
}

function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
    >
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {course.image ? (
          <img
            src={getStImageUrl(course.image)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TechIcon name={course.icon || course.technology} className="w-14 h-14 text-indigo-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/95 p-1.5 flex items-center justify-center shadow">
            <TechIcon name={course.icon || course.technology} className="w-5 h-5" />
          </div>
          <DifficultyBadge level={course.difficulty} />
        </div>
      </div>
      <div className="p-4">
        <h3
          className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm leading-snug mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {course.description}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration || "4 hours"}
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {course.rating || "4.8"}
          </span>
        </div>
        {course.progress > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Progress</span>
              <span className="text-xs font-semibold text-indigo-600">
                {course.progress}%
              </span>
            </div>
            <ProgressBar value={course.progress} />
          </div>
        ) : (
          <div className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
            Start course <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </Link>
  )
}

const FEATURED_PRODUCTS = [
  {
    title: "SAP ABAP Compiler & Lab",
    badge: "Flagship",
    badgeColor: "bg-indigo-100 text-indigo-700",
    desc: "In-browser ABAP compiler & simulator. Supports table declarations, OpenSQL joins, and ABAP Objects without SAP GUI.",
    link: "/compilers/abap-compiler",
    icon: <Terminal className="w-6 h-6 text-indigo-600" />,
    cta: "Launch ABAP Studio",
  },
  {
    title: "CodeLab Cloud IDE",
    badge: "Interactive",
    badgeColor: "bg-emerald-100 text-emerald-700",
    desc: "Full browser-based development workspace with multi-file IDE, instant runner, and persistent workspaces.",
    link: "/codelab",
    icon: <Code2 className="w-6 h-6 text-emerald-600" />,
    cta: "Open CodeLab",
  },
  {
    title: "SQL Practice & Queries",
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-700",
    desc: "Write and execute database queries. Master complex INNER/LEFT JOINs, GROUP BY, aggregations, and subqueries.",
    link: "/sql-practice",
    icon: <Database className="w-6 h-6 text-blue-600" />,
    cta: "Practice SQL",
  },
  {
    title: "Online PHP Compiler",
    badge: "Web Backend",
    badgeColor: "bg-purple-100 text-purple-700",
    desc: "Run modern PHP 8 scripts instantly. Practice object-oriented classes, array transformations, and REST APIs.",
    link: "/compilers/php-compiler",
    icon: <Layers className="w-6 h-6 text-purple-600" />,
    cta: "Run PHP Code",
  },
  {
    title: "Django Coding & Practice",
    badge: "Python Web",
    badgeColor: "bg-teal-100 text-teal-700",
    desc: "Master Django web architecture, database ORM queries, Django REST framework serializers, and API optimization.",
    link: "/django-tutorials",
    icon: <Zap className="w-6 h-6 text-teal-600" />,
    cta: "Explore Django",
  },
  {
    title: "Structured Courses",
    badge: "Curriculum",
    badgeColor: "bg-amber-100 text-amber-700",
    desc: "Comprehensive tracks with video lessons, code walkthroughs, quizzes, and verifiable completion certificates.",
    link: "/courses",
    icon: <BookOpen className="w-6 h-6 text-amber-600" />,
    cta: "Browse Courses",
  },
]

const WHY_SKILTRIX = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-600" />,
    title: "In-Browser Coding",
    desc: "Zero installation, no complex local setup or VPN hurdles. Code immediately from any modern browser.",
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    title: "Instant Execution & Feedback",
    desc: "Run programs and test cases in milliseconds with precise syntax error markers and execution output.",
  },
  {
    icon: <Target className="w-6 h-6 text-blue-600" />,
    title: "Practical Exercises",
    desc: "Hands-on challenges designed for actual engineering scenarios, technical interviews, and enterprise systems.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
    title: "Progress Tracking & XP",
    desc: "Visual streaks, daily goals, problem-solving analytics, and milestone badges keep you accountable.",
  },
  {
    icon: <Compass className="w-6 h-6 text-amber-600" />,
    title: "Beginner to Enterprise",
    desc: "Clear learning progression from foundational programming to specialized domains like SAP ABAP and Django.",
  },
  {
    icon: <Globe className="w-6 h-6 text-rose-600" />,
    title: "Practice Anywhere",
    desc: "Cloud-synchronized progress and workspaces accessible on your laptop, tablet, or desktop anytime.",
  },
]

export default function Home() {
  const [promoOpen, setPromoOpen] = useState(false)
  const {
    courses: apiCourses,
    problems,
    quizzes,
    videos,
    companies: apiCompanies,
    discussions: apiDiscussions,
    enrollments,
    loading,
  } = useSkiltrixData()

  const safeEnrollments = Array.isArray(enrollments) ? enrollments : []
  const safeApiCourses = Array.isArray(apiCourses) ? apiCourses : []
  const safeProblems = Array.isArray(problems) ? problems : []
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : []
  const safeVideos = Array.isArray(videos) ? videos : []
  const safeCompanies = Array.isArray(apiCompanies) ? apiCompanies : []
  const safeDiscussions = Array.isArray(apiDiscussions) ? apiDiscussions : []

  const progressByCourse = new Map(
    safeEnrollments
      .filter((item) => item && (item.course || (item as any).course_id))
      .map((item) => [item.course?.course_id || (item as any).course_id, item.progress_percent || 0])
  )

  const mappedCourses = safeApiCourses.map((course) =>
    mapCourse(course, progressByCourse.get(course.course_id) ?? 0)
  )

  const courses: CourseCardData[] = mappedCourses.length > 0 ? mappedCourses : mockCourses

  const dynamicTechs = [...new Set(courses.map((c) => c.technology).filter(Boolean))].map((name) => ({
    name,
    icon: (name || "").toLowerCase(),
    color: "bg-indigo-50 text-indigo-700",
  }))
  const technologies = dynamicTechs.length >= 4 ? dynamicTechs : mockTechnologies

  const stats = [
    { value: loading ? "…" : `${safeApiCourses.length || mockCourses.length}`, label: "Courses" },
    { value: loading ? "…" : `${safeProblems.length || 200}`, label: "Coding Problems" },
    { value: loading ? "…" : `${safeQuizzes.length || 50}`, label: "Quizzes" },
    { value: loading ? "…" : `${safeVideos.length || 180}`, label: "Video Lessons" },
  ]

  const activeCourses: CourseCardData[] = courses.filter((course) => (course.progress || 0) > 0)

  const internshipCompanies = (safeCompanies.length > 0
    ? safeCompanies.map((c) => ({
        name: c.name || "Company",
        logo: c.name || "Company",
        path: `/internships/${c.company_id || ""}`,
      }))
    : mockCompanies.map((c) => ({
        name: c.name,
        logo: c.logo || c.name.toLowerCase(),
        path: `/internships`,
      }))
  )

  const communityActivity = (safeDiscussions.length > 0
    ? safeDiscussions.slice(0, 5).map((post) => ({
        user: post.author_name || "SkilTrix learner",
        action: post.title || "Shared a discussion",
        time: post.created_at ? new Date(post.created_at).toLocaleDateString() : "Recently",
        icon: <MessageSquare className="w-4 h-4" />,
        color: "bg-indigo-100 text-indigo-600",
      }))
    : mockDiscussions.slice(0, 5).map((d) => ({
        user: d.user?.name || "SkilTrix learner",
        action: d.question || "Posted a question",
        time: d.time || "Recently",
        icon: <MessageSquare className="w-4 h-4" />,
        color: "bg-indigo-100 text-indigo-600",
      }))
  )

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Learn → Practice → Code → Test → Improve</span>
              </div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Learn, Practice &amp;
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Code Online
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Master programming with interactive coding labs, online compilers, practice problems,
                courses and assessments.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/practice"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  Start Coding Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/compilers/abap-compiler"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 rounded-xl border border-slate-300 transition-colors shadow-sm"
                >
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Explore ABAP Compiler</span>
                </Link>
                <button
                  onClick={() => setPromoOpen(true)}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-95 group"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500 text-indigo-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </div>
                  <span>Watch Promo (25s)</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-xl font-bold text-slate-900"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block relative">
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-0 border border-slate-800">
                <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-slate-400 text-xs font-mono">
                    z_demo_report.abap — SkilTrix Studio
                  </span>
                </div>
                <div className="p-5 font-mono text-sm leading-7">
                  <div>
                    <span className="text-purple-400">DATA</span>{" "}
                    <span className="text-white">it_customers</span>{" "}
                    <span className="text-purple-400">TYPE TABLE OF</span>{" "}
                    <span className="text-orange-300">zcustomers</span>
                    <span className="text-white">.</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-purple-400">SELECT</span>{" "}
                    <span className="text-blue-300">cust_id, name, city</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-purple-400">FROM</span>{" "}
                    <span className="text-orange-300">zcustomers</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-purple-400">INTO TABLE</span>{" "}
                    <span className="text-blue-300">@DATA(lt_results)</span>
                    <span className="text-white">.</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-purple-400">LOOP AT</span>{" "}
                    <span className="text-blue-300">lt_results</span>{" "}
                    <span className="text-purple-400">INTO</span>{" "}
                    <span className="text-white">wa_cust</span>
                    <span className="text-white">.</span>
                  </div>
                  <div className="pl-6">
                    <span className="text-blue-400">WRITE:</span>{" "}
                    <span className="text-white">/ wa_cust-name, wa_cust-city.</span>
                  </div>
                  <div>
                    <span className="text-purple-400">ENDLOOP.</span>
                  </div>
                  <div className="mt-4 border-t border-slate-700 pt-3">
                    <div className="text-slate-500 text-xs mb-1">Execution Output</div>
                    <div className="text-green-400 text-xs font-mono">101 SMITH BANGALORE · ROWS FOUND: 1</div>
                  </div>
                </div>
              </div>

              {/* Floating Status Badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    AST Interpreter Active
                  </div>
                  <div className="text-xs text-slate-400">All tests passed</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Daily Coding Streak
                  </div>
                  <div className="text-xs text-slate-400">Keep up the momentum</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Strip */}
          <div className="mt-14">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Technologies &amp; Frameworks Covered
            </p>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <Link
                  key={tech.name}
                  to="/courses"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${tech.color} hover:opacity-80 transition-opacity`}
                >
                  <TechIcon name={tech.icon || tech.name} className="w-4 h-4" />
                  {tech.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6 Featured Product Cards Section */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Core Learning Products</span>
          </div>
          <h2
            className="text-3xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Everything You Need to Master Software Development
          </h2>
          <p className="text-slate-500 text-sm md:text-base mt-2">
            Choose your learning path across specialized in-browser compilers, interactive coding labs, and courses.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_PRODUCTS.map((prod, i) => (
            <Link
              key={i}
              to={prod.link}
              className="group bg-white rounded-2xl border border-slate-200/90 p-6 hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {prod.icon}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${prod.badgeColor}`}>
                    {prod.badge}
                  </span>
                </div>
                <h3
                  className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {prod.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {prod.desc}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 pt-2 border-t border-slate-100">
                <span>{prod.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Career Learning Roadmaps Section (Reproduced from Android HomeFragment) */}
      <section className="bg-slate-900 text-white py-16 px-4 lg:px-8 border-y border-slate-800">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3 border border-indigo-500/30">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interactive Learning Roadmaps</span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Career Learning Roadmaps
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
                Explore 3D serpentine learning paths with ordered milestones from beginner to production-ready developer.
              </p>
            </div>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto"
            >
              Explore All 7 Roadmaps <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {getAllRoadmapsWithLocalProgress().slice(0, 4).map((rm) => (
              <Link
                key={rm.key}
                to={`/roadmaps/${rm.key}`}
                className="group bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/70 hover:border-slate-500 p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${rm.accent_color}25`,
                        color: rm.accent_color,
                      }}
                    >
                      {rm.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {rm.stages.length} Steps
                    </span>
                  </div>

                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors text-base line-clamp-1 mb-1">
                    {rm.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {rm.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-700/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      {rm.completed_stages} of {rm.total_stages} Done
                    </span>
                    <span className="font-bold text-indigo-400">
                      {rm.progress_percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${rm.progress_percent}%`,
                        backgroundColor: rm.accent_color,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Continue Learning (if logged in and enrolled) */}

      {activeCourses.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Continue Learning
            </h2>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all flex gap-4 items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center p-2.5 shrink-0">
                  <TechIcon name={course.icon || course.technology} className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 truncate"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 mb-2">
                    Next: Variables &amp; Data Types
                  </p>
                  <ProgressBar value={course.progress} />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">
                      {course.progress}% complete
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:underline">
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Courses */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Popular Courses
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Curated by senior software architects for maximum career impact
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
          >
            See all courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Why Learn with SkilTrix Section */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-extrabold text-slate-900 mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Why Learn with SkilTrix?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Everything you need to go from curious beginner to confident developer, in one integrated platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_SKILTRIX.map((card) => (
              <div
                key={card.title}
                className="group p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <h3
                  className="font-bold text-slate-900 mb-1.5 text-base"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Contribution / Community Activity & Internship Prep */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Community Discussions
              </h2>
              <Link
                to="/community"
                className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
              >
                Join community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
              {communityActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <span
                    className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-base shrink-0`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">
                        {item.user}
                      </span>{" "}
                      {item.action}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Make your daily contribution</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ask a question",
                  "Share a solution",
                  "Help someone",
                  "Share progress",
                ].map((a) => (
                  <Link
                    key={a}
                    to="/community"
                    className="text-xs font-medium bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {a}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Internship Section */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Internship &amp; Career Preparation
              </h2>
              <Link
                to="/internships"
                className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
              >
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {internshipCompanies.map((c) => (
                <Link
                  key={c.name}
                  to={c.path}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all p-4 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center p-1 border border-slate-100 shadow-sm shrink-0">
                    <TechIcon name={c.logo} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {c.name}
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium group-hover:underline">
                      Start prep <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-5 text-white">
              <h3
                className="font-bold text-lg mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Ready for your technical interview?
              </h3>
              <p className="text-indigo-100 text-sm mb-4">
                Structured roadmaps, coding assessments, and behavioral prep for top engineering roles.
              </p>
              <Link
                to="/interview"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors"
              >
                Explore Interview Questions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Practice CTA */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center">
          <h2
            className="text-3xl font-extrabold text-white mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Start Coding Right Now
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm sm:text-base">
            No downloads, no setup. In-browser compilers for SAP ABAP, Python, JavaScript, Java, C++, SQL, and PHP.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/compilers"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Terminal className="w-4 h-4" />
              <span>Multi-Language Compiler</span>
            </Link>
            <Link
              to="/abap/editor"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-slate-700"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>SAP ABAP Studio</span>
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-slate-700"
            >
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Coding Practice</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            {["SAP ABAP", "Python / Django", "JavaScript", "SQL", "PHP", "Java", "C++"].map((l) => (
              <span key={l} className="font-mono text-xs">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Video Modal */}
      <PromoVideoModal
        isOpen={promoOpen}
        onClose={() => setPromoOpen(false)}
      />
    </div>
  )
}
