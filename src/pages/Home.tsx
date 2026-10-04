import { useState } from "react"
import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapCourse, type CourseCardData } from "../data/apiAdapters"
import {
  courses as mockCourses,
  technologies as mockTechnologies,
  discussions as mockDiscussions,
  companies as mockCompanies,
} from "../data/mockData"
import { TechIcon } from "../components/TechIcons"
import PromoVideoModal from "../components/PromoVideoModal"
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
        {course.image ? <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        /> : <div className="w-full h-full flex items-center justify-center"><TechIcon name={course.icon || course.technology} className="w-14 h-14 text-indigo-500" /></div>}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent`}
        />
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
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {course.rating || "—"}
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

const whyCards = [
  {
    icon: <Terminal className="w-6 h-6 text-indigo-600" />,
    title: "Interactive Coding",
    desc: "Write and run code in our built-in compiler with real-time feedback.",
  },
  {
    icon: <Code2 className="w-6 h-6 text-indigo-600" />,
    title: "Coding Lab",
    desc: "200+ practice problems from Easy to Hard with detailed explanations.",
  },
  {
    icon: <Target className="w-6 h-6 text-indigo-600" />,
    title: "Quizzes & Tests",
    desc: "Topic-wise quizzes with instant scoring and improvement suggestions.",
  },
  {
    icon: <Compass className="w-6 h-6 text-indigo-600" />,
    title: "Learning Roadmaps",
    desc: "Structured paths for every technology and skill level.",
  },
  {
    icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
    title: "Interview Prep",
    desc: "Company-specific preparation guides for top tech internships and jobs.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
    title: "Progress Tracking",
    desc: "Visual dashboards showing your growth, streaks, and achievements.",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
    title: "Community",
    desc: "Ask questions, share solutions, and learn together with peers.",
  },
  {
    icon: <Trophy className="w-6 h-6 text-indigo-600" />,
    title: "Achievements & XP",
    desc: "Earn badges, level up, and track milestones as you grow.",
  },
]

const communityActivity = [
  {
    user: "Priya S.",
    action: "answered a Python threading question",
    time: "2m ago",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    user: "Marcus C.",
    action: "shared a Two Sum solution in O(n)",
    time: "12m ago",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "bg-green-100 text-green-600",
  },
  {
    user: "Aisha J.",
    action: "asked about DP patterns",
    time: "25m ago",
    icon: <HelpCircle className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    user: "Rahul M.",
    action: "completed React Hooks chapter",
    time: "1h ago",
    icon: <Award className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    user: "Sofia L.",
    action: "earned the Quiz Master badge",
    time: "2h ago",
    icon: <Trophy className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-600",
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

  // Use database courses if available, otherwise fallback to mockCourses so the page is always full of rich content
  const courses: CourseCardData[] = mappedCourses.length > 0 ? mappedCourses : mockCourses

  // Get distinct technologies from courses, or fallback to mockTechnologies
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
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
                <div className="w-5 h-5 rounded-md bg-slate-900 overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                  <img src={logoImg} alt="SkilTrix" className="w-full h-full object-contain" />
                </div>
                <span>Skil<strong className="text-indigo-600 font-bold">Trix</strong> — Developed by <strong className="text-slate-800 font-bold">Ascentracore Solutions</strong></span>
              </div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Learn. Practice.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Build. Get Hired.
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                From your first line of code to your first job offer. Master
                programming, ace coding interviews, and prepare for internships
                — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
                >
                  Start Learning Free
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-colors"
                >
                  Explore Courses
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
            {/* Hero visual */}
            <div className="hidden lg:block relative">
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-0">
                <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-slate-400 text-xs font-mono">
                    main.py — SkilTrix by Ascentracore Solutions
                  </span>
                </div>
                <div className="p-5 font-mono text-sm leading-7">
                  <div>
                    <span className="text-purple-400">def</span>{" "}
                    <span className="text-blue-400">greet</span>
                    <span className="text-white">(</span>
                    <span className="text-orange-300">name</span>
                    <span className="text-white">):</span>
                  </div>
                  <div className="pl-6">
                    <span className="text-purple-400">return</span>{" "}
                    <span className="text-green-400">
                      f"Hello, {"{name}"}!"
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500"># Call the function</span>
                  </div>
                  <div>
                    <span className="text-white">message</span>{" "}
                    <span className="text-slate-400">=</span>{" "}
                    <span className="text-blue-400">greet</span>
                    <span className="text-white">(</span>
                    <span className="text-green-400">"Developer"</span>
                    <span className="text-white">)</span>
                  </div>
                  <div>
                    <span className="text-blue-400">print</span>
                    <span className="text-white">(message)</span>
                  </div>
                  <div className="mt-4 border-t border-slate-700 pt-4">
                    <div className="text-slate-500 text-xs mb-1">Output</div>
                    <div className="text-green-400">Hello, Developer</div>
                  </div>
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Test Passed!
                  </div>
                  <div className="text-xs text-slate-400">8/8 cases</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    14-day streak!
                  </div>
                  <div className="text-xs text-slate-400">Keep it up!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tech strip */}
          <div className="mt-14">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Technologies covered
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

      {/* Continue Learning */}
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
                    Next: Variables & Data Types
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
              Curated by our learning team for maximum impact
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

      {/* Why SkillTrix */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-extrabold text-slate-900 mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Why SkilTrix?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Everything you need to go from curious beginner to confident
              developer, in one place.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyCards.map((card) => (
              <div
                key={card.title}
                className="group p-5 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3
                  className="font-semibold text-slate-900 mb-1.5 text-sm"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Contribution / Community */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Community Activity
              </h2>
              <Link
                to="/community"
                className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
              >
                Join community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
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
                Internship Preparation
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
                Ready for your dream internship?
              </h3>
              <p className="text-indigo-100 text-sm mb-4">
                Structured roadmaps, coding assessments, and behavioral prep for
                top companies.
              </p>
              <Link
                to="/internships"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors"
              >
                Explore Internship Prep <ArrowRight className="w-4 h-4" />
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
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            No downloads, no setup. Our in-browser compiler supports Python,
            JavaScript, Java, C++, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/compiler"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Terminal className="w-4 h-4" />
              <span>Open Compiler</span>
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span>Practice Problems</span>
            </Link>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-sm text-slate-400">
            {["Python", "JavaScript", "Java", "C++", "SQL", "HTML/CSS"].map(
              (l) => (
                <span key={l}>{l}</span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 25-Second Cinematic Promo Video Modal */}
      <PromoVideoModal
        isOpen={promoOpen}
        onClose={() => setPromoOpen(false)}
      />
    </div>
  )
}
