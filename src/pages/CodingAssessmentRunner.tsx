import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Code2,
  Copy,
  Cpu,
  FileText,
  Flag,
  HelpCircle,
  Lock,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Save,
  Send,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trophy,
  XCircle,
} from "lucide-react"
import CodeEditor from "../components/CodeEditor"
import AssessmentCodeLabWorkspace from "../components/codelab/AssessmentCodeLabWorkspace"
const logoImg = "https://cdn.ascentracoresolutions.com/skiltrix_logo.png"
import {
  AssessmentQuestionNode,
  AssessmentResultAnalytics,
  CodeRunResponse,
  CodingAssessmentItem,
  LANGUAGE_LABELS,
  MONACO_LANGUAGE_MAP,
  ProblemSubmitResponse,
  QuestionPaletteState,
  autosaveCodingAssessment,
  getCodingAssessmentDetail,
  getCodingAssessmentResult,
  recordCodingAssessmentEvent,
  resetCodingAssessmentCodelab,
  runCodingAssessmentCode,
  startCodingAssessment,
  submitCodingAssessment,
  submitCodingAssessmentProblem,
} from "../api/codingAssessments"
import { getApiErrorMessage } from "../api/client"
import { useAuth } from "../auth"

type Phase = "loading" | "instructions" | "active" | "submitting" | "results" | "error"
type ConsoleTab = "test_cases" | "custom_input" | "console"

const PALETTE_STYLES: Record<QuestionPaletteState, { label: string; cls: string }> = {
  not_visited: {
    label: "Not Visited",
    cls: "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500",
  },
  not_attempted: {
    label: "Not Attempted",
    cls: "bg-slate-700/70 text-slate-200 border-slate-500",
  },
  attempted: {
    label: "Attempted",
    cls: "bg-amber-500/20 text-amber-300 border-amber-500/60",
  },
  marked_for_review: {
    label: "Marked for Review",
    cls: "bg-purple-500/20 text-purple-300 border-purple-500/70",
  },
  submitted: {
    label: "Submitted",
    cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/70",
  },
}

function formatTimer(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const hrs = Math.floor(s / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export default function CodingAssessmentRunner() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()

  const [phase, setPhase] = useState<Phase>("loading")
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [assessment, setAssessment] = useState<CodingAssessmentItem | null>(null)
  const [questions, setQuestions] = useState<AssessmentQuestionNode[]>([])
  const [attemptId, setAttemptId] = useState<string>("")
  const [currentIdx, setCurrentIdx] = useState(0)
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(true)

  // Question states & drafts
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionPaletteState>>({})
  const [codingDrafts, setCodingDrafts] = useState<
    Record<string, { language: string; code: string; problem_id?: string; files?: Record<string, string> }>
  >({})
  const [langDraftCache, setLangDraftCache] = useState<
    Record<string, Record<string, string>>
  >({})
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({})
  const [activeLanguageMap, setActiveLanguageMap] = useState<Record<string, string>>({})
  const [activeFileMap, setActiveFileMap] = useState<Record<string, string>>({})

  // Timer & proctoring
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [proctoringAlert, setProctoringAlert] = useState<string | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  // Execution & console state
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("test_cases")
  const [useCustomInput, setUseCustomInput] = useState(false)
  const [customInput, setCustomInput] = useState("")
  const [runningCode, setRunningCode] = useState(false)
  const [submittingProblem, setSubmittingProblem] = useState(false)
  const [runOutcome, setRunOutcome] = useState<CodeRunResponse | null>(null)
  const [submitOutcome, setSubmitOutcome] = useState<ProblemSubmitResponse | null>(null)
  const [execError, setExecError] = useState<string | null>(null)

  // Submission confirmation & results
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [results, setResults] = useState<AssessmentResultAnalytics | null>(null)
  const autoSubmittedRef = useRef(false)

  const currentQuestion = questions[currentIdx] || null

  const isDjangoProject = Boolean(
    currentQuestion &&
      (currentQuestion.problem?.question_type === "django_debug" ||
        currentQuestion.question_type === "django_debug")
  )

  const currentLang = useMemo(() => {
    if (!currentQuestion) return "python"
    if (
      currentQuestion.problem?.question_type === "django_debug" ||
      currentQuestion.question_type === "django_debug"
    ) {
      return "django"
    }
    const draft = codingDrafts[currentQuestion.item_id]
    if (activeLanguageMap[currentQuestion.item_id]) {
      return activeLanguageMap[currentQuestion.item_id]
    }
    if (draft?.language) return draft.language
    const supported =
      currentQuestion.problem?.supported_languages ||
      currentQuestion.supported_languages ||
      ["python", "java", "c", "cpp", "javascript"]
    return supported[0] || "python"
  }, [currentQuestion, codingDrafts, activeLanguageMap])

  const currentProjectFiles = useMemo(() => {
    if (!currentQuestion || !isDjangoProject) return {} as Record<string, string>
    const starterFiles =
      currentQuestion.problem?.project_files || currentQuestion.project_files || {}
    const draftFiles = codingDrafts[currentQuestion.item_id]?.files
    if (draftFiles && typeof draftFiles === "object" && Object.keys(draftFiles).length > 0) {
      return { ...starterFiles, ...draftFiles }
    }
    return { ...starterFiles }
  }, [currentQuestion, isDjangoProject, codingDrafts])

  const sortedProjectFileKeys = useMemo(() => {
    const keys = Object.keys(currentProjectFiles)
    const priority = (path: string) => {
      if (path === "posts/views.py") return 0
      if (path === "posts/models.py") return 1
      if (path === "posts/urls.py") return 2
      if (path === "posts/tests.py") return 3
      if (path.endsWith("views.py")) return 4
      if (path.endsWith("models.py")) return 5
      if (path.endsWith("urls.py")) return 6
      if (path.endsWith("tests.py")) return 7
      if (path.startsWith("config/")) return 8
      if (path === "manage.py") return 9
      return 10
    }
    return keys.sort((a, b) => priority(a) - priority(b) || a.localeCompare(b))
  }, [currentProjectFiles])

  const currentActiveFile = useMemo(() => {
    if (!currentQuestion || !isDjangoProject) return ""
    const chosen = activeFileMap[currentQuestion.item_id]
    if (chosen && chosen in currentProjectFiles) return chosen
    if ("posts/views.py" in currentProjectFiles) return "posts/views.py"
    return sortedProjectFileKeys[0] || ""
  }, [currentQuestion, isDjangoProject, activeFileMap, currentProjectFiles, sortedProjectFileKeys])

  const currentCode = useMemo(() => {
    if (!currentQuestion) return ""
    if (isDjangoProject) {
      return currentActiveFile ? currentProjectFiles[currentActiveFile] ?? "" : ""
    }
    const draft = codingDrafts[currentQuestion.item_id]
    if (draft && draft.language === currentLang && typeof draft.code === "string") {
      return draft.code
    }
    const starters =
      currentQuestion.problem?.starter_codes || currentQuestion.starter_codes || {}
    return starters[currentLang] || starters.python || ""
  }, [currentQuestion, isDjangoProject, currentActiveFile, currentProjectFiles, codingDrafts, currentLang])

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
      setIsFullscreen(true)
    } catch {
      // Browser might block unprompted fullscreen requests
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen()
      }
      setIsFullscreen(false)
    } catch {
      setIsFullscreen(false)
    }
  }, [])

  // Initialize assessment detail and check if already in progress or completed
  useEffect(() => {
    if (!assessmentId) return
    let mounted = true
    const init = async () => {
      setPhase("loading")
      try {
        const detail = await getCodingAssessmentDetail(assessmentId)
        if (!mounted) return
        setAssessment(detail)
        setQuestions(detail.questions || [])

        const att = detail.latest_attempt
        const wantResult = searchParams.get("view") === "result"
        if (att && ["completed", "timed_out"].includes(att.status)) {
          const resData = await getCodingAssessmentResult(assessmentId, att.attempt_id)
          if (!mounted) return
          setResults(resData)
          setPhase("results")
          return
        }
        if (wantResult && !att) {
          setPhase("instructions")
          return
        }
        if (att && att.status === "in_progress") {
          await handleStartAssessment(true)
          return
        }
        setPhase("instructions")
      } catch (err) {
        if (!mounted) return
        setErrorMsg(getApiErrorMessage(err, "Failed to load assessment."))
        setPhase("error")
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [assessmentId])

  const handleStartAssessment = async (resuming = false) => {
    if (!assessmentId) return
    setPhase("loading")
    try {
      const started = await startCodingAssessment(assessmentId)
      setAssessment(started.assessment)
      setQuestions(started.questions || [])
      setAttemptId(started.attempt.attempt_id)
      setRemainingSeconds(started.attempt.remaining_seconds || started.assessment.duration_minutes * 60)

      const restoredDrafts = started.attempt.saved_drafts?.coding_drafts || {}
      setCodingDrafts(restoredDrafts)
      const restoredLangCache: Record<string, Record<string, string>> = {}
      Object.entries(restoredDrafts).forEach(([qid, d]) => {
        if (d?.language && typeof d.code === "string") {
          restoredLangCache[qid] = { [d.language]: d.code }
        }
      })
      setLangDraftCache(restoredLangCache)
      setSelectedAnswers((started.attempt.selected_answers as Record<string, string>) || {})

      const initialStates: Record<string, QuestionPaletteState> = {
        ...(started.attempt.question_states || {}),
      }
      ;(started.questions || []).forEach((q, idx) => {
        if (!initialStates[q.item_id]) {
          initialStates[q.item_id] = idx === 0 ? "not_attempted" : "not_visited"
        }
      })
      setQuestionStates(initialStates)
      setCurrentIdx(started.attempt.current_question_index || 0)
      setPhase("active")

      if (!resuming && started.assessment.require_fullscreen) {
        await enterFullscreen()
      }
    } catch (err: any) {
      const autoRes = err?.response?.data?.result
      if (autoRes) {
        setResults(autoRes)
        setPhase("results")
        return
      }
      setErrorMsg(getApiErrorMessage(err, "Unable to start this assessment."))
      setPhase("error")
    }
  }

  // Persist drafts helper
  const persistAutosave = useCallback(
    async (
      draftsOverride?: Record<
        string,
        { language: string; code: string; problem_id?: string; files?: Record<string, string> }
      >,
      statesOverride?: Record<string, QuestionPaletteState>,
      answersOverride?: Record<string, string | string[]>
    ) => {
      if (!assessmentId || !attemptId || phase !== "active") return
      setSavingDraft(true)
      try {
        await autosaveCodingAssessment(assessmentId, {
          attempt_id: attemptId,
          coding_drafts: draftsOverride || codingDrafts,
          selected_answers: answersOverride || selectedAnswers,
          question_states: statesOverride || questionStates,
          current_question_index: currentIdx,
        })
        setLastSavedAt(new Date().toLocaleTimeString())
      } catch {
        // Silent background retry next cycle
      } finally {
        setSavingDraft(false)
      }
    },
    [assessmentId, attemptId, phase, codingDrafts, selectedAnswers, questionStates, currentIdx]
  )

  // Countdown timer + automatic submission at 00:00
  const handleFinalizeAssessment = useCallback(
    async (autoSubmitted = false) => {
      if (!assessmentId || !attemptId || phase === "submitting" || phase === "results") return
      if (autoSubmitted && autoSubmittedRef.current) return
      if (autoSubmitted) autoSubmittedRef.current = true
      setShowConfirmModal(false)
      setPhase("submitting")
      try {
        const finalSummary = await submitCodingAssessment(assessmentId, {
          attempt_id: attemptId,
          coding_drafts: codingDrafts,
          selected_answers: selectedAnswers,
          auto_submitted: autoSubmitted,
        })
        setResults(finalSummary)
        setPhase("results")
        if (document.fullscreenElement) {
          exitFullscreen()
        }
      } catch (err) {
        setErrorMsg(getApiErrorMessage(err, "Error finalizing submission."))
        setPhase("error")
      }
    },
    [assessmentId, attemptId, phase, codingDrafts, selectedAnswers, exitFullscreen]
  )

  useEffect(() => {
    if (phase !== "active") return
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinalizeAssessment(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, handleFinalizeAssessment])

  // Periodic background autosave every 15s
  useEffect(() => {
    if (phase !== "active") return
    const saver = setInterval(() => {
      persistAutosave()
    }, 15000)
    return () => clearInterval(saver)
  }, [phase, persistAutosave])

  // Prevent accidental page navigation / closing during active test
  useEffect(() => {
    if (phase !== "active") return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [phase])

  // Proctoring focus & fullscreen listener
  useEffect(() => {
    if (phase !== "active" || !assessment?.proctoring_enabled) return

    const onVisibilityChange = () => {
      if (document.hidden && attemptId && assessmentId) {
        setProctoringAlert("Tab switch detected and logged for integrity review.")
        recordCodingAssessmentEvent(assessmentId, {
          attempt_id: attemptId,
          event_type: "TAB_SWITCH",
        }).catch(() => undefined)
      }
    }
    const onFullscreenChange = () => {
      const full = Boolean(document.fullscreenElement)
      setIsFullscreen(full)
      if (!full && assessment?.require_fullscreen && attemptId && assessmentId) {
        setProctoringAlert("Full-screen exited. Please stay in full-screen mode.")
        recordCodingAssessmentEvent(assessmentId, {
          attempt_id: attemptId,
          event_type: "FULLSCREEN_EXIT",
        }).catch(() => undefined)
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      document.removeEventListener("fullscreenchange", onFullscreenChange)
    }
  }, [phase, assessment, attemptId, assessmentId])

  const switchQuestion = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= questions.length) return
    const targetQ = questions[nextIndex]
    setQuestionStates((prev) => {
      if (prev[targetQ.item_id] === "not_visited") {
        return { ...prev, [targetQ.item_id]: "not_attempted" }
      }
      return prev
    })
    setRunOutcome(null)
    setSubmitOutcome(null)
    setExecError(null)
    setUseCustomInput(false)
    setCustomInput("")
    setCurrentIdx(nextIndex)
    persistAutosave()
  }

  const handleCodeChange = (newCode: string) => {
    if (!currentQuestion) return
    const qid = currentQuestion.item_id

    if (isDjangoProject && currentActiveFile) {
      const updatedFiles = {
        ...currentProjectFiles,
        [currentActiveFile]: newCode,
      }
      const updatedDrafts = {
        ...codingDrafts,
        [qid]: {
          language: "django",
          code: newCode,
          problem_id: currentQuestion.problem?.problem_id,
          files: updatedFiles,
        },
      }
      setCodingDrafts(updatedDrafts)
      const starterContent =
        (currentQuestion.problem?.project_files || currentQuestion.project_files || {})[
          currentActiveFile
        ] || ""
      setQuestionStates((prev) => {
        const cur = prev[qid]
        if (
          (cur === "not_visited" || cur === "not_attempted") &&
          newCode.trim() !== starterContent.trim()
        ) {
          return { ...prev, [qid]: "attempted" }
        }
        return prev
      })
      return
    }

    setLangDraftCache((prev) => ({
      ...prev,
      [qid]: { ...(prev[qid] || {}), [currentLang]: newCode },
    }))
    const updatedDrafts = {
      ...codingDrafts,
      [qid]: {
        language: currentLang,
        code: newCode,
        problem_id: currentQuestion.problem?.problem_id,
      },
    }
    setCodingDrafts(updatedDrafts)
    const starters =
      currentQuestion.problem?.starter_codes || currentQuestion.starter_codes || {}
    const starterText = starters[currentLang] || ""
    setQuestionStates((prev) => {
      const cur = prev[qid]
      if (
        (cur === "not_visited" || cur === "not_attempted") &&
        newCode.trim() !== starterText.trim()
      ) {
        return { ...prev, [qid]: "attempted" }
      }
      return prev
    })
  }

  const handleLanguageChange = (newLang: string) => {
    if (!currentQuestion) return
    const qid = currentQuestion.item_id
    setActiveLanguageMap((prev) => ({ ...prev, [qid]: newLang }))
    const starters =
      currentQuestion.problem?.starter_codes || currentQuestion.starter_codes || {}
    const cachedCode = langDraftCache[qid]?.[newLang]
    if (typeof cachedCode === "string") {
      setCodingDrafts((prev) => ({
        ...prev,
        [qid]: {
          language: newLang,
          code: cachedCode,
          problem_id: currentQuestion.problem?.problem_id,
        },
      }))
    } else {
      setCodingDrafts((prev) => ({
        ...prev,
        [qid]: {
          language: newLang,
          code: starters[newLang] || "",
          problem_id: currentQuestion.problem?.problem_id,
        },
      }))
    }
  }

  const handleResetCode = () => {
    if (!currentQuestion) return
    const qid = currentQuestion.item_id
    if (isDjangoProject) {
      const freshFiles = {
        ...(currentQuestion.problem?.project_files || currentQuestion.project_files || {}),
      }
      setCodingDrafts((prev) => ({
        ...prev,
        [qid]: {
          language: "django",
          code: freshFiles[currentActiveFile] || "",
          problem_id: currentQuestion.problem?.problem_id,
          files: freshFiles,
        },
      }))
      setRunOutcome(null)
      setSubmitOutcome(null)
      setExecError(null)
      return
    }
    const starters =
      currentQuestion.problem?.starter_codes || currentQuestion.starter_codes || {}
    const fresh = starters[currentLang] || starters.python || ""
    setLangDraftCache((prev) => ({
      ...prev,
      [qid]: { ...(prev[qid] || {}), [currentLang]: fresh },
    }))
    setCodingDrafts((prev) => ({
      ...prev,
      [qid]: {
        language: currentLang,
        code: fresh,
        problem_id: currentQuestion.problem?.problem_id,
      },
    }))
    setRunOutcome(null)
    setSubmitOutcome(null)
    setExecError(null)
  }

  const handleToggleMarkForReview = () => {
    if (!currentQuestion) return
    const qid = currentQuestion.item_id
    setQuestionStates((prev) => {
      const cur = prev[qid]
      const next: QuestionPaletteState =
        cur === "marked_for_review"
          ? codingDrafts[qid]?.code || selectedAnswers[qid]
            ? "attempted"
            : "not_attempted"
          : "marked_for_review"
      const updated = { ...prev, [qid]: next }
      persistAutosave(undefined, updated)
      return updated
    })
  }

  const handleSelectMcqOption = (optValue: string, isMulti: boolean) => {
    if (!currentQuestion) return
    const qid = currentQuestion.item_id
    let nextSelected: string | string[]
    if (isMulti) {
      const curArr = Array.isArray(selectedAnswers[qid])
        ? (selectedAnswers[qid] as string[])
        : []
      nextSelected = curArr.includes(optValue)
        ? curArr.filter((v) => v !== optValue)
        : [...curArr, optValue]
    } else {
      nextSelected = optValue
    }
    const updatedAnswers = { ...selectedAnswers, [qid]: nextSelected }
    setSelectedAnswers(updatedAnswers)
    const hasVal = Array.isArray(nextSelected) ? nextSelected.length > 0 : Boolean(nextSelected)
    const updatedStates: Record<string, QuestionPaletteState> = {
      ...questionStates,
      [qid]: hasVal ? "attempted" : "not_attempted",
    }
    setQuestionStates(updatedStates)
    persistAutosave(undefined, updatedStates, updatedAnswers)
  }

  const handleRunCode = async (filesOverride?: Record<string, string>) => {
    if (!assessmentId || !currentQuestion?.problem) return
    setRunningCode(true)
    setExecError(null)
    setSubmitOutcome(null)
    try {
      const evalFiles = isDjangoProject ? (filesOverride || currentProjectFiles) : undefined
      const res = await runCodingAssessmentCode(assessmentId, {
        attempt_id: attemptId,
        item_id: currentQuestion.item_id,
        problem_id: currentQuestion.problem.problem_id,
        language: currentLang,
        source_code: currentCode,
        ...(evalFiles ? { files: evalFiles } : {}),
        ...(!isDjangoProject && useCustomInput ? { custom_input: customInput } : {}),
      })
      setRunOutcome(res)
      if (isDjangoProject) {
        setConsoleTab(res.test_case_results?.length ? "test_cases" : "console")
      } else {
        setConsoleTab(res.compile_output || res.stderr ? "console" : "test_cases")
      }
      setQuestionStates((prev) => {
        if (prev[currentQuestion.item_id] === "not_visited" || prev[currentQuestion.item_id] === "not_attempted") {
          return { ...prev, [currentQuestion.item_id]: "attempted" }
        }
        return prev
      })
    } catch (err: any) {
      if (err?.response?.data?.result) {
        setResults(err.response.data.result)
        setPhase("results")
        return
      }
      setExecError(getApiErrorMessage(err, "Code execution failed."))
      setConsoleTab("console")
    } finally {
      setRunningCode(false)
    }
  }

  const handleSubmitProblem = async (filesOverride?: Record<string, string>) => {
    if (!assessmentId || !currentQuestion?.problem) return
    setSubmittingProblem(true)
    setExecError(null)
    setRunOutcome(null)
    try {
      const evalFiles = isDjangoProject ? (filesOverride || currentProjectFiles) : undefined
      const res = await submitCodingAssessmentProblem(assessmentId, {
        attempt_id: attemptId,
        item_id: currentQuestion.item_id,
        problem_id: currentQuestion.problem.problem_id,
        language: currentLang,
        source_code: currentCode,
        ...(evalFiles ? { files: evalFiles } : {}),
      })
      setSubmitOutcome(res)
      if (res.question_states) {
        setQuestionStates((prev) => ({ ...prev, ...res.question_states }))
      } else {
        setQuestionStates((prev) => ({ ...prev, [currentQuestion.item_id]: "submitted" }))
      }
      if (isDjangoProject) {
        setConsoleTab(res.test_case_results?.length ? "test_cases" : "console")
      } else {
        setConsoleTab(res.compile_output ? "console" : "test_cases")
      }
    } catch (err: any) {
      if (err?.response?.data?.result) {
        setResults(err.response.data.result)
        setPhase("results")
        return
      }
      setExecError(getApiErrorMessage(err, "Problem submission failed."))
      setConsoleTab("console")
    } finally {
      setSubmittingProblem(false)
    }
  }

  const paletteSummary = useMemo(() => {
    const counts: Record<QuestionPaletteState, number> = {
      not_visited: 0,
      not_attempted: 0,
      attempted: 0,
      marked_for_review: 0,
      submitted: 0,
    }
    questions.forEach((q) => {
      const st = questionStates[q.item_id] || "not_visited"
      counts[st] = (counts[st] || 0) + 1
    })
    return counts
  }, [questions, questionStates])

  // Render States
  if (phase === "loading" || phase === "submitting") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-300 font-medium">
          {phase === "submitting"
            ? "Evaluating final code & computing analytics..."
            : "Loading assessment workspace..."}
        </p>
      </div>
    )
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold">Assessment Unavailable</h2>
          <p className="text-sm text-slate-300">{errorMsg}</p>
          <div className="flex justify-center gap-3 pt-2">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() =>
                  void login(assessmentId ? `/assessments/coding/${assessmentId}` : "/assessments")
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer"
              >
                Sign In to Continue
              </button>
            )}
            <Link
              to="/assessments"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white"
            >
              Back to Assessments Hub
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Instructions Screen
  if (phase === "instructions" && assessment) {
    const scheduleBlocked =
      assessment.schedule_status === "upcoming" || assessment.schedule_status === "ended"
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-900/70 to-slate-900 p-6 sm:p-8 border-b border-slate-800">
            <Link
              to="/assessments"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Assessments Hub
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {assessment.assessment_type} assessment
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {assessment.difficulty}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {assessment.title}
            </h1>
            <p className="text-sm text-slate-300 mt-2">{assessment.description}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3.5">
                <div className="text-xs text-slate-400">Duration</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {assessment.duration_minutes} mins
                </div>
              </div>
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3.5">
                <div className="text-xs text-slate-400">Questions</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {questions.length}
                </div>
              </div>
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3.5">
                <div className="text-xs text-slate-400">Total Marks</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {assessment.total_marks}
                </div>
              </div>
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3.5">
                <div className="text-xs text-slate-400">Passing Score</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {assessment.pass_percentage}%
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-800/40 border border-slate-800 p-5 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Assessment Instructions &amp; Rules
              </h2>
              <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                <li>
                  Your timer starts once you click <strong>Begin Assessment</strong> and
                  auto-submits automatically when time expires.
                </li>
                <li>
                  Code and answers autosave continuously every 15 seconds. Use{" "}
                  <strong>Run Code</strong> to test against public sample cases or custom
                  stdin, and <strong>Submit Code</strong> to evaluate against hidden test
                  suites.
                </li>
                <li>
                  Supported Languages:{" "}
                  <span className="font-mono text-indigo-300">
                    {(assessment.supported_languages || [])
                      .map((l) => LANGUAGE_LABELS[l] || l)
                      .join(", ")}
                  </span>
                  .
                </li>
                {assessment.negative_marking && (
                  <li className="text-amber-300">
                    Negative marking applies for incorrect objective responses (
                    {assessment.negative_marking_percentage || 25}%).
                  </li>
                )}
                {assessment.proctoring_enabled && (
                  <li className="text-indigo-200">
                    Proctored session: tab switches and full-screen exits are monitored.
                  </li>
                )}
                {assessment.instructions && (
                  <li className="whitespace-pre-line">{assessment.instructions}</li>
                )}
              </ul>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedGuidelines}
                onChange={(e) => setAcceptedGuidelines(e.target.checked)}
                className="mt-1 rounded border-slate-600 bg-slate-800 text-indigo-600"
              />
              <span>
                I have read all instructions and confirm that my submitted code and solutions
                are exclusively my own work.
              </span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/assessments"
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Link>
              <button
                disabled={!acceptedGuidelines || scheduleBlocked}
                onClick={() => {
                  if (!isAuthenticated) {
                    void login(assessmentId ? `/assessments/coding/${assessmentId}` : "/assessments")
                    return
                  }
                  void handleStartAssessment(false)
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white shadow-lg shadow-indigo-600/20"
              >
                {scheduleBlocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Assessment Window {assessment.schedule_status}
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In to Begin Assessment
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Begin Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results Analytics Dashboard
  if (phase === "results" && results) {
    const mins = Math.floor((results.time_taken_seconds || 0) / 60)
    const secs = (results.time_taken_seconds || 0) % 60
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <Trophy className="w-4 h-4" />
                Assessment Result Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {results.assessment_title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Attempt ID: <span className="font-mono">{results.attempt_id}</span> •{" "}
                {results.auto_submitted
                  ? "Automatically submitted at time expiration"
                  : "Submitted by candidate"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {results.results_released ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border ${
                    results.passed
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/15 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {results.passed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {results.passed ? "Assessment Passed" : "Below Cutoff"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                  <Lock className="w-4 h-4" />
                  Pending Instructor Release
                </span>
              )}
              <Link
                to="/assessments"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white"
              >
                Back to Assessments
              </Link>
            </div>
          </div>

          {!results.results_released ? (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
              <h2 className="text-lg font-bold">Submission Recorded Successfully</h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Your assessment responses have been securely saved and judged. Scores and
                question-level analytics will become visible here once the administrator
                releases results.
              </p>
              <div className="text-xs text-slate-500 pt-2">
                Time Taken: {mins}m {secs}s • Problems Attempted: {results.problems_attempted}
                /{results.total_problems}
              </div>
            </div>
          ) : (
            <>
              {/* Analytics KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs text-slate-400">Total Score</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {results.total_score}
                    <span className="text-sm font-normal text-slate-400">
                      /{results.max_score}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs text-slate-400">Percentage</div>
                  <div className="text-2xl font-extrabold text-indigo-400 mt-1">
                    {results.percentage}%
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs text-slate-400">Solved</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {results.problems_solved}/{results.total_problems}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs text-slate-400">Attempted</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {results.problems_attempted}/{results.total_problems}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs text-slate-400">Test Case Accuracy</div>
                  <div className="text-2xl font-extrabold text-amber-400 mt-1">
                    {results.accuracy}%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {results.test_cases_passed}/{results.test_cases_total} passed
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs text-slate-400">Time Taken</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {mins}m {secs}s
                  </div>
                </div>
              </div>

              {/* Problem-wise Performance */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white">
                    Problem-Wise Performance
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3 text-left">Question</th>
                        <th className="px-4 py-3 text-left">Type / Diff</th>
                        <th className="px-4 py-3 text-left">Language</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Cases Passed</th>
                        <th className="px-4 py-3 text-left">Score</th>
                        <th className="px-4 py-3 text-left">Runtime / Memory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {results.problem_wise_performance.map((row) => {
                        const expl = results.explanations?.[row.item_id]
                        return (
                          <tr key={row.item_id} className="hover:bg-slate-800/30 align-top">
                            <td className="px-4 py-3 font-semibold text-white">
                              <div>{row.title}</div>
                              {expl && (
                                <p className="text-[11px] font-normal text-slate-400 mt-1 max-w-md whitespace-pre-line">
                                  {expl}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300">
                              {row.question_type} • {row.difficulty}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-indigo-300">
                              {row.language ? LANGUAGE_LABELS[row.language] || row.language : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  row.status === "Accepted" || row.status === "Correct"
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : row.status === "Partial Accepted"
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-rose-500/15 text-rose-300"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                              {row.passed_test_cases}/{row.total_test_cases}
                            </td>
                            <td className="px-4 py-3 font-bold text-indigo-300">
                              {row.score}/{row.max_score}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {row.execution_time_ms} ms •{" "}
                              {row.memory_kb ? `${(row.memory_kb / 1024).toFixed(1)} MB` : "—"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Active HackerRank / Amazon-Style Assessment IDE
  const prob = currentQuestion?.problem
  const availableLanguages =
    prob?.supported_languages ||
    currentQuestion?.supported_languages ||
    ["python", "java", "c", "cpp", "javascript"]
  const isCodingQuestion = Boolean(prob)
  const isMarked =
    currentQuestion && questionStates[currentQuestion.item_id] === "marked_for_review"

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none sm:select-auto">
      {/* Top Assessment Header */}
      <header className="h-14 shrink-0 bg-slate-900 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/assessments")}
            title="Exit to Assessments Hub"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 p-0.5 flex items-center justify-center shrink-0">
              <img
                src={logoImg}
                alt="SkilTrix Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs flex items-center gap-2">
                <span className="hidden sm:inline text-indigo-400 font-extrabold">SkilTrix</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="truncate">{assessment?.title || "Coding Assessment"}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Save className="w-3 h-3 text-emerald-400" />
                  {savingDraft
                    ? "Saving..."
                    : lastSavedAt
                    ? `Saved ${lastSavedAt}`
                    : "Autosave On"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${
              remainingSeconds <= 300
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse"
                : remainingSeconds <= 600
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-slate-800 border-slate-700 text-emerald-300"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => (isFullscreen ? exitFullscreen() : enterFullscreen())}
            title="Toggle Fullscreen"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Finish Test
          </button>
        </div>
      </header>

      {proctoringAlert && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            {proctoringAlert}
          </span>
          <button
            onClick={() => setProctoringAlert(null)}
            className="text-amber-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Question Navigation + 5-State Status Palette Strip */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {questions.map((q, idx) => {
            const st = questionStates[q.item_id] || "not_visited"
            const active = idx === currentIdx
            return (
              <button
                key={q.item_id}
                onClick={() => switchQuestion(idx)}
                title={`${q.title} — ${PALETTE_STYLES[st].label}`}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  PALETTE_STYLES[st].cls
                } ${active ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900" : ""}`}
              >
                <span>Q{idx + 1}</span>
                {st === "submitted" && <CheckCircle2 className="w-3 h-3" />}
                {st === "marked_for_review" && <Flag className="w-3 h-3" />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-400 mr-2">
            <span>Submitted: {paletteSummary.submitted}</span>
            <span>Attempted: {paletteSummary.attempted}</span>
            <span>Review: {paletteSummary.marked_for_review}</span>
          </div>
          {currentQuestion && (
            <button
              onClick={handleToggleMarkForReview}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                isMarked
                  ? "bg-purple-600 text-white border-purple-500"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isMarked ? "Marked for Review" : "Mark for Review"}
            </button>
          )}
          <button
            disabled={currentIdx === 0}
            onClick={() => switchQuestion(currentIdx - 1)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={currentIdx >= questions.length - 1}
            onClick={() => switchQuestion(currentIdx + 1)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      {!currentQuestion ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
          No questions configured in this assessment yet.
        </div>
      ) : isCodingQuestion && prob ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Left Panel: Problem / Issue Description */}
          <div
            className={`w-full ${
              isDjangoProject && currentQuestion.codelab_project_id
                ? "lg:w-[29%]"
                : "lg:w-[44%]"
            } border-b lg:border-b-0 lg:border-r border-slate-800 lg:overflow-y-auto p-5 space-y-5 bg-slate-950`}
          >
            {isDjangoProject && (
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Question Description
              </div>
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      prob.difficulty === "Easy"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : prob.difficulty === "Medium"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300">
                    {currentQuestion.marks} Marks
                  </span>
                  {currentQuestion.section_title && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
                      {currentQuestion.section_title}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Time Limit: {prob.time_limit_seconds}s</span>
                  <span>Memory: {prob.memory_limit_mb} MB</span>
                </div>
              </div>
              <h1 className="text-xl font-extrabold text-white">{prob.title}</h1>
              {prob.topics && prob.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {prob.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="prose prose-invert prose-sm max-w-none text-slate-200 whitespace-pre-line leading-relaxed">
              {prob.description}
            </div>

            {prob.input_format && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Input Format
                </h3>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {prob.input_format}
                </p>
              </div>
            )}

            {prob.output_format && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Output Format
                </h3>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {prob.output_format}
                </p>
              </div>
            )}

            {prob.constraints && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Constraints
                </h3>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                  {prob.constraints}
                </pre>
              </div>
            )}

            {/* Sample / Public Test Cases or Django Evaluation Summary */}
            {isDjangoProject ? (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Evaluation Rules
                  </h3>
                  {prob.hidden_test_count > 0 && (
                    <span className="text-[11px] text-amber-300 font-semibold">
                      + {prob.hidden_test_count} Hidden Suite(s)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Use <strong>Run Server</strong> in CodeLab to preview and reproduce the issue on the live Django server, and click <strong>Run Tests</strong> to verify against locked <code className="text-indigo-300">posts/tests.py</code> before submitting.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Sample Test Cases ({prob.public_test_cases.length})
                  </h3>
                  {prob.hidden_test_count > 0 && (
                    <span className="text-[11px] text-slate-400">
                      + {prob.hidden_test_count} Hidden Judge Cases
                    </span>
                  )}
                </div>

                {prob.public_test_cases.map((tc, idx) => (
                  <div
                    key={tc.test_case_id || idx}
                    className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Example {idx + 1}</span>
                      <button
                        onClick={() => {
                          setUseCustomInput(true)
                          setCustomInput(tc.input_data)
                          setConsoleTab("custom_input")
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                      >
                        <Copy className="w-3 h-3" />
                        Load into Custom Input
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] text-slate-400 mb-1">Input</div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                          {tc.input_data || "(empty)"}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 mb-1">Expected Output</div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                          {tc.expected_output}
                        </pre>
                      </div>
                    </div>
                    {tc.explanation && (
                      <div className="text-xs text-slate-400 pt-1">
                        <span className="font-semibold text-slate-300">Explanation: </span>
                        {tc.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Real CodeLab IDE (for Django projects) or Code Editor + Test Console */}
          {isDjangoProject && currentQuestion.codelab_project_id ? (
            <div className="w-full lg:w-[71%] flex flex-col min-h-[600px] lg:min-h-0 overflow-hidden bg-[#11111b]">
              <AssessmentCodeLabWorkspace
                key={currentQuestion.codelab_project_id}
                projectId={currentQuestion.codelab_project_id}
                projectTitle={prob.title}
                lockedPaths={currentQuestion.locked_paths || []}
                starterFiles={prob.project_files || {}}
                runningTests={runningCode}
                submittingSolution={submittingProblem}
                runOutcome={runOutcome}
                submitOutcome={submitOutcome}
                execError={execError}
                onRunTests={(overrides) => handleRunCode(overrides)}
                onSubmitSolution={(overrides) => handleSubmitProblem(overrides)}
                onResetWorkspace={async () => {
                  if (!assessmentId) return
                  await resetCodingAssessmentCodelab(assessmentId, {
                    attempt_id: attemptId,
                    item_id: currentQuestion.item_id,
                    problem_id: prob.problem_id,
                  })
                  handleResetCode()
                }}
                onFilesSnapshot={(filesMap) => {
                  const qid = currentQuestion.item_id
                  setCodingDrafts((prev) => ({
                    ...prev,
                    [qid]: {
                      language: "django",
                      code: filesMap["posts/views.py"] ?? prev[qid]?.code ?? "",
                      problem_id: prob.problem_id,
                      files: { ...currentProjectFiles, ...filesMap },
                    },
                  }))
                }}
              />
            </div>
          ) : (
          <div className="w-full lg:w-[56%] flex flex-col min-h-[520px] lg:min-h-0 lg:overflow-hidden bg-slate-950">
            {/* Editor Toolbar */}
            <div className="h-11 shrink-0 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
                {isDjangoProject ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 rounded-lg px-2.5 py-1 whitespace-nowrap">
                      Django Project (manage.py test)
                    </span>
                    {currentActiveFile && (
                      <span className="hidden sm:inline text-xs font-mono text-slate-300 truncate">
                        {currentActiveFile}
                      </span>
                    )}
                  </div>
                ) : (
                  <select
                    value={currentLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {LANGUAGE_LABELS[lang] || lang}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleResetCode}
                  title={isDjangoProject ? "Reset all Django project files to starter state" : "Reset editor to starter template"}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isDjangoProject ? "Reset Project" : "Reset Code"}
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={runningCode || submittingProblem}
                  onClick={() => void handleRunCode()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  {runningCode
                    ? isDjangoProject
                      ? "Testing..."
                      : "Running..."
                    : isDjangoProject
                    ? "Run manage.py test"
                    : "Run Code"}
                </button>
                <button
                  disabled={runningCode || submittingProblem}
                  onClick={() => void handleSubmitProblem()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingProblem ? "Judging..." : "Submit Code"}
                </button>
              </div>
            </div>

            {/* Code Editor (+ Multi-File Tree for Django Projects) */}
            <div className="flex-1 min-h-[240px] overflow-hidden flex">
              {isDjangoProject && (
                <div className="w-48 sm:w-56 shrink-0 bg-slate-900/70 border-r border-slate-800 flex flex-col overflow-y-auto">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Project Files
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {sortedProjectFileKeys.map((filePath) => {
                      const active = currentActiveFile === filePath
                      const isTestFile = filePath.endsWith("tests.py")
                      return (
                        <button
                          key={filePath}
                          type="button"
                          onClick={() =>
                            currentQuestion &&
                            setActiveFileMap((prev) => ({
                              ...prev,
                              [currentQuestion.item_id]: filePath,
                            }))
                          }
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between gap-1.5 transition ${
                            active
                              ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40"
                              : "text-slate-300 hover:bg-slate-800/80 border border-transparent"
                          }`}
                        >
                          <span className="truncate">{filePath}</span>
                          {isTestFile && (
                            <span className="shrink-0 px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-sans font-bold">
                              tests
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0 overflow-hidden">
                <CodeEditor
                  code={currentCode}
                  onChange={handleCodeChange}
                  language={MONACO_LANGUAGE_MAP[currentLang] || currentLang}
                  fontSize="sm"
                  onRun={() => void handleRunCode()}
                />
              </div>
            </div>

            {/* Bottom Execution & Test Case Console */}
            <div className="h-[230px] shrink-0 bg-slate-900 border-t border-slate-800 flex flex-col">
              <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setConsoleTab("test_cases")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      consoleTab === "test_cases"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Test Results
                  </button>
                  {!isDjangoProject && (
                    <button
                      onClick={() => setConsoleTab("custom_input")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        consoleTab === "custom_input"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Custom Input (stdin)
                    </button>
                  )}
                  <button
                    onClick={() => setConsoleTab("console")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      consoleTab === "console"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Output &amp; Errors
                  </button>
                </div>

                {/* Live Verdict Metrics */}
                {(submitOutcome || runOutcome) && (
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`font-bold ${
                        (submitOutcome?.status || runOutcome?.status) === "Accepted" ||
                        runOutcome?.status === "Executed"
                          ? "text-emerald-400"
                          : (submitOutcome?.status || runOutcome?.status) ===
                            "Partial Accepted"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {submitOutcome?.status || runOutcome?.status}
                    </span>
                    {submitOutcome && (
                      <span className="text-indigo-300 font-semibold">
                        {submitOutcome.passed_test_cases}/{submitOutcome.total_test_cases}{" "}
                        Passed • {submitOutcome.score}/{submitOutcome.max_score} pts
                      </span>
                    )}
                    <span className="text-slate-400 font-mono">
                      {submitOutcome?.execution_time_ms ?? runOutcome?.execution_time_ms} ms
                    </span>
                    <span className="text-slate-400 font-mono">
                      {submitOutcome?.memory_used_kb ?? runOutcome?.memory_kb} KB
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 text-xs">
                {consoleTab === "custom_input" && !isDjangoProject ? (
                  <div className="space-y-2 h-full flex flex-col">
                    <label className="flex items-center gap-2 text-slate-300 font-medium">
                      <input
                        type="checkbox"
                        checked={useCustomInput}
                        onChange={(e) => setUseCustomInput(e.target.checked)}
                      />
                      Use custom stdin when clicking Run Code
                    </label>
                    <textarea
                      value={customInput}
                      onChange={(e) => {
                        setCustomInput(e.target.value)
                        if (!useCustomInput) setUseCustomInput(true)
                      }}
                      placeholder="Enter custom test input here..."
                      className="flex-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                ) : consoleTab === "console" ? (
                  <div className="space-y-2 font-mono">
                    {execError && (
                      <pre className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 whitespace-pre-wrap">
                        {execError}
                      </pre>
                    )}
                    {(submitOutcome?.compile_output || runOutcome?.compile_output) && (
                      <div>
                        <div className="text-amber-300 font-semibold mb-1">
                          Compilation Error:
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-200 whitespace-pre-wrap">
                          {submitOutcome?.compile_output || runOutcome?.compile_output}
                        </pre>
                      </div>
                    )}
                    {(submitOutcome?.error_message || runOutcome?.stderr) &&
                      !(submitOutcome?.compile_output || runOutcome?.compile_output) && (
                        <div>
                          <div className="text-rose-300 font-semibold mb-1">
                            Runtime / Stderr:
                          </div>
                          <pre className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/30 text-rose-200 whitespace-pre-wrap">
                            {submitOutcome?.error_message || runOutcome?.stderr}
                          </pre>
                        </div>
                      )}
                    {runOutcome?.stdout && (
                      <div>
                        <div className="text-slate-400 font-semibold mb-1">Stdout:</div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 whitespace-pre-wrap">
                          {runOutcome.stdout}
                        </pre>
                      </div>
                    )}
                    {!execError && !submitOutcome && !runOutcome && (
                      <div className="text-slate-500">
                        Click Run Code or Submit Code to view console output.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submitOutcome ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {submitOutcome.test_case_results.map((tc) => (
                          <div
                            key={tc.case_number}
                            className={`rounded-lg border p-2.5 ${
                              tc.passed
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-rose-500/10 border-rose-500/30"
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold gap-2">
                              <span className="truncate">
                                {tc.is_hidden
                                  ? `Case #${tc.case_number} (Hidden)`
                                  : tc.name
                                  ? tc.name
                                  : `Case #${tc.case_number} (Sample)`}
                              </span>
                              <span
                                className={tc.passed ? "text-emerald-300 shrink-0" : "text-rose-300 shrink-0"}
                              >
                                {tc.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {tc.execution_time_ms} ms • {tc.memory_kb} KB
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : runOutcome ? (
                      <div className="space-y-2">
                        {runOutcome.test_case_results.map((tc) => (
                          <div
                            key={tc.case_number}
                            className={`rounded-lg bg-slate-950 border p-2.5 space-y-1.5 ${
                              isDjangoProject
                                ? tc.passed
                                  ? "border-emerald-500/30"
                                  : "border-rose-500/30"
                                : "border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span>
                                {tc.name || `Sample Case #${tc.case_number}`}
                              </span>
                              <span
                                className={tc.passed ? "text-emerald-400" : "text-rose-400"}
                              >
                                {tc.status} ({tc.execution_time_ms} ms)
                              </span>
                            </div>
                            {!isDjangoProject && (
                              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                                <div>
                                  <div className="text-slate-500">Input</div>
                                  <pre className="text-slate-300 whitespace-pre-wrap">
                                    {tc.input || "(empty)"}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-slate-500">Your Output</div>
                                  <pre className="text-slate-200 whitespace-pre-wrap">
                                    {tc.actual_output || tc.stderr || "(empty)"}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-slate-500">Expected</div>
                                  <pre className="text-emerald-300 whitespace-pre-wrap">
                                    {tc.expected_output ?? "—"}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {isDjangoProject && !runOutcome.passed && runOutcome.stdout && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setConsoleTab("console")}
                              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                            >
                              View full manage.py test traceback in Output &amp; Errors
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-500 flex items-center gap-2 py-4">
                        <Terminal className="w-4 h-4" />
                        Run your code against sample tests or submit to judge all hidden test
                        cases.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      ) : (
        /* Objective / Technical / MCQ Question Panel */
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
                  {currentQuestion.question_type}
                </span>
                <span className="text-xs text-slate-400">
                  {currentQuestion.difficulty} • {currentQuestion.marks} Marks
                </span>
              </div>
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </div>

            <h2 className="text-lg font-bold text-white">{currentQuestion.title}</h2>
            <p className="text-sm text-slate-200 whitespace-pre-line">
              {currentQuestion.prompt}
            </p>
            {currentQuestion.buggy_code && (
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto">
                {currentQuestion.buggy_code}
              </pre>
            )}

            <div className="space-y-2.5">
              {(currentQuestion.options || []).map((opt, idx) => {
                const value =
                  typeof opt === "string"
                    ? opt
                    : String(opt.id ?? opt.value ?? opt.text ?? idx)
                const label =
                  typeof opt === "string"
                    ? opt
                    : String(opt.text ?? opt.label ?? opt.value ?? opt.id)
                const isMulti = currentQuestion.question_type === "mcq_multi"
                const sel = selectedAnswers[currentQuestion.item_id]
                const checked = Array.isArray(sel)
                  ? sel.includes(value)
                  : sel === value

                return (
                  <button
                    key={value}
                    onClick={() => handleSelectMcqOption(value, isMulti)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      checked
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        checked
                          ? "bg-indigo-600 border-indigo-400 text-white"
                          : "border-slate-600 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <Cpu className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  Confirm Final Assessment Submission
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Once submitted, you cannot edit answers or resubmit code for this attempt.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                <div className="text-emerald-300 font-bold text-base">
                  {paletteSummary.submitted}
                </div>
                <div className="text-slate-300">Submitted</div>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                <div className="text-amber-300 font-bold text-base">
                  {paletteSummary.attempted}
                </div>
                <div className="text-slate-300">Drafts / Attempted</div>
              </div>
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3">
                <div className="text-purple-300 font-bold text-base">
                  {paletteSummary.marked_for_review}
                </div>
                <div className="text-slate-300">Marked for Review</div>
              </div>
              <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
                <div className="text-slate-200 font-bold text-base">
                  {paletteSummary.not_attempted + paletteSummary.not_visited}
                </div>
                <div className="text-slate-400">Unattempted</div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Continue Test
              </button>
              <button
                onClick={() => handleFinalizeAssessment(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white"
              >
                Submit Assessment Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
