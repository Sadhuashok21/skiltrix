import { useState } from "react";
import { Link } from "react-router-dom";
import { discussions } from "../data/mockData";

const tagOptions = ["All", "Python", "JavaScript", "Java", "DSA", "React", "HTML", "CSS", "Django", "SQL"];

const topContributors = [
  { name: "Priya Sharma", points: 1240, badge: "🏆", avatar: "PS", color: "from-pink-500 to-rose-500" },
  { name: "Marcus Chen", points: 980, badge: "🥈", avatar: "MC", color: "from-blue-500 to-indigo-500" },
  { name: "Aisha Johnson", points: 876, badge: "🥉", avatar: "AJ", color: "from-emerald-500 to-teal-500" },
  { name: "Rahul Mehta", points: 654, badge: "⭐", avatar: "RM", color: "from-purple-500 to-violet-500" },
  { name: "Sofia Lane", points: 540, badge: "⭐", avatar: "SL", color: "from-amber-500 to-orange-500" },
];

function DiscussionCard({ d }: { d: typeof discussions[0] }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(d.bookmarked);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${d.user.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {d.user.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">{d.user.name}</span>
            <span className="text-xs text-slate-400">@{d.user.username}</span>
            <span className="text-xs text-slate-300">  </span>
            <span className="text-xs text-slate-400">{d.time}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.tagColor}`}>{d.tag}</span>
          </div>
        </div>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`text-sm shrink-0 transition-colors ${bookmarked ? "text-indigo-600" : "text-slate-300 hover:text-slate-500"}`}
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bookmark" viewBox="0 0 16 16">
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"/>
        </svg>
        </button>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-2 hover:text-indigo-600 cursor-pointer transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {d.question}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{d.content}</p>

      {d.code && (
        <div className="bg-slate-900 rounded-lg p-3 mb-3 overflow-x-auto">
          <pre className="text-xs font-mono text-slate-200 leading-5">{d.code}</pre>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
            <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
          </svg>
          {liked ? d.likes + 1 : d.likes}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat" viewBox="0 0 16 16">
            <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
          </svg>
          {d.comments} replies
        </button>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
          </svg> 
          Share
        </button>
      </div>
    </div>
  );
}

export default function Community() {
  const [activeTag, setActiveTag] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [newPost, setNewPost] = useState("");

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span><span className="text-slate-700">Community</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Learn Together</h1>
          <p className="text-slate-500 mt-1">Ask questions, share solutions, and grow with the community</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          + New Post
        </button>
      </div>

      {/* New post modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>New Discussion Post</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Type</label>
                <div className="flex gap-2">
                  {["Ask a Question", "Share Solution", "Share Progress", "Help Others"].map(t => (
                    <button key={t} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 transition-colors">{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tag</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {tagOptions.slice(1).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Your post</label>
                <textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="What are you thinking about? Ask a question, share code, or start a discussion..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNew(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  Post
                </button>
                <button onClick={() => setShowNew(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main feed */}
        <div className="lg:col-span-2">
          {/* Daily contribution */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 mb-6 text-white">
            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Today's Contribution 🌟</h3>
            <p className="text-indigo-100 text-sm mb-4">Join the community. Share knowledge, earn points, level up.</p>
            <div className="flex flex-wrap gap-2">
              {["Ask a Question", "Share a Solution", "Help Someone", "Share Your Progress"].map(a => (
                <button
                  key={a}
                  onClick={() => setShowNew(true)}
                  className="text-xs font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/20"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            {tagOptions.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTag === tag ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Discussions */}
          <div className="space-y-4">
            {discussions.map(d => <DiscussionCard key={d.id} d={d} />)}

            {/* Empty state placeholder */}
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <div className="text-3xl mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Be the first to start a discussion today!</p>
              <p className="text-xs text-slate-400 mb-4">Your question could help many other learners</p>
              <button onClick={() => setShowNew(true)} className="text-sm font-semibold text-indigo-600 hover:underline">Start a discussion →</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Today's stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Community Today</h3>
            <div className="space-y-3">
              {[
                { label: "Questions Asked", value: "34", icon: "❓" },
                { label: "Answers Given", value: "89", icon: "✅" },
                { label: "Solutions Shared", value: "23", icon: "💡" },
                { label: "Active Members", value: "142", icon: "👥" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-base">{s.icon}</span>
                  <span className="text-sm text-slate-600 flex-1">{s.label}</span>
                  <span className="text-sm font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top contributors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Top Contributors</h3>
            <div className="space-y-3">
              {topContributors.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-base w-5 text-center">{c.badge}</span>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">{c.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular tags */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { tag: "Python", count: 234 }, { tag: "DSA", count: 189 }, { tag: "JavaScript", count: 156 },
                { tag: "Interview", count: 143 }, { tag: "React", count: 98 }, { tag: "Java", count: 87 },
              ].map(t => (
                <button key={t.tag} className="flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors">
                  {t.tag} <span className="text-slate-400">({t.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
