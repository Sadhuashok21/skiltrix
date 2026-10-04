import React, { useRef, useMemo, useEffect, useState } from "react"
import Editor, { OnMount, type Monaco } from "@monaco-editor/react"
import {
  X,
  Circle,
  Save,
  Play,
  Loader2,
  FileCode,
  FileText,
  Settings,
  Globe,
  Database,
  Code2,
  Layers,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  Info,
  LoaderCircle,
  SearchCheck,
} from "lucide-react"
import type { SourceDiagnostic } from "../../api/diagnostics"
import { diagnosticNavigationTarget } from "../../utils/diagnosticState"

interface OpenTab {
  path: string
  name: string
  content: string
  isDirty: boolean
}

interface MonacoEditorPanelProps {
  openTabs: OpenTab[]
  activePath: string | null
  theme: "vs-dark" | "light"
  isRunning: boolean
  isSaving: boolean
  onSelectTab: (path: string) => void
  onCloseTab: (path: string) => void
  onChangeContent: (path: string, newContent: string) => void
  onSave: () => void
  onRun: () => void
  diagnostics: SourceDiagnostic[]
  isChecking: boolean
  onCheckProject: () => void
  onNavigate: (path: string) => void
}

function renderTabFileIcon(fileName: string) {
  const lower = (fileName || "").toLowerCase()
  const ext = lower.split(".").pop() || ""

  if (lower === "manage.py") {
    return (
      <span className="w-3.5 h-3.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-bold text-[8px] flex items-center justify-center shrink-0">
        dj
      </span>
    )
  }
  if (lower === "settings.py") {
    return <Settings className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
  }
  if (lower === "urls.py") {
    return <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
  }
  if (lower === "models.py") {
    return <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
  }
  if (lower === "views.py") {
    return <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
  }
  if (lower === "requirements.txt" || lower === "pyproject.toml") {
    return <Layers className="w-3.5 h-3.5 text-rose-400 shrink-0" />
  }
  if (lower.startsWith(".env") || lower === ".gitignore") {
    return <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  }

  switch (ext) {
    case "py":
      return (
        <span className="w-3.5 h-3.5 rounded bg-blue-950/80 border border-blue-500/50 text-blue-300 font-bold text-[8px] flex items-center justify-center shrink-0">
          py
        </span>
      )
    case "html":
    case "htm":
      return <span className="text-orange-400 font-bold text-[10px] shrink-0">&lt;&gt;</span>
    case "css":
    case "scss":
    case "less":
      return <span className="text-sky-400 font-bold text-[10px] shrink-0">#</span>
    case "js":
    case "jsx":
      return <span className="text-yellow-400 font-bold text-[9px] shrink-0">JS</span>
    case "ts":
    case "tsx":
      return <span className="text-blue-400 font-bold text-[9px] shrink-0">TS</span>
    case "json":
      return <FileJson className="w-3.5 h-3.5 text-lime-400 shrink-0" />
    case "sql":
      return <Database className="w-3.5 h-3.5 text-teal-400 shrink-0" />
    case "csv":
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
    case "md":
    case "txt":
      return <FileText className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
    default:
      return <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  }
}

function detectMonacoLanguage(filePath: string): string {
  const normalized = filePath.toLowerCase()
  const fileName = normalized.split("/").pop() || ""

  if (fileName === "requirements.txt") return "plaintext"
  if (fileName === "dockerfile") return "dockerfile"
  if (fileName === ".env" || fileName.startsWith(".env.") || fileName === ".gitignore") return "ini"

  const ext = fileName.split(".").pop() || ""
  switch (ext) {
    case "py":
      return "python"
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript"
    case "ts":
    case "tsx":
      return "typescript"
    case "html":
    case "htm":
      return "html"
    case "css":
    case "scss":
    case "less":
      return "css"
    case "json":
      return "json"
    case "yaml":
    case "yml":
      return "yaml"
    case "toml":
    case "ini":
    case "cfg":
    case "conf":
      return "ini"
    case "sql":
      return "sql"
    case "php":
      return "php"
    case "sh":
    case "bash":
    case "zsh":
      return "shell"
    case "md":
    case "markdown":
      return "markdown"
    case "java":
      return "java"
    case "cpp":
    case "cc":
    case "cxx":
    case "c":
    case "h":
    case "hpp":
    case "hh":
    case "hxx":
      return "cpp"
    default:
      return "plaintext"
  }
}

export default function MonacoEditorPanel({
  openTabs,
  activePath,
  theme,
  isRunning,
  isSaving,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  onSave,
  onRun,
  diagnostics,
  isChecking,
  onCheckProject,
  onNavigate,
}: MonacoEditorPanelProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const pendingNavigation = useRef<{ path: string; line: number; column: number } | null>(null)
  const [severityFilter, setSeverityFilter] = useState("all")

  // Normalize path helper
  const norm = (p: string | null) => (p || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "").trim()

  // Deduplicate tabs for guaranteed unique key and single tab per file
  const uniqueTabs = useMemo(() => {
    const seen = new Set<string>()
    return openTabs.filter((tab) => {
      const key = norm(tab.path)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [openTabs])

  const activeTab = uniqueTabs.find((t) => norm(t.path) === norm(activePath)) || uniqueTabs[0]

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Keyboard shortcut: Ctrl+S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave()
    })

    // Keyboard shortcut: Ctrl+Enter to run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun()
    })
    editor.addCommand(monaco.KeyCode.F8, () => navigateProblem(1))
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F8, () => navigateProblem(-1))
  }

  const navigateProblem = (direction: 1 | -1) => {
    if (!diagnostics.length || !editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return
    const markers = (monacoRef.current?.editor.getModelMarkers({ resource: model.uri }) || []) as Array<{ startLineNumber: number; startColumn: number }>
    if (!markers.length) return
    const position = editorRef.current.getPosition()
    const next = direction > 0
      ? markers.find((marker) => !position || marker.startLineNumber > position.lineNumber || (marker.startLineNumber === position.lineNumber && marker.startColumn > position.column)) || markers[0]
      : [...markers].reverse().find((marker) => !position || marker.startLineNumber < position.lineNumber || (marker.startLineNumber === position.lineNumber && marker.startColumn < position.column)) || markers[markers.length - 1]
    editorRef.current.setPosition({ lineNumber: next.startLineNumber, column: next.startColumn })
    editorRef.current.revealLineInCenter(next.startLineNumber)
    editorRef.current.focus()
  }

  useEffect(() => {
    const model = editorRef.current?.getModel()
    if (!model || !monacoRef.current) return
    const activeDiagnostics = diagnostics.filter((item) => norm(item.file) === norm(activeTab?.path || null))
    const markers = activeDiagnostics
      .filter((item) => item.startLine && item.severity)
      .map((item) => {
        const line = Math.max(1, item.startLine || 1)
        const lineText = model.getLineContent(Math.min(line, model.getLineCount()))
        const startColumn = item.startColumn ?? 1
        const endColumn = item.endColumn ?? Math.max(startColumn + 1, lineText.length + 1)
        const severity = item.severity === "error"
          ? monacoRef.current!.MarkerSeverity.Error
          : item.severity === "warning"
            ? monacoRef.current!.MarkerSeverity.Warning
            : monacoRef.current!.MarkerSeverity.Info
        return {
          severity,
          message: `${item.code}: ${item.message}`,
          source: item.source,
          code: item.code,
          startLineNumber: line,
          startColumn,
          endLineNumber: item.endLine ?? line,
          endColumn,
        }
      })
    monacoRef.current.editor.setModelMarkers(model, "skiltrix-diagnostics", markers)
  }, [diagnostics, activeTab?.path, activeTab?.content])

  useEffect(() => {
    const pending = pendingNavigation.current
    if (!pending || norm(activeTab?.path || null) !== norm(pending.path)) return
    const editor = editorRef.current
    if (!editor) return
    editor.setPosition({ lineNumber: pending.line, column: pending.column })
    editor.revealLineInCenter(pending.line)
    editor.focus()
    pendingNavigation.current = null
  }, [activeTab?.path])

  const visibleDiagnostics = diagnostics
    .filter((item) => severityFilter === "all" || item.severity === severityFilter)
    .sort((a, b) => (a.file.localeCompare(b.file) || (a.startLine || 0) - (b.startLine || 0)))
  const errors = diagnostics.filter((item) => item.severity === "error").length
  const warnings = diagnostics.filter((item) => item.severity === "warning").length
  const jumpTo = (diagnostic: SourceDiagnostic) => {
    const target = diagnosticNavigationTarget(diagnostic)
    if (!target) return
    const { line, column } = target
    pendingNavigation.current = { path: target.file, line, column }
    if (norm(target.file) !== norm(activeTab?.path || null)) onNavigate(target.file)
    else {
      editorRef.current?.setPosition({ lineNumber: line, column })
      editorRef.current?.revealLineInCenter(line)
      editorRef.current?.focus()
      pendingNavigation.current = null
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] text-slate-100 overflow-hidden">
      {/* Top Tabs Bar */}
      <div className="flex items-center justify-between bg-[#181825] border-b border-slate-800 px-2 h-10 select-none">
        <div className="flex items-center overflow-x-auto no-scrollbar h-full flex-nowrap">
          {uniqueTabs.map((tab) => {
            const isActive = norm(tab.path) === norm(activePath)
            return (
              <div
                key={tab.path}
                onClick={() => onSelectTab(tab.path)}
                title={tab.path}
                className={`group flex items-center gap-2 px-3 h-full text-xs cursor-pointer border-t-2 transition-colors shrink-0 ${
                  isActive
                    ? "bg-[#1e1e2e] text-indigo-300 border-indigo-500 font-medium"
                    : "bg-[#181825] text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                {renderTabFileIcon(tab.name)}
                <span className="truncate max-w-[130px]">{tab.name}</span>
                {tab.isDirty && (
                  <Circle className="w-2 h-2 fill-amber-400 text-amber-400 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseTab(tab.path)
                  }}
                  className="hover:text-red-400 opacity-60 group-hover:opacity-100 p-0.5 rounded transition-all shrink-0"
                  title="Close tab"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 pr-2">
          {activeTab?.isDirty ? (
            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
              <Circle className="w-1.5 h-1.5 fill-amber-400" /> Unsaved
            </span>
          ) : isSaving ? (
            <span className="text-[11px] text-indigo-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Saved</span>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={!activeTab?.isDirty || isSaving}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 px-2.5 py-1 rounded transition-colors"
            title="Save file (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-3 py-1 rounded shadow-sm transition-colors"
            title="Run Code (Ctrl+Enter)"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full relative">
        {activeTab ? (
          <Editor
            height="100%"
            width="100%"
            language={detectMonacoLanguage(activeTab.path)}
            path={activeTab.path}
            value={activeTab.content}
            theme={theme}
            onMount={handleEditorDidMount}
            onChange={(val) => onChangeContent(activeTab.path, val ?? "")}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              tabSize: 4,
              insertSpaces: true,
              automaticLayout: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              renderWhitespace: "selection",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 select-none">
            <p className="text-sm">Select a file from the explorer to begin editing.</p>
            <p className="text-xs text-slate-600 mt-1">Press Ctrl+S to save, Ctrl+Enter to run.</p>
          </div>
        )}
      </div>

      <section className="h-40 shrink-0 border-t border-slate-800 bg-[#181825] flex flex-col" aria-label="Problems">
        <div className="h-9 shrink-0 flex items-center justify-between gap-2 px-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-400" />Problems</span>
            <span className="text-red-400">{errors} errors</span>
            <span className="text-amber-300">{warnings} warnings</span>
            {isChecking && <span className="text-slate-400 flex items-center gap-1"><LoaderCircle className="w-3 h-3 animate-spin" />Checking…</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-300" aria-label="Filter problems by severity">
              <option value="all">All severities</option><option value="error">Errors</option><option value="warning">Warnings</option><option value="info">Info</option>
            </select>
            <button type="button" onClick={onCheckProject} className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-slate-200" title="Check all tracked project files">
              <SearchCheck className="w-3.5 h-3.5" />Check project
            </button>
            <span className="text-[10px] text-slate-500">F8 / Shift+F8: next / previous</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {visibleDiagnostics.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500">{isChecking ? "Checking the active file…" : "No diagnostics for the selected filter."}</div>
          ) : visibleDiagnostics.map((item, index) => {
            const Icon = item.severity === "error" ? AlertCircle : item.severity === "warning" ? AlertTriangle : Info
            return <button type="button" key={`${item.file}:${item.code}:${item.startLine}:${index}`} onClick={() => jumpTo(item)} className="w-full grid grid-cols-[18px_minmax(100px,1fr)_70px_minmax(100px,2fr)_100px] gap-2 items-center px-3 py-1 text-left text-[11px] hover:bg-slate-800/70 border-b border-slate-800/50">
              <Icon className={`w-3.5 h-3.5 ${item.severity === "error" ? "text-red-400" : item.severity === "warning" ? "text-amber-300" : "text-sky-300"}`} />
              <span className="truncate text-slate-300" title={item.file}>{item.file}</span>
              <span className="font-mono text-slate-500">{item.startLine ? `${item.startLine}${item.startColumn ? `:${item.startColumn}` : ""}` : "—"}</span>
              <span className="truncate text-slate-200" title={item.message}>{item.message}</span>
              <span className="truncate text-slate-500" title={`${item.source} · ${item.category}`}>{item.source} · {item.code}</span>
            </button>
          })}
        </div>
      </section>
    </div>
  )
}
