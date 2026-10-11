import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Terminal, Play, Copy, Check, Code2, Sparkles, BookOpen, CheckCircle2, ArrowRight, Layers, Cpu } from "lucide-react"
import CodeBlock from "../components/CodeBlock"

interface PHPTemplate {
  id: string
  name: string
  tag: string
  code: string
  output: string
}

const TEMPLATES: PHPTemplate[] = [
  {
    id: "basics",
    name: "PHP 8.2 Basics & Arrays",
    tag: "Fundamentals",
    code: `<?php
// Welcome to SkilTrix PHP Online Compiler
$platform = "SkilTrix";
$version = phpversion();

$skills = ["PHP 8.2", "Laravel", "MySQL", "REST APIs"];

echo "=== Welcome to $platform PHP Sandbox ===\n";
echo "Running PHP Version: " . $version . "\n\n";

echo "Skills Catalog:\n";
foreach ($skills as $index => $skill) {
    echo "  [" . ($index + 1) . "] " . $skill . "\n";
}
`,
    output: `=== Welcome to SkilTrix PHP Sandbox ===
Running PHP Version: 8.2.10

Skills Catalog:
  [1] PHP 8.2
  [2] Laravel
  [3] MySQL
  [4] REST APIs`,
  },
  {
    id: "oop",
    name: "OOP & Typed Properties",
    tag: "Object Oriented",
    code: `<?php
class UserAssessment {
    public function __construct(
        public readonly string $candidate,
        public readonly string $role,
        private int $score
    ) {}

    public function getStatus(): string {
        return $this->score >= 70 ? "PASSED" : "NEEDS PRACTICE";
    }

    public function summary(): string {
        return sprintf("%s applying for %s: Result = %s (%d%%)", 
            $this->candidate, $this->role, $this->getStatus(), $this->score);
    }
}

$submission = new UserAssessment("Alex", "Backend Engineer", 88);
echo $submission->summary() . "\n";
`,
    output: `Alex applying for Backend Engineer: Result = PASSED (88%)`,
  },
  {
    id: "json-api",
    name: "JSON Response & Data Manipulation",
    tag: "Web / APIs",
    code: `<?php
$data = [
    "status" => "success",
    "timestamp" => time(),
    "payload" => [
        ["id" => 101, "course" => "PHP Core", "enrolled" => true],
        ["id" => 102, "course" => "Laravel Pro", "enrolled" => false]
    ]
];

echo json_encode($data, JSON_PRETTY_PRINT);
`,
    output: `{
    "status": "success",
    "timestamp": 1728214200,
    "payload": [
        {
            "id": 101,
            "course": "PHP Core",
            "enrolled": true
        },
        {
            "id": 102,
            "course": "Laravel Pro",
            "enrolled": false
        }
    ]
}`,
  },
]

export default function PHPCompilerLanding() {
  const [selectedTemplate, setSelectedTemplate] = useState<PHPTemplate>(TEMPLATES[0])
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedTemplate.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          High-Performance Cloud Sandbox
        </div>
        <h1
          className="text-4xl font-extrabold text-slate-900 mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Online PHP Compiler & Sandbox
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Write, test, and run PHP 8 code directly in your browser. Practice object-oriented programming, modern array functions, and backend algorithm challenges with zero setup.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            to="/compilers/php-compiler"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            Launch Live PHP Compiler
          </Link>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Browse Problems
          </Link>
        </div>
      </div>

      {/* Interactive Code Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-12">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950">
          <div className="flex items-center gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tpl.id === selectedTemplate.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
            <Link
              to="/compilers/php-compiler"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Run in Compiler
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          <div className="overflow-hidden min-h-[300px] max-h-[450px]">
            <CodeBlock
              code={selectedTemplate.code}
              language="php"
              filename="index.php"
              maxHeight="450px"
            />
          </div>
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto min-h-[300px] max-h-[450px]">
            <div className="text-slate-500 mb-2 font-sans text-[11px] uppercase tracking-wider font-bold">
              Standard Output (Terminal):
            </div>
            <pre className="text-emerald-400 whitespace-pre leading-relaxed">{selectedTemplate.output}</pre>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-xl">
          <Cpu className="w-8 h-8 text-indigo-600 mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">Instant Execution</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Execute modern PHP 8 scripts within milliseconds in secure cloud containers with real-time stdout and stderr.
          </p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-xl">
          <Code2 className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">Zero Configuration</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No need to install XAMPP, WAMP, or configure php.ini. Start writing code and practicing backend algorithms right away.
          </p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-xl">
          <BookOpen className="w-8 h-8 text-amber-600 mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">Assessment Ready</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Practice for company coding assessments with full support for input streams, command-line arguments, and unit tests.
          </p>
        </div>
      </div>
    </div>
  )
}
