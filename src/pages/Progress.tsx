import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapCourse } from "../data/apiAdapters"
import { TechIcon } from "../components/TechIcons"
import { getStreakData } from "../api/tutorialsApi"
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

export default function Progress() {
  const { enrollments, badges: apiBadges, activity, quizAttempts, progress, profile } = useSkiltrixData()
  const courses = enrollments.map((item) => mapCourse(item.course, item.progress_percent))
  const weeklyData = activity.map((item) => ({ day: item.date ? new Date(String(item.date)).toLocaleDateString(undefined, { weekday: "short" }) : "—", minutes: Number(item.minutes_spent ?? 0), problems: Number(item.problems_solved ?? 0) }))
  const maxMin = Math.max(0, ...weeklyData.map((item) => item.minutes))
  const quizScores = new Map<string, number[]>()
  quizAttempts.forEach((attempt) => {
    const title = String(attempt.quiz_title ?? "Quiz")
    quizScores.set(title, [...(quizScores.get(title) ?? []), Number(attempt.percentage ?? 0)])
  })
  const quizPerformance = [...quizScores.entries()].map(([topic, scores], index) => ({ topic, score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length), color: ["bg-yellow-500", "bg-amber-500", "bg-purple-500", "bg-blue-500"][index % 4] }))
  const badges = apiBadges.map((badge) => ({ ...badge, name: String(badge.name ?? "Badge"), description: String(badge.description ?? ""), icon: String(badge.icon ?? "trophy"), earned: ((profile?.earned_badges as string[] | undefined) ?? []).includes(String(badge.name)) }))
  const currentStreak = progress?.streak || profile?.current_streak || getStreakData().currentStreak || 1
  const avgQuizScore = quizPerformance.length > 0
    ? Math.round(quizPerformance.reduce((sum, q) => sum + q.score, 0) / quizPerformance.length)
    : 85
  const totalWeeklyMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0)
  const weeklyHours = Math.floor(totalWeeklyMinutes / 60)
  const weeklyMins = totalWeeklyMinutes % 60
  const weeklyTimeString = totalWeeklyMinutes > 0 ? `${weeklyHours}h ${weeklyMins}m` : `${Math.round(Number(profile?.total_learning_minutes ?? 0) / 60)}h 0m`
  const weeklyProblemsCount = weeklyData.reduce((sum, d) => sum + d.problems, 0) || Number(progress?.problems_solved ?? 0)
  const stats = [
    {
      label: "Courses Enrolled",
      value: String(progress?.courses_enrolled ?? enrollments.length),
      icon: BookOpen,
      iconBg: "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Lessons Available",
      value: String(courses.reduce((count, course) => count + course.lessons, 0)),
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Problems Solved",
      value: String(progress?.problems_solved ?? 0),
      icon: Code2,
      iconBg: "bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Quizzes Passed",
      value: String(progress?.quizzes_passed ?? 0),
      icon: Target,
      iconBg: "bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/40",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Current Streak",
      value: String(currentStreak),
      icon: Flame,
      iconBg: "bg-orange-50 dark:bg-orange-950/60 border border-orange-100 dark:border-orange-900/40",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Total Learning Time",
      value: `${Math.round(Number(profile?.total_learning_minutes ?? 0) / 60)} hrs`,
      icon: Clock,
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-900/40",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
  ]
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Home
          </Link>
          <span>/</span>
          <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">My Progress</span>
        </nav>
        <h1
          className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          My Progress
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Track your learning journey and celebrate milestones
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className={`w-9 h-9 rounded-lg ${s.iconBg} ${s.iconColor} flex items-center justify-center mb-3 shadow-xs`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div
              className="text-2xl font-extrabold text-slate-900 dark:text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {s.value}
            </div>
            <div className="text-xs mt-1 text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Course progress */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2
            className="font-bold text-slate-900 dark:text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Course Completion
          </h2>
          <div className="space-y-4">
            {courses.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
                      <TechIcon name={c.icon || c.title} className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {c.title}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        c.difficulty === "Beginner"
                          ? "bg-green-100 text-green-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : c.difficulty === "Intermediate"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-rose-950/60 dark:text-rose-400"
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      c.progress === 100
                        ? "text-green-600 dark:text-emerald-400"
                        : c.progress > 0
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {c.progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2
            className="font-bold text-slate-900 dark:text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Quiz Performance
          </h2>
          <div className="space-y-4">
            {quizPerformance.map((q) => (
              <div key={q.topic}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{q.topic}</span>
                  <span
                    className={`text-sm font-bold ${
                      q.score >= 80 ? "text-green-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {q.score}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${q.color}`}
                    style={{ width: `${q.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Average score</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{avgQuizScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-bold text-slate-900 dark:text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Weekly Activity
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
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
              <span className="text-xs text-slate-400 dark:text-slate-500">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          <span>
            Total this week: <strong className="text-slate-900 dark:text-white">{weeklyTimeString}</strong>
          </span>
          <span>
            Problems solved: <strong className="text-slate-900 dark:text-white">{weeklyProblemsCount}</strong>
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h2
          className="font-bold text-slate-900 dark:text-white mb-5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Achievements & Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`p-4 rounded-xl border text-center transition-all ${
                b.earned
                  ? "border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 opacity-60"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/60 dark:border-amber-800/40 shadow-sm flex items-center justify-center mx-auto mb-2.5">
                <TechIcon name={b.icon || b.name} className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div
                className="text-sm font-semibold text-slate-900 dark:text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {b.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.description}</div>
              {b.earned ? (
                <div className="mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Earned</span>
                </div>
              ) : (
                <div className="mt-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
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
