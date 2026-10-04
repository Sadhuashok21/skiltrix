/**
 * SkilTrix SAP ABAP Lab - Monaco Editor ABAP Language Support
 * Provides authentic ABAP Monarch tokenization, language configuration,
 * folding ranges, code completions, hover documentation, formatting provider,
 * and SAP Fiori themes.
 */

import type { Monaco } from "@monaco-editor/react"
import { formatABAPCode } from "../services/abapLintService"

let isABAPLanguageRegistered = false

export const registerABAPLanguage = (monaco: Monaco) => {
  if (isABAPLanguageRegistered) return

  const languages = monaco.languages.getLanguages()
  const hasAbap = languages.some((l: any) => l.id === "abap")

  if (!hasAbap) {
    monaco.languages.register({ id: "abap" })
  }

  // 1. Language Configuration
  monaco.languages.setLanguageConfiguration("abap", {
    comments: {
      lineComment: '"',
    },
    brackets: [
      ["(", ")"],
      ["[", "]"],
    ],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: "`", close: "`", notIn: ["string", "comment"] },
      { open: "|", close: "|", notIn: ["string", "comment"] },
    ],
    surroundingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "'", close: "'" },
      { open: "`", close: "`" },
      { open: "|", close: "|" },
    ],
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    indentationRules: {
      increaseIndentPattern: /^\s*(IF|ELSEIF|ELSE|LOOP|WHILE|DO|CASE|WHEN|CLASS|METHOD|FORM|TRY|CATCH|CLEANUP)\b/i,
      decreaseIndentPattern: /^\s*(ENDIF|ELSEIF|ELSE|ENDLOOP|ENDWHILE|ENDDO|ENDCASE|WHEN|ENDCLASS|ENDMETHOD|ENDFORM|ENDTRY|CATCH|CLEANUP)\b/i,
    },
  })

  // 2. Monarch Tokenizer & Grammar
  monaco.languages.setMonarchTokensProvider("abap", {
    defaultToken: "",
    tokenPostfix: ".abap",
    ignoreCase: true,

    keywords: [
      "REPORT",
      "PROGRAM",
      "DATA",
      "CONSTANTS",
      "TYPES",
      "TABLES",
      "FIELD-SYMBOLS",
      "PARAMETERS",
      "SELECT-OPTIONS",
      "WRITE",
      "ULINE",
      "SKIP",
      "NEW-LINE",
      "IF",
      "ELSEIF",
      "ELSE",
      "ENDIF",
      "CASE",
      "WHEN",
      "ENDCASE",
      "DO",
      "ENDDO",
      "WHILE",
      "ENDWHILE",
      "LOOP",
      "AT",
      "ENDLOOP",
      "READ",
      "TABLE",
      "APPEND",
      "INSERT",
      "MODIFY",
      "DELETE",
      "SORT",
      "CLEAR",
      "REFRESH",
      "FREE",
      "FORM",
      "ENDFORM",
      "PERFORM",
      "USING",
      "CHANGING",
      "CLASS",
      "ENDCLASS",
      "METHOD",
      "ENDMETHOD",
      "DEFINITION",
      "IMPLEMENTATION",
      "PUBLIC",
      "PROTECTED",
      "PRIVATE",
      "SECTION",
      "METHODS",
      "INTERFACES",
      "EVENTS",
      "CREATE",
      "OBJECT",
      "NEW",
      "TRY",
      "CATCH",
      "CLEANUP",
      "ENDTRY",
      "RAISE",
      "EXCEPTION",
      "SELECT",
      "FROM",
      "INTO",
      "CORRESPONDING",
      "FIELDS",
      "WHERE",
      "ORDER",
      "BY",
      "GROUP",
      "HAVING",
      "UP",
      "TO",
      "ROWS",
      "SINGLE",
      "JOIN",
      "INNER",
      "LEFT",
      "OUTER",
      "ON",
      "START-OF-SELECTION",
      "INITIALIZATION",
      "SELECTION-SCREEN",
      "TOP-OF-PAGE",
      "END-OF-SELECTION",
      "CHECK",
      "EXIT",
      "CONTINUE",
      "RETURN",
      "ASSIGN",
      "TYPE",
      "LIKE",
      "STANDARD",
      "SORTED",
      "HASHED",
      "WITH",
      "UNIQUE",
      "NON-UNIQUE",
      "KEY",
      "INITIAL",
      "VALUE",
      "DEFAULT",
      "IMPORTING",
      "EXPORTING",
      "RETURNING",
      "COMMIT",
      "WORK",
      "ROLLBACK",
      "FOR",
      "IN",
    ],

    typeKeywords: [
      "I",
      "INT1",
      "INT2",
      "INT4",
      "INT8",
      "P",
      "F",
      "C",
      "N",
      "D",
      "T",
      "X",
      "STRING",
      "XSTRING",
      "DECIMALS",
      "LENGTH",
      "BEGIN",
      "OF",
      "END",
      "REF",
      "TO",
      "ANY",
      "DATA",
    ],

    operators: [
      "=",
      "<>",
      "<",
      ">",
      "<=",
      ">=",
      "EQ",
      "NE",
      "LT",
      "GT",
      "LE",
      "GE",
      "AND",
      "OR",
      "NOT",
      "BETWEEN",
      "IN",
      "IS",
      "INITIAL",
      "CS",
      "NS",
      "CP",
      "NP",
      "+",
      "-",
      "*",
      "/",
      "&&",
      "->",
      "=>",
      "->*",
    ],

    systemVars: [
      "sy-subrc",
      "sy-datum",
      "sy-uzeit",
      "sy-index",
      "sy-tabix",
      "sy-mandt",
      "sy-uname",
      "sy-langu",
      "sy-dbcnt",
      "sy-title",
      "sy-pagno",
      "sy-linno",
    ],

    tokenizer: {
      root: [
        // System variables
        [
          /sy-[a-zA-Z0-9_]+/i,
          {
            cases: {
              "@systemVars": "variable.predefined",
              "@default": "identifier",
            },
          },
        ],

        // Identifiers and keywords
        [
          /[a-zA-Z0-9_#\-]+/,
          {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "type",
              "@operators": "operator",
              "@default": "identifier",
            },
          },
        ],

        // Full line comment starting with * at column 0
        [/^\*.*$/, "comment"],

        // Inline comment starting with "
        [/".*$/, "comment"],

        // Strings
        [/'[^\\']*'/, "string"],
        [/`[^\\`]*`/, "string"],
        [/\|[^\\|]*\|/, "string.template"],

        // Numbers
        [/\d+\.\d+/, "number.float"],
        [/\d+/, "number"],

        // Delimiters
        [/[;,.]/, "delimiter"],
        [/[()\[\]]/, "@brackets"],
      ],
    },
  })

  // 3. Code Folding Provider (Block Folding for IF, LOOP, CLASS, METHOD, etc.)
  monaco.languages.registerFoldingRangeProvider("abap", {
    provideFoldingRanges: (model) => {
      const ranges: Array<{ start: number; end: number; kind: any }> = []
      const stack: Array<{ type: string; line: number }> = []
      const totalLines = model.getLineCount()

      for (let i = 1; i <= totalLines; i++) {
        const lineText = model.getLineContent(i).trim()
        if (lineText.startsWith("*") || lineText.startsWith('"')) continue

        const upper = lineText.toUpperCase()

        // Block openers
        if (/\b(IF|LOOP|CASE|DO|WHILE|TRY|FORM)\b/i.test(upper) && !/\bEND(IF|LOOP|CASE|DO|WHILE|TRY|FORM)\b/i.test(upper)) {
          const match = upper.match(/\b(IF|LOOP|CASE|DO|WHILE|TRY|FORM)\b/i)
          if (match) stack.push({ type: match[1], line: i })
        } else if (/\bCLASS\b/i.test(upper) && /\b(DEFINITION|IMPLEMENTATION)\b/i.test(upper)) {
          stack.push({ type: "CLASS", line: i })
        } else if (/\bMETHOD\b/i.test(upper) && !/\bENDMETHOD\b/i.test(upper) && !/\bMETHODS\b/i.test(upper)) {
          stack.push({ type: "METHOD", line: i })
        }

        // Block closers
        if (/\bENDIF\b/i.test(upper)) {
          const top = popMatching(stack, "IF")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDLOOP\b/i.test(upper)) {
          const top = popMatching(stack, "LOOP")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDCASE\b/i.test(upper)) {
          const top = popMatching(stack, "CASE")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDDO\b/i.test(upper)) {
          const top = popMatching(stack, "DO")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDWHILE\b/i.test(upper)) {
          const top = popMatching(stack, "WHILE")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDTRY\b/i.test(upper)) {
          const top = popMatching(stack, "TRY")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDFORM\b/i.test(upper)) {
          const top = popMatching(stack, "FORM")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDCLASS\b/i.test(upper)) {
          const top = popMatching(stack, "CLASS")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        } else if (/\bENDMETHOD\b/i.test(upper)) {
          const top = popMatching(stack, "METHOD")
          if (top && i > top.line) ranges.push({ start: top.line, end: i, kind: monaco.languages.FoldingRangeKind.Region })
        }
      }

      return ranges
    },
  })

  // 4. Completion Item Provider (IntelliSense & Snippets)
  monaco.languages.registerCompletionItemProvider("abap", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions: any[] = [
        // ABAP Snippets
        {
          label: "report",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "REPORT ${1:zreport}.\n\nSTART-OF-SELECTION.\n  ${0:WRITE: / 'Execution started.'.}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Standard executable ABAP report template",
          range,
        },
        {
          label: "loop",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "LOOP AT ${1:itab} INTO ${2:wa}.\n  ${0}\nENDLOOP.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "LOOP AT itab INTO wa statement block",
          range,
        },
        {
          label: "if",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "IF ${1:condition}.\n  ${2}\nELSE.\n  ${0}\nENDIF.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "IF ... ELSE ... ENDIF conditional block",
          range,
        },
        {
          label: "select",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "SELECT * FROM ${1:kna1}\n  INTO TABLE ${2:it_customers}\n  UP TO ${3:100} ROWS\n  WHERE ${4:mandt = sy-mandt}.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Open SQL SELECT query",
          range,
        },
        {
          label: "insert_table",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "INSERT ${1:dbtab} FROM TABLE ${2:itab}.\nIF sy-subrc = 0.\n  COMMIT WORK.\nENDIF.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "ABAP Open SQL bulk INSERT statement with COMMIT WORK",
          range,
        },
        {
          label: "try_catch",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "TRY.\n  ${1}\nCATCH ${2:cx_root} INTO DATA(${3:lx_error}).\n  WRITE: / ${3:lx_error}->get_text( ).\nENDTRY.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "TRY ... CATCH exception handling block",
          range,
        },
        {
          label: "class_def",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "CLASS ${1:lcl_app} DEFINITION FINAL.\n  PUBLIC SECTION.\n    METHODS run.\nENDCLASS.\n\nCLASS ${1:lcl_app} IMPLEMENTATION.\n  METHOD run.\n    ${0}\n  ENDMETHOD.\nENDCLASS.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "ABAP OO Class definition and implementation",
          range,
        },
        {
          label: "append",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "APPEND ${1:wa} TO ${2:it}.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "APPEND work area to internal table",
          range,
        },
        // System variables
        {
          label: "sy-subrc",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-subrc",
          documentation: "System return value (0 = successful, 4 = not found / error)",
          range,
        },
        {
          label: "sy-datum",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-datum",
          documentation: "Current application server date in YYYYMMDD format",
          range,
        },
        {
          label: "sy-uzeit",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-uzeit",
          documentation: "Current application server time in HHMMSS format",
          range,
        },
        {
          label: "sy-tabix",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-tabix",
          documentation: "Current loop or read index of an internal table",
          range,
        },
        {
          label: "sy-index",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-index",
          documentation: "Current loop counter of a DO or WHILE statement",
          range,
        },
        {
          label: "sy-mandt",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-mandt",
          documentation: "Client number of current logon user session",
          range,
        },
        {
          label: "sy-uname",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-uname",
          documentation: "User logon name in current session",
          range,
        },
        {
          label: "sy-dbcnt",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "sy-dbcnt",
          documentation: "Number of database table rows processed by SQL statement",
          range,
        },
        // Built-in functions
        {
          label: "strlen",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "strlen( ${1:string} )",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Returns string length in characters",
          range,
        },
        {
          label: "lines",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "lines( ${1:itab} )",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Returns the number of rows currently in internal table",
          range,
        },
        {
          label: "condense",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "condense( ${1:val} )",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Removes leading, trailing, and duplicate spaces",
          range,
        },
        // Common ABAP Keywords
        ...[
          "DATA",
          "TYPES",
          "CONSTANTS",
          "WRITE",
          "ULINE",
          "SKIP",
          "COMMIT WORK",
          "ROLLBACK WORK",
          "CLEAR",
          "REFRESH",
          "FREE",
          "START-OF-SELECTION",
          "INITIALIZATION",
          "END-OF-SELECTION",
          "CHECK",
          "EXIT",
          "CONTINUE",
          "RETURN",
          "STANDARD TABLE OF",
        ].map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        })),
      ]

      return { suggestions }
    },
  })

  // 5. Hover Documentation Provider
  monaco.languages.registerHoverProvider("abap", {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position)
      if (!word) return null

      const term = word.word.toUpperCase()
      const doc = getABAPHoverDoc(term)
      if (!doc) return null

      return {
        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
        contents: [
          { value: `**ABAP**: \`${term}\`` },
          { value: doc },
        ],
      }
    },
  })

  // 6. Document Formatting Edit Provider (Shift+Alt+F)
  monaco.languages.registerDocumentFormattingEditProvider("abap", {
    provideDocumentFormattingEdits: (model) => {
      const originalCode = model.getValue()
      const formattedCode = formatABAPCode(originalCode)
      const lineCount = model.getLineCount()
      const lastLineLength = model.getLineContent(lineCount).length

      return [
        {
          range: new monaco.Range(1, 1, lineCount, lastLineLength + 1),
          text: formattedCode,
        },
      ]
    },
  })

  // 7. Themes: SAP Fiori Dark & Light
  monaco.editor.defineTheme("sap-fiori-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
      { token: "type", foreground: "4ec9b0" },
      { token: "variable.predefined", foreground: "dcdcaa", fontStyle: "bold" },
      { token: "string", foreground: "ce9178" },
      { token: "string.template", foreground: "d7ba7d" },
      { token: "comment", foreground: "6a9955", fontStyle: "italic" },
      { token: "number", foreground: "b5cea8" },
      { token: "operator", foreground: "d4d4d4" },
      { token: "identifier", foreground: "9cdcfe" },
    ],
    colors: {
      "editor.background": "#0b192c",
      "editor.foreground": "#d4d4d4",
      "editorLineNumber.foreground": "#425672",
      "editorLineNumber.activeForeground": "#61b5ff",
      "editor.lineHighlightBackground": "#132845",
      "editorCursor.foreground": "#3da5ff",
      "editor.selectionBackground": "#1e4976",
    },
  })

  monaco.editor.defineTheme("sap-fiori-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "0000ff", fontStyle: "bold" },
      { token: "type", foreground: "267f99" },
      { token: "variable.predefined", foreground: "795e26", fontStyle: "bold" },
      { token: "string", foreground: "a31515" },
      { token: "string.template", foreground: "b1321a" },
      { token: "comment", foreground: "008000", fontStyle: "italic" },
      { token: "number", foreground: "098658" },
      { token: "operator", foreground: "000000" },
      { token: "identifier", foreground: "001080" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#000000",
      "editorLineNumber.foreground": "#6e7681",
      "editorLineNumber.activeForeground": "#0969da",
      "editor.lineHighlightBackground": "#f6f8fa",
      "editorCursor.foreground": "#0969da",
      "editor.selectionBackground": "#b3d7ff",
    },
  })

  isABAPLanguageRegistered = true
}

function popMatching(stack: Array<{ type: string; line: number }>, expectedType: string) {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].type === expectedType) {
      const [item] = stack.splice(i, 1)
      return item
    }
  }
  return stack.pop()
}

function getABAPHoverDoc(term: string): string | null {
  const docs: Record<string, string> = {
    REPORT: "Defines an executable ABAP program. Every standalone program begins with `REPORT <name> [options].`",
    DATA: "Declares variable storage or internal tables. Syntax: `DATA <var> TYPE <type> [VALUE <val>].`",
    TYPES: "Defines local user data types. Syntax: `TYPES <typename> TYPE <type>.`",
    APPEND: "Appends a row to the end of an internal table. Syntax: `APPEND <wa> TO <itab>.`",
    INSERT: "Inserts single rows or a table into a database or internal table. Open SQL: `INSERT <dbtab> FROM TABLE <itab>.`",
    SELECT: "Open SQL statement that queries rows from persistent database tables into internal tables or work areas.",
    "COMMIT WORK": "Explicitly commits all open database transactions in the current SAP LUW to disk.",
    "ROLLBACK WORK": "Rolls back uncommitted changes made in the current SAP LUW.",
    "SY-SUBRC": "SAP system return code. `0` indicates success; `4` indicates row not found; other numbers indicate errors.",
    "SY-DATUM": "Current application server date in `YYYYMMDD` format.",
    "SY-UZEIT": "Current application server time in `HHMMSS` format.",
    "SY-TABIX": "Index of current table row inside `LOOP AT` or after `READ TABLE`.",
    "SY-INDEX": "Loop iteration counter inside `DO` or `WHILE` blocks.",
    "SY-MANDT": "Current SAP client number (e.g. 100, 200, 800).",
    "SY-UNAME": "Current logged-in developer username.",
    "SY-DBCNT": "Number of database rows processed by the preceding Open SQL operation.",
    STRLEN: "Built-in function returning the length of a string in characters.",
    LINES: "Built-in function returning the count of rows in an internal table.",
    "START-OF-SELECTION": "Processing block event in executable reports triggered after selection screen parameters are entered.",
  }

  return docs[term] || null
}

