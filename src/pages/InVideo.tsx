import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import VideoPlayer, { SubtitleItem, ChapterItem } from "../components/VideoPlayer"
import CodeBlock from "../components/CodeBlock"
import { TechIcon } from "../components/TechIcons"
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
  views: string
  likes: string
  tag: string
  thumb: string
  date: string
  videoUrl?: string
  chapters?: ChapterItem[]
  code?: string
  language?: string
  subtitles?: Record<string, SubtitleItem[]>
}

export const DEFAULT_VIDEOS: Video[] = [
  {
    id: 1,
    title: "Python for Absolute Beginners",
    instructor: "Maya Chen",
    duration: "24:15",
    views: "142K",
    likes: "8.4K",
    tag: "Python",
    thumb:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=480&h=270&fit=crop&auto=format",
    date: "3 days ago",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    language: "python",
    chapters: [
      { time: 0, title: "1. Introduction to Python 3 & Philosophy" },
      { time: 45, title: "2. Dynamic Typing & Variables" },
      { time: 180, title: "3. Scope, Indentation & Syntax Rules" },
      { time: 420, title: "4. Control Flow: if, elif, else" },
      { time: 720, title: "5. Lists, Tuples & Dictionaries" },
      { time: 1080, title: "6. Building a Complete Mini-App" },
    ],
    code: `# Python 3 Beginner Demo
def calculate_grade(score: int) -> str:
    """Returns the letter grade based on score."""
    if score >= 90:
        return "A (Excellent)"
    elif score >= 80:
        return "B (Good)"
    elif score >= 70:
        return "C (Satisfactory)"
    else:
        return "D (Needs Improvement)"

students = {"Alex": 94, "Maya": 88, "Jordan": 72}
for name, score in students.items():
    print(f"Student {name}: Score {score} -> Grade {calculate_grade(score)}")
`,
    subtitles: {
      en: [
        { start: 0, end: 4, text: "Welcome to SkilTrix! Today we master Python programming from the ground up." },
        { start: 4, end: 8, text: "Python uses clean indentation instead of braces to define code blocks." },
        { start: 8, end: 14, text: "Let's inspect variables, dynamic typing, and built-in functions." },
        { start: 14, end: 22, text: "Notice how f-strings allow effortless string formatting in Python 3.6+." },
        { start: 22, end: 32, text: "You can click 'Load into Compiler' below to run this code live right now." },
      ],
      es: [
        { start: 0, end: 4, text: "¡Bienvenidos a SkilTrix! Hoy dominamos Python desde cero." },
        { start: 4, end: 8, text: "Python utiliza sangría limpia para definir bloques de código." },
        { start: 8, end: 14, text: "Inspeccionemos variables y tipado dinámico en acción." },
      ],
      hi: [
        { start: 0, end: 4, text: "SkilTrix में आपका स्वागत है! आज हम शुरू से Python प्रोग्रामिंग सीखेंगे।" },
        { start: 4, end: 8, text: "Python में कोड ब्लॉक के लिए साफ़ इंडेंटेशन का उपयोग होता है।" },
        { start: 8, end: 14, text: "आइए वेरिएबल्स और डायनामिक टाइपिंग का अभ्यास करें।" },
      ],
    },
  },
  {
    id: 2,
    title: "JavaScript Arrow Functions Explained",
    instructor: "Alex Rivera",
    duration: "18:42",
    views: "98K",
    likes: "6.1K",
    tag: "JavaScript",
    thumb:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=480&h=270&fit=crop&auto=format",
    date: "1 week ago",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    language: "javascript",
    chapters: [
      { time: 0, title: "1. Traditional vs Arrow Function Syntax" },
      { time: 90, title: "2. Implicit Returns & One-Liners" },
      { time: 240, title: "3. Lexical 'this' Binding Demystified" },
      { time: 540, title: "4. When NOT to Use Arrow Functions" },
    ],
    code: `// Modern ES6+ Arrow Functions
const numbers = [1, 2, 3, 4, 5];

// Concise implicit return
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);

console.log("Doubled:", doubled);
console.log("Evens:", evens);
`,
    subtitles: {
      en: [
        { start: 0, end: 5, text: "Arrow functions provide clean syntax and lexical this binding." },
        { start: 5, end: 12, text: "Notice the difference when omitting the return keyword and curly braces." },
      ],
    },
  },
  {
    id: 3,
    title: "Mastering React Hooks: useState & useEffect",
    instructor: "Priya Patel",
    duration: "32:08",
    views: "87K",
    likes: "5.9K",
    tag: "React",
    thumb:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=270&fit=crop&auto=format",
    date: "2 weeks ago",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    language: "javascript",
    chapters: [
      { time: 0, title: "1. React Functional Components" },
      { time: 120, title: "2. useState State Management" },
      { time: 480, title: "3. useEffect Lifecycle & Cleanup" },
    ],
  },
  {
    id: 4,
    title: "Binary Search — Step by Step",
    instructor: "Jordan Kim",
    duration: "15:30",
    views: "76K",
    likes: "4.8K",
    tag: "DSA",
    thumb:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=480&h=270&fit=crop&auto=format",
    date: "2 weeks ago",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    language: "cpp",
  },
  {
    id: 5,
    title: "CSS Grid vs Flexbox — When to Use Each",
    instructor: "Sam Torres",
    duration: "21:45",
    views: "65K",
    likes: "4.2K",
    tag: "CSS",
    thumb:
      "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=480&h=270&fit=crop&auto=format",
    date: "3 weeks ago",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  },
  {
    id: 6,
    title: "SQL JOINs Explained Visually",
    instructor: "Lena Müller",
    duration: "19:20",
    views: "54K",
    likes: "3.7K",
    tag: "SQL",
    thumb:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=480&h=270&fit=crop&auto=format",
    date: "1 month ago",
  },
  {
    id: 7,
    title: "Dynamic Programming: Top-Down vs Bottom-Up",
    instructor: "Rahul Sharma",
    duration: "38:15",
    views: "49K",
    likes: "3.5K",
    tag: "DSA",
    thumb:
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=480&h=270&fit=crop&auto=format",
    date: "1 month ago",
  },
  {
    id: 8,
    title: "Java OOP: Classes, Interfaces & Inheritance",
    instructor: "Aisha Johnson",
    duration: "27:33",
    views: "41K",
    likes: "2.9K",
    tag: "Java",
    thumb:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&h=270&fit=crop&auto=format",
    date: "2 months ago",
    language: "java",
  },
]

const initialComments = [
  {
    user: "Jordan K.",
    avatar: "JK",
    time: "1h ago",
    text: "This explanation of range() vs enumerate() really clicked for me! The subtitles and timeline chapters made review so fast.",
    likes: 14,
    color: "from-indigo-500 to-blue-500",
  },
  {
    user: "Priya S.",
    avatar: "PS",
    time: "3h ago",
    text: "Super clear — loaded the code directly into the compiler and tested all edge cases.",
    likes: 9,
    color: "from-pink-500 to-rose-500",
  },
  {
    user: "Marcus L.",
    avatar: "ML",
    time: "5h ago",
    text: "The audio tracks and 10-second skip shortcuts are super handy when taking notes!",
    likes: 6,
    color: "from-emerald-500 to-teal-500",
  },
]

interface InVideoProps {
  selectedVideo?: Video
  videos?: Video[]
  onSelectVideo?: (video: Video) => void
  onBackToList?: () => void
}

export default function InVideo({
  selectedVideo = DEFAULT_VIDEOS[0],
  videos = DEFAULT_VIDEOS,
  onSelectVideo,
  onBackToList,
}: InVideoProps) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState("")
  const [activeTab, setActiveTab] = useState<"code" | "chapters" | "transcript" | "notes">("code")
  const [isMiniPlayer, setIsMiniPlayer] = useState(false)

  const activeVideo = selectedVideo || DEFAULT_VIDEOS[0]

  const handleAddComment = () => {
    if (!commentText.trim()) return
    setComments([
      {
        user: "You (Learner)",
        avatar: "ME",
        time: "Just now",
        text: commentText.trim(),
        likes: 0,
        color: "from-indigo-600 to-violet-600",
      },
      ...comments,
    ])
    setCommentText("")
  }

  const handleLoadInCompiler = (codeSnippet?: string, lang?: string) => {
    if (codeSnippet) {
      localStorage.setItem("skiltrix_custom_code", codeSnippet)
      localStorage.setItem("skiltrix_custom_lang", lang || "python")
    }
    navigate("/compiler")
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
              videoUrl={activeVideo.videoUrl}
              poster={activeVideo.thumb}
              title={activeVideo.title}
              instructor={activeVideo.instructor}
              subtitles={activeVideo.subtitles}
              chapters={activeVideo.chapters}
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
              videoUrl={activeVideo.videoUrl}
              poster={activeVideo.thumb}
              title={activeVideo.title}
              instructor={activeVideo.instructor}
              subtitles={activeVideo.subtitles}
              chapters={activeVideo.chapters}
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
                <span>{activeVideo.views} views</span>
                <span>•</span>
                <span>{activeVideo.date}</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">1080p HD Certified</span>
              </div>

              {/* Action Buttons: Like, Share, Save */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    liked
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
                  />
                  <span>
                    {liked
                      ? (parseInt(activeVideo.likes.replace("K", "")) * 1000 + 1).toLocaleString()
                      : activeVideo.likes}
                  </span>
                </button>
                <button className="flex items-center justify-center p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href)
                    alert("Link copied to clipboard!")
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    saved
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${saved ? "fill-current" : ""}`}
                  />
                  <span>{saved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructor Bio Bar */}
          <div className="flex items-center gap-3.5 py-4 px-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              {activeVideo.instructor
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{activeVideo.instructor}</p>
              <p className="text-xs text-slate-500 truncate">
                Senior Curriculum Engineer · SkilTrix Learning Labs
              </p>
            </div>
            <button className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors shadow-sm">
              Follow Instructor
            </button>
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
              {comments.map((c, i) => (
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
                      <button className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{c.likes}</span>
                      </button>
                      <button className="text-xs text-slate-400 hover:text-slate-700 font-medium">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                  onClick={() => onSelectVideo?.(v)}
                  className={`w-full flex gap-3 text-left rounded-2xl p-2.5 transition-all group ${
                    v.id === activeVideo.id
                      ? "bg-indigo-50/80 border-2 border-indigo-500 shadow-sm"
                      : "bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={v.thumb}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold">
                      {v.duration}
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
                      <span>{v.views} views</span>
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
