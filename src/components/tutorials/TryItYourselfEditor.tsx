import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Terminal,
  CheckCircle2,
  XCircle,
  Code2,
  Eye,
} from "lucide-react"
import CodeEditor from "../CodeEditor"
import { executeTutorialCode } from "../../api/tutorialsApi"

interface TryItYourselfEditorProps {
  initialCode: string
  language: string
  taskTitle?: string
  taskDescription?: string
  expectedOutput?: string
  solutionCode?: string
  hints?: string[]
  validationType?: "output_match" | "contains_text" | "regex"
  trackSlug?: string
  lessonSlug?: string
  showSandboxLink?: boolean
  className?: string
}

export default function TryItYourselfEditor({
  initialCode,
  language,
  taskTitle = "Try It Yourself",
  taskDescription,
  expectedOutput,
  solutionCode,
  hints = [],
  validationType = "output_match",
  trackSlug,
  lessonSlug,
  showSandboxLink = true,
  className = "",
}: TryItYourselfEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [isCopied, setIsCopied] = useState(false)
  const [stdin, setStdin] = useState("")
  const [showStdin, setShowStdin] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    tested: boolean
    passed: boolean
    message: string
  }>({ tested: false, passed: false, message: "" })
  const [activeTab, setActiveTab] = useState<"editor" | "output">("editor")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isWebHtml = language.toLowerCase() === "html" || language.toLowerCase() === "css"

  // Reset code when initialCode changes (e.g. changing lesson)
  useEffect(() => {
    setCode(initialCode)
    setOutput("")
    setStatus("idle")
    setValidationResult({ tested: false, passed: false, message: "" })
    setShowSolution(false)
  }, [initialCode, language])

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput("")
    setStatus("idle")
    setValidationResult({ tested: false, passed: false, message: "" })
  }

  const handleRun = async () => {
    setIsRunning(true)
    setStatus("running")
    setOutput("Executing program...")

    try {
      const res = await executeTutorialCode(language, code, stdin)
      setOutput(res.output)
      setStatus(res.success ? "success" : "error")

      // Validate against expected output if available
      if (expectedOutput) {
        const cleanActual = res.output.trim().replace(/\r\n/g, "\n")
        const cleanExpected = expectedOutput.trim().replace(/\r\n/g, "\n")

        let passed = false
        if (validationType === "contains_text") {
          passed = cleanActual.toLowerCase().includes(cleanExpected.toLowerCase())
        } else if (validationType === "regex") {
          try {
            const rx = new RegExp(cleanExpected, "i")
            passed = rx.test(cleanActual)
          } catch {
            passed = cleanActual === cleanExpected
          }
        } else {
          // Output match
          passed = cleanActual === cleanExpected
        }

        setValidationResult({
          tested: true,
          passed,
          message: passed
            ? "Excellent! Your output matches the target requirement."
            : `Expected output: "${cleanExpected}". Got: "${cleanActual}"`,
        })
      }
    } catch (err: any) {
      setOutput(`Execution error: ${err.message || String(err)}`)
      setStatus("error")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all ${className}`}
    >
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {taskTitle}
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {language}
              </span>
            </h4>
            {taskDescription && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{taskDescription}</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hints.length > 0 && (
            <button
              onClick={() => setShowHints(!showHints)}
              className="px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors flex items-center gap-1"
              title="Show Hints"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hint</span>
            </button>
          )}

          {solutionCode && (
            <button
              onClick={() => {
                setShowSolution(!showSolution)
                if (!showSolution) setCode(solutionCode)
              }}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showSolution ? "Hide Solution" : "Solution"}</span>
            </button>
          )}

          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              showStdin
                ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Custom Stdin"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Input</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Copy Code"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {showSandboxLink && trackSlug && lessonSlug && (
            <Link
              to={`/tutorials/${trackSlug}/${lessonSlug}/try`}
              className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors flex items-center gap-1"
              title="Open Fullscreen Try It Yourself Editor"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Try it Yourself</span>
            </Link>
          )}

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : "fill-current"}`} />
            <span>{isRunning ? "Running…" : "Run Code"}</span>
          </button>
        </div>
      </div>

      {/* Hints Banner */}
      {showHints && hints.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-800/40 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <ul className="list-disc pl-4 space-y-1">
            {hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom Stdin Box */}
      {showStdin && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Standard Input (stdin):
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={2}
            placeholder="Pass inputs if your program prompts for user inputs..."
            className="w-full text-xs font-mono p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Editor & Output Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Left Side: Code Editor */}
        <div className="min-h-[240px] max-h-[380px] overflow-auto flex flex-col bg-white dark:bg-slate-950">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            fontSize="sm"
            className="min-h-[220px]"
          />
        </div>

        {/* Right Side: Output / Preview */}
        <div className="flex flex-col bg-slate-900 text-slate-100 min-h-[240px] max-h-[380px]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              {isWebHtml ? "Live Render Preview" : "Console Output"}
            </span>
            <div className="flex items-center gap-2">
              {status === "running" && <span className="text-amber-400 animate-pulse">Running…</span>}
              {status === "success" && <span className="text-emerald-400">Exited 0</span>}
              {status === "error" && <span className="text-rose-400">Exited with Error</span>}
            </div>
          </div>

          <div className="p-3 font-mono text-xs overflow-auto flex-1 select-text">
            {isWebHtml ? (
              <iframe
                title="HTML Preview"
                srcDoc={code}
                sandbox="allow-scripts"
                className="w-full h-full min-h-[200px] bg-white rounded-md border-0"
              />
            ) : output ? (
              <pre className="whitespace-pre-wrap font-mono leading-relaxed text-slate-200">{output}</pre>
            ) : (
              <div className="text-slate-500 italic py-6 text-center">
                Click "Run Code" above to execute and view output.
              </div>
            )}
          </div>

          {/* Test Validation Notification */}
          {validationResult.tested && (
            <div
              className={`px-3 py-2 border-t text-xs flex items-center gap-2 ${
                validationResult.passed
                  ? "bg-emerald-950/70 border-emerald-800 text-emerald-200"
                  : "bg-rose-950/70 border-rose-800 text-rose-200"
              }`}
            >
              {validationResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-sans">{validationResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

