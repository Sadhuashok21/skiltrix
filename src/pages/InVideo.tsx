import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const comments = [
  { user: "Jordan K.", avatar: "JK", time: "1h ago", text: "This was exactly what I needed! The explanation of range() vs enumerate() really clicked for me.", likes: 14, color: "from-indigo-500 to-blue-500" },
  { user: "Priya S.", avatar: "PS", time: "3h ago", text: "Super clear — going to practice with the examples right now in the SkillTrix compiler 🔥", likes: 9, color: "from-pink-500 to-rose-500" },
  { user: "Marcus L.", avatar: "ML", time: "5h ago", text: "Can you make one for while loops too? I always confuse when to use each.", likes: 6, color: "from-emerald-500 to-teal-500" },
];

function inVideo() {
    
  const [commentText, setCommentText] = useState("");
    
    
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span>
          <button onClick={() => setView("list")} className="hover:text-indigo-600">Videos</button><span>/</span>
          <span className="text-slate-700 truncate">{selectedVideo.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {/* Video player */}
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video">
              <img src={selectedVideo.thumb} alt={selectedVideo.title} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xl transition-transform hover:scale-110">
                  <svg className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </button>
              </div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-indigo-500 w-1/3" />
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">{selectedVideo.duration}</div>
            </div>

            {/* Video info */}
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{selectedVideo.title}</h1>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>{selectedVideo.views} views</span>
                  <span>•</span>
                  <span>{selectedVideo.date}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{selectedVideo.tag}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${liked ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    👍 {liked ? parseInt(selectedVideo.likes.replace("K", "")) * 1000 + 1 : selectedVideo.likes}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">👎</button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">↗ Share</button>
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${saved ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {saved ? "🔖 Saved" : "🔖 Save"}
                  </button>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 py-4 border-y border-slate-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">MC</div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{selectedVideo.instructor}</p>
                <p className="text-xs text-slate-500">Senior Instructor · Python & DSA</p>
              </div>
              <button className="ml-auto text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-4 py-1.5 rounded-lg transition-colors">Follow</button>
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Comments (24)</h3>
              <div className="flex items-start gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">JD</div>
                <div className="flex-1">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full border-b border-slate-300 focus:border-indigo-500 outline-none text-sm py-2 bg-transparent placeholder-slate-400"
                  />
                  {commentText && (
                    <div className="flex gap-2 mt-2">
                      <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition-colors">Post</button>
                      <button onClick={() => setCommentText("")} className="text-sm text-slate-500 hover:text-slate-900 px-4 py-1.5 rounded-lg">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{c.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">{c.user}</span>
                        <span className="text-xs text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-sm text-slate-700">{c.text}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">👍 {c.likes}</button>
                        <button className="text-xs text-slate-400 hover:text-slate-700">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related videos */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Related Videos</h3>
            <div className="space-y-3">
              {videos.slice(1, 6).map(v => (
                <button key={v.id} onClick={() => {}} className="w-full flex gap-3 text-left hover:bg-slate-50 rounded-xl p-2 transition-colors group">
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                    <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded font-mono">{v.duration}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 line-clamp-2 leading-snug">{v.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{v.instructor}</p>
                    <p className="text-xs text-slate-400">{v.views} views</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}


export default inVideo