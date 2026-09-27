import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { highlightCode, normalizeLanguage } from "../utils/highlighter"

export interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
  language: string
  filename?: string
  fontSize?: "xs" | "sm" | "base" | "lg"
  readOnly?: boolean
  className?: string
  onCursorChange?: (line: number, col: number) => void
}

const FONT_SIZE_STYLES = {
  xs: {
    fontSize: "12px",
    lineHeight: "20px",
  },
  sm: {
    fontSize: "14px",
    lineHeight: "24px",
  },
  base: {
    fontSize: "16px",
    lineHeight: "26px",
  },
  lg: {
    fontSize: "18px",
    lineHeight: "28px",
  },
}

export default function CodeEditor({
  code,
  onChange,
  language,
  fontSize = "sm",
  readOnly = false,
  className = "",
  onCursorChange,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const [activeLine, setActiveLine] = useState(1)
  const [activeCol, setActiveCol] = useState(1)

  const normalized = normalizeLanguage(language)

  // Generate highlighted HTML
  const highlightedHtml = useMemo(() => {
    return highlightCode(code, normalized)
  }, [code, normalized])

  const lines = useMemo(() => {
    return code.split("\n")
  }, [code])

  // Synchronize scroll across layers
  const syncScroll = useCallback(() => {
    if (!textareaRef.current) return
    const { scrollTop, scrollLeft } = textareaRef.current
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop
      preRef.current.scrollLeft = scrollLeft
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop
    }
  }, [])

  // Update cursor position and active line
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return
    const pos = textareaRef.current.selectionStart || 0
    const textBefore = code.slice(0, pos)
    const lineList = textBefore.split("\n")
    const currentLine = lineList.length
    const currentCol = (lineList[lineList.length - 1]?.length || 0) + 1
    setActiveLine(currentLine)
    setActiveCol(currentCol)
    if (onCursorChange) {
      onCursorChange(currentLine, currentCol)
    }
  }, [code, onCursorChange])

  useEffect(() => {
    syncScroll()
  }, [syncScroll, code])

  // Handle Tab, Enter, and Bracket closing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return
    const textarea = e.currentTarget
    const { selectionStart, selectionEnd, value } = textarea

    // TAB key handling
    if (e.key === "Tab") {
      e.preventDefault()
      const tab = "    " // 4 spaces for Python/Java/C/C++

      if (e.shiftKey) {
        // Shift+Tab: Un-indent
        const linesArr = value.split("\n")
        let charCount = 0
        let startLineIdx = 0
        let endLineIdx = 0

        for (let i = 0; i < linesArr.length; i++) {
          const nextCount = charCount + linesArr[i].length + 1
          if (selectionStart >= charCount && selectionStart < nextCount)
            startLineIdx = i
          if (selectionEnd >= charCount && selectionEnd <= nextCount) {
            endLineIdx = i
            break
          }
          charCount = nextCount
        }

        let removedTotal = 0
        for (let i = startLineIdx; i <= endLineIdx; i++) {
          if (linesArr[i].startsWith("    ")) {
            linesArr[i] = linesArr[i].slice(4)
            removedTotal += 4
          } else if (linesArr[i].startsWith("  ")) {
            linesArr[i] = linesArr[i].slice(2)
            removedTotal += 2
          } else if (linesArr[i].startsWith(" ")) {
            linesArr[i] = linesArr[i].slice(1)
            removedTotal += 1
          }
        }

        const newText = linesArr.join("\n")
        onChange(newText)
        setTimeout(() => {
          textarea.selectionStart = Math.max(
            0,
            selectionStart - (linesArr[startLineIdx].startsWith(" ") ? 0 : 2),
          )
          textarea.selectionEnd = Math.max(0, selectionEnd - removedTotal)
        }, 0)
      } else {
        // Tab: Insert 4 spaces
        const before = value.substring(0, selectionStart)
        const after = value.substring(selectionEnd)
        const newText = before + tab + after
        onChange(newText)

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 4
          updateCursorPosition()
        }, 0)
      }
      return
    }

    // ENTER key: Auto-indentation
    if (e.key === "Enter") {
      const beforeCursor = value.substring(0, selectionStart)
      const afterCursor = value.substring(selectionEnd)
      const currentLine = beforeCursor.split("\n").pop() || ""
      const match = currentLine.match(/^(\s+)/)
      let indent = match ? match[1] : ""

      // Extra indent if line ends with colon or open brace
      const trimmed = currentLine.trimEnd()
      if (
        trimmed.endsWith(":") ||
        trimmed.endsWith("{") ||
        trimmed.endsWith("(")
      ) {
        indent += "    "
      }

      if (indent.length > 0) {
        e.preventDefault()
        const insertText = "\n" + indent
        const newText = beforeCursor + insertText + afterCursor
        onChange(newText)

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + insertText.length
          updateCursorPosition()
          syncScroll()
        }, 0)
        return
      }
    }

    // Auto-close pairs: (), [], {}, "", ''
    const pairs: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
      "`": "`",
    }

    if (pairs[e.key] && selectionStart === selectionEnd) {
      const closing = pairs[e.key]
      // Skip if typing closing quote and it's already there
      if (
        (e.key === '"' || e.key === "'" || e.key === "`") &&
        value[selectionStart] === e.key
      ) {
        e.preventDefault()
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
        updateCursorPosition()
        return
      }

      e.preventDefault()
      const before = value.substring(0, selectionStart)
      const after = value.substring(selectionEnd)
      const newText = before + e.key + closing + after
      onChange(newText)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
        updateCursorPosition()
      }, 0)
      return
    }

    // Backspace: if deleting inside empty pair, delete both
    if (
      e.key === "Backspace" &&
      selectionStart === selectionEnd &&
      selectionStart > 0
    ) {
      const prevChar = value[selectionStart - 1]
      const nextChar = value[selectionStart]
      if (
        (prevChar === "(" && nextChar === ")") ||
        (prevChar === "[" && nextChar === "]") ||
        (prevChar === "{" && nextChar === "}") ||
        (prevChar === '"' && nextChar === '"') ||
        (prevChar === "'" && nextChar === "'")
      ) {
        e.preventDefault()
        const before = value.substring(0, selectionStart - 1)
        const after = value.substring(selectionStart + 1)
        onChange(before + after)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart - 1
          updateCursorPosition()
        }, 0)
        return
      }
    }
  }

  const currentFont = FONT_SIZE_STYLES[fontSize] || FONT_SIZE_STYLES.sm

  return (
    <div
      className={`relative flex flex-1 h-full w-full bg-slate-950 overflow-hidden font-mono select-none ${className}`}
    >
      {/* Line Numbers Column */}
      <div
        ref={lineNumbersRef}
        aria-hidden="true"
        className="shrink-0 w-12 sm:w-14 bg-slate-900/70 border-r border-slate-800/80 py-4 select-none overflow-hidden text-right pr-3"
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: currentFont.fontSize,
          lineHeight: currentFont.lineHeight,
        }}
      >
        {lines.map((_, idx) => {
          const lineNum = idx + 1
          const isCurrent = lineNum === activeLine
          return (
            <div
              key={lineNum}
              className={`transition-colors font-mono ${
                isCurrent
                  ? "text-indigo-400 font-bold bg-indigo-500/10 -mr-3 pr-3 rounded-l"
                  : "text-slate-600 hover:text-slate-400"
              }`}
            >
              {lineNum}
            </div>
          )
        })}
      </div>

      {/* Editor Canvas Container (Pre + Textarea overlay) */}
      <div className="relative flex-1 h-full w-full overflow-hidden">
        {/* Active Line Highlight bar */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 pointer-events-none bg-indigo-500/[0.04] border-y border-indigo-500/10 transition-all duration-75"
          style={{
            top: `calc(1rem + ${(activeLine - 1) * parseInt(currentFont.lineHeight, 10)}px)`,
            height: currentFont.lineHeight,
          }}
        />

        {/* Syntax-highlighted PRE layer (underneath) */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="code-editor absolute inset-0 m-0 p-4 whitespace-pre overflow-hidden pointer-events-none select-none font-mono text-slate-100"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: currentFont.fontSize,
            lineHeight: currentFont.lineHeight,
            tabSize: 4,
            color: "#f8fafc",
          }}
        >
          <code
            dangerouslySetInnerHTML={{
              __html: highlightedHtml + (code.endsWith("\n") ? "\n " : ""),
            }}
          />
        </pre>

        {/* Interactive Textarea Layer (on top, text transparent, caret visible) */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            onChange(e.target.value)
            updateCursorPosition()
          }}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onSelect={updateCursorPosition}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          readOnly={readOnly}
          className="absolute inset-0 m-0 p-4 whitespace-pre overflow-auto resize-none outline-none font-mono border-0 bg-transparent text-transparent caret-indigo-400 selection:bg-indigo-500/35 selection:text-transparent"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: currentFont.fontSize,
            lineHeight: currentFont.lineHeight,
            tabSize: 4,
            WebkitTextFillColor: "transparent",
          }}
        />
      </div>
    </div>
  )
}
