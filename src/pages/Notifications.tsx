import { useState } from "react";
import { Link } from "react-router-dom";

const allNotifs = [
  { id: 1, icon: "🏆", title: "Badge Earned!", body: "You earned the Python Beginner badge. Keep up the great work!", time: "2 minutes ago", read: false, category: "Achievements" },
  { id: 2, icon: "💬", title: "New reply on your post", body: "Alex Rivera replied to your question: 'How does Python GIL work?'", time: "15 minutes ago", read: false, category: "Community" },
  { id: 3, icon: "✅", title: "Quiz completed", body: "You scored 92% on JavaScript ES6 Features quiz! +80 XP earned.", time: "1 hour ago", read: false, category: "Learning" },
  { id: 4, icon: "📚", title: "New course recommended", body: "Based on your Python progress, try JavaScript: The Complete Guide next.", time: "3 hours ago", read: true, category: "Learning" },
  { id: 5, icon: "🔥", title: "Streak milestone!", body: "You've maintained a 14-day learning streak! You're on fire 🔥", time: "1 day ago", read: true, category: "Achievements" },
  { id: 6, icon: "👍", title: "Your answer was helpful", body: "3 people found your answer on list vs tuple helpful.", time: "1 day ago", read: true, category: "Community" },
  { id: 7, icon: "🎯", title: "Daily quiz available", body: "Today's Python quiz is ready. Take it now to earn bonus XP!", time: "2 days ago", read: true, category: "Learning" },
  { id: 8, icon: "💼", title: "Internship prep update", body: "New Amazon-style practice problems added to your prep roadmap.", time: "3 days ago", read: true, category: "Learning" },
];

const categories = ["All", "Learning", "Community", "Achievements"];

export default function Notifications() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [notifs, setNotifs] = useState(allNotifs);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  const filtered = notifs.filter(n => activeCategory === "All" || n.category === activeCategory);
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span><span className="text-slate-700">Notifications</span>
          </nav>
          <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Notifications {unreadCount > 0 && <span className="text-lg text-indigo-600">({unreadCount} new)</span>}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-indigo-600 hover:underline font-medium">Mark all read</button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${!n.read ? "bg-white border-indigo-100 hover:border-indigo-200" : "bg-white border-slate-200 hover:border-slate-300"}`}
            onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${!n.read ? "bg-indigo-50" : "bg-slate-100"}`}>
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`text-sm font-semibold ${!n.read ? "text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{n.category}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{n.body}</p>
            </div>
            <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bell-fill" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No notifications here</h3>
            <p className="text-sm text-slate-400">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
}
