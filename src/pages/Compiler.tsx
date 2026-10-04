import { useState, useCallback, useEffect } from "react"
import CodeEditor from "../components/CodeEditor"
import SyntaxComparisonModal from "../components/SyntaxComparisonModal"
import { TechIcon } from "../components/TechIcons"
import api from "../api/client"
import { parseCompilerDiagnostics, type SourceDiagnostic } from "../api/diagnostics"
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Lightbulb,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import logoImg from "../assets/logo.png"

export interface LanguageDef {
  id: string
  label: string
  filename: string
}
interface ApiLanguage { language_id: string; name: string }
interface ApiSnippet {
  snippet_id: string
  language: string
  title: string
  code: string
  stdin?: string
  stdout?: string
}
interface ApiSyntax {
  entry_id: string
  topic: string
  category: string
  notes?: string
  python_code?: string
  java_code?: string
  cpp_code?: string
  c_code?: string
  javascript_code?: string
}
interface SyntaxTopic {
  id: string
  title: string
  description: string
  snippets: Record<string, { code: string; notes: string }>
}
const EXTENSIONS: Record<string, string> = {
  python: "py", java: "java", cpp: "cpp", c: "c", javascript: "js",
  typescript: "ts", sql: "sql", html: "html", css: "css", go: "go",
  rust: "rs", php: "php", ruby: "rb", csharp: "cs",
}
const DEFAULT_CODE: Record<string, string> = {
  python: 'print("Hello from SkillTrix!")\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from SkillTrix!");\n    }\n}\n',
  cpp: '#include <iostream>\nint main() {\n    std::cout << "Hello from SkillTrix!" << std::endl;\n    return 0;\n}\n',
  c: '#include <stdio.h>\nint main(void) {\n    printf("Hello from SkillTrix!\\n");\n    return 0;\n}\n',
  javascript: 'console.log("Hello from SkillTrix!");\n',
  sql: "SELECT 'Hello from SkillTrix!' AS message;\n",
  html: '<!doctype html>\n<html><head><meta charset="utf-8"><title>SkillTrix preview</title></head><body><h1>Hello from SkillTrix!</h1></body></html>\n',
}
const getStarterCode = (language: string, snippets: ApiSnippet[], topics: SyntaxTopic[]) =>
  snippets.find((snippet) => normalize(snippet.language) === language)?.code ||
  DEFAULT_CODE[language] ||
  topics.find((topic) => topic.snippets[language])?.snippets[language].code || ""
const asList = <T,>(data: unknown): T[] =>
  Array.isArray(data) ? data as T[] : ((data as { results?: T[] })?.results ?? [])
const normalize = (value: string) => {
  const compact = value.toLowerCase().replace(/[^a-z0-9+#]/g, "")
  const aliases: Record<string, string> = {
    "c++": "cpp", cxx: "cpp", "c#": "csharp", js: "javascript",
    node: "javascript", nodejs: "javascript", py: "python", python3: "python",
    python37: "python", python38: "python", python39: "python", python310: "python",
    python311: "python", python312: "python", python313: "python", java17: "java",
    cpp20: "cpp", "c++20": "cpp", htmlcss: "html", html5: "html", sqlite: "sql", sqlite3: "sql",
    postgresql: "sql", mysql: "sql",
  }
  return aliases[compact] || compact
}
const toLanguage = (item: ApiLanguage): LanguageDef => {
  // language_id is a database key (often a generated identifier), not the runner's language name.
  const id = normalize(item.name || item.language_id)
  const ext = EXTENSIONS[id] || id
  const filename = id === "java" ? "Main.java" : id === "html" ? "index.html" : id === "sql" ? "query.sql" : `main.${ext}`
  return { id, label: item.name, filename }
}

export default function Compiler() {
  const [languages, setLanguages] = useState<LanguageDef[]>([])
  const [snippets, setSnippets] = useState<ApiSnippet[]>([])
  const [syntaxTopics, setSyntaxTopics] = useState<SyntaxTopic[]>([])
  const [loadError, setLoadError] = useState("")
  const [lang, setLang] = useState("")
  const [code, setCode] = useState("")
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>({})
  const [output, setOutput] = useState("")
  const [status, setStatus] =
    useState<"idle" | "running" | "success" | "error">("idle")
  const [input, setInput] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [fontSize, setFontSize] = useState<"xs" | "sm" | "base" | "lg">("sm")
  const [copied, setCopied] = useState(false)
  const [showSyntaxModal, setShowSyntaxModal] = useState(false)
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol, setCursorCol] = useState(1)
  const [activeOutputTab, setActiveOutputTab] = useState<"console" | "preview">(
    "console",
  )
  const [compilerDiagnostics, setCompilerDiagnostics] = useState<SourceDiagnostic[]>([])
  const [diagnosticTarget, setDiagnosticTarget] = useState<{ line: number; column: number } | null>(null)

  const currentLang = languages.find((l) => l.id === lang) || languages[0]

  useEffect(() => {
    let alive = true
    Promise.all([api.get("/languages/"), api.get("/snippets/"), api.get("/syntax/")])
      .then(([languageResponse, snippetResponse, syntaxResponse]) => {
        if (!alive) return
        const loadedLanguages = asList<ApiLanguage>(languageResponse.data).map(toLanguage)
        const loadedSnippets = asList<ApiSnippet>(snippetResponse.data)
        const loadedSyntax = asList<ApiSyntax>(syntaxResponse.data).map((entry) => {
          const fields: Record<string, string | undefined> = {
            python: entry.python_code, java: entry.java_code, cpp: entry.cpp_code,
            c: entry.c_code, javascript: entry.javascript_code,
          }
          const snippets = Object.fromEntries(Object.entries(fields)
            .filter(([, value]) => Boolean(value))
            .map(([key, value]) => [key, { code: value || "", notes: entry.notes || "" }]))
          return { id: entry.entry_id, title: entry.topic, description: entry.category, snippets }
        })
        setLanguages(loadedLanguages)
        setSnippets(loadedSnippets)
        setSyntaxTopics(loadedSyntax)
        if (loadedLanguages.length) {
          const initial = loadedLanguages[0]
          const initialBuffers = Object.fromEntries(loadedLanguages.map((item) => [
            item.id,
            getStarterCode(item.id, loadedSnippets, loadedSyntax),
          ]))
          setLang(initial.id)
          setCodeByLanguage(initialBuffers)
          setCode(initialBuffers[initial.id] || "")
        } else {
          setLoadError("No active compiler languages are available from the API.")
        }
      })
      .catch(() => alive && setLoadError("Could not load compiler languages and examples. Check the API connection and try refreshing."))
    return () => { alive = false }
  }, [])

  const handleLangChange = (l: string) => {
    const nextCode = codeByLanguage[l] ?? getStarterCode(l, snippets, syntaxTopics)
    setCodeByLanguage((buffers) => ({ ...buffers, [lang]: code, [l]: nextCode }))
    setLang(l)
    setCode(nextCode)
    setOutput("")
    setCompilerDiagnostics([])
    setStatus("idle")
    if (l === "html" || l === "css") {
      setActiveOutputTab("preview")
    } else {
      setActiveOutputTab("console")
    }
  }

  const handleLoadCodeFromModal = useCallback(
    (newCode: string, newLang: string) => {
      setCodeByLanguage((buffers) => ({ ...buffers, [lang]: code, [newLang]: newCode }))
      setLang(newLang)
      setCode(newCode)
      setOutput("")
      setCompilerDiagnostics([])
      setStatus("idle")
      setActiveOutputTab("console")
    },
    [code, lang],
  )

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode)
    setCompilerDiagnostics([])
    setCodeByLanguage((buffers) => ({ ...buffers, [lang]: nextCode }))
  }

  const runCode = async () => {
    if (lang === "html" || lang === "css") {
      setStatus("success")
      setOutput("HTML/CSS preview updated locally.")
      setActiveOutputTab("preview")
      return
    }
    if (!code.trim()) {
      setStatus("error")
      setOutput("Enter code before running it.")
      return
    }
    setStatus("running")
    setOutput("")
    setCompilerDiagnostics([])
    try {
      const { data } = await api.post("/actions/execute-code/", { language: currentLang.label, code, stdin: input })
      setStatus(data.success ? "success" : "error")
      const resultOutput = data.output || "Program completed with no output."
      setCompilerDiagnostics(parseCompilerDiagnostics(resultOutput, currentLang.filename))
      if (!data.success && /EOFError|NoSuchElementException|end of input|no line found|unexpected end of input/i.test(resultOutput)) {
        setShowInput(true)
        setOutput(`This program requested standard input, but the stdin box was empty. Enter the input your program expects and run it again.\n\n${resultOutput}`)
      } else {
        setOutput(resultOutput)
      }
    } catch (error: any) {
      setStatus("error")
      setOutput(error?.response?.data?.detail || "Could not run this program. Check your API connection and try again.")
    }
  }

  const reset = () => {
    const starterCode = getStarterCode(lang, snippets, syntaxTopics)
    setCode(starterCode)
    setCodeByLanguage((buffers) => ({ ...buffers, [lang]: starterCode }))
    setOutput("")
    setCompilerDiagnostics([])
    setStatus("idle")
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusColor = {
    idle: "text-slate-400",
    running: "text-amber-500",
    success: "text-green-500",
    error: "text-red-500",
  }
  const statusText = {
    idle: "Ready",
    running: "Running...",
    success: "Success",
    error: "Error",
  }
  const htmlSource = lang === "html" ? code : codeByLanguage.html ?? getStarterCode("html", snippets, syntaxTopics)
  const cssSource = lang === "css" ? code : codeByLanguage.css ?? ""
  const inlineStyle = cssSource
    ? `<style>${cssSource.replace(/<\/style/gi, "<\\/style")}</style>`
    : ""
  let linkedCssReplaced = false
  let previewMarkup = htmlSource.replace(/<link\b[^>]*>/gi, (linkTag) => {
    const href = linkTag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]
    if (inlineStyle && href && !/^(?:https?:|\/\/|data:)/i.test(href) && /\.css(?:[?#].*)?$/i.test(href)) {
      linkedCssReplaced = true
      return inlineStyle
    }
    return linkTag
  })
  if (inlineStyle && !linkedCssReplaced) {
    previewMarkup = /<head\b[^>]*>/i.test(previewMarkup)
      ? previewMarkup.replace(/<head\b[^>]*>/i, (head) => `${head}${inlineStyle}`)
      : `${inlineStyle}${previewMarkup}`
  }
  const previewPolicy = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: blob:; style-src \'unsafe-inline\' https:; script-src \'unsafe-inline\'; connect-src \'none\'; form-action \'none\'; base-uri \'none\'; object-src \'none\'">'
  const previewDocument = /<head\b[^>]*>/i.test(previewMarkup)
    ? previewMarkup.replace(/<head\b[^>]*>/i, (head) => `${head}${previewPolicy}`)
    : `${previewPolicy}${previewMarkup}`

  if (!currentLang) {
    return <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center p-6 text-center text-slate-300">{loadError || "Loading compiler languages…"}</div>
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-950">
      {/* Top Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex-wrap gap-y-2">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 p-0.5 flex items-center justify-center shadow-sm">
            <img src={logoImg} alt="SkilTrix Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-white font-semibold text-sm leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Skil<span className="text-indigo-400">Trix</span> Compiler
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              by Ascentracore Solutions
            </span>
          </div>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 overflow-x-auto border border-slate-700/50">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => handleLangChange(l.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                lang === l.id
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <TechIcon name={l.id} className="w-3.5 h-3.5" />
              {l.label}
            </button>
          ))}
        </div>

        {/* Syntax comparison launcher button */}
        <button
          onClick={() => setShowSyntaxModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/60 transition-colors shadow-sm"
          title="Compare syntax examples from the API"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Compare Syntax:</span>
          <span>Compare Syntax</span>
        </button>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Font Size controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/50 text-xs text-slate-300">
            <button
              onClick={() =>
                setFontSize((cur) =>
                  cur === "lg" ? "base" : cur === "base" ? "sm" : "xs",
                )
              }
              className="px-2 py-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="px-1.5 text-[11px] font-mono text-slate-400 uppercase">
              {fontSize}
            </span>
            <button
              onClick={() =>
                setFontSize((cur) =>
                  cur === "xs" ? "sm" : cur === "sm" ? "base" : "lg",
                )
              }
              className="px-2 py-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          <span
            className={`text-xs font-semibold flex items-center gap-1.5 ${statusColor[status]}`}
          >
            {status === "running" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {status === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
            {status === "error" && <AlertCircle className="w-3.5 h-3.5" />}
            {status === "idle" && <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />}
            {statusText[status]}
          </span>

          <button
            onClick={reset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/50"
            title="Reset code to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/50"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={runCode}
            disabled={status === "running"}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-green-500/20"
          >
            {status === "running" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>

        {snippets.some((snippet) => normalize(snippet.language) === lang) && (
          <select
            aria-label="Load saved code example"
            value={snippets.find((snippet) => normalize(snippet.language) === lang && snippet.code === code)?.snippet_id || ""}
            onChange={(event) => {
              const snippet = snippets.find((item) => item.snippet_id === event.target.value)
              if (snippet) {
                setCode(snippet.code)
                setCodeByLanguage((buffers) => ({ ...buffers, [lang]: snippet.code }))
                setOutput("")
                setStatus("idle")
              }
            }}
            className="max-w-48 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
          >
            <option value="">API examples</option>
            {snippets.filter((snippet) => normalize(snippet.language) === lang).map((snippet) => (
              <option key={snippet.snippet_id} value={snippet.snippet_id}>{snippet.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Language Syntax Highlight Info Banner */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
            <TechIcon name={currentLang.id} className="w-4 h-4" />
            <span>{currentLang.label}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">Loaded from compiler API</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[10px] text-slate-400 font-mono">
            Syntax Highlighting Active
          </span>
        </div>
      </div>

      {/* Main Workspace (Editor + Output) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Code Editor Column */}
        <div className="flex-1 flex flex-col border-r border-slate-800 overflow-hidden">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
              <TechIcon name={currentLang.id} className="w-4 h-4" />
              <span className="font-semibold text-slate-200">
                {currentLang.filename}
              </span>
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                Ln {cursorLine}, Col {cursorCol}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">
                {code.split("\n").length} lines
              </span>
              <span>•</span>
              <span>UTF-8</span>
            </div>
          </div>

          {/* Interactive Code Editor with real-time Syntax Highlighting */}
          <div className="flex-1 flex overflow-hidden bg-slate-950">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              language={lang}
              fontSize={fontSize}
              diagnostics={compilerDiagnostics}
              navigationTarget={diagnosticTarget}
              onCursorChange={(line, col) => {
                setCursorLine(line)
                setCursorCol(col)
              }}
            />
          </div>
        </div>

        {/* Output Panel Column */}
        <div
          className="lg:w-[440px] flex flex-col bg-slate-900 border-t lg:border-t-0 border-slate-800"
          style={{ minHeight: "240px" }}
        >
          {/* Output Header with Tab Toggles */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveOutputTab("console")}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeOutputTab === "console"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Output / Console
              </button>
              {(lang === "html" || lang === "css") && (
                <button
                  onClick={() => setActiveOutputTab("preview")}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeOutputTab === "preview"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInput(!showInput)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  showInput
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "text-slate-400 hover:text-white bg-slate-800 border-slate-700"
                }`}
              >
                stdin
              </button>
              {output && (
                <button
                  onClick={() => setOutput("")}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Standard Input (stdin) Panel */}
          {showInput && (
            <div className="border-b border-slate-800 px-4 py-2 bg-slate-900/90">
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                Standard input (stdin):
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter custom input here..."
                className="w-full bg-slate-950 text-slate-200 text-xs font-mono p-2 rounded border border-slate-800 outline-none resize-none h-16"
              />
            </div>
          )}

          {/* Output Content Area */}
          <div className="flex-1 p-4 overflow-auto bg-slate-950">
            {compilerDiagnostics.length > 0 && (
              <section aria-label="Problems" className="mb-4 rounded-lg border border-slate-700 bg-slate-900/80">
                <div className="px-3 py-2 border-b border-slate-700 text-xs font-semibold text-slate-200">
                  Problems <span className="ml-2 text-red-300">{compilerDiagnostics.filter((item) => item.severity === "error").length} errors</span>
                  {compilerDiagnostics.some((item) => item.severity === "warning") && <span className="ml-2 text-amber-300">{compilerDiagnostics.filter((item) => item.severity === "warning").length} warnings</span>}
                </div>
                <ul className="max-h-40 overflow-auto divide-y divide-slate-800">
                  {compilerDiagnostics.map((item, index) => (
                    <li key={`${item.code}-${item.startLine}-${index}`}>
                      <button type="button" disabled={!item.startLine} onClick={() => item.startLine && setDiagnosticTarget({ line: item.startLine, column: item.startColumn || 1 })} className="w-full text-left px-3 py-2 hover:bg-slate-800 disabled:cursor-default">
                        <span className={item.severity === "warning" ? "text-amber-300" : "text-red-300"}>{item.severity.toUpperCase()}</span>
                        {item.startLine ? <span className="ml-2 text-slate-500">{item.file}:{item.startLine}{item.startColumn ? `:${item.startColumn}` : ""}</span> : null}
                        <span className="ml-2 text-slate-200">{item.message}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(lang === "html" || lang === "css") && activeOutputTab === "preview" ? (
              <div className="h-full w-full rounded-xl overflow-hidden bg-white shadow-inner border border-slate-700">
                <iframe
                  title="HTML Live Preview"
                  srcDoc={previewDocument}
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <>
                {status === "idle" && !output && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                      <Play className="w-6 h-6 text-slate-400 fill-current ml-0.5" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">
                      Click <strong className="text-slate-200">Run</strong> to
                      execute your code
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Output and execution results will appear here
                    </p>
                  </div>
                )}

                {status === "running" && (
                  <div className="flex items-center gap-3 text-amber-400 text-sm font-mono p-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth={4}
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Compiling & executing code...</span>
                  </div>
                )}

                {output && status === "success" && (
                  <pre className="text-green-400 font-mono text-xs sm:text-sm leading-6 whitespace-pre-wrap">
                    {output}
                  </pre>
                )}

                {output && status === "error" && (
                  <div>
                    <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      Execution Error
                    </div>
                    <pre className="text-red-300 font-mono text-xs sm:text-sm leading-6 whitespace-pre-wrap">
                      {output}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status Bar */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>{code.length} characters</span>
            <span className="text-slate-400 font-semibold">
              {currentLang.label}
            </span>
          </div>
        </div>
      </div>

      {/* Syntax Comparison Matrix Modal */}
      <SyntaxComparisonModal
        isOpen={showSyntaxModal}
        onClose={() => setShowSyntaxModal(false)}
        onLoadCode={handleLoadCodeFromModal}
        topics={syntaxTopics}
        languages={languages}
      />
    </div>
  )
}
