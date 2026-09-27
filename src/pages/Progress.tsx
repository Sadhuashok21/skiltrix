import { Link } from "react-router-dom"
import { badges, courses } from "../data/mockData"
import { TechIcon } from "../components/TechIcons"
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Target,
  PlayCircle,
  MessageSquare,
  Flame,
  Clock,
  Check,
  Lock,
} from "lucide-react"

const weeklyData = [
  { day: "Mon", minutes: 45, problems: 2 },
  { day: "Tue", minutes: 90, problems: 4 },
  { day: "Wed", minutes: 30, problems: 1 },
  { day: "Thu", minutes: 120, problems: 5 },
  { day: "Fri", minutes: 75, problems: 3 },
  { day: "Sat", minutes: 60, problems: 2 },
  { day: "Sun", minutes: 0, problems: 0 },
]

const maxMin = Math.max(...weeklyData.map((d) => d.minutes))

const quizPerformance = [
  { topic: "Python Basics", score: 90, color: "bg-yellow-500" },
  { topic: "JavaScript ES6", score: 80, color: "bg-amber-500" },
  { topic: "DSA Arrays", score: 70, color: "bg-purple-500" },
  { topic: "HTML & CSS", score: 95, color: "bg-blue-500" },
]

const stats = [
  {
    label: "Courses Completed",
    value: "3",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    label: "Lessons Finished",
    value: "86",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    label: "Problems Solved",
    value: "47",
    icon: Code2,
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    label: "Quizzes Completed",
    value: "23",
    icon: Target,
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    label: "Videos Watched",
    value: "38",
    icon: PlayCircle,
    color: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  {
    label: "Discussion Posts",
    value: "15",
    icon: MessageSquare,
    color: "bg-pink-50 text-pink-600 border-pink-100",
  },
  {
    label: "Current Streak",
    value: "14 days",
    icon: Flame,
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    label: "Total Learning Time",
    value: "124 hrs",
    icon: Clock,
    color: "bg-slate-50 text-slate-600 border-slate-200",
  },
]

export default function Progress() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-700">My Progress</span>
        </nav>
        <h1
          className="text-3xl font-extrabold text-slate-900 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          My Progress
        </h1>
        <p className="text-slate-500">
          Track your learning journey and celebrate milestones
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.color} rounded-xl p-4 border`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center mb-3">
              <s.icon className="w-4 h-4" />
            </div>
            <div
              className="text-2xl font-extrabold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {s.value}
            </div>
            <div className="text-xs mt-0.5 text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Course progress */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2
            className="font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Course Completion
          </h2>
          <div className="space-y-4">
            {courses.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <TechIcon name={c.icon || c.title} className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {c.title}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        c.difficulty === "Beginner"
                          ? "bg-green-100 text-green-700"
                          : c.difficulty === "Intermediate"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      c.progress === 100
                        ? "text-green-600"
                        : c.progress > 0
                          ? "text-indigo-600"
                          : "text-slate-400"
                    }`}
                  >
                    {c.progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${
                      c.progress === 100 ? "bg-green-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2
            className="font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Quiz Performance
          </h2>
          <div className="space-y-4">
            {quizPerformance.map((q) => (
              <div key={q.topic}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{q.topic}</span>
                  <span
                    className={`text-sm font-bold ${
                      q.score >= 80 ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {q.score}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${q.color}`}
                    style={{ width: `${q.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Average score</span>
              <span className="font-bold text-indigo-600">84%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-bold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Weekly Activity
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
              Minutes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
              Problems
            </span>
          </div>
        </div>
        <div className="flex items-end gap-4 h-32">
          {weeklyData.map((d) => (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex items-end gap-1 h-20">
                <div
                  className="flex-1 bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-400"
                  style={{
                    height: `${maxMin > 0 ? (d.minutes / maxMin) * 100 : 0}%`,
                    minHeight: d.minutes > 0 ? "4px" : 0,
                  }}
                  title={`${d.minutes} minutes`}
                />
                <div
                  className="w-2.5 bg-green-500 rounded-t-md"
                  style={{
                    height: `${(d.problems / 5) * 100}%`,
                    minHeight: d.problems > 0 ? "4px" : 0,
                  }}
                  title={`${d.problems} problems`}
                />
              </div>
              <span className="text-xs text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
          <span>
            Total this week: <strong className="text-slate-900">7h 30m</strong>
          </span>
          <span>
            Problems solved: <strong className="text-slate-900">17</strong>
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2
          className="font-bold text-slate-900 mb-5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Achievements & Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`p-4 rounded-xl border text-center ${
                b.earned
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-slate-50 opacity-50"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-amber-200/60 shadow-sm flex items-center justify-center mx-auto mb-2.5">
                <TechIcon name={b.icon || b.name} className="w-6 h-6 text-amber-600" />
              </div>
              <div
                className="text-sm font-semibold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {b.name}
              </div>
              <div className="text-xs text-slate-500 mt-1">{b.description}</div>
              {b.earned ? (
                <div className="mt-2.5 text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Earned</span>
                </div>
              ) : (
                <div className="mt-2.5 text-xs font-semibold text-slate-400 inline-flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
