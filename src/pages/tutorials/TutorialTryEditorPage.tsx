import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Code2,
  Share2,
} from "lucide-react"
import CodeEditor from "../../components/CodeEditor"
import { TUTORIAL_TRACKS } from "../../data/tutorialsCatalog"
import { executeTutorialCode } from "../../api/tutorialsApi"
import logoImg from "../../assets/logo.png"

export default function TutorialTryEditorPage() {
  const { trackSlug, lessonSlug } = useParams<{ trackSlug?: string; lessonSlug?: string }>()

  const track = TUTORIAL_TRACKS.find((t) => t.id.toLowerCase() === (trackSlug || "").toLowerCase()) || TUTORIAL_TRACKS[0]
  
  // Find matching lesson
  let targetLesson = track.modules[0]?.lessons[0]
  if (lessonSlug) {
    for (const m of track.modules) {
      const match = m.lessons.find((l) => l.slug.toLowerCase() === lessonSlug.toLowerCase())
      if (match) {
        targetLesson = match
        break
      }
    }
  }

  const [code, setCode] = useState(targetLesson?.tryItYourself?.initialCode || "// Write your code here\n")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [stdin, setStdin] = useState("")
  const [showStdin, setShowStdin] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    tested: boolean
    passed: boolean
    message: string
  }>({ tested: false, passed: false, message: "" })

  const isWebHtml = track.id.toLowerCase() === "html" || track.id.toLowerCase() === "css"

  useEffect(() => {
    if (targetLesson?.tryItYourself?.initialCode) {
      setCode(targetLesson.tryItYourself.initialCode)
    }
  }, [targetLesson])

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleReset = () => {
    if (targetLesson?.tryItYourself?.initialCode) {
      setCode(targetLesson.tryItYourself.initialCode)
    }
    setOutput("")
    setValidationResult({ tested: false, passed: false, message: "" })
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput("Executing...")
    try {
      const res = await executeTutorialCode(track.id, code, stdin)
      setOutput(res.output)

      if (targetLesson?.tryItYourself?.expectedOutput) {
        const cleanActual = res.output.trim().replace(/\r\n/g, "\n")
        const cleanExpected = targetLesson.tryItYourself.expectedOutput.trim().replace(/\r\n/g, "\n")
        const passed = cleanActual === cleanExpected
        setValidationResult({
          tested: true,
          passed,
          message: passed
            ? "Exercise solved! Target output matched."
            : `Expected "${cleanExpected}", but received "${cleanActual}".`,
        })
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message || String(err)}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/tutorials/${track.id}/${targetLesson?.slug || ""}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex items-center gap-1.5 text-xs transition-colors"
            title="Return to lesson"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Tutorial</span>
          </Link>

          <div className="h-5 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 p-1 flex items-center justify-center">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm hidden md:inline">SkilTrix TryIt Editor</span>
            <span className="text-xs text-slate-400 font-mono">
              — {targetLesson?.title || track.title}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              showStdin ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stdin</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-xs"
            title="Copy code"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-xs"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : "fill-current"}`} />
            <span>{isRunning ? "Running…" : "Run Code"}</span>
          </button>
        </div>
      </header>

      {/* Optional Stdin strip */}
      {showStdin && (
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-slate-400 shrink-0">Stdin:</span>
          <input
            type="text"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Pass standard input inputs separated by newline..."
            className="w-full text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 focus:outline-hidden"
          />
        </div>
      )}

      {/* Main Split Body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 min-h-0">
        {/* Left Half: Code Editor */}
        <div className="flex flex-col bg-slate-950 overflow-hidden h-full">
          <div className="h-9 px-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
            <span className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              main.{track.id === "python" ? "py" : track.id === "javascript" ? "js" : track.id}
            </span>
            <span className="text-[10px] uppercase">{track.title}</span>
          </div>

          <div className="flex-1 overflow-auto">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={track.id}
              fontSize="sm"
              className="h-full"
            />
          </div>
        </div>

        {/* Right Half: Output Console */}
        <div className="flex flex-col bg-slate-900/80 overflow-hidden h-full">
          <div className="h-9 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              {isWebHtml ? "Rendered Result" : "Output Terminal"}
            </span>
            <button
              onClick={() => setOutput("")}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-auto select-text">
            {isWebHtml ? (
              <iframe
                title="Preview"
                srcDoc={code}
                sandbox="allow-scripts"
                className="w-full h-full bg-white rounded-lg border-0"
              />
            ) : output ? (
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-100">{output}</pre>
            ) : (
              <div className="text-slate-500 italic py-12 text-center">
                Click "Run Code" in the top bar to execute program and view console stream.
              </div>
            )}
          </div>

          {/* Validation Status Footer */}
          {validationResult.tested && (
            <div
              className={`p-3 border-t text-xs flex items-center gap-2 shrink-0 ${
                validationResult.passed
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-200"
                  : "bg-rose-950/60 border-rose-800 text-rose-200"
              }`}
            >
              {validationResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{validationResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

