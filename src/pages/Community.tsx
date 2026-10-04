import { useState } from "react"
import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapDiscussion, type DiscussionCardData } from "../data/apiAdapters"
import { createDiscussion } from "../api/community"
import CodeBlock from "../components/CodeBlock"
import {
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  Trophy,
  Medal,
  Star,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Users,
  X,
  Plus,
  ArrowRight,
} from "lucide-react"

const tagOptions = [
  "All",
  "Python",
  "JavaScript",
  "Java",
  "DSA",
  "React",
  "HTML",
  "CSS",
  "Django",
  "SQL",
]

const topContributors = [
  {
    name: "Priya Sharma",
    points: 1240,
    rank: 1,
    avatar: "PS",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Marcus Chen",
    points: 980,
    rank: 2,
    avatar: "MC",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Aisha Johnson",
    points: 876,
    rank: 3,
    avatar: "AJ",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Rahul Mehta",
    points: 654,
    rank: 4,
    avatar: "RM",
    color: "from-purple-500 to-violet-500",
  },
  {
    name: "Sofia Lane",
    points: 540,
    rank: 5,
    avatar: "SL",
    color: "from-amber-500 to-orange-500",
  },
]

function DiscussionCard({ d }: { d: DiscussionCardData }) {
  const [liked, setLiked] = useState(false)

  const [bookmarked, setBookmarked] = useState(d.bookmarked)

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all p-5">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${d.user.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
        >
          {d.user.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">
              {d.user.name}
            </span>
            <span className="text-xs text-slate-400">@{d.user.username}</span>
            <span className="text-xs text-slate-300"> </span>
            <span className="text-xs text-slate-400">{d.time}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.tagColor}`}
            >
              {d.tag}
            </span>
          </div>
        </div>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`text-sm shrink-0 transition-colors ${
            bookmarked
              ? "text-indigo-600"
              : "text-slate-300 hover:text-slate-500"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-indigo-600 text-indigo-600" : ""}`} />
        </button>
      </div>

      <h3
        className="text-base font-bold text-slate-900 mb-2 hover:text-indigo-600 cursor-pointer transition-colors"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {d.question}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{d.content}</p>

      {d.code && (
        <div className="mb-3">
          <CodeBlock
            code={d.code}
            language={d.tag === "Python" ? "python" : "javascript"}
            filename={`snippet.${d.tag === "Python" ? "py" : "js"}`}
            showLineNumbers={false}
            maxHeight="220px"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            liked ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? "fill-indigo-600 text-indigo-600" : ""}`} />
          {liked ? d.likes + 1 : d.likes}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-medium">
          <MessageSquare className="w-4 h-4" />
          {d.comments} replies
        </button>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-medium">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}

export default function Community() {
  const { discussions: apiDiscussions, refresh } = useSkiltrixData()
  const discussions = apiDiscussions.map(mapDiscussion)
  const contributorCounts = new Map<string, number>()
  apiDiscussions.forEach((post) => contributorCounts.set(post.author_name || "SkilTrix learner", (contributorCounts.get(post.author_name || "SkilTrix learner") ?? 0) + 1))
  const contributorColors = ["from-indigo-500 to-violet-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"]
  const topContributors = [...contributorCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count], index) => ({ name, points: count, rank: index + 1, avatar: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(), color: contributorColors[index % contributorColors.length] }))
  const [activeTag, setActiveTag] = useState("All")

  const [showNew, setShowNew] = useState(false)

  const [newPost, setNewPost] = useState("")
  const [newTag, setNewTag] = useState("Python")
  const [postError, setPostError] = useState("")
  const [posting, setPosting] = useState(false)

  const submitPost = async () => {
    const userId = localStorage.getItem("user_id")
    if (!userId) { setPostError("Sign in before posting to the community."); return }
    const content = newPost.trim()
    if (!content) { setPostError("Write your post before submitting."); return }
    setPosting(true)
    setPostError("")
    try {
      await createDiscussion({ user_id: userId, title: content.slice(0, 120), content, tag: newTag })
      setNewPost("")
      setShowNew(false)
      refresh()
    } catch {
      setPostError("Your post could not be saved. Please try again.")
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700">Community</span>
          </nav>
          <h1
            className="text-3xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Learn Together
          </h1>
          <p className="text-slate-500 mt-1">
            Ask questions, share solutions, and grow with the community
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* New post modal */}
      {showNew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNew(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                New Discussion Post
              </h2>
              <button
                onClick={() => setShowNew(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Type
                </label>
                <div className="flex gap-2">
                  {[
                    "Ask a Question",
                    "Share Solution",
                    "Share Progress",
                    "Help Others",
                  ].map((t) => (
                    <button
                      key={t}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Tag
                </label>
                <select value={newTag} onChange={(event) => setNewTag(event.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {tagOptions.slice(1).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Your post
                </label>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What are you thinking about? Ask a question, share code, or start a discussion..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {postError && <p className="text-sm text-red-600">{postError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => void submitPost()}
                  disabled={posting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {posting ? "Posting…" : "Post"}
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300"
                >
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
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 mb-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Today's Contribution
              </h3>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-indigo-100 text-sm mb-4">
              Join the community. Share knowledge, earn points, level up.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Ask a Question",
                "Share a Solution",
                "Help Someone",
                "Share Your Progress",
              ].map((a) => (
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
            {tagOptions.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Discussions */}
          <div className="space-y-4">
            {discussions.filter((d) => activeTag === "All" || d.tag.toLowerCase() === activeTag.toLowerCase()).map((d) => (
              <DiscussionCard key={d.id} d={d} />
            ))}

            {/* Empty state placeholder */}
            {discussions.length === 0 && <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                Be the first to start a discussion today!
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Your question could help many other learners
              </p>
              <button
                onClick={() => setShowNew(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                <span>Start a discussion</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Today's stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3
              className="font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Community Today
            </h3>
            <div className="space-y-3">
              {[
                { label: "Questions Asked", value: "34", icon: HelpCircle, color: "text-blue-600 bg-blue-50" },
                { label: "Answers Given", value: "89", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                { label: "Solutions Shared", value: "23", icon: Lightbulb, color: "text-amber-600 bg-amber-50" },
                { label: "Active Members", value: "142", icon: Users, color: "text-indigo-600 bg-indigo-50" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-600 flex-1">
                    {s.label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top contributors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3
              className="font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Top Contributors
            </h3>
            <div className="space-y-3">
              {topContributors.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-5 flex items-center justify-center shrink-0">
                    {c.rank === 1 ? (
                      <Trophy className="w-4 h-4 text-amber-500" />
                    ) : c.rank === 2 ? (
                      <Medal className="w-4 h-4 text-slate-400" />
                    ) : c.rank === 3 ? (
                      <Medal className="w-4 h-4 text-amber-700" />
                    ) : (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {c.name}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {c.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular tags */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3
              className="font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { tag: "Python", count: 234 },
                { tag: "DSA", count: 189 },
                { tag: "JavaScript", count: 156 },

                { tag: "Interview", count: 143 },
                { tag: "React", count: 98 },
                { tag: "Java", count: 87 },
              ].map((t) => (
                <button
                  key={t.tag}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                >
                  {t.tag} <span className="text-slate-400">({t.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
