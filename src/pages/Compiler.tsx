import { useState, useCallback } from "react"
import CodeEditor from "../components/CodeEditor"
import SyntaxComparisonModal from "../components/SyntaxComparisonModal"
import { TechIcon } from "../components/TechIcons"
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
  paradigm: string
  syntaxSummary: string
}

const LANGUAGES: LanguageDef[] = [
  {
    id: "python",
    label: "Python 3",
    filename: "main.py",
    paradigm: "Dynamic • High-level",
    syntaxSummary:
      "Indentation scoped • def keyword • # comments • print() • Dynamic typing",
  },
  {
    id: "java",
    label: "Java 17",
    filename: "Main.java",
    paradigm: "Strictly Typed • OOP",
    syntaxSummary:
      "public class Main • public static void main • System.out.println() • { } blocks",
  },
  {
    id: "cpp",
    label: "C++ 20",
    filename: "main.cpp",
    paradigm: "Compiled • Multi-paradigm",
    syntaxSummary:
      "#include <iostream> • using namespace std; • cout << • STL & references",
  },
  {
    id: "c",
    label: "C (GCC)",
    filename: "main.c",
    paradigm: "Procedural • Low-level",
    syntaxSummary:
      '#include <stdio.h> • int main() • printf("%d") • pointers * & manual memory',
  },
  {
    id: "javascript",
    label: "JavaScript",
    filename: "main.js",
    paradigm: "Event-driven • Dynamic",
    syntaxSummary:
      "function / const / let • console.log() • async/await • template strings",
  },
  {
    id: "sql",
    label: "SQL",
    filename: "query.sql",
    paradigm: "Declarative • Relational",
    syntaxSummary:
      "CREATE TABLE • INSERT INTO • SELECT ... WHERE • -- comments",
  },
  {
    id: "html",
    label: "HTML / CSS",
    filename: "index.html",
    paradigm: "Markup & Styles",
    syntaxSummary:
      "<!DOCTYPE html> • <html> • <style> CSS rules • Live interactive preview",
  },
]

const STARTER_CODE: Record<string, string> = {
  python: `# Welcome to SkillTrix Python 3 Compiler
# Write your code below and click Run

def greet(name: str) -> str:
    return f"Hello, {name}!"

# Call the function
message = greet("Developer")
print(message)

# Loop example
for i in range(1, 4):
    print(f"Line {i}: Learning Python with SkillTrix")`,

  java: `// Welcome to SkillTrix Java Compiler
// Strictly-typed object-oriented language

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Developer!");

        // Loop example
        for (int i = 1; i <= 3; i++) {
            System.out.println("Line " + i + ": Learning Java with SkillTrix");
        }
    }

    static String greet(String name) {
        return "Hello, " + name + "!";
    }
} `,

  cpp: `// Welcome to SkillTrix C++ Compiler
// High performance with templates and STL

#include <iostream>
#include <string>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << greet("Developer") << endl;

    for (int i = 1; i <= 3; i++) {
        cout << "Line " << i << ": Learning C++ with SkillTrix" << endl;
    }

    return 0;
}`,

  c: `// Welcome to SkillTrix C Compiler
// Procedural language with direct memory control

#include <stdio.h>

int main(void) {
    printf("Hello, Developer!\\n");

    for (int i = 1; i <= 3; i++) {
        printf("Line %d: Learning C with SkillTrix\\n", i);
    }

    return 0;
}`,

  javascript: `// Welcome to SkillTrix JavaScript Compiler

function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("Developer");
console.log(message);

// Loop example
for (let i = 1; i <= 3; i++) {
  console.log(\`Line \${i}: Learning JS with SkillTrix\`);
}`,

  sql: `-- Welcome to SkillTrix SQL Compiler

CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    score INT,
    course VARCHAR(50)
);

INSERT INTO students VALUES
    (1, 'Jordan', 92, 'Python'),
    (2, 'Priya', 88, 'JavaScript'),
    (3, 'Marcus', 95, 'DSA'),
    (4, 'Aisha', 79, 'Java');

-- Query: Find top students
SELECT name, course, score
FROM students
WHERE score > 85
ORDER BY score DESC;`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillTrix Live Web Preview</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
    }
    .card {
      background: rgba(255, 255, 255, 0.95);
      color: #0f172a;
      border-radius: 16px;
      padding: 2.5rem 3rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      max-width: 380px;
    }
    h1 { color: #4338ca; margin: 0 0 0.5rem 0; font-size: 1.6rem; }
    p { color: #475569; margin: 0; font-size: 0.95rem; }
    .badge {
      display: inline-block;
      margin-top: 1.25rem;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 600;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, World!</h1>
    <p>Welcome to SkillTrix Live HTML/CSS Compiler</p>
    <div class="badge">Live Preview Active</div>
  </div>
</body>
</html>`,
}

const MOCK_OUTPUTS: Record<string, string> = {
  python: `Hello, Developer!
Line 1: Learning Python with SkillTrix
Line 2: Learning Python with SkillTrix
Line 3: Learning Python with SkillTrix

Execution completed in 0.12s`,

  javascript: `Hello, Developer!
Line 1: Learning JS with SkillTrix
Line 2: Learning JS with SkillTrix
Line 3: Learning JS with SkillTrix

Execution completed in 0.08s`,

  java: `Hello, Developer!
Line 1: Learning Java with SkillTrix
Line 2: Learning Java with SkillTrix
Line 3: Learning Java with SkillTrix

Execution completed in 0.34s`,

  cpp: `Hello, Developer!
Line 1: Learning C++ with SkillTrix
Line 2: Learning C++ with SkillTrix
Line 3: Learning C++ with SkillTrix

Execution completed in 0.05s`,

  c: `Hello, Developer!
Line 1: Learning C with SkillTrix
Line 2: Learning C with SkillTrix
Line 3: Learning C with SkillTrix

Execution completed in 0.04s`,

  sql: `name    | course     | score
--------|------------|-------
Marcus  | DSA        | 95
Jordan  | Python     | 92
Priya   | JavaScript | 88

3 rows returned · 0.02s`,

  html: `[Live Web Preview is rendering in the preview tab]`,
}

export default function Compiler() {
  const [lang, setLang] = useState("python")
  const [code, setCode] = useState(STARTER_CODE.python)
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

  const currentLang = LANGUAGES.find((l) => l.id === lang) || LANGUAGES[0]

  const handleLangChange = (l: string) => {
    setLang(l)
    setCode(STARTER_CODE[l] || "")
    setOutput("")
    setStatus("idle")
    if (l === "html") {
      setActiveOutputTab("preview")
    } else {
      setActiveOutputTab("console")
    }
  }

  const handleLoadCodeFromModal = useCallback(
    (newCode: string, newLang: string) => {
      setLang(newLang)
      setCode(newCode)
      setOutput("")
      setStatus("idle")
      setActiveOutputTab("console")
    },
    [],
  )

  const runCode = () => {
    setStatus("running")
    setOutput("")
    setTimeout(() => {
      if (code.trim() === "") {
        setStatus("error")
        setOutput("Error: No code to run. Write some code first!")
      } else {
        setStatus("success")
        setOutput(MOCK_OUTPUTS[lang] || "Code executed successfully.")
      }
    }, 900)
  }

  const reset = () => {
    setCode(STARTER_CODE[lang] || "")
    setOutput("")
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
          {LANGUAGES.map((l) => (
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
          title="Compare syntax between Python, Java, C, and C++"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Compare Syntax:</span>
          <span>Python vs Java vs C vs C++</span>
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
      </div>

      {/* Language Syntax Highlight Info Banner */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
            <TechIcon name={currentLang.id} className="w-4 h-4" />
            <span>{currentLang.label}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">
            {currentLang.paradigm}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 truncate max-w-md md:max-w-xl font-mono text-[11px]">
            {currentLang.syntaxSummary}
          </span>
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
              onChange={setCode}
              language={lang}
              fontSize={fontSize}
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
              {lang === "html" && (
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
            {lang === "html" && activeOutputTab === "preview" ? (
              <div className="h-full w-full rounded-xl overflow-hidden bg-white shadow-inner border border-slate-700">
                <iframe
                  title="HTML Live Preview"
                  srcDoc={code}
                  sandbox="allow-scripts"
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
      />
    </div>
  )
}
