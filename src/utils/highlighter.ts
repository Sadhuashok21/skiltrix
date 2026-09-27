/**
 * Robust, zero-dependency code syntax highlighter for SkilTrix.
 * Provides fast, reliable tokenization for Python, Java, C, C++, JavaScript, TypeScript, SQL, HTML, CSS.
 * Generates tokens compatible with Prism dark theme CSS classes defined in src/index.css.
 */

export function normalizeLanguage(lang: string): string {
  const l = (lang || "").toLowerCase().trim()
  switch (l) {
    case "py":
    case "python":
    case "python3":
      return "python"
    case "java":
      return "java"
    case "c":
      return "c"
    case "cpp":
    case "c++":
      return "cpp"
    case "js":
    case "javascript":
      return "javascript"
    case "ts":
    case "typescript":
      return "javascript"
    case "sql":
      return "sql"
    case "html":
    case "htm":
    case "xml":
      return "markup"
    case "css":
      return "css"
    default:
      return "clike"
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

interface TokenRule {
  type: string
  regex: RegExp
}

function getRules(lang: string): TokenRule[] {
  if (lang === "python") {
    return [
      { type: "comment", regex: /^(?:"""[\s\S]*?"""|'''[\s\S]*?'''|#.*)/ },
      { type: "string", regex: /^(?:f?"(?:\\.|[^"\\\n])*"|f?'(?:\\.|[^'\\\n])*')/ },
      { type: "number", regex: /^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/ },
      { type: "boolean", regex: /^(?:True|False|None)\b/ },
      {
        type: "keyword",
        regex:
          /^(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
      },
      {
        type: "builtin",
        regex:
          /^(?:int|float|str|list|dict|set|tuple|range|len|enumerate|zip|map|filter|sum|min|max|sorted|type|isinstance|open|input)\b/,
      },
      { type: "function", regex: /^[a-zA-Z_]\w*(?=\s*\()/ },
      { type: "class-name", regex: /^[A-Z]\w*/ },
      { type: "variable", regex: /^[a-zA-Z_]\w*/ },
      { type: "operator", regex: /^(?:->|[+\-*/%=!<>]=?|\/\/=?|\*\*=?|&|\||\^|~|<<|>>)/ },
      { type: "punctuation", regex: /^[{}()[\];,.:]/ },
    ]
  }

  if (lang === "c" || lang === "cpp") {
    return [
      {
        type: "macro",
        regex: /^#\s*(?:include|define|undef|ifdef|ifndef|if|else|elif|endif|pragma)\b[^\r\n]*/,
      },
      { type: "comment", regex: /^(?:\/\*[\s\S]*?\*\/|\/\/.*)/ },
      { type: "string", regex: /^(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/ },
      { type: "number", regex: /^(?:0[xX][0-9a-fA-F]+[uUlL]*|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFuUlL]*)\b/ },
      { type: "boolean", regex: /^(?:true|false|NULL|nullptr)\b/ },
      {
        type: "keyword",
        regex:
          /^(?:alignas|alignof|auto|bool|break|case|catch|char|class|const|constexpr|continue|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|while)\b/,
      },
      {
        type: "builtin",
        regex:
          /^(?:std|cin|cout|cerr|endl|vector|string|map|set|pair|make_pair|unique_ptr|shared_ptr|size_t|int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t|printf|scanf|malloc|free|memcpy|memset)\b/,
      },
      { type: "function", regex: /^[a-zA-Z_]\w*(?=\s*\()/ },
      { type: "class-name", regex: /^[A-Z]\w*/ },
      { type: "variable", regex: /^[a-zA-Z_]\w*/ },
      { type: "operator", regex: /^(?:[+\-*/%=!<>]=?|->|\+\+|--|&&|\|\||<<=?|>>=?|::|&|\||\^|~|\?)/ },
      { type: "punctuation", regex: /^[{}()[\];,.:]/ },
    ]
  }

  if (lang === "java") {
    return [
      { type: "macro", regex: /^@[A-Za-z]\w*/ },
      { type: "comment", regex: /^(?:\/\*[\s\S]*?\*\/|\/\/.*)/ },
      { type: "string", regex: /^(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/ },
      { type: "number", regex: /^(?:0[xX][0-9a-fA-F]+[lL]?|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFdDlL]?)\b/ },
      { type: "boolean", regex: /^(?:true|false|null)\b/ },
      {
        type: "keyword",
        regex:
          /^(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|record|sealed|permits)\b/,
      },
      {
        type: "builtin",
        regex:
          /^(?:System|String|Integer|Double|Float|Boolean|Long|Short|Byte|Character|Math|Arrays|Collections|List|ArrayList|Map|HashMap|Set|HashSet|Scanner|StringBuilder|Exception|Object)\b/,
      },
      { type: "function", regex: /^[a-zA-Z_]\w*(?=\s*\()/ },
      { type: "class-name", regex: /^[A-Z]\w*/ },
      { type: "variable", regex: /^[a-zA-Z_]\w*/ },
      { type: "operator", regex: /^(?:[+\-*/%=!<>]=?|\+\+|--|&&|\|\||<<=?|>>=?|>>>|&|\||\^|~|\?)/ },
      { type: "punctuation", regex: /^[{}()[\];,.:]/ },
    ]
  }

  if (lang === "sql") {
    return [
      { type: "comment", regex: /^(?:--.*|\/\*[\s\S]*?\*\/)/ },
      { type: "string", regex: /^(?:'(?:''|[^'])*'|"(?:\\.|[^"\n])*")/ },
      { type: "number", regex: /^\b\d+(?:\.\d+)?\b/ },
      { type: "boolean", regex: /^(?:TRUE|FALSE|NULL)\b/i },
      {
        type: "keyword",
        regex:
          /^(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|TABLE|VIEW|INDEX|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|OFFSET|UNION|ALL|DISTINCT|AS|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|CHECK|DEFAULT|CONSTRAINT)\b/i,
      },
      {
        type: "builtin",
        regex:
          /^(?:COUNT|SUM|AVG|MIN|MAX|NOW|CURRENT_TIMESTAMP|COALESCE|CONCAT|SUBSTRING|TRIM|ROUND|CAST|INT|VARCHAR|TEXT|DATE|DATETIME|TIMESTAMP|DECIMAL|FLOAT|BOOLEAN)\b/i,
      },
      { type: "function", regex: /^[a-zA-Z_]\w*(?=\s*\()/ },
      { type: "variable", regex: /^[a-zA-Z_]\w*/ },
      { type: "operator", regex: /^(?:[+\-*/%=!<>]=?|<>|\|\|)/ },
      { type: "punctuation", regex: /^[{}()[\];,.:]/ },
    ]
  }

  if (lang === "markup") {
    return [
      { type: "comment", regex: /^<!--[\s\S]*?-->/ },
      { type: "doctype", regex: /^<!DOCTYPE[^>]*>/i },
      { type: "tag", regex: /^<\/?([a-zA-Z0-9:-]+)/ },
      { type: "attr-value", regex: /^=(?:"[^"]*"|'[^']*'|[^\s'">=]+)/ },
      { type: "attr-name", regex: /^[a-zA-Z_:][-a-zA-Z0-9_:.]*/ },
      { type: "punctuation", regex: /^[<>/=]/ },
      { type: "entity", regex: /^&[#\w]+;/ },
    ]
  }

  if (lang === "css") {
    return [
      { type: "comment", regex: /^(?:\/\*[\s\S]*?\*\/|\/\/.*)/ },
      { type: "string", regex: /^(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/ },
      { type: "number", regex: /^\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%|s|ms|deg|fr)?\b/ },
      { type: "property", regex: /^[\w-]+(?=\s*:)/ },
      { type: "class-name", regex: /^[.#][\w-]+/ },
      { type: "variable", regex: /^--[\w-]+/ },
      { type: "function", regex: /^[\w-]+(?=\s*\()/ },
      { type: "punctuation", regex: /^[{}()[\];:,]/ },
    ]
  }

  // JavaScript / TypeScript / clike fallback
  return [
    { type: "comment", regex: /^(?:\/\*[\s\S]*?\*\/|\/\/.*)/ },
    { type: "string", regex: /^(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`[\s\S]*?`)/ },
    { type: "number", regex: /^(?:0[xX][0-9a-fA-F]+|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/ },
    { type: "boolean", regex: /^(?:true|false|null|undefined|NaN)\b/ },
    {
      type: "keyword",
      regex:
        /^(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/,
    },
    {
      type: "builtin",
      regex:
        /^(?:console|window|document|Math|JSON|Promise|Array|Object|String|Number|Boolean|Date|RegExp|Map|Set|WeakMap|WeakSet|Symbol|Error|setTimeout|setInterval|clearTimeout|clearInterval|fetch|parseInt|parseFloat)\b/,
    },
    { type: "function", regex: /^[a-zA-Z_$][\w$]*(?=\s*\()/ },
    { type: "class-name", regex: /^[A-Z][\w$]*/ },
    { type: "variable", regex: /^[a-zA-Z_$][\w$]*/ },
    { type: "operator", regex: /^(?:[+\-*/%=!<>]=?|===|!==|=>|\+\+|--|&&|\|\||\?\?|\?:|&|\||\^|~|\?)/ },
    { type: "punctuation", regex: /^[{}()[\];,.:]/ },
  ]
}

export function highlightCode(code: string, language: string): string {
  if (!code) return ""

  const normalized = normalizeLanguage(language)
  const rules = getRules(normalized)

  let html = ""
  let pos = 0
  const len = code.length

  while (pos < len) {
    const sub = code.slice(pos)

    // Handle whitespace rapidly
    const ws = sub.match(/^[ \t\r\n]+/)
    if (ws) {
      html += ws[0]
      pos += ws[0].length
      continue
    }

    let matched = false
    for (let r = 0; r < rules.length; r++) {
      const rule = rules[r]
      const match = sub.match(rule.regex)
      if (match) {
        const text = match[0]
        html += `<span class="token ${rule.type}">${escapeHtml(text)}</span>`
        pos += text.length
        matched = true
        break
      }
    }

    if (!matched) {
      html += escapeHtml(code[pos])
      pos++
    }
  }

  return html
}

export const Prism = {
  highlight: highlightCode,
  languages: {} as Record<string, unknown>,
}
