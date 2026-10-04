/**
 * SkilTrix SAP ABAP Lab - ABAPLint & Language Service
 * Runs real-time AST parsing, diagnostics, formatting, and quick fixes powered by @abaplint/core.
 */

import { Registry, MemoryFile, Config, PrettyPrinter } from "@abaplint/core"

export interface ABAPDiagnosticItem {
  file: string
  line: number
  column: number
  endLine: number
  endColumn: number
  severity: "error" | "warning" | "info"
  message: string
  code: string
  category: "syntax" | "lint" | "spacing" | "ddic" | "style"
  source: string
  quickFix?: {
    description: string
    newText: string
    range: {
      startLineNumber: number
      startColumn: number
      endLineNumber: number
      endColumn: number
    }
  }
}

/**
 * Intelligent whitespace and assignment normalizer.
 * In ABAP, assignments require whitespace around '=' (e.g. `lv_count = 10.`),
 * but developers frequently type `lv_count=10.`.
 *
 * This function preserves:
 * - Comments (* at col 0, or inline " ...)
 * - String literals ('...', `...`, |...|)
 * - Comparison operators (<=, >=, <>, ==)
 * - Structural operators (=>, ->, ->*)
 */
export function normalizeABAPAssignmentSpacing(sourceCode: string): string {
  if (!sourceCode) return ""
  const lines = sourceCode.split(/\r?\n/)

  const processed = lines.map((line) => {
    // Column 0 full comment or empty line
    if (/^\s*\*|^$/.test(line)) {
      return line
    }

    let inSingleQuote = false
    let inBacktick = false
    let inPipe = false
    let result = ""

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      const prev = i > 0 ? line[i - 1] : ""
      const next = i < line.length - 1 ? line[i + 1] : ""

      // Inline comment begins outside any string
      if (ch === '"' && !inSingleQuote && !inBacktick && !inPipe) {
        result += line.slice(i)
        break
      }

      // String quote handling
      if (ch === "'" && !inBacktick && !inPipe) {
        inSingleQuote = !inSingleQuote
        result += ch
        continue
      }
      if (ch === "`" && !inSingleQuote && !inPipe) {
        inBacktick = !inBacktick
        result += ch
        continue
      }
      if (ch === "|" && !inSingleQuote && !inBacktick) {
        inPipe = !inPipe
        result += ch
        continue
      }

      // Check assignment operator outside literals
      if (!inSingleQuote && !inBacktick && !inPipe) {
        const isAssignment =
          ch === "=" &&
          prev !== "<" &&
          prev !== ">" &&
          prev !== "=" &&
          next !== "=" &&
          next !== ">"

        if (isAssignment) {
          const needsSpaceBefore = prev !== " " && prev !== ""
          const needsSpaceAfter = next !== " " && next !== ""
          if (needsSpaceBefore) result += " "
          result += "="
          if (needsSpaceAfter) result += " "
          continue
        }
      }

      result += ch
    }

    return result
  })

  return processed.join("\n")
}

/**
 * Build abaplint config tailored for interactive browser IDE usage.
 * Parser and syntax checks are set to Error, while pure style rules are set to Warning or Info.
 */
function createStudioConfig(): Config {
  const defaultConfig = Config.getDefault()
  const raw = JSON.parse(JSON.stringify(defaultConfig.get()))

  // Ensure normal ABAP release syntax rules
  if (raw.syntax?.version) {
    raw.syntax.version.language = "Normal"
    raw.syntax.version.release = "Newest"
  }

  // Disable case-sensitivity, naming conventions, and cosmetic/strict stylistic rules
  // that generate false red/yellow markers during interactive typing
  const disabledRules = [
    // Case rules (Requirement 5: ABAP keywords & identifiers are case-insensitive)
    "keyword_case",
    "lower_case_style",
    "upper_case_style",

    // Program structure and filename mismatch rules (Requirement 8)
    "main_file_contents",
    "implicit_start_of_selection",
    "check_subrc",
    "fully_type_itabs",

    // SQL rules: ORDER BY is optional in standard Open SQL; SELECT * and valid Open SQL constructs are permitted
    "select_add_order_by",
    "select_performance",
    "select_single_full_key",
    "strict_sql",
    "sql_escape_host_variables",

    // Formatting & whitespace rules that flag code while typing
    "in_statement_indentation",
    "indentation",
    "line_length",
    "whitespace_end",
    "double_space",
    "colon_missing_space",
    "space_before_colon",
    "space_before_dot",
    "empty_statement",
    "empty_line_in_statement",
    "line_only_punc",
    "no_prefixes",
    "definitions_top",
    "names_no_dash",
    "prefer_insert_into_table",
    "allowed_object_naming",
    "allowed_object_types",
    "local_variable_names",
    "method_parameter_names",
    "class_attribute_names",
    "chain_mainly_declarations",
    "max_one_statement",
    "unnecessary_chaining",
    "commented_code",
    "short_case",
    "change_if_to_case",
    "modify_only_own_db_tables",
  ]

  for (const rule of disabledRules) {
    raw.rules[rule] = false
  }

  // Configure naming rules to Warning by default so they do not block execution
  const namingRules = [
    "local_class_naming",
    "types_naming",
    "object_naming",
    "interface_naming",
    "local_variable_names",
    "method_parameter_names",
    "class_attribute_names",
    "local_testclass_naming",
  ]
  for (const rule of namingRules) {
    if (raw.rules[rule] !== false) {
      raw.rules[rule] = { severity: "Warning" }
    }
  }

  // Genuine syntax, structure, parser, and DDIC errors
  if (raw.rules.parser_error) raw.rules.parser_error = { severity: "Error" }
  if (raw.rules.check_syntax) raw.rules.check_syntax = { severity: "Error" }
  if (raw.rules.check_ddic) raw.rules.check_ddic = { severity: "Error" }
  if (raw.rules.unknown_types) raw.rules.unknown_types = { severity: "Error" }
  if (raw.rules.structure) raw.rules.structure = { severity: "Error" }

  return new Config(JSON.stringify(raw))
}

const studioConfig = createStudioConfig()

export interface LintOptions {
  enforceNamingRulesAsErrors?: boolean
}

/**
 * Standard known DDIC tables in SAP ABAP + SkilTrix Simulator
 */
const DEFAULT_DDIC_TABLES = new Set([
  "KNA1",
  "VBAK",
  "VBAP",
  "MARA",
  "MAKT",
  "LFA1",
  "BKPF",
  "BSEG",
  "EKKO",
  "EKPO",
  "T001",
  "T001W",
])

/**
 * Run syntax and lint diagnostics on ABAP code.
 */
export function lintABAPCode(
  code: string,
  fileName: string = "zreport.prog.abap",
  customTables: string[] = [],
  options?: LintOptions
): ABAPDiagnosticItem[] {
  if (!code || !code.trim()) return []

  const activeTables = new Set([...DEFAULT_DDIC_TABLES, ...customTables.map((t) => t.toUpperCase())])
  const diagnostics: ABAPDiagnosticItem[] = []
  const lines = code.split(/\r?\n/)

  try {
    // 1. Run @abaplint/core AST analysis
    const reg = new Registry(studioConfig)
    const normalizedFileName = fileName.endsWith(".abap") ? fileName : `${fileName}.prog.abap`
    const memoryFile = new MemoryFile(normalizedFileName, code)
    reg.addFile(memoryFile)
    reg.parse()

    const rawIssues = reg.findIssues()

    for (const issue of rawIssues) {
      const key = issue.getKey()
      const msg = issue.getMessage()
      const start = issue.getStart()
      const end = issue.getEnd()
      const row = start?.getRow() || 1
      const col = start?.getCol() || 1
      const currentLineText = lines[row - 1] || ""
      const lineLen = currentLineText.length
      const endRow = end?.getRow() || row
      let endCol = end?.getCol() || (col + 1)
      if (endRow === row && endCol <= col) {
        endCol = Math.min(lineLen + 1, col + 1)
      }

      // Rule classification & DDIC table resolution
      if (key === "select_add_order_by" || msg.toLowerCase().includes("add order by")) {
        continue
      }

      if (key === "select_performance" && msg.toLowerCase().includes("select *")) {
        continue
      }

      if (key === "unknown_types" || key === "check_ddic" || key === "check_syntax") {
        // Check if the unknown type is a known custom/standard DDIC table (e.g. ZCUSTOMERS or ZEMPDETAILS)
        const matchedTable = Array.from(activeTables).find((tbl) =>
          new RegExp(`\\b${tbl}\\b`, "i").test(msg) || new RegExp(`\\b${tbl}\\b`, "i").test(currentLineText)
        )

        if (matchedTable) {
          // Table exists in active repository/dictionary: do not report as error
          continue
        }
      }

      // Check if parser error is due to unspaced '=' assignment (e.g. WA-EMPSAL=5000.)
      if (key === "parser_error" && currentLineText.includes("=")) {
        const normalizedLine = normalizeABAPAssignmentSpacing(currentLineText)
        if (normalizedLine !== currentLineText) {
          diagnostics.push({
            file: fileName,
            line: row,
            column: col,
            endLine: row,
            endColumn: currentLineText.length + 1,
            severity: "warning",
            message: `Missing whitespace around assignment operator '='. In ABAP, operators require surrounding spaces.`,
            code: "ABAP_ASSIGNMENT_SPACING",
            category: "spacing",
            source: "SkilTrix ABAP Parser",
            quickFix: {
              description: "Format spacing around assignment operator '='",
              newText: normalizedLine,
              range: {
                startLineNumber: row,
                startColumn: 1,
                endLineNumber: row,
                endColumn: currentLineText.length + 1,
              },
            },
          })
          continue
        }
      }

      // Check if parser error is due to classic Open SQL `INSERT INTO <table> FROM TABLE <itab>`
      if (
        key === "parser_error" &&
        /\bINSERT\s+INTO\b/i.test(currentLineText) &&
        /\bFROM\s+TABLE\b/i.test(currentLineText)
      ) {
        const fixedSql = currentLineText.replace(/\bINSERT\s+INTO\b/gi, "INSERT")
        diagnostics.push({
          file: fileName,
          line: row,
          column: col,
          endLine: row,
          endColumn: currentLineText.length + 1,
          severity: "info",
          message: `ABAP Open SQL: Standard syntax is 'INSERT <table> FROM TABLE <itab>' without INTO (supported by simulator).`,
          code: "OPEN_SQL_INTO_OMIT",
          category: "syntax",
          source: "SkilTrix ABAP Engine",
          quickFix: {
            description: "Convert to standard Open SQL 'INSERT <table> FROM TABLE <itab>'",
            newText: fixedSql,
            range: {
              startLineNumber: row,
              startColumn: 1,
              endLineNumber: row,
              endColumn: currentLineText.length + 1,
            },
          },
        })
        continue
      }

      // Map severity: Errors are error, Warnings are warning, Info is info
      let mappedSeverity: "error" | "warning" | "info" = "error"
      const issueSev = issue.getSeverity()?.toLowerCase() || ""
      if (issueSev.includes("info")) {
        mappedSeverity = "info"
      } else if (issueSev.includes("warn")) {
        mappedSeverity = "warning"
      } else {
        mappedSeverity = "error"
      }

      const isNamingRule =
        key === "local_class_naming" ||
        key === "types_naming" ||
        key === "object_naming" ||
        key === "interface_naming" ||
        key === "local_variable_names" ||
        key === "method_parameter_names" ||
        key === "class_attribute_names" ||
        key === "local_testclass_naming" ||
        key.includes("naming") ||
        msg.toLowerCase().includes("naming") ||
        msg.toLowerCase().includes("name must")

      let category: "syntax" | "lint" | "spacing" | "ddic" | "style" = mappedSeverity === "error" ? "syntax" : "lint"

      if (isNamingRule) {
        category = "style"
        if (!options?.enforceNamingRulesAsErrors) {
          mappedSeverity = "warning"
        }
      }

      // Quick fix for missing period if identifiable
      let quickFix: ABAPDiagnosticItem["quickFix"] = undefined
      if (
        (msg.toLowerCase().includes("period") || msg.toLowerCase().includes("expected '.'")) &&
        !currentLineText.trim().endsWith(".")
      ) {
        quickFix = {
          description: "Add missing period '.' at statement end",
          newText: currentLineText.trimEnd() + ".",
          range: {
            startLineNumber: row,
            startColumn: 1,
            endLineNumber: row,
            endColumn: currentLineText.length + 1,
          },
        }
      }

      diagnostics.push({
        file: fileName,
        line: row,
        column: col,
        endLine: endRow,
        endColumn: endCol,
        severity: mappedSeverity,
        message: msg,
        code: key,
        category,
        source: "abaplint",
        quickFix,
      })
    }
  } catch (err: any) {
    console.warn("abaplint parse error:", err)
  }

  return diagnostics
}

/**
 * Format ABAP Document using PrettyPrinter and intelligent assignment spacing.
 */
export function formatABAPCode(code: string, fileName: string = "zreport.prog.abap"): string {
  if (!code || !code.trim()) return code

  // Step 1: Normalize assignment spacing (lv_count=10. -> lv_count = 10.)
  let formatted = normalizeABAPAssignmentSpacing(code)

  // Step 2: Run PrettyPrinter if parseable
  try {
    const reg = new Registry(studioConfig)
    const memFile = new MemoryFile(fileName.endsWith(".abap") ? fileName : `${fileName}.prog.abap`, formatted)
    reg.addFile(memFile)
    reg.parse()

    const obj = reg.getFirstObject()
    const abapFile = (obj as any)?.getABAPFiles?.()?.[0]
    if (abapFile) {
      const pp = new PrettyPrinter(abapFile, reg.getConfig())
      const prettyResult = pp.run()
      if (prettyResult && prettyResult.trim().length > 0) {
        formatted = prettyResult
      }
    }
  } catch (err) {
    // If PrettyPrinter fails (e.g. unclosed block during edit), preserve safely normalized code
    console.debug("PrettyPrinter fallback to normalized spacing:", err)
  }

  return formatted
}
