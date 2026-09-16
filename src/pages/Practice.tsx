import { useState } from "react";
import { Link } from "react-router-dom";
import { codingProblems } from "../data/mockData";

const difficultyColors: Record<string, string> = {
  Easy: "text-green-600 bg-green-50",
  Medium: "text-amber-600 bg-amber-50",
  Hard: "text-red-600 bg-red-50",
};

const topicTags = ["All", "Arrays", "Strings", "Linked List", "Stack", "Binary Search", "Dynamic Programming", "Backtracking", "Two Pointers", "Hash Map", "Sorting"];

const problemDetail = codingProblems[0];

const starterCode = `def twoSum(nums, target):
    # Write your solution below
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test your solution
nums = [2, 7, 11, 15]
target = 9
print(twoSum(nums, target))  # Expected: [0, 1]`;

export default function Practice() {
  const [view, setView] = useState<"list" | "problem">("list");
  const [selectedDiff, setSelectedDiff] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");

  const filtered = codingProblems.filter(p => {
    const matchDiff = selectedDiff === "All" || p.difficulty === selectedDiff;
    const matchTopic = selectedTopic === "All" || p.topics.includes(selectedTopic);
    return matchDiff && matchTopic;
  });

  const stats = {
    easy: codingProblems.filter(p => p.difficulty === "Easy" && p.solved).length,
    easyTotal: codingProblems.filter(p => p.difficulty === "Easy").length,
    medium: codingProblems.filter(p => p.difficulty === "Medium" && p.solved).length,
    mediumTotal: codingProblems.filter(p => p.difficulty === "Medium").length,
    hard: codingProblems.filter(p => p.difficulty === "Hard" && p.solved).length,
    hardTotal: codingProblems.filter(p => p.difficulty === "Hard").length,
  };

  const runCode = () => {
    setRunning(true);
    setOutput("");
    setTimeout(() => {
      setRunning(false);
      setOutput(`Running test cases...\n\n✓ Test 1: nums=[2,7,11,15], target=9  →  [0, 1]  ✓\n✓ Test 2: nums=[3,2,4], target=6      →  [1, 2]  ✓\n✓ Test 3: nums=[3,3], target=6         →  [0, 1]  ✓\n\nAll 3/3 test cases passed!\nRuntime: 42ms | Memory: 14.3 MB`);
    }, 1500);
  };

  const submit = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setSubmitted(true);
    }, 2000);
  };

  if (view === "problem") {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
        {/* Problem header bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
            ← Back
          </button>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {["Description", "Hints", "Solutions"].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={runCode} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              {running ? "Running..." : "▶ Run"}
            </button>
            <button onClick={submit} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              Submit
            </button>
          </div>
        </div>

        {/* Split layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problem panel */}
          <div className="w-[400px] shrink-0 overflow-y-auto bg-white border-r border-slate-200 p-5">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-xl font-bold text-green-600 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Accepted!</h2>
                <p className="text-sm text-slate-500 mb-4">Your solution passed all test cases</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Runtime", value: "42ms", sub: "Faster than 87%" },
                    { label: "Memory", value: "14.3 MB", sub: "Better than 74%" },
                    { label: "Test Cases", value: "57/57", sub: "All passed" },
                    { label: "Score", value: "+100 XP", sub: "Bonus applied" },
                  ].map(s => (
                    <div key={s.label} className="bg-green-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-green-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                      <div className="text-xs text-green-600 mt-0.5">{s.sub}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSubmitted(false)} className="text-sm text-indigo-600 hover:underline">View problem again</button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Problem #1</span>
                    <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Two Sum</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Easy</span>
                      <span className="text-xs text-slate-400">Acceptance: 73%</span>
                    </div>
                  </div>
                </div>

                {activeTab === "Description" && (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                      <p>Given an array of integers <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">nums</code> and an integer <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">target</code>, return indices of the two numbers such that they add up to <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">target</code>.</p>
                      <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explain: "Because nums[0] + nums[1] == 9, return [0, 1]." },
                        { input: "nums = [3,2,4], target = 6", output: "[1,2]", explain: null },
                        { input: "nums = [3,3], target = 6", output: "[0,1]", explain: null },
                      ].map((ex, i) => (
                        <div key={i} className="bg-slate-50 rounded-lg p-3 text-xs font-mono space-y-1">
                          <p className="text-slate-500">Example {i + 1}:</p>
                          <p><span className="text-slate-400">Input: </span><span className="text-slate-900">{ex.input}</span></p>
                          <p><span className="text-slate-400">Output: </span><span className="text-green-600">{ex.output}</span></p>
                          {ex.explain && <p><span className="text-slate-400">Explain: </span><span className="text-slate-600 font-sans">{ex.explain}</span></p>}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Constraints:</h4>
                      <ul className="text-xs text-slate-600 space-y-1 font-mono">
                        <li>• 2 ≤ nums.length ≤ 10⁴</li>
                        <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                        <li>• -10⁹ ≤ target ≤ 10⁹</li>
                        <li>• Only one valid answer exists.</li>
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["Arrays", "Hash Map"].map(tag => (
                        <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Hints" && (
                  <div className="space-y-3">
                    {[
                      "A brute-force solution is O(n²) — check every pair. Can you do better?",
                      "For each number, what other number would complete the pair?",
                      "A hash map can tell you if a number exists in O(1) time.",
                    ].map((hint, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Hint {i + 1}</p>
                        <p className="text-sm text-slate-700">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Code editor */}
          <div className="flex-1 flex flex-col bg-slate-950">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-mono">🐍 solution.py</span>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-sm leading-6 resize-none outline-none"
              spellCheck={false}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />

            {/* Output */}
            {output && (
              <div className="h-40 border-t border-slate-800 p-4 overflow-auto">
                <p className="text-xs font-semibold text-slate-400 mb-2">Test Results</p>
                <pre className="text-green-400 font-mono text-xs leading-5 whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span><span className="text-slate-700">Coding Practice</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Coding Lab</h1>
          <p className="text-slate-500 mt-1">Practice problems to sharpen your skills and ace interviews</p>
        </div>
        <Link to="/compiler" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          💻 Open Free Compiler
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Easy", solved: stats.easy, total: stats.easyTotal, color: "text-green-600 bg-green-50", bar: "bg-green-500" },
          { label: "Medium", solved: stats.medium, total: stats.mediumTotal, color: "text-amber-600 bg-amber-50", bar: "bg-amber-500" },
          { label: "Hard", solved: stats.hard, total: stats.hardTotal, color: "text-red-600 bg-red-50", bar: "bg-red-500" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border border-current border-opacity-20`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{s.label}</span>
              <span className="text-sm font-bold">{s.solved}/{s.total}</span>
            </div>
            <div className="h-1.5 bg-white/60 rounded-full">
              <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${(s.solved / s.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {["All", "Easy", "Medium", "Hard"].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDiff(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDiff === d ? (d === "Easy" ? "bg-green-500 text-white" : d === "Medium" ? "bg-amber-500 text-white" : d === "Hard" ? "bg-red-500 text-white" : "bg-indigo-600 text-white") : "text-slate-600 hover:bg-slate-100"}`}
            >
              {d}
            </button>
          ))}
        </div>
        <select
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {topicTags.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Problem list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1">Status</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Topics</div>
          <div className="col-span-2">Acceptance</div>
        </div>
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => setView("problem")}
            className="w-full grid grid-cols-12 gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50 text-left items-center transition-colors group"
          >
            <div className="col-span-1">
              {p.solved ? (
                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</span>
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center" />
              )}
            </div>
            <div className="col-span-5">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {p.id}. {p.title}
              </span>
            </div>
            <div className="col-span-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[p.difficulty]}`}>{p.difficulty}</span>
            </div>
            <div className="col-span-2">
              <div className="flex flex-wrap gap-1">
                {p.topics.slice(0, 2).map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="col-span-2 text-sm text-slate-500">{p.acceptance}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
