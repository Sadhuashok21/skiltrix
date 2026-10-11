import React, { useState, useEffect, useRef, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  Lock,
  ChevronLeft,
  ChevronRight,
  Code2,
  Terminal,
  Trophy,
  Loader2,
  Sparkles,
  ShieldAlert,
  BarChart3,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Monitor,
  Maximize2,
  WifiOff,
  Wifi,
  Eye,
  FileQuestion,
  Info,
  X,
  Check,
  Layers,
} from "lucide-react"


import {
  getAssessment,
  startAssessment,
  autosaveAssessmentDraft,
  submitAssessment,
  runSampleProblem,
  recordAssessmentEvent,
  type ApiAssessment,
  type ApiAssessmentSection,
  type ApiAssessmentQuestionItem,
  type AssessmentAttemptData,
  type AssessmentSubmissionResponse,
  type TestCaseResult,
} from "../api/practice"
import CodeEditor from "../components/CodeEditor"

const ASSESSMENT_LANGUAGES = [
  { id: "python", label: "Python 3", ext: "py" },
  { id: "java", label: "Java", ext: "java" },
  { id: "cpp", label: "C++", ext: "cpp" },
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "sql", label: "SQL", ext: "sql" },
]

export default function AssessmentView() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()

  const [assessment, setAssessment] = useState<ApiAssessment | null>(null)
  const [attempt, setAttempt] = useState<AssessmentAttemptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  // Multi-section and Question Navigation
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)

  // Answers State
  // MCQ/Numerical answers: { [itemId]: string | string[] | number }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({})
  // Coding drafts: { [problemId]: { lang: string, code: string } }
  const [codingDrafts, setCodingDrafts] = useState<Record<string, { lang: string; code: string }>>({})

  // Runner state for coding questions
  const [running, setRunning] = useState(false)
  const [sampleVerdict, setSampleVerdict] = useState<string | null>(null)
  const [sampleResults, setSampleResults] = useState<TestCaseResult[]>([])
  const [activeSampleTab, setActiveSampleTab] = useState(0)

  // Timer & Proctoring State
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5400)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const [integrityEventsCount, setIntegrityEventsCount] = useState(0)
  const [violationWarning, setViolationWarning] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<AssessmentSubmissionResponse | null>(null)
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "offline" | "">("")

  // Reconnection & Local Storage cache key
  const cacheKey = `skiltrix_assessment_${attempt?.attempt_id || assessmentId}`

  // Log Assessment Event helper
  const logEvent = useCallback(
    async (
      eventType: "FULLSCREEN_ENTER" | "FULLSCREEN_EXIT" | "TAB_SWITCH" | "SCREEN_SHARE_STARTED" | "SCREEN_SHARE_STOPPED" | "WINDOW_BLUR" | "WINDOW_FOCUS" | "NETWORK_DISCONNECTED" | "NETWORK_RECONNECTED",
      meta: Record<string, any> = {}
    ) => {
      if (!attempt) return
      try {
        const res = await recordAssessmentEvent({
          attempt_id: attempt.attempt_id,
          event_type: eventType,
          metadata: meta,
        })
        setIntegrityEventsCount((prev) => prev + 1)
        if (res?.auto_submitted) {
          setViolationWarning("Integrity policies exceeded limits. The assessment has been automatically concluded.")
          handleFinalSubmit(true)
        }
      } catch (err) {
        console.error("Failed to log assessment event", err)
      }
    },
    [attempt]
  )

  // Privacy-friendly Screen Share Verification (Strictly verifies active stream track; NO camera/mic, NO recording)
  const requestScreenShareVerification = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen sharing verification is not supported in this browser.")
        return
      }

      // Explicitly only request display media with video: true, audio: false
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })

      screenStreamRef.current = stream
      setIsScreenSharingActive(true)
      logEvent("SCREEN_SHARE_STARTED", { note: "Stream active track verified" })

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsScreenSharingActive(false)
          setViolationWarning("Screen sharing was stopped. Please maintain active sharing to uphold assessment integrity.")
          logEvent("SCREEN_SHARE_STOPPED", { reason: "User stopped screen sharing track" })
        }
      }
    } catch (err) {
      console.warn("Screen share permission dismissed or cancelled", err)
      setViolationWarning("Screen share verification was dismissed.")
    }
  }

  // Fullscreen Enforcer
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
        logEvent("FULLSCREEN_ENTER")
      }
    } catch (err) {
      console.warn("Fullscreen request declined", err)
    }
  }

  // Listeners for Fullscreen, Tab switches (visibilitychange), blur/focus, and Network status
  useEffect(() => {
    if (!attempt || submissionResult) return

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
        setViolationWarning("Fullscreen mode exited. Please re-enter fullscreen immediately.")
        logEvent("FULLSCREEN_EXIT")
      } else {
        setIsFullscreen(true)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationWarning("Browser tab switch detected. Integrity event recorded.")
        logEvent("TAB_SWITCH", { hidden: true })
      }
    }

    const handleWindowBlur = () => {
      logEvent("WINDOW_BLUR")
    }

    const handleWindowFocus = () => {
      logEvent("WINDOW_FOCUS")
    }

    const handleOnline = () => {
      setIsOnline(true)
      logEvent("NETWORK_RECONNECTED")
      // Sync local storage cache to server
      const localData = localStorage.getItem(cacheKey)
      if (localData) {
        try {
          const parsed = JSON.parse(localData)
          if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers)
        } catch {}
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setAutosaveStatus("offline")
      logEvent("NETWORK_DISCONNECTED")
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("focus", handleWindowFocus)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("focus", handleWindowFocus)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [attempt, submissionResult, logEvent, cacheKey])

  // Load Assessment & Start/Resume Session
  useEffect(() => {
    let isMounted = true

    async function initAssessment() {
      try {
        setLoading(true)
        setErrorMsg("")
        const id = assessmentId || "asmt_amazon_sde1"
        const res = await startAssessment(id)
        if (!isMounted) return

        setAssessment(res.assessment)
        setAttempt(res.attempt)
        setSecondsRemaining(res.time_remaining_seconds)

        // Initialize drafts from server saved_drafts
        const initialDrafts: Record<string, { lang: string; code: string }> = {}
        const serverDrafts = res.attempt.saved_drafts || {}

        // Initialize coding drafts for both legacy questions and new section question items
        res.assessment.questions?.forEach((q) => {
          const pid = q.problem.problem_id
          if (serverDrafts[pid]) {
            initialDrafts[pid] = {
              lang: serverDrafts[pid].language || "python",
              code: serverDrafts[pid].code || "",
            }
          } else {
            const starters = q.problem.starter_codes || {}
            initialDrafts[pid] = {
              lang: "python",
              code: starters["python"] || "",
            }
          }
        })

        res.assessment.question_items?.forEach((qi) => {
          if (qi.problem) {
            const pid = qi.problem.problem_id
            if (serverDrafts[pid]) {
              initialDrafts[pid] = {
                lang: serverDrafts[pid].language || "python",
                code: serverDrafts[pid].code || "",
              }
            } else {
              const starters = qi.problem.starter_codes || {}
              initialDrafts[pid] = {
                lang: "python",
                code: starters["python"] || "",
              }
            }
          }
        })

        setCodingDrafts(initialDrafts)
        setSelectedAnswers(res.attempt.selected_answers || {})
      } catch (err: any) {
        if (!isMounted) return
        setErrorMsg(err?.response?.data?.message || err.message || "Could not launch assessment session.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAssessment()
    return () => {
      isMounted = false
    }
  }, [assessmentId])

  // Server Authoritative Countdown Timer
  useEffect(() => {
    if (submissionResult || loading || !attempt) return

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          handleFinalSubmit(true) // Auto-submit on time expiration
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [attempt, submissionResult, loading])

  // Periodic Autosave every 20 seconds with local caching
  const triggerAutosave = useCallback(async () => {
    if (!attempt) return

    // Save offline copy first
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        selectedAnswers,
        codingDrafts,
        timestamp: Date.now(),
      })
    )

    if (!navigator.onLine) {
      setAutosaveStatus("offline")
      return
    }

    try {
      setAutosaveStatus("saving")
      await autosaveAssessmentDraft({
        attempt_id: attempt.attempt_id,
        selected_answers: selectedAnswers,
        current_section: sections[currentSectionIdx]?.section_id,
        current_question_index: currentQuestionIdx,
      })
      setAutosaveStatus("saved")
    } catch {
      setAutosaveStatus("")
    }
  }, [attempt, selectedAnswers, codingDrafts, currentSectionIdx, currentQuestionIdx, cacheKey])

  useEffect(() => {
    const autoInterval = setInterval(triggerAutosave, 20000)
    return () => clearInterval(autoInterval)
  }, [triggerAutosave])

  // Active section and questions calculation
  const sections: ApiAssessmentSection[] =
    assessment?.sections && assessment.sections.length > 0
      ? assessment.sections
      : [
          {
            section_id: "sec_default",
            title: "Technical Coding",
            section_type: "coding",
            order: 1,
            duration_minutes: assessment?.duration_minutes || 90,
            total_marks: assessment?.total_marks || 100,
          },
        ]

  const activeSection = sections[currentSectionIdx] || sections[0]

  // Questions for the current section
  const currentSectionQuestions: ApiAssessmentQuestionItem[] =
    assessment?.question_items && assessment.question_items.length > 0
      ? assessment.question_items.filter((qi) => qi.section_id === activeSection.section_id)
      : (assessment?.questions || []).map((q) => ({
          item_id: q.item_id,
          section_id: activeSection.section_id,
          question_type: "coding" as const,
          title: q.problem.title,
          prompt: q.problem.description || "",
          marks: q.marks,
          negative_marks: 0,
          order: q.order,
          problem: q.problem,
        }))

  const activeQuestionItem = currentSectionQuestions[currentQuestionIdx] || currentSectionQuestions[0]
  const currentProblem = activeQuestionItem?.problem
  const currentDraft = currentProblem ? codingDrafts[currentProblem.problem_id] : null

  // MCQ Selection handler
  const handleSelectOption = (option: string) => {
    if (!activeQuestionItem) return
    if (activeQuestionItem.question_type === "mcq_single") {
      setSelectedAnswers((prev) => ({
        ...prev,
        [activeQuestionItem.item_id]: option,
      }))
    } else if (activeQuestionItem.question_type === "mcq_multi") {
      const currentArr: string[] = Array.isArray(selectedAnswers[activeQuestionItem.item_id])
        ? selectedAnswers[activeQuestionItem.item_id]
        : []
      const nextArr = currentArr.includes(option)
        ? currentArr.filter((o) => o !== option)
        : [...currentArr, option]
      setSelectedAnswers((prev) => ({
        ...prev,
        [activeQuestionItem.item_id]: nextArr,
      }))
    }
  }

  const handleNumericalChange = (val: string) => {
    if (!activeQuestionItem) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestionItem.item_id]: val,
    }))
  }

  const handleCodeChange = (newCode: string) => {
    if (!currentProblem) return
    setCodingDrafts((prev) => ({
      ...prev,
      [currentProblem.problem_id]: {
        lang: prev[currentProblem.problem_id]?.lang || "python",
        code: newCode,
      },
    }))
  }

  const handleLangChange = (newLang: string) => {
    if (!currentProblem) return
    const starters = currentProblem.starter_codes || {}
    const existingCode = codingDrafts[currentProblem.problem_id]?.code
    const newCode = existingCode && existingCode.trim().length > 10 ? existingCode : starters[newLang] || ""
    setCodingDrafts((prev) => ({
      ...prev,
      [currentProblem.problem_id]: {
        lang: newLang,
        code: newCode,
      },
    }))
  }

  const handleRunSample = async () => {
    if (!currentProblem || !currentDraft) return
    setRunning(true)
    setSampleVerdict(null)
    setSampleResults([])
    try {
      const res = await runSampleProblem({
        problem_id: currentProblem.problem_id,
        language: currentDraft.lang,
        code: currentDraft.code,
      })
      setSampleVerdict(res.verdict)
      setSampleResults(res.test_results || [])
      setActiveSampleTab(0)
    } catch (err: any) {
      alert(`Execution failed: ${err?.response?.data?.message || err.message}`)
    } finally {
      setRunning(false)
    }
  }

  const handleFinalSubmit = async (isAutoSubmit = false) => {
    if (!attempt || isSubmitting) return
    if (!isAutoSubmit) {
      const confirmed = window.confirm(
        "Are you sure you want to finish and submit this assessment? All answers across sections will be evaluated."
      )
      if (!confirmed) return
    }

    try {
      setIsSubmitting(true)
      const res = await submitAssessment({
        attempt_id: attempt.attempt_id,
        submissions: Object.fromEntries(
          Object.entries(codingDrafts).map(([pid, draft]) => [
            pid,
            { language: draft.lang, code: draft.code },
          ])
        ),
        selected_answers: selectedAnswers,
      })
      setSubmissionResult(res)
    } catch (err: any) {
      alert(`Submission failed: ${err?.response?.data?.message || err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format Timer HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-bold text-white">Initializing Company-Style Assessment Session...</h2>
        <p className="text-sm text-slate-500 mt-1">Configuring isolated compiler sandboxes & server verification timer.</p>
      </div>
    )
  }

  if (errorMsg || !assessment) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-slate-300 p-6">
        <div className="bg-red-950/40 border border-red-800 rounded-2xl p-8 max-w-md text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Assessment Unavailable</h2>
          <p className="text-sm text-red-200 mb-6">{errorMsg || "Unable to find the requested assessment."}</p>
          <Link
            to="/placement-preparation"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            ← Return to Placement Prep
          </Link>
        </div>
      </div>
    )
  }

  // SUBMITTED REPORT VIEW WITH SECTION SCORES & INTEGRITY RATING
  if (submissionResult) {
    const summary = submissionResult.score_summary
    return (
      <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="bg-gradient-to-b from-slate-900 to-[#0e1422] border border-slate-800 rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <Trophy className="w-4 h-4 text-amber-400" /> Assessment Finalized & Evaluated
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-2">{assessment.title}</h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
              Complete evaluation across all sections. Review your section-wise performance, skill competency radar, and verified integrity rating.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-6 py-4">
                <div className="text-3xl font-black text-white">{summary.percentage}%</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Overall Score ({summary.total_score}/{summary.max_possible} marks)
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-6 py-4">
                <div className={`text-2xl font-black ${summary.passed ? "text-emerald-400" : "text-amber-400"}`}>
                  {summary.passed ? "PASSED" : "NEEDS PRACTICE"}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Passing Threshold: {summary.pass_percentage}%</div>
              </div>

              {/* Integrity Rating Badge */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-6 py-4">
                <div
                  className={`text-2xl font-black ${
                    summary.integrity_rating === "Good"
                      ? "text-emerald-400"
                      : summary.integrity_rating === "Acceptable"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {summary.integrity_rating || "Good"}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Integrity Rating ({summary.integrity_score ?? 100}/100)
                </div>
              </div>
            </div>
          </div>

          {/* Section-Wise Breakdown Card */}
          {summary.section_breakdown && Object.keys(summary.section_breakdown).length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Section-Wise Performance Breakdown</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(summary.section_breakdown).map(([secId, sdata]) => (
                  <div key={secId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 mb-1">{secId}</div>
                    <div className="text-xl font-bold text-white mb-2">{sdata.percentage}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${sdata.percentage}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 font-mono">
                      {sdata.marks_earned} / {sdata.marks_possible} Marks
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Skill Competency Radar</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(summary.skill_breakdown || {}).map(([skill, score]) => (
                <div key={skill} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">{skill}</span>
                    <span className="text-indigo-400 font-mono font-bold">{score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coding Problem Solutions & Reviews */}
          {submissionResult.problem_evaluations && submissionResult.problem_evaluations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white mb-2">Detailed Question Review & Official Solutions</h3>
              {submissionResult.problem_evaluations.map((pe, idx) => (
                <div key={pe.problem_id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{pe.title}</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {pe.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          pe.verdict === "Accepted"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {pe.verdict} ({pe.marks_earned}/{pe.marks_possible} pts)
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Test Cases Passed: {pe.passed_tests}/{pe.total_tests} • Execution: {pe.duration_ms}ms
                    {pe.expected_complexity ? ` • Expected: ${pe.expected_complexity}` : ""}
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                      <BookOpen className="w-3.5 h-3.5" /> Optimal Solution & Explanation:
                    </div>
                    <p className="leading-relaxed text-slate-400">{pe.explanation}</p>
                    {pe.solution_code && (
                      <pre className="bg-[#0b0e14] p-3 rounded border border-slate-800/80 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                        {pe.solution_code}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center pb-12">
            <Link
              to="/placement-preparation"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              Return to Company Placement Dashboard →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0d14] text-slate-200 overflow-hidden font-sans select-none">
      {/* Policy / Violation Warning Banner */}
      {violationWarning && (
        <div className="bg-amber-950 border-b border-amber-800 px-4 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0 z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{violationWarning}</span>
          </div>
          <button
            onClick={() => setViolationWarning(null)}
            className="text-amber-400 hover:text-white font-bold ml-4 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Dismiss
          </button>

        </div>
      )}

      {/* Top Assessment Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/placement-preparation"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Exit
          </Link>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
              {assessment.title}
            </span>
            {assessment.company_tag && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                {assessment.company_tag}
              </span>
            )}
          </div>
        </div>

        {/* Center Section Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {sections.map((sec, idx) => (
            <button
              key={sec.section_id}
              onClick={() => {
                triggerAutosave()
                setCurrentSectionIdx(idx)
                setCurrentQuestionIdx(0)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                idx === currentSectionIdx
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>

        {/* Right Status, Proctoring, & Countdown */}
        <div className="flex items-center gap-3">
          {/* Integrity / Privacy verification buttons */}
          {assessment.require_fullscreen && !isFullscreen && (
            <button
              onClick={enterFullscreen}
              className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg hover:bg-amber-500/20 transition-colors"
              title="Click to enter required fullscreen mode"
            >
              <Maximize2 className="w-3 h-3" /> Fullscreen
            </button>
          )}

          {assessment.require_screen_share && !isScreenSharingActive && (
            <button
              onClick={requestScreenShareVerification}
              className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded-lg hover:bg-indigo-500/20 transition-colors"
              title="Verify active screen sharing (No camera/audio recording used)"
            >
              <Monitor className="w-3 h-3" /> Verify Screen
            </button>
          )}

          {/* Network status */}
          {!isOnline && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-800">
              <WifiOff className="w-3 h-3" /> Offline (Cached locally)
            </span>
          )}

          {autosaveStatus && isOnline && (
            <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
              {autosaveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Saved
                </>
              )}
            </span>
          )}

          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              secondsRemaining < 600
                ? "bg-red-950/40 border-red-800 text-red-400 animate-pulse"
                : "bg-slate-950 border-slate-800 text-amber-400"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Finish Test
              </>
            )}
          </button>
        </div>
      </header>

      {/* Subheader: Question Navigator Bar */}
      <div className="h-10 bg-[#0d121c] border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">{activeSection.title}</span>
          <span>•</span>
          <span>
            Question {currentQuestionIdx + 1} of {currentSectionQuestions.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {currentSectionQuestions.map((q, idx) => {
            const isAnswered =
              selectedAnswers[q.item_id] !== undefined ||
              (q.problem && codingDrafts[q.problem.problem_id]?.code.length > 15)
            const isCurrent = idx === currentQuestionIdx
            return (
              <button
                key={q.item_id}
                onClick={() => {
                  triggerAutosave()
                  setCurrentQuestionIdx(idx)
                  setSampleVerdict(null)
                  setSampleResults([])
                }}
                className={`w-6 h-6 rounded-md text-[11px] font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                    : isAnswered
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentQuestionIdx > 0) setCurrentQuestionIdx(currentQuestionIdx - 1)
            }}
            disabled={currentQuestionIdx === 0}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (currentQuestionIdx < currentSectionQuestions.length - 1) {
                setCurrentQuestionIdx(currentQuestionIdx + 1)
              }
            }}
            disabled={currentQuestionIdx === currentSectionQuestions.length - 1}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Assessment Body: Render MCQ/Numerical OR CodeEditor depending on question type */}
      {activeQuestionItem?.question_type === "mcq_single" ||
      activeQuestionItem?.question_type === "mcq_multi" ||
      activeQuestionItem?.question_type === "numerical" ? (
        /* APTITUDE / REASONING / CORE CS MCQ VIEW */
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full select-text">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider">
                  {activeSection.title} • {activeQuestionItem.question_type.toUpperCase().replace("_", " ")}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{activeQuestionItem.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-amber-400">+{activeQuestionItem.marks} Marks</span>
                {activeQuestionItem.negative_marks > 0 && (
                  <div className="text-[10px] text-red-400">-{activeQuestionItem.negative_marks} Neg. Marking</div>
                )}
              </div>
            </div>

            {/* Prompt */}
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {activeQuestionItem.prompt}
            </div>

            {/* Options for MCQ */}
            {activeQuestionItem.options && activeQuestionItem.options.length > 0 && (
              <div className="space-y-3 pt-2">
                {activeQuestionItem.options.map((opt, i) => {
                  const isChecked =
                    activeQuestionItem.question_type === "mcq_single"
                      ? selectedAnswers[activeQuestionItem.item_id] === opt
                      : Array.isArray(selectedAnswers[activeQuestionItem.item_id]) &&
                        selectedAnswers[activeQuestionItem.item_id].includes(opt)

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isChecked
                          ? "bg-indigo-600/10 border-indigo-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded ${
                          activeQuestionItem.question_type === "mcq_single" ? "rounded-full" : "rounded-md"
                        } border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-600"
                        }`}
                      >
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm leading-relaxed">{opt}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Numerical Input */}
            {activeQuestionItem.question_type === "numerical" && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400">Enter your numerical answer:</label>
                <input
                  type="text"
                  value={selectedAnswers[activeQuestionItem.item_id] || ""}
                  onChange={(e) => handleNumericalChange(e.target.value)}
                  placeholder="e.g. 42 or 3.14"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CODING / DEBUGGING / SQL DUAL-PANE VIEW */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Problem Panel */}
          <div className="w-[480px] shrink-0 bg-[#0d1117] border-r border-slate-800 flex flex-col overflow-y-auto p-6 select-text">
            {currentProblem ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>
                      Question {currentQuestionIdx + 1} of {currentSectionQuestions.length}
                    </span>
                    <span className="font-semibold text-amber-400">{activeQuestionItem.marks} Marks</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{currentProblem.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        currentProblem.difficulty === "Easy"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : currentProblem.difficulty === "Medium"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-red-950 text-red-400 border border-red-800"
                      }`}
                    >
                      {currentProblem.difficulty}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {currentProblem.category || "DSA"}
                    </span>
                    {currentProblem.expected_complexity && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {currentProblem.expected_complexity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Error Traceback block if Backend Debugging Question */}
                {currentProblem.error_snippet && (
                  <div className="bg-red-950/30 border border-red-800/80 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" /> Production Error Traceback:
                    </div>
                    <pre className="text-red-200 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {currentProblem.error_snippet}
                    </pre>
                  </div>
                )}

                {/* Description */}
                <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                  <p className="whitespace-pre-wrap">{currentProblem.description || activeQuestionItem.prompt}</p>
                </div>

                {/* Constraints */}
                {currentProblem.constraints && (
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Constraints:</span>
                    <pre className="text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap font-mono text-[11px]">
                      {currentProblem.constraints}
                    </pre>
                  </div>
                )}

                {/* Sample Test Cases */}
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                    Sample Test Cases:
                  </span>
                  {(currentProblem.sample_test_cases || []).map((st, i) => (
                    <div
                      key={st.test_case_id || i}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1"
                    >
                      <div className="text-slate-500 font-semibold text-[11px]">Example {i + 1}:</div>
                      <div>
                        <span className="text-slate-500">Input: </span>
                        <span className="text-slate-200">{st.input_data}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Output: </span>
                        <span className="text-emerald-400 font-semibold">{st.expected_output}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Select a question to view details.</p>
            )}
          </div>

          {/* Right Editor & Execution Panel */}
          <div className="flex-1 flex flex-col bg-[#070a0f] overflow-hidden select-text">
            {/* Editor Header Bar */}
            <div className="h-10 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono text-slate-300">
                  solution.{currentDraft?.lang === "python" ? "py" : currentDraft?.lang === "java" ? "java" : currentDraft?.lang === "sql" ? "sql" : "js"}
                </span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {ASSESSMENT_LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLangChange(l.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      currentDraft?.lang === l.id
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Run Sample Button */}
              <button
                onClick={handleRunSample}
                disabled={running}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors border border-slate-700"
              >
                {running ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Compiling...
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current text-emerald-400" /> Run Sample Tests
                  </>
                )}
              </button>
            </div>

            {/* Monaco / CodeEditor */}
            <div className="flex-1 flex overflow-hidden">
              <CodeEditor
                code={currentDraft?.code || ""}
                onChange={handleCodeChange}
                language={currentDraft?.lang || "python"}
                fontSize="sm"
              />
            </div>

            {/* Sample Test Execution Output Drawer */}
            {sampleResults.length > 0 && (
              <div className="h-56 bg-[#0c1017] border-t border-slate-800 flex flex-col overflow-hidden">
                <div className="h-9 bg-slate-950 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Sample Verdict:
                    </span>
                    {sampleVerdict && (
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          sampleVerdict === "Accepted"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {sampleVerdict}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      ({sampleResults.filter((s) => s.verdict === "Accepted").length}/{sampleResults.length} passed)
                    </span>
                  </div>
                  <button
                    onClick={() => setSampleResults([])}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Close
                  </button>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden p-3 font-mono text-xs">
                  <div className="flex items-center gap-1 mb-2 border-b border-slate-800/60 pb-1">
                    {sampleResults.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSampleTab(idx)}
                        className={`px-3 py-1 rounded-t text-xs font-bold transition-colors flex items-center gap-1 ${
                          activeSampleTab === idx
                            ? "bg-slate-800 text-white border-b-2 border-indigo-500"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Case {idx + 1}
                        {tc.verdict === "Accepted" ? (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        ) : (
                          <X className="w-3 h-3 text-red-400 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>


                  {sampleResults[activeSampleTab] && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Input:</div>
                        <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 whitespace-pre-wrap">
                          {sampleResults[activeSampleTab].input_data || "(none)"}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Expected:</div>
                        <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400 whitespace-pre-wrap">
                          {sampleResults[activeSampleTab].expected_output || "(none)"}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Actual Output:</div>
                        <pre
                          className={`bg-slate-950 p-2 rounded border whitespace-pre-wrap ${
                            sampleResults[activeSampleTab].verdict === "Accepted"
                              ? "border-emerald-800 text-emerald-300"
                              : "border-red-800 text-red-300"
                          }`}
                        >
                          {sampleResults[activeSampleTab].actual_output ||
                            sampleResults[activeSampleTab].error_message ||
                            "(empty)"}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
