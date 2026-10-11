import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Edit3,
  Search,
  BookOpen,
  Code2,
  HelpCircle,
  Award,
  Menu,
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ListOrdered,
  Lightbulb,
} from "lucide-react"
import {
  TUTORIAL_TRACKS,
  TutorialTrackItem,
  TutorialModuleItem,
  TutorialLessonItem,
} from "../../data/tutorialsCatalog"
import {
  fetchLesson,
  recordLessonProgress,
  getStoredProgress,
  toggleBookmark,
  isLessonBookmarked,
  issueCertificate,
  getIssuedCertificates,
  IssuedCertificate,
} from "../../api/tutorialsApi"
import TryItYourselfEditor from "../../components/tutorials/TryItYourselfEditor"
import LessonQuizWidget from "../../components/tutorials/LessonQuizWidget"
import CourseProgressWidget from "../../components/tutorials/CourseProgressWidget"
import LessonNotesDrawer from "../../components/tutorials/LessonNotesDrawer"
import CertificateModal from "../../components/tutorials/CertificateModal"
import CodeBlock from "../../components/CodeBlock"

export default function TutorialViewer() {
  const { trackSlug, lessonSlug } = useParams<{ trackSlug?: string; lessonSlug?: string }>()
  const navigate = useNavigate()

  const currentTrackId = trackSlug || "java"
  const currentLessonSlug = lessonSlug || ""

  // State
  const [track, setTrack] = useState<TutorialTrackItem | null>(null)
  const [currentModule, setCurrentModule] = useState<TutorialModuleItem | null>(null)
  const [currentLesson, setCurrentLesson] = useState<TutorialLessonItem | null>(null)
  const [curriculumSearch, setCurriculumSearch] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null)
  const [certificateModalOpen, setCertificateModalOpen] = useState(false)
  const [activeCertificate, setActiveCertificate] = useState<IssuedCertificate | null>(null)

  // Load lesson data
  useEffect(() => {
    let activeTrack = TUTORIAL_TRACKS.find((t) => t.id.toLowerCase() === currentTrackId.toLowerCase())
    if (!activeTrack) {
      activeTrack = TUTORIAL_TRACKS[0] // fallback to first track
    }
    setTrack(activeTrack)

    // Determine target lesson
    let targetMod: TutorialModuleItem | null = null
    let targetLesson: TutorialLessonItem | null = null

    if (currentLessonSlug) {
      for (const m of activeTrack.modules) {
        const found = m.lessons.find((l) => l.slug.toLowerCase() === currentLessonSlug.toLowerCase())
        if (found) {
          targetMod = m
          targetLesson = found
          break
        }
      }
    }

    // If not found by slug, default to first lesson of first module
    if (!targetLesson && activeTrack.modules.length > 0 && activeTrack.modules[0].lessons.length > 0) {
      targetMod = activeTrack.modules[0]
      targetLesson = targetMod.lessons[0]
    }

    setCurrentModule(targetMod)
    setCurrentLesson(targetLesson)

    if (targetLesson) {
      setBookmarked(isLessonBookmarked(targetLesson.id))
      const prog = getStoredProgress()
      const isDone = prog[activeTrack.id]?.completedLessons?.includes(targetLesson.id) || false
      setIsCompleted(isDone)
    }

    // Scroll to top of lesson area on navigation
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentTrackId, currentLessonSlug])

  // Flat list of all lessons in this track for Prev/Next navigation
  const allLessonsInTrack = useMemo(() => {
    if (!track) return []
    const list: Array<{ module: TutorialModuleItem; lesson: TutorialLessonItem }> = []
    track.modules.forEach((mod) => {
      mod.lessons.forEach((l) => {
        list.push({ module: mod, lesson: l })
      })
    })
    return list
  }, [track])

  const currentIndex = allLessonsInTrack.findIndex(
    (item) => item.lesson.id === currentLesson?.id
  )
  const prevLessonItem = currentIndex > 0 ? allLessonsInTrack[currentIndex - 1] : null
  const nextLessonItem =
    currentIndex >= 0 && currentIndex < allLessonsInTrack.length - 1
      ? allLessonsInTrack[currentIndex + 1]
      : null

  // Handlers
  const handleToggleBookmark = async () => {
    if (!currentLesson || !track) return
    const newState = await toggleBookmark({
      lessonId: currentLesson.id,
      trackId: track.id,
      title: currentLesson.title,
      slug: currentLesson.slug,
    })
    setBookmarked(newState)
  }

  const handleMarkComplete = async () => {
    if (!currentLesson || !track) return
    const newStatus = !isCompleted
    setIsCompleted(newStatus)
    await recordLessonProgress({
      trackId: track.id,
      lessonId: currentLesson.id,
      lessonSlug: currentLesson.slug,
      completed: newStatus,
    })
  }

  const handleCopyCode = (codeStr: string, idx: number) => {
    navigator.clipboard?.writeText(codeStr)
    setCopiedCodeIndex(idx)
    setTimeout(() => setCopiedCodeIndex(null), 2000)
  }

  const handleClaimCertificate = async () => {
    if (!track) return
    const cert = await issueCertificate(track.id, "SkilTrix Scholar")
    setActiveCertificate(cert)
    setCertificateModalOpen(true)
  }

  if (!track || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading SkilTrix tutorial...</p>
        </div>
      </div>
    )
  }

  // Filter curriculum lessons by search query
  const filteredCurriculumModules = track.modules
    .map((mod) => ({
      ...mod,
      lessons: mod.lessons.filter((l) =>
        l.title.toLowerCase().includes(curriculumSearch.toLowerCase())
      ),
    }))
    .filter((mod) => mod.lessons.length > 0)

  const progressState = getStoredProgress()
  const completedLessonIds = new Set(progressState[track.id]?.completedLessons || [])

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Breadcrumb & Mobile Header Bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 mr-1"
              title="Open Curriculum Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <Link
              to="/tutorials"
              className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              Tutorials
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              to={`/tutorials/${track.id}`}
              className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              {track.title}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-none">
              {currentLesson.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                bookmarked
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Bookmark this lesson"
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{bookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>

            <button
              onClick={() => setNotesDrawerOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1.5 transition-colors"
              title="Open personal notes"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-COLUMN MAIN LAYOUT */}
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col lg:flex-row">
        {/* ================================================================= */}
        {/* 1. LEFT SIDEBAR: Course Curriculum */}
        {/* ================================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform lg:transform-none lg:static transition-transform duration-200 ease-in-out flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs uppercase">
                {track.title.slice(0, 3)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {track.title} Tutorial
                </h3>
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Curriculum Syllabus
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Curriculum Quick Filter */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={curriculumSearch}
                onChange={(e) => setCurriculumSearch(e.target.value)}
                placeholder={`Search ${track.title} topics...`}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Modules & Lessons List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {filteredCurriculumModules.map((mod) => (
              <div key={mod.id} className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {mod.title}
                  </span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {mod.level}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {mod.lessons.map((lesson) => {
                    const isSelected = lesson.id === currentLesson.id
                    const isLessonDone = completedLessonIds.has(lesson.id)

                    return (
                      <Link
                        key={lesson.id}
                        to={`/tutorials/${track.id}/${lesson.slug}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                          isSelected
                            ? "bg-indigo-600 text-white font-semibold shadow-xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                        }`}
                      >
                        <span className="truncate pr-2">{lesson.title}</span>
                        {isLessonDone && (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? "text-white" : "text-emerald-500"
                            }`}
                          />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Sidebar Overlay on Mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ================================================================= */}
        {/* 2. CENTER COLUMN: Main Lesson Learning Area */}
        {/* ================================================================= */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 max-w-4xl mx-auto">
          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                {currentModule?.title || "Module"}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                • {currentLesson.readingTimeMinutes} min read
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {currentLesson.title}
            </h1>
          </div>

          {/* Learning Objectives Box */}
          <div className="mb-8 p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-900 dark:text-indigo-200 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Learning Objectives</span>
            </div>
            <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mb-2">
              After completing this lesson, you will understand:
            </p>
            <ul className="space-y-1.5">
              {currentLesson.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Explanation Section */}
          <section className="mb-10 prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Concept Explanation
            </h2>
            <div className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 space-y-4 font-sans">
              {(() => {
                const text = currentLesson.explanation || ""
                const parts = text.split(/(```[\w-]*\n[\s\S]*?\n```)/g)
                return parts.map((part, idx) => {
                  const match = part.match(/^```([\w-]*)\n([\s\S]*?)\n```$/)
                  if (match) {
                    const blockLang = match[1] || track.id
                    const blockCode = match[2]
                    return (
                      <div key={idx} className="my-4 not-prose">
                        <CodeBlock
                          code={blockCode}
                          language={blockLang}
                          filename={`example.${blockLang}`}
                        />
                      </div>
                    )
                  }
                  return (
                    <div key={idx} className="whitespace-pre-line space-y-2">
                      {part}
                    </div>
                  )
                })
              })()}
            </div>
          </section>

          {/* Syntax Code Reference Block (if available) */}
          {currentLesson.syntaxCode && (
            <section className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Syntax Pattern</span>
              </h3>
              <CodeBlock
                code={currentLesson.syntaxCode}
                language={track.id}
                filename="Syntax Pattern"
              />
            </section>
          )}

          {/* Code Examples Section */}
          {currentLesson.codeExamples.length > 0 && (
            <section className="mb-10 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Practical Code Examples
              </h2>
              {currentLesson.codeExamples.map((eg, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  <CodeBlock
                    code={eg.code}
                    language={eg.language || track.id}
                    filename={eg.title}
                  />

                  {eg.explanation && (
                    <div className="p-3.5 bg-slate-50/50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <p>{eg.explanation}</p>
                    </div>
                  )}

                  {eg.output && (
                    <div className="p-3 bg-slate-900 border-t border-slate-800 font-mono text-xs text-emerald-400">
                      <span className="text-[10px] uppercase text-slate-500 block mb-0.5 font-sans font-bold">Terminal Output:</span>
                      <pre className="whitespace-pre-wrap">{eg.output}</pre>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Embedded "Try It Yourself" Interactive Editor */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Try It Yourself
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Write, run, and experiment directly inside this browser sandbox.
                </p>
              </div>
            </div>

            <TryItYourselfEditor
              initialCode={currentLesson.tryItYourself.initialCode}
              language={track.id}
              taskTitle={currentLesson.title + " Sandbox"}
              taskDescription={currentLesson.tryItYourself.task}
              expectedOutput={currentLesson.tryItYourself.expectedOutput}
              solutionCode={currentLesson.tryItYourself.solutionCode}
              hints={currentLesson.tryItYourself.hints}
              validationType={currentLesson.tryItYourself.validationType}
              trackSlug={track.id}
              lessonSlug={currentLesson.slug}
            />
          </section>

          {/* Interactive Lesson Quiz */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Lesson Quiz
            </h2>
            <LessonQuizWidget
              quiz={currentLesson.quiz}
              lessonId={currentLesson.id}
              trackId={track.id}
              lessonSlug={currentLesson.slug}
            />
          </section>

          {/* Next / Previous Lesson & Complete Bottom Navigation */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevLessonItem ? (
              <Link
                to={`/tutorials/${track.id}/${prevLessonItem.lesson.slug}`}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate max-w-[140px]">Prev: {prevLessonItem.lesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            <button
              onClick={handleMarkComplete}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
            </button>


            {nextLessonItem ? (
              <Link
                to={`/tutorials/${track.id}/${nextLessonItem.lesson.slug}`}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span className="truncate max-w-[140px]">Next: {nextLessonItem.lesson.title}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={handleClaimCertificate}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>Get Certificate</span>
              </button>
            )}
          </div>
        </main>

        {/* ================================================================= */}
        {/* 3. RIGHT PANEL: Quick Table of Contents & Progress */}
        {/* ================================================================= */}
        <aside className="hidden xl:block w-80 p-6 border-l border-slate-200 dark:border-slate-800 space-y-6">
          {/* Track Progress Widget */}
          <CourseProgressWidget
            track={track}
            onClaimCertificate={handleClaimCertificate}
          />

          {/* Quick Page Sections Nav */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              On This Page
            </h4>
            <nav className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <a
                href="#objectives"
                className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              >
                Learning Objectives
              </a>
              <a
                href="#explanation"
                className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              >
                Concept Explanation
              </a>
              {currentLesson.syntaxCode && (
                <a
                  href="#syntax"
                  className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                >
                  Syntax Reference
                </a>
              )}
              <a
                href="#try-it-yourself"
                className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              >
                Try It Yourself Editor
              </a>
              <a
                href="#quiz"
                className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
              >
                Knowledge Check Quiz
              </a>
            </nav>
          </div>

          {/* Sandbox Fullscreen Button */}
          <Link
            to={`/tutorials/${track.id}/${currentLesson.slug}/try`}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between group block transition-all"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Fullscreen Sandbox
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Launch full-page code compiler
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </aside>
      </div>

      {/* Lesson Notes Drawer */}
      <LessonNotesDrawer
        isOpen={notesDrawerOpen}
        onClose={() => setNotesDrawerOpen(false)}
        lessonId={currentLesson.id}
        trackId={track.id}
        lessonTitle={currentLesson.title}
      />

      {/* Verified Certificate Modal */}
      <CertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        certificate={activeCertificate}
      />
    </div>
  )
}

