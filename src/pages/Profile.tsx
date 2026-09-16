import { useState } from "react";
import { Link } from "react-router-dom";
import { badges, courses } from "../data/mockData";

const tabs = ["Overview", "Courses", "Achievements", "Activity", "Saved"];

const activityFeed = [
  { icon: "✅", text: "Completed: Python Loops", time: "1h ago", color: "bg-green-100 text-green-600" },
  { icon: "🎯", text: "Quiz completed: Python Basics — 90%", time: "3h ago", color: "bg-indigo-100 text-indigo-600" },
  { icon: "💻", text: "Solved: Valid Parentheses", time: "5h ago", color: "bg-purple-100 text-purple-600" },
  { icon: "💬", text: "Answered: How does Python GIL work?", time: "Yesterday", color: "bg-blue-100 text-blue-600" },
  { icon: "🎉", text: "Earned badge: 7-Day Streak", time: "2 days ago", color: "bg-amber-100 text-amber-600" },
  { icon: "📚", text: "Started: JavaScript Complete Guide", time: "3 days ago", color: "bg-orange-100 text-orange-600" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("Aspiring developer passionate about Python and web development. Currently preparing for tech internships. Building projects and solving DSA daily 💻");
  const [name, setName] = useState("Jordan Davis");

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white shadow-lg">
                JD
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-white">+</button>
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <input value={name} onChange={e => setName(e.target.value)} className="text-2xl font-extrabold text-slate-900 border-b-2 border-indigo-500 outline-none bg-transparent" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
              ) : (
                <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{name}</h1>
              )}
              <p className="text-slate-500 text-sm">@jordandavis · Member since January 2026</p>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <button onClick={() => setEditing(!editing)} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${editing ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-700 hover:border-indigo-300"}`}>
                {editing ? "Save Profile" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mb-5">
            {[
              { label: "Courses", value: "3", icon: "📚" },
              { label: "Problems Solved", value: "47", icon: "💻" },
              { label: "Quizzes", value: "23", icon: "🎯" },
              { label: "Contributions", value: "15", icon: "💬" },
              { label: "Streak", value: "14d 🔥", icon: "" },
              { label: "Level", value: "12 ⚡", icon: "" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div>
            {editing ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            ) : (
              <p className="text-sm text-slate-700 max-w-2xl leading-relaxed">{bio}</p>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["Python", "JavaScript", "Django", "React", "SQL", "DSA"].map(s => (
              <span key={s} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">{s}</span>
            ))}
            {editing && (
              <button className="text-xs font-medium border border-dashed border-indigo-300 text-indigo-500 px-2.5 py-1 rounded-lg">+ Add Skill</button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Activity</h2>
              <div className="space-y-3">
                {activityFeed.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center text-sm shrink-0`}>{a.icon}</span>
                    <p className="text-sm text-slate-700 flex-1">{a.text}</p>
                    <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrolled courses */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Enrolled Courses</h2>
              <div className="space-y-3">
                {courses.filter(c => c.progress > 0).map(course => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="group flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-all">
                    <span className="text-2xl">{course.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 shrink-0">{course.progress}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Level card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold opacity-80">Current Level</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Level 12</span>
              </div>
              <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>4,280 XP</div>
              <div className="h-2 bg-white/20 rounded-full mb-2">
                <div className="h-full bg-white rounded-full" style={{ width: "68%" }} />
              </div>
              <p className="text-xs text-indigo-200">720 XP to Level 13</p>
            </div>

            {/* Recent badges */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Badges</h3>
                <button onClick={() => setActiveTab("Achievements")} className="text-xs text-indigo-600 hover:underline">View all</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {badges.filter(b => b.earned).map(b => (
                  <div key={b.name} title={b.name} className="flex flex-col items-center gap-1 p-2 bg-amber-50 rounded-lg">
                    <span className="text-xl">{b.icon}</span>
                    <span className="text-center leading-tight text-slate-500" style={{ fontSize: "9px" }}>{b.name.split(" ")[0]}</span>
                  </div>
                ))}
                {badges.filter(b => !b.earned).slice(0, 4).map(b => (
                  <div key={b.name} title={b.name} className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg opacity-30">
                    <span className="text-xl">{b.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning goals */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Learning Goals</h3>
              <div className="space-y-2">
                {["Complete Python course", "Solve 100 problems", "Land a tech internship", "Learn React"].map(g => (
                  <div key={g} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-green-500 text-xs">✓</span>
                    {g}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Achievements" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>All Badges & Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map(b => (
              <div key={b.name} className={`p-4 rounded-xl border text-center ${b.earned ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-50"}`}>
                <div className="text-3xl mb-2">{b.icon}</div>
                <div className="text-sm font-bold text-slate-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{b.name}</div>
                <div className="text-xs text-slate-500">{b.description}</div>
                <div className={`mt-2 text-xs font-semibold ${b.earned ? "text-amber-600" : "text-slate-400"}`}>
                  {b.earned ? "Earned ✓" : "Locked 🔒"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Activity" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Activity History</h2>
          <div className="space-y-3">
            {activityFeed.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                <span className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center text-base shrink-0`}>{a.icon}</span>
                <p className="text-sm text-slate-700 flex-1">{a.text}</p>
                <span className="text-xs text-slate-400">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
