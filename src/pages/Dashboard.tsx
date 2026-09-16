import { useState } from "react";
import { Link } from "react-router-dom";
import { courses, badges } from "../data/mockData";

function ProgressBar({ value, color = "bg-indigo-600" }: { value: number; color?: string }) {
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
}

const goals = [
  { text: "Complete Python Functions lesson", done: true, xp: 50 },
  { text: "Solve 3 coding problems", done: false, xp: 150, progress: "1/3" },
  { text: "Take today's quiz: Python OOP", done: false, xp: 80 },
  { text: "Watch 1 video lesson", done: true, xp: 30 },
  { text: "Post in community discussion", done: false, xp: 40 },
];

const recentActivity = [
  { icon: "✅", text: "Completed: Python Loops", sub: "Python Fundamentals · Chapter 6", time: "1h ago", color: "bg-green-100 text-green-600" },
  { icon: "📊", text: "Quiz Completed: Variables & Types", sub: "Score: 88% · +80 XP", time: "3h ago", color: "bg-blue-100 text-blue-600" },
  { icon: "💻", text: "Solved: Valid Parentheses", sub: "Runtime: 45ms · Easy", time: "5h ago", color: "bg-purple-100 text-purple-600" },
  { icon: "💬", text: "Answered a Python question", sub: "+3 upvotes from community", time: "Yesterday", color: "bg-amber-100 text-amber-600" },
  { icon: "🎉", text: "Badge Earned: 7-Day Streak", sub: "+100 bonus XP", time: "2 days ago", color: "bg-rose-100 text-rose-600" },
];

const recommended = [
  { type: "Course", icon: "📚", title: "JavaScript: The Complete Guide", desc: "Based on your Python progress", badge: "Next step", to: "/courses/javascript-complete" },
  { type: "Problem", icon: "🧪", title: "Merge Two Sorted Lists", desc: "Easy · Linked Lists", badge: "Popular", to: "/practice" },
  { type: "Quiz", icon: "🎯", title: "Python OOP Quiz", desc: "20 questions · 15 min", badge: "Today", to: "/quizzes" },
  { type: "Video", icon: "▶️", title: "Understanding Recursion", desc: "15 min · DSA concepts", badge: "New", to: "/videos" },
];

const statCards = [
  { label: "Day Streak", value: "14", icon: "🔥", color: "text-orange-500", sub: "Personal best!" },
  { label: "XP Points", value: "4,280", icon: "⚡", color: "text-yellow-500", sub: "Level 12" },
  { label: "Problems Solved", value: "47", icon: "✅", color: "text-green-500", sub: "This month" },
  { label: "Quizzes Done", value: "23", icon: "🎯", color: "text-indigo-500", sub: "Avg: 84%" },
];

export default function Dashboard() {
  const [completedGoals, setCompletedGoals] = useState<number[]>([0, 3]);

  const toggleGoal = (i: number) => {
    setCompletedGoals(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Good morning, Jordan 👋
          </h1>
          <p className="text-slate-500 mt-1">You're on a 14-day streak. Don't break it today!</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/compiler" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-laptop" viewBox="0 0 16 16">
              <path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5"/>
            </svg>  
            Open Compiler
          </Link>
          <Link to="/practice" className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pc-display" viewBox="0 0 16 16">
              <path d="M8 1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zm1 13.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0m2 0a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0M9.5 1a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM9 3.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5M1.5 2A1.5 1.5 0 0 0 0 3.5v7A1.5 1.5 0 0 0 1.5 12H6v2h-.5a.5.5 0 0 0 0 1H7v-4H1.5a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5H7V2z"/>
            </svg>
            Practice
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{s.sub}</span>
            </div>
            <div className={`text-2xl font-extrabold ${s.color} mb-0.5`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Continue Learning</h2>
              <Link to="/courses" className="text-xs text-indigo-600 hover:underline font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {courses.filter(c => c.progress > 0).map(course => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100 hover:border-indigo-100">
                  <span className="text-2xl shrink-0">{course.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{course.title}</h3>
                      <span className="text-xs font-bold text-indigo-600 shrink-0 ml-2">{course.progress}%</span>
                    </div>
                    <ProgressBar value={course.progress} />
                    <p className="text-xs text-slate-400 mt-1">Next: Variables & Data Types • {course.lessons - Math.floor(course.lessons * course.progress / 100)} lessons left</p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recommended For You</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {recommended.map(r => (
                <Link key={r.title} to={r.to} className="group flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <span className="text-xl shrink-0 mt-0.5">{r.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{r.type}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-600 font-medium px-1.5 py-0.5 rounded">{r.badge}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{r.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center text-sm shrink-0`}>{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.text}</p>
                    <p className="text-xs text-slate-400">{a.sub}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Today's Goals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Today's Goals</h2>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {completedGoals.length}/{goals.length}
              </span>
            </div>
            <ProgressBar value={(completedGoals.length / goals.length) * 100} />
            <div className="space-y-2 mt-4">
              {goals.map((g, i) => (
                <button
                  key={i}
                  onClick={() => toggleGoal(i)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${completedGoals.includes(i) ? "bg-green-50" : "hover:bg-slate-50"}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${completedGoals.includes(i) ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                    {completedGoals.includes(i) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${completedGoals.includes(i) ? "line-through text-slate-400" : "text-slate-700"}`}>{g.text}</p>
                    {g.progress && !completedGoals.includes(i) && (
                      <p className="text-xs text-slate-400 mt-0.5">{g.progress} done</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-amber-500 shrink-0">+{g.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Level / XP */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold opacity-80">Your Level</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Level 12</span>
            </div>
            <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>4,280 XP</div>
            <div className="h-2 bg-white/20 rounded-full mb-2">
              <div className="h-full bg-white rounded-full" style={{ width: "68%" }} />
            </div>
            <p className="text-xs text-indigo-100">720 XP to Level 13</p>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Badges</h2>
              <Link to="/progress" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {badges.slice(0, 8).map(b => (
                <div key={b.name} title={b.name} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${b.earned ? "bg-amber-50" : "bg-slate-50 opacity-40"}`}>
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-xs text-slate-500 text-center leading-tight" style={{ fontSize: "10px" }}>{b.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Access</h2>
            <div className="space-y-1">
              {[
                { label: "Interview Questions", to: "/interview", icon: "🎯" },
                { label: "Internship Prep", to: "/internships", icon: "💼" },
                { label: "Community", to: "/community", icon: "💬" },
                { label: "My Progress", to: "/progress", icon: "📊" },
                { label: "Notifications", to: "/notifications", icon: "🔔" },
              ].map(link => (
                <Link key={link.to} to={link.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-700 hover:text-indigo-600 transition-colors">
                  <span>{link.icon}</span>
                  {link.label}
                  <svg className="w-3.5 h-3.5 ml-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
