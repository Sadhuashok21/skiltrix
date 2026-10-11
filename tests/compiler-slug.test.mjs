import test from "node:test"
import assert from "node:assert/strict"

// Logic mirrored from Compiler.tsx
const normalize = (value) => {
  const compact = value.toLowerCase().replace(/[^a-z0-9+#]/g, "")
  const aliases = {
    "c++": "cpp", cxx: "cpp", "c#": "csharp", js: "javascript",
    node: "javascript", nodejs: "javascript", py: "python", python3: "python",
    python37: "python", python38: "python", python39: "python", python310: "python",
    python311: "python", python312: "python", python313: "python", java17: "java",
    cpp20: "cpp", "c++20": "cpp", htmlcss: "html", html5: "html", sqlite: "sql", sqlite3: "sql",
    postgresql: "sql", mysql: "sql",
  }
  return aliases[compact] || compact
}

const getCompilerSlug = (langId) => {
  const compact = normalize(langId || "python")
  return `${compact}-compiler`
}

const getCompilerPath = (langId) => {
  const compact = normalize(langId || "python")
  return `/compilers/${compact}-compiler`
}

const getLangFromSlugOrUrl = (pathname, search = "", paramLang, compilerSlug) => {
  if (paramLang) return normalize(paramLang.replace(/-compiler$/, ""))
  if (compilerSlug) {
    const clean = compilerSlug.toLowerCase().replace(/-compiler$/, "")
    return normalize(clean)
  }
  const searchLang = new URLSearchParams(search).get("lang")
  if (searchLang) return normalize(searchLang.replace(/-compiler$/, ""))

  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/")
  const first = segments[0]?.toLowerCase() || ""
  const second = segments[1]?.toLowerCase() || ""

  // Case 1: /compilers/java-compiler or /compiler/java-compiler or /compilers/java or /compiler/java
  if (first === "compilers" || first === "compiler") {
    if (second) {
      return normalize(second.replace(/-compiler$/, ""))
    }
  }

  // Case 2: /java-compiler
  if (first.endsWith("-compiler") && first !== "abap-compiler") {
    return normalize(first.replace(/-compiler$/, ""))
  }

  return null
}

test("generates expected compiler slugs and paths for all languages", () => {
  assert.equal(getCompilerSlug("java"), "java-compiler")
  assert.equal(getCompilerPath("java"), "/compilers/java-compiler")
  assert.equal(getCompilerPath("python"), "/compilers/python-compiler")
  assert.equal(getCompilerPath("cpp"), "/compilers/cpp-compiler")
  assert.equal(getCompilerPath("c++"), "/compilers/cpp-compiler")
  assert.equal(getCompilerPath("c"), "/compilers/c-compiler")
  assert.equal(getCompilerPath("javascript"), "/compilers/javascript-compiler")
  assert.equal(getCompilerPath("sql"), "/compilers/sql-compiler")
  assert.equal(getCompilerPath("php"), "/compilers/php-compiler")
  assert.equal(getCompilerPath("html"), "/compilers/html-compiler")
  assert.equal(getCompilerPath("rust"), "/compilers/rust-compiler")
  assert.equal(getCompilerPath("go"), "/compilers/go-compiler")
  assert.equal(getCompilerPath("csharp"), "/compilers/csharp-compiler")
})

test("extracts target language from pathname /compilers/<lang>-compiler", () => {
  assert.equal(getLangFromSlugOrUrl("/compilers/java-compiler"), "java")
  assert.equal(getLangFromSlugOrUrl("/compilers/python-compiler"), "python")
  assert.equal(getLangFromSlugOrUrl("/compilers/cpp-compiler"), "cpp")
  assert.equal(getLangFromSlugOrUrl("/compilers/c-compiler"), "c")
  assert.equal(getLangFromSlugOrUrl("/compilers/javascript-compiler"), "javascript")
  assert.equal(getLangFromSlugOrUrl("/compilers/sql-compiler"), "sql")
  assert.equal(getLangFromSlugOrUrl("/compilers/php-compiler"), "php")
  assert.equal(getLangFromSlugOrUrl("/compilers/rust-compiler"), "rust")
  assert.equal(getLangFromSlugOrUrl("/compilers/go-compiler"), "go")
})

test("extracts target language from pathname /<lang>-compiler", () => {
  assert.equal(getLangFromSlugOrUrl("/java-compiler"), "java")
  assert.equal(getLangFromSlugOrUrl("/python-compiler"), "python")
})

test("extracts target language from /compiler/:lang and query param", () => {
  assert.equal(getLangFromSlugOrUrl("/compiler/java"), "java")
  assert.equal(getLangFromSlugOrUrl("/compiler", "?lang=java"), "java")
  assert.equal(getLangFromSlugOrUrl("/compiler", "?lang=cpp"), "cpp")
  assert.equal(getLangFromSlugOrUrl("/compiler"), null)
})
