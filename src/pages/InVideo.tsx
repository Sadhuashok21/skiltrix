import { useState, useEffect } from "react"
import { getComments, createComment } from "../api/comments"
import { likeVideo, recordVideoView, recordVideoShare, updateVideoDuration } from "../api/videos"
import { Link, useNavigate } from "react-router-dom"
import VideoPlayer, { SubtitleItem, ChapterItem } from "../components/VideoPlayer"
import CodeBlock from "../components/CodeBlock"
import { TechIcon } from "../components/TechIcons"
import { getStImageUrl, getStVideoUrl } from "../utils/cdn"
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Check,
  Terminal,
  BookOpen,
  FileText,
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
  Maximize2,
  X,
  Play,
  RotateCw,
} from "lucide-react"

export interface Video {
  id: string | number
  title: string
  instructor: string
  duration: string
  duration_seconds?: number
  views: string
  likes: string
  share?: string
  tag: string
  thumb: string
  date: string
  videoUrl?: string
  chapters?: ChapterItem[]
  code?: string
  language?: string
  subtitles?: Record<string, SubtitleItem[]>
}

export function parseNumericCount(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0
  if (typeof val === "number") return val
  const str = String(val).trim().toUpperCase()
  if (str.endsWith("K")) {
    const num = parseFloat(str.slice(0, -1))
    return isNaN(num) ? 0 : Math.round(num * 1000)
  }
  if (str.endsWith("M")) {
    const num = parseFloat(str.slice(0, -1))
    return isNaN(num) ? 0 : Math.round(num * 1000000)
  }
  const clean = parseInt(str.replace(/[^0-9]/g, ""), 10)
  return isNaN(clean) ? 0 : clean
}

export function formatDisplayCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 10000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return count.toLocaleString()
}

export const DEFAULT_VIDEOS: Video[] = [
  {
    id: "default",
    title: "Lesson Overview",
    instructor: "SkilTrix Instructor",
    duration: "—",
    views: "0",
    likes: "0",
    share: "0",
    tag: "Lessons",
    thumb: "",
    date: "",
  },
]

interface InVideoProps {
  selectedVideo?: Video
  videos?: Video[]
  onSelectVideo?: (video: Video) => void
  onBackToList?: () => void
  onUpdateVideoCounts?: (
    id: string | number,
    counts: { views?: number; likes?: number; share?: number }
  ) => void
}

export default function InVideo({
  selectedVideo = DEFAULT_VIDEOS[0],
  videos = DEFAULT_VIDEOS,
  onSelectVideo,
  onBackToList,
  onUpdateVideoCounts,
}: InVideoProps) {
  const navigate = useNavigate()
  const activeVideo = selectedVideo || DEFAULT_VIDEOS[0]

  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [likesCount, setLikesCount] = useState<number>(0)
  const [viewsCount, setViewsCount] = useState<number>(0)
  const [shareCount, setShareCount] = useState<number>(0)
  const [comments, setComments] = useState<
    { user: string; avatar: string; time: string; text: string; likes: number; color: string }[]
  >([])
  const [commentText, setCommentText] = useState("")
  const [activeTab, setActiveTab] = useState<"code" | "chapters" | "transcript" | "notes">("code")
  const [isMiniPlayer, setIsMiniPlayer] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [videoDurations, setVideoDurations] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("skiltrix_video_durations") || "{}")
    } catch {
      return {}
    }
  })

  const parseDurationToSeconds = (dur?: string): number => {
    if (!dur || dur === "—") return 0
    const parts = dur.split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1]
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    return 0
  }

  const handleDurationLoaded = (sec: number) => {
    if (!sec || isNaN(sec) || sec <= 0) return
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    const formatted = `${m}:${s.toString().padStart(2, "0")}`
    const vidId = String(activeVideo.id)

    setVideoDurations((prev) => {
      if (prev[vidId] === formatted) return prev
      const next = { ...prev, [vidId]: formatted }
      try {
        localStorage.setItem("skiltrix_video_durations", JSON.stringify(next))
      } catch {}
      return next
    })

    if (!activeVideo.duration_seconds || activeVideo.duration_seconds === 0) {
      updateVideoDuration(vidId, Math.round(sec)).catch(() => {})
    }
  }

  useEffect(() => {
    if (!activeVideo || !activeVideo.id) return
    const vidId = String(activeVideo.id)

    // 1. Initialize counts from activeVideo
    const parsedLikes = parseNumericCount(activeVideo.likes)
    const parsedViews = parseNumericCount(activeVideo.views)
    const parsedShares = parseNumericCount(activeVideo.share)
    setLikesCount(parsedLikes)
    setViewsCount(parsedViews)
    setShareCount(parsedShares)

    // 2. Read liked & saved state from localStorage
    try {
      const likedList: string[] = JSON.parse(
        localStorage.getItem("skiltrix_liked_videos") || "[]"
      )
      setLiked(likedList.includes(vidId))
      const savedList: string[] = JSON.parse(
        localStorage.getItem("skiltrix_saved_videos") || "[]"
      )
      setSaved(savedList.includes(vidId))
    } catch {
      setLiked(false)
      setSaved(false)
    }

    // 3. Record video view (once per browser session per video)
    const sessionKey = `skiltrix_viewed_${vidId}`
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "true")
      recordVideoView(vidId)
        .then((res) => {
          if (res && typeof res.views === "number") {
            setViewsCount(res.views)
            onUpdateVideoCounts?.(vidId, { views: res.views })
          }
        })
        .catch(() => {
          setViewsCount((prev) => prev + 1)
        })
    }

    // 4. Load comments from backend
    void loadLiveComments(vidId)
  }, [activeVideo?.id])

  const handleToggleLike = async () => {
    if (!activeVideo?.id) return
    const vidId = String(activeVideo.id)
    const nextLiked = !liked

    setLiked(nextLiked)
    if (nextLiked) setDisliked(false)
    const optimisticLikes = Math.max(0, likesCount + (nextLiked ? 1 : -1))
    setLikesCount(optimisticLikes)
    onUpdateVideoCounts?.(vidId, { likes: optimisticLikes })

    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("skiltrix_liked_videos") || "[]"
      )
      const updated = nextLiked
        ? Array.from(new Set([...stored, vidId]))
        : stored.filter((id) => id !== vidId)
      localStorage.setItem("skiltrix_liked_videos", JSON.stringify(updated))
    } catch {}

    try {
      const res = await likeVideo(vidId, nextLiked)
      if (res && typeof res.like === "number") {
        setLikesCount(res.like)
        onUpdateVideoCounts?.(vidId, { likes: res.like })
      }
    } catch (err) {
      console.warn("Failed to persist like to backend:", err)
    }
  }

  const handleToggleDislike = async () => {
    if (!activeVideo?.id) return
    const vidId = String(activeVideo.id)
    const nextDisliked = !disliked
    setDisliked(nextDisliked)

    if (nextDisliked && liked) {
      setLiked(false)
      const optimisticLikes = Math.max(0, likesCount - 1)
      setLikesCount(optimisticLikes)
      onUpdateVideoCounts?.(vidId, { likes: optimisticLikes })

      try {
        const stored: string[] = JSON.parse(
          localStorage.getItem("skiltrix_liked_videos") || "[]"
        )
        localStorage.setItem(
          "skiltrix_liked_videos",
          JSON.stringify(stored.filter((id) => id !== vidId))
        )
      } catch {}

      try {
        const res = await likeVideo(vidId, false)
        if (res && typeof res.like === "number") {
          setLikesCount(res.like)
          onUpdateVideoCounts?.(vidId, { likes: res.like })
        }
      } catch {}
    }
  }

  const handleToggleSave = () => {
    if (!activeVideo?.id) return
    const vidId = String(activeVideo.id)
    const nextSaved = !saved
    setSaved(nextSaved)
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("skiltrix_saved_videos") || "[]"
      )
      const updated = nextSaved
        ? Array.from(new Set([...stored, vidId]))
        : stored.filter((id) => id !== vidId)
      localStorage.setItem("skiltrix_saved_videos", JSON.stringify(updated))
    } catch {}
  }

  const handleShare = async () => {
    if (!activeVideo?.id) return
    const vidId = String(activeVideo.id)
    const shareUrl = `${window.location.origin}/videos?video_id=${encodeURIComponent(vidId)}`

    // Optimistically update share count and notify backend
    const optimisticShares = shareCount + 1
    setShareCount(optimisticShares)
    onUpdateVideoCounts?.(vidId, { share: optimisticShares })

    recordVideoShare(vidId)
      .then((res) => {
        if (res && typeof res.share === "number") {
          setShareCount(res.share)
          onUpdateVideoCounts?.(vidId, { share: res.share })
        }
      })
      .catch(() => {})

    if (navigator.share) {
      try {
        await navigator.share({
          title: activeVideo.title,
          text: `Watch "${activeVideo.title}" on SkilTrix`,
          url: shareUrl,
        })
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
        return
      } catch (err: any) {
        if (err?.name === "AbortError") return
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        textArea.style.position = "fixed"
        textArea.style.opacity = "0"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error("Clipboard copy failed:", err)
    }
  }

  const loadLiveComments = async (vidId: string) => {
    try {
      const data = await getComments(vidId)
      if (data && data.length > 0) {
        setComments(
          data.map((c) => ({
            user: c.user_name || "Learner",
            avatar: (c.user_name || "L").slice(0, 2).toUpperCase(),
            time: c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recently",
            text: c.comment,
            likes: 0,
            color: "from-indigo-600 to-violet-600",
          }))
        )
      } else {
        setComments([])
      }
    } catch {
      // Keep existing comments on network failure
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeVideo?.id) return
    const textToSubmit = commentText.trim()
    setIsSubmittingComment(true)
    try {
      const created = await createComment({
        video_id: String(activeVideo.id),
        comment: textToSubmit,
      })
      setComments((prev) => [
        {
          user: created.user_name || "You (Learner)",
          avatar: "YOU",
          time: "Just now",
          text: created.comment,
          likes: 0,
          color: "from-indigo-600 to-violet-600",
        },
        ...prev,
      ])
      setCommentText("")
    } catch (err) {
      console.error("Failed to post comment to server:", err)
      setComments((prev) => [
        {
          user: "You (Learner)",
          avatar: "YOU",
          time: "Just now",
          text: textToSubmit,
          likes: 0,
          color: "from-indigo-600 to-violet-600",
        },
        ...prev,
      ])
      setCommentText("")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleLoadInCompiler = (codeSnippet?: string, lang?: string) => {
    if (codeSnippet) {
      localStorage.setItem("skiltrix_custom_code", codeSnippet)
      localStorage.setItem("skiltrix_custom_lang", lang || "python")
    }
    const cleanLang = (lang || "python").toLowerCase().trim()
    navigate(`/compilers/${cleanLang}-compiler`)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 relative">
      {/* Floating In-App Mini Player (when docked or browsing) */}
      {isMiniPlayer && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-slate-900 border-2 border-indigo-500/80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-xs text-white">
            <span className="font-semibold truncate flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mini Player</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMiniPlayer(false)}
                title="Expand to Full Player"
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMiniPlayer(false)}
                title="Close"
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="aspect-video w-full">
            <VideoPlayer
              videoUrl={getStVideoUrl(activeVideo.videoUrl)}
              poster={getStImageUrl(activeVideo.thumb)}
              title={activeVideo.title}
              instructor={activeVideo.instructor}
              subtitles={activeVideo.subtitles}
              chapters={activeVideo.chapters}
              initialDurationSec={activeVideo.duration_seconds || parseDurationToSeconds(activeVideo.duration) || 102}
              onDurationLoaded={handleDurationLoaded}
            />
          </div>
          <div className="p-3 bg-slate-900">
            <h4 className="text-xs font-bold text-white truncate">{activeVideo.title}</h4>
            <p className="text-[11px] text-slate-400">{activeVideo.instructor}</p>
          </div>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <button
          onClick={onBackToList}
          className="hover:text-indigo-600 transition-colors font-medium"
        >
          Videos
        </button>
        <span>/</span>
        <span className="text-slate-700 truncate font-semibold">{activeVideo.title}</span>
      </nav>

      {/* Main Grid: Player + Content and Sidebar */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Full-Featured Video Player */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
            <VideoPlayer
              videoUrl={getStVideoUrl(activeVideo.videoUrl)}
              poster={getStImageUrl(activeVideo.thumb)}
              title={activeVideo.title}
              instructor={activeVideo.instructor}
              subtitles={activeVideo.subtitles}
              chapters={activeVideo.chapters}
              initialDurationSec={activeVideo.duration_seconds || parseDurationToSeconds(activeVideo.duration) || 102}
              onDurationLoaded={handleDurationLoaded}
              onMiniPlayerToggle={(active) => setIsMiniPlayer(active)}
            />
          </div>

          {/* Video Title and Primary Metadata Bar */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <h1
                className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {activeVideo.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full font-semibold">
                  <TechIcon name={activeVideo.tag.toLowerCase()} className="w-3.5 h-3.5" />
                  <span>{activeVideo.tag}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-200">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{formatDisplayCount(viewsCount)} views</span>
                <span>•</span>
                <span>{activeVideo.date || "Recently added"}</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">1080p HD Certified</span>
              </div>

              {/* Action Buttons: Like, Share, Save */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    liked
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  title={liked ? "Unlike" : "Like"}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
                  />
                  <span>{formatDisplayCount(likesCount)}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleDislike}
                  className={`flex items-center justify-center p-2 rounded-xl transition-colors cursor-pointer ${
                    disliked
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    copied
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  title="Share link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? "Copied Link!" : "Share"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    saved
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  title={saved ? "Saved" : "Save"}
                >
                  <Bookmark
                    className={`w-4 h-4 ${saved ? "fill-current" : ""}`}
                  />
                  <span>{saved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Learning Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Tab navigation headers */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
              <button
                onClick={() => setActiveTab("code")}
                className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "code"
                    ? "border-indigo-600 text-indigo-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Try the Code (Sandbox)</span>
              </button>

              <button
                onClick={() => setActiveTab("chapters")}
                className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "chapters"
                    ? "border-indigo-600 text-indigo-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Timeline Chapters ({activeVideo.chapters?.length || 4})</span>
              </button>

              <button
                onClick={() => setActiveTab("transcript")}
                className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "transcript"
                    ? "border-indigo-600 text-indigo-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Subtitles Transcript</span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "notes"
                    ? "border-indigo-600 text-indigo-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Lesson Notes</span>
              </button>
            </div>

            {/* Tab 1: Code Sandbox */}
            {activeTab === "code" && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Lesson Code Example
                    </h3>
                    <p className="text-xs text-slate-500">
                      Execute or modify this snippet directly in the built-in compiler
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleLoadInCompiler(activeVideo.code, activeVideo.language)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run in Compiler</span>
                  </button>
                </div>

                <CodeBlock
                  code={
                    activeVideo.code ||
                    `// Try running this sample code from the lesson\nconsole.log("Ready to practice with SkilTrix Compiler!");`
                  }
                  language={activeVideo.language || "python"}
                  filename={`lesson_${activeVideo.tag.toLowerCase()}.${
                    activeVideo.language === "python" ? "py" : "js"
                  }`}
                  showLineNumbers={true}
                  maxHeight="280px"
                />
              </div>
            )}

            {/* Tab 2: Chapters List */}
            {activeTab === "chapters" && (
              <div className="p-5 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Jump to Lesson Milestones
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {(
                    activeVideo.chapters || [
                      { time: 0, title: "1. Overview & Objectives" },
                      { time: 180, title: "2. Setting up environment" },
                      { time: 420, title: "3. Syntax explanation & demonstration" },
                      { time: 720, title: "4. Practical coding exercises" },
                    ]
                  ).map((ch, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {ch.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {Math.floor(ch.time / 60)
                          .toString()
                          .padStart(2, "0")}
                        :
                        {Math.floor(ch.time % 60)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Subtitles Transcript */}
            {activeTab === "transcript" && (
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Closed Caption Transcript (English)
                </h3>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
                  {(
                    activeVideo.subtitles?.["en"] || [
                      {
                        start: 0,
                        end: 10,
                        text: "In this lesson, we break down core syntax rules step-by-step.",
                      },
                      {
                        start: 10,
                        end: 25,
                        text: "Notice how cleanly code can be executed and tested right here.",
                      },
                    ]
                  ).map((sub, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex gap-3 items-start"
                    >
                      <span className="font-mono font-bold text-indigo-600 shrink-0">
                        {Math.floor(sub.start / 60)
                          .toString()
                          .padStart(2, "0")}
                        :
                        {Math.floor(sub.start % 60)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                      <p className="text-slate-700 leading-relaxed">{sub.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Lesson Notes */}
            {activeTab === "notes" && (
              <div className="p-5 space-y-3 text-sm text-slate-700">
                <h3 className="font-bold text-slate-900">Key Takeaways</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  <li>Understand standard language syntax and idiomatic best practices.</li>
                  <li>Use the 10-second skip or playback speed controls to study complex sections.</li>
                  <li>Toggle subtitles (CC) in English, Hindi, or Spanish in player settings.</li>
                  <li>Try running the code snippet directly in the compiler to verify output.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Comments Discussion Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3
              className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span>Discussion & Questions ({comments.length})</span>
              <span className="text-xs font-normal text-slate-500">
                Be respectful and helpful to fellow learners
              </span>
            </h3>

            {/* Add comment input */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                YOU
              </div>
              <div className="flex-1">
                <input
                  id="invideo-comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment()
                  }}
                  placeholder="Ask a question or share feedback on this lesson..."
                  className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none bg-slate-50/50 focus:bg-white transition-all placeholder-slate-400"
                />
                {commentText && (
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={handleAddComment}
                      className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      Post Comment
                    </button>
                    <button
                      onClick={() => setCommentText("")}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No comments yet. Be the first to start the discussion!
                </div>
              ) : (
                comments.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                    >
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {c.user}
                        </span>
                        <span className="text-[11px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {c.text}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setComments((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? { ...item, likes: item.likes + 1 } : item,
                              ),
                            )
                          }}
                          className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{c.likes}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCommentText(`@${c.user} `)
                            document.getElementById("invideo-comment-input")?.focus()
                          }}
                          className="text-xs text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Related Video Lessons */}
        <div>
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3
                className="font-bold text-slate-900 text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Up Next Lessons
              </h3>
              <span className="text-xs font-semibold text-indigo-600">
                Autoplay ON
              </span>
            </div>

            <div className="space-y-3">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
                    if (document.documentElement) document.documentElement.scrollTop = 0
                    if (document.body) document.body.scrollTop = 0
                    onSelectVideo?.(v)
                  }}
                  className={`w-full flex gap-3 text-left rounded-2xl p-2.5 transition-all group ${
                    v.id === activeVideo.id
                      ? "bg-indigo-50/80 border-2 border-indigo-500 shadow-sm"
                      : "bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={getStImageUrl(v.thumb)}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold">
                      {v.duration && v.duration !== "—"
                        ? v.duration
                        : videoDurations[String(v.id)] ||
                          (v.duration_seconds
                            ? `${Math.floor(v.duration_seconds / 60)}:${String(v.duration_seconds % 60).padStart(2, "0")}`
                            : "—")}
                    </div>
                    {v.id === activeVideo.id && (
                      <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-indigo-600 px-2 py-0.5 rounded-full">
                          Playing
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold line-clamp-2 leading-snug mb-1 ${
                        v.id === activeVideo.id
                          ? "text-indigo-700"
                          : "text-slate-900 group-hover:text-indigo-600"
                      }`}
                    >
                      {v.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{v.instructor}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>
                        {v.id === activeVideo.id
                          ? formatDisplayCount(viewsCount)
                          : formatDisplayCount(parseNumericCount(v.views))}{" "}
                        views
                      </span>
                      <span>•</span>
                      <span className="text-indigo-600 font-semibold">{v.tag}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
