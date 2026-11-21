import React from "react"

export interface MarkdownRenderOptions {
  boldClassName?: string
  codeClassName?: string
  italicClassName?: string
}

/**
 * Strips raw markdown bold asterisks `**text**` -> `text`
 */
export function stripMarkdownStars(text: string): string {
  if (!text) return ""
  return text.replace(/\*\*([^*]+?)\*\*/g, "$1")
}

/**
 * Parses inline markdown:
 * - **content** -> bold element without asterisks (shows only the content in bold)
 * - `code` -> styled inline code element
 * - *italic* -> styled italic element
 * Handles nested code within bold (e.g. **`code`**) and preserves whitespaces/newlines.
 */
export function renderInlineMarkdown(
  text: string | null | undefined,
  options?: MarkdownRenderOptions
): React.ReactNode {
  if (!text) return null

  const boldClass =
    options?.boldClassName || "font-bold text-slate-900 dark:text-slate-100"
  const codeClass =
    options?.codeClassName ||
    "px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700"
  const italicClass = options?.italicClassName || "italic text-slate-800 dark:text-slate-200"

  // Pattern matching inline code, bold, or italic
  const pattern = /(`[^`]+`|\*\*[^*]+?\*\*|\*[^*]+?\*)/g
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    // 1. Bold: **content**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const rawInner = part.slice(2, -2)
      const leadingSpace = rawInner.match(/^\s*/)?.[0] || ""
      const trailingSpace = rawInner.match(/\s*$/)?.[0] || ""
      const inner = rawInner.trim()

      // Handle nested code inside bold: **`code`**
      if (inner.startsWith("`") && inner.endsWith("`") && inner.length >= 2) {
        return (
          <React.Fragment key={index}>
            {leadingSpace}
            <strong className={boldClass}>
              <code className={codeClass}>{inner.slice(1, -1)}</code>
            </strong>
            {trailingSpace}
          </React.Fragment>
        )
      }

      return (
        <React.Fragment key={index}>
          {leadingSpace}
          <strong className={boldClass}>{inner}</strong>
          {trailingSpace}
        </React.Fragment>
      )
    }

    // 2. Inline Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={index} className={codeClass}>
          {part.slice(1, -1)}
        </code>
      )
    }

    // 3. Italic: *content* (only if not preceded/followed by another asterisk)
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
      const inner = part.slice(1, -1)
      return (
        <em key={index} className={italicClass}>
          {inner}
        </em>
      )
    }

    // 4. Fallback regular text segment
    return part
  })
}
