import React, { useRef, useEffect, useCallback, useMemo } from "react"
import Editor, { OnMount, type Monaco } from "@monaco-editor/react"
import { Loader2 } from "lucide-react"
import { registerABAPLanguage } from "../utils/abapMonarch"

export interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
  language: string
  filename?: string
  fontSize?: "xs" | "sm" | "base" | "lg"
  readOnly?: boolean
  className?: string
  onCursorChange?: (line: number, col: number) => void
  diagnostics?: {
    severity: "error" | "warning" | "info"
    startLine?: number
    startColumn?: number
    endColumn?: number
    message: string
  }[]
  navigationTarget?: { line: number; column: number } | null
  onRun?: () => void
}

export function normalizeMonacoLanguage(lang: string): string {
  const raw = (lang || "").toLowerCase().trim().replace(/[^a-z0-9+#]/g, "")
  const map: Record<string, string> = {
    python: "python",
    py: "python",
    python3: "python",
    java: "java",
    cpp: "cpp",
    "c++": "cpp",
    cxx: "cpp",
    c: "c",
    javascript: "javascript",
    js: "javascript",
    node: "javascript",
    nodejs: "javascript",
    typescript: "typescript",
    ts: "typescript",
    sql: "sql",
    sqlite: "sql",
    postgresql: "sql",
    mysql: "sql",
    html: "html",
    htm: "html",
    markup: "html",
    css: "css",
    scss: "css",
    less: "css",
    go: "go",
    rust: "rust",
    rs: "rust",
    php: "php",
    ruby: "ruby",
    rb: "ruby",
    csharp: "csharp",
    cs: "csharp",
    "c#": "csharp",
    kotlin: "kotlin",
    kt: "kotlin",
    swift: "swift",
    abap: "abap",
    "abap-oops": "abap",
    abapoops: "abap",
    json: "json",
    shell: "shell",
    bash: "shell",
    sh: "shell",
    markdown: "markdown",
    md: "markdown",
  }
  return map[raw] || "plaintext"
}

const FONT_SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 13,
  base: 14,
  lg: 16,
}

export default function CodeEditor({
  code,
  onChange,
  language,
  fontSize = "sm",
  readOnly = false,
  className = "",
  onCursorChange,
  diagnostics = [],
  navigationTarget,
  onRun,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)

  const monacoLang = useMemo(() => normalizeMonacoLanguage(language), [language])

  const defineCodeLabTheme = useCallback((monaco: Monaco) => {
    try {
      registerABAPLanguage(monaco)
    } catch {
      // ignore
    }
    monaco.editor.defineTheme("codelab-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
        { token: "type", foreground: "4ec9b0" },
        { token: "variable.predefined", foreground: "4fc1ff", fontStyle: "bold" },
        { token: "string", foreground: "ce9178" },
        { token: "string.template", foreground: "d7ba7d" },
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "number", foreground: "b5cea8" },
        { token: "operator", foreground: "d4d4d4" },
        { token: "identifier", foreground: "9cdcfe" },
        { token: "delimiter", foreground: "d4d4d4" },
      ],
      colors: {
        "editor.background": "#020617",
        "editor.foreground": "#e2e8f0",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#818cf8",
        "editor.lineHighlightBackground": "#0f172a60",
        "editorCursor.foreground": "#818cf8",
        "editor.selectionBackground": "#312e8160",
        "editorGutter.background": "#020617",
      },
    })
  }, [])

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco

      defineCodeLabTheme(monaco)
      monaco.editor.setTheme("codelab-dark")

      // Track cursor position
      editor.onDidChangeCursorPosition((e) => {
        onCursorChange?.(e.position.lineNumber, e.position.column)
      })

      // Run code shortcut: Ctrl+Enter or Cmd+Enter
      if (onRun) {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
          onRun()
        })
      }

      // Initial cursor report
      const pos = editor.getPosition()
      if (pos) {
        onCursorChange?.(pos.lineNumber, pos.column)
      }
    },
    [defineCodeLabTheme, onCursorChange, onRun]
  )

  // Sync navigation target (e.g. jumping to diagnostic error line)
  useEffect(() => {
    if (!navigationTarget || !editorRef.current) return
    const { line, column } = navigationTarget
    editorRef.current.revealPositionInCenter({ lineNumber: line, column })
    editorRef.current.setPosition({ lineNumber: line, column })
    editorRef.current.focus()
  }, [navigationTarget])

  // Sync compiler diagnostics to Monaco model markers
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return

    const markers = (diagnostics || []).map((d) => ({
      startLineNumber: d.startLine || 1,
      startColumn: d.startColumn || 1,
      endLineNumber: d.startLine || 1,
      endColumn: d.endColumn || model.getLineLength(d.startLine || 1) + 1,
      message: d.message,
      severity:
        d.severity === "error"
          ? monacoRef.current!.MarkerSeverity.Error
          : d.severity === "warning"
            ? monacoRef.current!.MarkerSeverity.Warning
            : monacoRef.current!.MarkerSeverity.Info,
    }))

    monacoRef.current.editor.setModelMarkers(model, "compiler-diagnostics", markers)
  }, [diagnostics])

  const fontSizeVal = FONT_SIZE_MAP[fontSize] || 13

  return (
    <div className={`relative flex flex-1 h-full w-full bg-[#020617] overflow-hidden ${className}`}>
      <Editor
        height="100%"
        width="100%"
        language={monacoLang}
        value={code}
        theme="codelab-dark"
        beforeMount={defineCodeLabTheme}
        onMount={handleEditorDidMount}
        onChange={(val) => onChange(val ?? "")}
        loading={
          <div className="flex items-center justify-center h-full w-full bg-[#020617] text-slate-400 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Loading Editor...</span>
            </div>
          </div>
        }
        options={{
          readOnly,
          fontSize: fontSizeVal,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "all",
          wordWrap: "on",
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoSurround: "languageDefined",
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          fixedOverflowWidgets: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  )
}
