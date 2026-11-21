import { useState } from "react"
import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapDiscussion, type DiscussionCardData } from "../data/apiAdapters"
import { createDiscussion, replyDiscussion, likeDiscussion } from "../api/community"
import { useAuth } from "../auth"
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

function DiscussionCard({ d, onAction }: { d: DiscussionCardData; onAction?: () => void }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(d.likes)
  const [bookmarked, setBookmarked] = useState(d.bookmarked)
  const [copied, setCopied] = useState(false)
  const [repliesOpen, setRepliesOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replyList, setReplyList] = useState<string[]>([])
  const [submittingReply, setSubmittingReply] = useState(false)

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleLike = async () => {
    const userId = user?.user_id || localStorage.getItem("user_id") || "guest_learner"
    const nextState = !liked
    setLiked(nextState)
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)))
    try {
      await likeDiscussion(d.id, { user_id: userId })
      onAction?.()
    } catch {
      // ignore
    }
  }

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = replyText.trim()
    if (!content || submittingReply) return
    const userId = user?.user_id || localStorage.getItem("user_id") || "guest_learner"
    setReplyList((prev) => [...prev, content])
    setReplyText("")
    setSubmittingReply(true)
    try {
      await replyDiscussion(d.id, { user_id: userId, content })
      onAction?.()
    } catch {
      // ignore
    } finally {
      setSubmittingReply(false)
    }
  }

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
          type="button"
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            liked ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? "fill-indigo-600 text-indigo-600" : ""}`} />
          {likesCount}
        </button>
        <button
          type="button"
          onClick={() => setRepliesOpen(!repliesOpen)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-medium cursor-pointer transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {d.comments + replyList.length} replies
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-medium cursor-pointer transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {copied ? "Copied Link!" : "Share"}
        </button>
      </div>

      {repliesOpen && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {replyList.map((rep, idx) => (
            <div key={idx} className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-0.5">You</span>
              {rep}
            </div>
          ))}
          <form onSubmit={handleAddReply} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || submittingReply}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              {submittingReply ? "..." : "Reply"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function Community() {
  const { user } = useAuth()
  const { discussions: apiDiscussions, refresh } = useSkiltrixData()
  const discussions: DiscussionCardData[] = apiDiscussions.map(mapDiscussion)

  const [activeTag, setActiveTag] = useState("All")
  const [showNew, setShowNew] = useState(false)
  const [postType, setPostType] = useState("Ask a Question")
  const [newPost, setNewPost] = useState("")
  const [newTag, setNewTag] = useState("Python")
  const [postError, setPostError] = useState("")
  const [posting, setPosting] = useState(false)

  const filteredDiscussions = discussions.filter(
    (d) => activeTag === "All" || (d.tag || "").toLowerCase() === activeTag.toLowerCase()
  )

  // Dynamic statistics computed from live backend discussions
  const questionsAsked = apiDiscussions.length
  const answersGiven = apiDiscussions.reduce((sum, d) => sum + (d.comments_count || 0), 0)
  const solutionsShared = apiDiscussions.filter(
    (d) => d.is_solved || (d.comments_count || 0) > 0 || (d.tag || "").toLowerCase().includes("solution")
  ).length

  // Dynamic active members count
  const memberNames = new Set<string>()
  apiDiscussions.forEach((d) => {
    if (d.author_name) memberNames.add(d.author_name)
  })
  if (user?.name || user?.username) {
    memberNames.add(String(user.name || user.username))
  }
  const activeMembers = memberNames.size

  // Dynamic top contributors based on participation
  const contributorStats = new Map<string, { count: number; points: number }>()
  apiDiscussions.forEach((post) => {
    const name = post.author_name || "SkilTrix learner"
    const current = contributorStats.get(name) || { count: 0, points: 0 }
    current.count += 1
    current.points += 10 + (post.likes_count || 0) * 2 + (post.comments_count || 0) * 5
    contributorStats.set(name, current)
  })

  const contributorColors = [
    "from-indigo-500 to-violet-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-pink-500 to-rose-500",
  ]

  const topContributors = [...contributorStats.entries()]
    .sort((a, b) => b[1].points - a[1].points)
    .slice(0, 5)
    .map(([name, stat], index) => ({
      name,
      points: stat.points,
      rank: index + 1,
      avatar: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      color: contributorColors[index % contributorColors.length],
    }))

  // Dynamic popular tags from actual discussion tags
  const tagCounts = new Map<string, number>()
  apiDiscussions.forEach((d) => {
    const t = (d.tag || "").trim()
    if (t) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1)
    }
  })

  const popularTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))

  const submitPost = async () => {
    const userId = user?.user_id || localStorage.getItem("user_id") || localStorage.getItem("skiltrix_user") || "guest_learner"
    const content = newPost.trim()
    if (!content) {
      setPostError("Write your post before submitting.")
      return
    }
    setPosting(true)
    setPostError("")
    try {
      await createDiscussion({ user_id: userId, title: content.slice(0, 120), content, tag: newTag })
      setNewPost("")
      setShowNew(false)
      refresh()
    } catch (err: any) {
      const serverErr =
        err?.response?.data?.message ||
        (err?.response?.data && typeof err.response.data === "object"
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : null) ||
        err?.message ||
        "Your post could not be saved. Please try again."
      setPostError(String(serverErr))
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
                <div className="flex flex-wrap gap-2">
                  {[
                    "Ask a Question",
                    "Share Solution",
                    "Share Progress",
                    "Help Others",
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPostType(t)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        postType === t
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600"
                      }`}
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
            {filteredDiscussions.map((d) => (
              <DiscussionCard key={d.id} d={d} onAction={refresh} />
            ))}

            {/* Empty state placeholder */}
            {filteredDiscussions.length === 0 && (
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  {activeTag === "All"
                    ? "There are no discussions added yet"
                    : `There are no discussions added for ${activeTag} yet`}
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Be the first to start a discussion today! Your question could help many other learners.
                </p>
                <button
                  onClick={() => {
                    if (activeTag !== "All") {
                      setNewTag(activeTag)
                    }
                    setShowNew(true)
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                >
                  <span>Start a discussion</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
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
                { label: "Questions Asked", value: String(questionsAsked), icon: HelpCircle, color: "text-blue-600 bg-blue-50" },
                { label: "Answers Given", value: String(answersGiven), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                { label: "Solutions Shared", value: String(solutionsShared), icon: Lightbulb, color: "text-amber-600 bg-amber-50" },
                { label: "Active Members", value: String(activeMembers), icon: Users, color: "text-indigo-600 bg-indigo-50" },
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
            {topContributors.length > 0 ? (
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
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                No contributors yet. Start a discussion or reply to top the leaderboard!
              </div>
            )}
          </div>

          {/* Popular tags */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3
              className="font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Popular Tags
            </h3>
            {popularTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {popularTags.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => setActiveTag(t.tag)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeTag.toLowerCase() === t.tag.toLowerCase()
                        ? "bg-indigo-600 text-white font-semibold"
                        : "bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600"
                    }`}
                  >
                    {t.tag} <span className={activeTag.toLowerCase() === t.tag.toLowerCase() ? "text-indigo-200" : "text-slate-400"}>({t.count})</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No tagged discussions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
