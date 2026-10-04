import api from "./client"

export type DiagnosticSeverity = "error" | "warning" | "info"
export type DiagnosticCategory =
  | "syntax" | "type" | "lint" | "import" | "framework"
  | "configuration" | "runtime" | "simulator_compatibility" | "tooling"

export interface SourceDiagnostic {
  file: string
  file_id?: string | null
  severity: DiagnosticSeverity
  code: string
  message: string
  startLine?: number
  startColumn?: number
  endLine?: number
  endColumn?: number
  source: string
  category: DiagnosticCategory
}

export const parseCompilerDiagnostics = (output: string, file: string): SourceDiagnostic[] => {
  const diagnostics: SourceDiagnostic[] = []
  const lines = output.split(/\r?\n/)
  const add = (severity: DiagnosticSeverity, code: string, message: string, line?: number, column?: number, source = "Compiler", category: DiagnosticCategory = "type") => {
    diagnostics.push({
      file, severity, code, message, source, category,
      ...(line ? { startLine: line, endLine: line } : {}),
      ...(column ? { startColumn: column, endColumn: column + 1 } : {}),
    })
  }
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    let match = line.match(/:(\d+):(\d+):\s*(fatal error|error|warning):\s*(.*)$/i)
    if (match) {
      add(/warning/i.test(match[3]) ? "warning" : "error", "COMPILER_DIAGNOSTIC", match[4], Number(match[1]), Number(match[2]), "Compiler", /undeclared|undefined|not declared|unknown identifier/i.test(match[4]) ? "type" : "syntax")
      continue
    }
    match = line.match(/(?:^|\s)(?:[^\s:]+\.java):(\d+):\s*(?:error:\s*)?(.*)$/i)
    if (match && match[2]) {
      add("error", "JAVA_COMPILER_DIAGNOSTIC", match[2], Number(match[1]), undefined, "javac", "type")
      continue
    }
    match = line.match(/(?:^|\s)[^\s(:]+\.cs\((\d+),(\d+)\):\s*(warning|error)\s+(CS\d+):\s*(.*)$/i)
    if (match) {
      add(match[3].toLowerCase() === "warning" ? "warning" : "error", match[4], match[5], Number(match[1]), Number(match[2]), "C# compiler", "type")
      continue
    }
    match = line.match(/(?:^|\s)(?:[^\s:]+\.(?:go|rs)):(\d+)(?::(\d+))?:\s*(.*)$/i)
    if (match && /undefined|cannot find|not found|undeclared|error/i.test(match[3])) {
      let errorMessage = match[3]
      let source = "Go compiler"
      if (/\.rs:/i.test(line)) {
        source = "Rust compiler"
        const location = lines.slice(index + 1, index + 5).join(" ").match(/--?>\s*[^\s:]+:(\d+):(\d+)/)
        if (location) { match[1] = location[1]; match[2] = location[2] }
      }
      add("error", "COMPILER_UNDEFINED_NAME", errorMessage, Number(match[1]), match[2] ? Number(match[2]) : undefined, source, "type")
      continue
    }
    // Rust emits the diagnostic first and the exact source span on the next lines:
    // error[E0425]: cannot find value `missing` in this scope
    // --> main.rs:4:5
    if (/^error(?:\[[A-Z0-9]+\])?:/.test(line) && /cannot find (?:value|type|function)|not found in this scope/i.test(line)) {
      const location = lines.slice(index + 1, index + 5).join(" ").match(/--?>\s*([^\s:]+\.rs):(\d+):(\d+)/)
      const message = line.replace(/^error(?:\[[A-Z0-9]+\])?:\s*/, "").trim()
      add("error", "RUST_UNDEFINED_NAME", message, location ? Number(location[2]) : undefined, location ? Number(location[3]) : undefined, "Rust compiler", "type")
      continue
    }
    match = line.match(/(?:PHP Parse error|Parse error):\s*(.*)\s+in\s+.+?\s+on line\s+(\d+)/i)
    if (match) {
      add("error", "PHP_PARSE_ERROR", match[1], Number(match[2]), undefined, "PHP", "syntax")
      continue
    }
    match = line.match(/(?:Warning|Notice):\s*(Undefined variable|Undefined array key)\s*\$?([^\s]+).*?on line\s+(\d+)/i)
    if (match) add("warning", "PHP_UNDEFINED_NAME", `${match[1]} ${match[2]}`, Number(match[3]), undefined, "PHP runtime", "type")
  }
  const frames = [...output.matchAll(/File ["'][^"']+\.py["'], line (\d+)/g)]
  if (frames.length && /(?:Traceback|SyntaxError|IndentationError|NameError|TypeError|ImportError|ModuleNotFoundError)/.test(output)) {
    const finalMessage = lines.filter(Boolean).at(-1) || "Python reported an execution error."
    const undefinedName = finalMessage.match(/NameError:\s*name ['"]([^'"]+)['"] is not defined/)
    add("error", undefinedName ? "PYTHON_UNDEFINED_NAME" : "PYTHON_RUNTIME_ERROR", finalMessage.trim(), Number(frames.at(-1)?.[1]), undefined, "Python runtime", undefinedName ? "type" : "runtime")
  }
  const jsReference = output.match(/ReferenceError:\s*(.*?) is not defined/i)
  if (jsReference) {
    const jsFrames = [...output.matchAll(/(?:main|index|program|source)\.(?:m?js|cjs):(\d+):(\d+)/gi)]
    const frame = jsFrames.at(-1)
    add("error", "JS_UNDEFINED_NAME", jsReference[1], frame ? Number(frame[1]) : undefined, frame ? Number(frame[2]) : undefined, "JavaScript runtime", "type")
  }
  const rubyName = output.match(/(?:NameError|undefined local variable or method)[:\s]+(.+?)(?:\s+for\s+#<|$)/i)
  if (rubyName) {
    const rubyFrame = output.match(/(?:main|solution)\.rb:(\d+)/i)
    add("error", "RUBY_UNDEFINED_NAME", rubyName[1].trim(), rubyFrame ? Number(rubyFrame[1]) : undefined, undefined, "Ruby runtime", "type")
  }
  return diagnostics
}

export const diagnoseProjectFile = async (
  projectId: string,
  path: string,
  source: string,
  version: number,
  database?: string,
  signal?: AbortSignal,
) => {
  const { data } = await api.post(`/codelab/projects/${encodeURIComponent(projectId)}/diagnostics/`, {
    path, source, version, database,
  }, { signal })
  return data as { project_id: string; file_id: string | null; version: number; diagnostics: SourceDiagnostic[] }
}

export const diagnoseProject = async (projectId: string, database?: string, signal?: AbortSignal, sources?: Record<string, string>) => {
  const { data } = await api.post(`/codelab/projects/${encodeURIComponent(projectId)}/diagnostics/`, {
    project_wide: true, database, sources,
  }, { signal })
  return data as { project_id: string; diagnostics: SourceDiagnostic[] }
}
