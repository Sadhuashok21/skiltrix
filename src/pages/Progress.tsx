import { Link } from "react-router-dom";
import { badges, courses } from "../data/mockData";

const weeklyData = [
  { day: "Mon", minutes: 45, problems: 2 },
  { day: "Tue", minutes: 90, problems: 4 },
  { day: "Wed", minutes: 30, problems: 1 },
  { day: "Thu", minutes: 120, problems: 5 },
  { day: "Fri", minutes: 75, problems: 3 },
  { day: "Sat", minutes: 60, problems: 2 },
  { day: "Sun", minutes: 0, problems: 0 },
];

const maxMin = Math.max(...weeklyData.map(d => d.minutes));

const quizPerformance = [
  { topic: "Python Basics", score: 90, color: "bg-yellow-500" },
  { topic: "JavaScript ES6", score: 80, color: "bg-amber-500" },
  { topic: "DSA Arrays", score: 70, color: "bg-purple-500" },
  { topic: "HTML & CSS", score: 95, color: "bg-blue-500" },
];

const stats = [
  { label: "Courses Completed", value: "3", icon: "📚", color: "bg-blue-50 text-blue-600" },
  { label: "Lessons Finished", value: "86", icon: "✅", color: "bg-green-50 text-green-600" },
  { label: "Problems Solved", value: "47", icon: "💻", color: "bg-purple-50 text-purple-600" },
  { label: "Quizzes Completed", value: "23", icon: "🎯", color: "bg-orange-50 text-orange-600" },
  { label: "Videos Watched", value: "38", icon: "▶️", color: "bg-cyan-50 text-cyan-600" },
  { label: "Discussion Posts", value: "15", icon: "💬", color: "bg-pink-50 text-pink-600" },
  { label: "Current Streak", value: "14 days", icon: "🔥", color: "bg-red-50 text-red-600" },
  { label: "Total Learning Time", value: "124 hrs", icon: "⏱", color: "bg-slate-50 text-slate-600" },
];

export default function Progress() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span>
          <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link><span>/</span>
          <span className="text-slate-700">My Progress</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Progress</h1>
        <p className="text-slate-500">Track your learning journey and celebrate milestones</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border border-current border-opacity-10`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div className="text-xs mt-0.5 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Course progress */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Course Completion</h2>
          <div className="space-y-4">
            {courses.map(c => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{c.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.difficulty === "Beginner" ? "bg-green-100 text-green-700" : c.difficulty === "Intermediate" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{c.difficulty}</span>
                  </div>
                  <span className={`text-sm font-bold ${c.progress === 100 ? "text-green-600" : c.progress > 0 ? "text-indigo-600" : "text-slate-400"}`}>{c.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${c.progress === 100 ? "bg-green-500" : "bg-indigo-600"}`}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quiz Performance</h2>
          <div className="space-y-4">
            {quizPerformance.map(q => (
              <div key={q.topic}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{q.topic}</span>
                  <span className={`text-sm font-bold ${q.score >= 80 ? "text-green-600" : "text-amber-600"}`}>{q.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className={`h-full rounded-full ${q.color}`} style={{ width: `${q.score}%` }} />
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
          <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Weekly Activity</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />Minutes</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />Problems</span>
          </div>
        </div>
        <div className="flex items-end gap-4 h-32">
          {weeklyData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end gap-1 h-20">
                <div
                  className="flex-1 bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-400"
                  style={{ height: `${maxMin > 0 ? (d.minutes / maxMin) * 100 : 0}%`, minHeight: d.minutes > 0 ? "4px" : 0 }}
                  title={`${d.minutes} minutes`}
                />
                <div
                  className="w-2.5 bg-green-500 rounded-t-md"
                  style={{ height: `${(d.problems / 5) * 100}%`, minHeight: d.problems > 0 ? "4px" : 0 }}
                  title={`${d.problems} problems`}
                />
              </div>
              <span className="text-xs text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
          <span>Total this week: <strong className="text-slate-900">7h 30m</strong></span>
          <span>Problems solved: <strong className="text-slate-900">17</strong></span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-bold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Achievements & Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map(b => (
            <div key={b.name} className={`p-4 rounded-xl border text-center ${b.earned ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-50"}`}>
              <div className="text-3xl mb-2">{b.icon}</div>
              <div className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{b.name}</div>
              <div className="text-xs text-slate-500 mt-1">{b.description}</div>
              {b.earned && <div className="mt-2 text-xs font-semibold text-amber-600">Earned ✓</div>}
              {!b.earned && <div className="mt-2 text-xs text-slate-400">Locked 🔒</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
