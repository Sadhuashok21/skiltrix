import { useState } from "react";

const LANGUAGES = [
  { id: "python", label: "Python 3", icon: "🐍" },
  { id: "javascript", label: "JavaScript", icon: "⚡" },
  { id: "java", label: "Java", icon: "☕" },
  { id: "cpp", label: "C++", icon: "⚙️" },
  { id: "c", label: "C", icon: "🔧" },
  { id: "sql", label: "SQL", icon: "🗄️" },
  { id: "html", label: "HTML/CSS", icon: "🌐" },
];

const STARTER_CODE: Record<string, string> = {
  python: `# Welcome to SkillTrix Python Compiler
# Write your code below and click Run

def greet(name):
    return f"Hello, {name}! 👋"

# Call the function
message = greet("Developer")
print(message)

# Loop example
for i in range(1, 4):
    print(f"Line {i}: Learning Python with SkillTrix")`,

  javascript: `// Welcome to SkillTrix JavaScript Compiler

function greet(name) {
  return \`Hello, \${name}! 👋\`;
}

const message = greet("Developer");
console.log(message);

// Loop example
for (let i = 1; i <= 3; i++) {
  console.log(\`Line \${i}: Learning JS with SkillTrix\`);
}`,

  java: `// Welcome to SkillTrix Java Compiler

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Developer! 👋");

        // Loop example
        for (int i = 1; i <= 3; i++) {
            System.out.println("Line " + i + ": Learning Java with SkillTrix");
        }
    }

    static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

  cpp: `#include <iostream>
#include <string>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "! 👋";
}

int main() {
    cout << greet("Developer") << endl;

    for (int i = 1; i <= 3; i++) {
        cout << "Line " << i << ": Learning C++ with SkillTrix" << endl;
    }

    return 0;
}`,

  c: `#include <stdio.h>

int main() {
    printf("Hello, Developer! 👋\\n");

    for (int i = 1; i <= 3; i++) {
        printf("Line %d: Learning C with SkillTrix\\n", i);
    }

    return 0;
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
  <title>My First Webpage</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 2rem 3rem;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    h1 { color: #4F46E5; margin-bottom: 0.5rem; }
    p { color: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, World! 👋</h1>
    <p>Welcome to SkillTrix HTML/CSS Compiler</p>
  </div>
</body>
</html>`,
};

const MOCK_OUTPUTS: Record<string, string> = {
  python: `Hello, Developer! 👋
Line 1: Learning Python with SkillTrix
Line 2: Learning Python with SkillTrix
Line 3: Learning Python with SkillTrix

✓ Execution completed in 0.12s`,
  javascript: `Hello, Developer! 👋
Line 1: Learning JS with SkillTrix
Line 2: Learning JS with SkillTrix
Line 3: Learning JS with SkillTrix

✓ Execution completed in 0.08s`,
  java: `Hello, Developer! 👋
Line 1: Learning Java with SkillTrix
Line 2: Learning Java with SkillTrix
Line 3: Learning Java with SkillTrix

✓ Execution completed in 0.34s`,
  cpp: `Hello, Developer! 👋
Line 1: Learning C++ with SkillTrix
Line 2: Learning C++ with SkillTrix
Line 3: Learning C++ with SkillTrix

✓ Execution completed in 0.05s`,
  c: `Hello, Developer! 👋
Line 1: Learning C with SkillTrix
Line 2: Learning C with SkillTrix
Line 3: Learning C with SkillTrix

✓ Execution completed in 0.04s`,
  sql: `name    | course     | score
--------|------------|-------
Marcus  | DSA        | 95
Jordan  | Python     | 92
Priya   | JavaScript | 88

3 rows returned · 0.02s`,
  html: `[Live Preview rendered in browser]`,
};

export default function Compiler() {
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(STARTER_CODE.python);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleLangChange = (l: string) => {
    setLang(l);
    setCode(STARTER_CODE[l]);
    setOutput("");
    setStatus("idle");
  };

  const runCode = () => {
    setStatus("running");
    setOutput("");
    setTimeout(() => {
      if (code.trim() === "") {
        setStatus("error");
        setOutput("Error: No code to run. Write some code first!");
      } else {
        setStatus("success");
        setOutput(MOCK_OUTPUTS[lang] || "✓ Code executed successfully.");
      }
    }, 1200);
  };

  const reset = () => {
    setCode(STARTER_CODE[lang]);
    setOutput("");
    setStatus("idle");
  };

  const statusColor = { idle: "text-slate-400", running: "text-amber-500", success: "text-green-500", error: "text-red-500" };
  const statusText = { idle: "Ready", running: "Running...", success: "Success", error: "Error" };
  const statusIcon = { idle: "●", running: "◌", success: "✓", error: "✗" };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 flex-wrap gap-y-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SkillTrix Compiler</span>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 overflow-x-auto">
          {LANGUAGES.map(l => (
            <button
              key={l.id}
              onClick={() => handleLangChange(l.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${lang === l.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
            >
              <span>{l.icon}</span>
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${statusColor[status]}`}>
            <span className={status === "running" ? "animate-spin" : ""}>{statusIcon[status]}</span>
            {statusText[status]}
          </span>
          <button onClick={reset} className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            ↺ Reset
          </button>
          <button onClick={() => navigator.clipboard?.writeText(code)} className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            Copy
          </button>
          <button
            onClick={runCode}
            disabled={status === "running"}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {status === "running" ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running
              </>
            ) : (
              <>▶ Run</>
            )}
          </button>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Code editor */}
        <div className="flex-1 flex flex-col border-r border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-xs text-slate-500 font-mono">{LANGUAGES.find(l => l.id === lang)?.icon} main.{lang === "javascript" ? "js" : lang === "cpp" ? "cpp" : lang === "html" ? "html" : lang}</span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Line 1, Col 1</span>
              <span>UTF-8</span>
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden bg-slate-950">
            {/* Line numbers */}
            <div className="w-10 shrink-0 pt-4 pb-4 bg-slate-900 border-r border-slate-800 overflow-hidden select-none">
              {code.split("\n").map((_, i) => (
                <div key={i} className="text-right pr-2 text-slate-600 text-xs leading-6 font-mono">{i + 1}</div>
              ))}
            </div>
            {/* Code area */}
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-sm leading-6 resize-none outline-none overflow-auto"
              spellCheck={false}
              style={{ fontFamily: "'JetBrains Mono', monospace", tabSize: 4 }}
            />
          </div>
        </div>

        {/* Output panel */}
        <div className="lg:w-[420px] flex flex-col bg-slate-900" style={{ minHeight: "220px" }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Output / Console</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInput(!showInput)}
                className={`text-xs px-2 py-1 rounded ${showInput ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white bg-slate-800"}`}
              >
                stdin
              </button>
              {output && (
                <button onClick={() => setOutput("")} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
              )}
            </div>
          </div>

          {showInput && (
            <div className="border-b border-slate-800 px-4 py-2">
              <label className="text-xs text-slate-500 block mb-1">Standard input (stdin):</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter input here..."
                className="w-full bg-slate-800 text-slate-200 text-xs font-mono p-2 rounded border border-slate-700 outline-none resize-none h-16"
              />
            </div>
          )}

          <div className="flex-1 p-4 overflow-auto">
            {status === "idle" && !output && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-3">▶</div>
                <p className="text-slate-500 text-sm">Click <strong className="text-slate-300">Run</strong> to execute your code</p>
                <p className="text-slate-600 text-xs mt-1">Output will appear here</p>
              </div>
            )}
            {status === "running" && (
              <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Executing code...
              </div>
            )}
            {output && status === "success" && (
              <pre className="text-green-400 font-mono text-sm leading-6 whitespace-pre-wrap">{output}</pre>
            )}
            {output && status === "error" && (
              <div>
                <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Execution Error
                </div>
                <pre className="text-red-300 font-mono text-sm leading-6 whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-500">
            <span>{code.split("\n").length} lines</span>
            <span>{code.length} chars</span>
            <span className="ml-auto">{LANGUAGES.find(l => l.id === lang)?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
