import { useState } from "react"
import { Link } from "react-router-dom"
import { codingProblems } from "../data/mockData"
import CodeEditor from "../components/CodeEditor"
import CodeBlock from "../components/CodeBlock"
import { TechIcon } from "../components/TechIcons"
import {
  Play,
  CheckCircle2,
  Circle,
  Trophy,
  Terminal,
  Loader2,
} from "lucide-react"

const difficultyColors: Record<string, string> = {
  Easy: "text-green-600 bg-green-50",
  Medium: "text-amber-600 bg-amber-50",
  Hard: "text-red-600 bg-red-50",
}

const topicTags = [
  "All",
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Binary Search",
  "Dynamic Programming",
  "Backtracking",
  "Two Pointers",
  "Hash Map",
  "Sorting",
]

const PRACTICE_LANGUAGES = [
  { id: "python", label: "Python", ext: "py" },
  { id: "java", label: "Java", ext: "java" },
  { id: "cpp", label: "C++", ext: "cpp" },
  { id: "c", label: "C", ext: "c" },
  { id: "javascript", label: "JavaScript", ext: "js" },
] as const

type PracticeLangKey = typeof PRACTICE_LANGUAGES[number]["id"]

const PRACTICE_STARTERS: Record<PracticeLangKey, string> = {
  python: `def twoSum(nums: list[int], target: int) -> list[int]:
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
print(twoSum(nums, target))  # Expected: [0, 1]`,

  java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution below
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int[] result = twoSum(nums, 9);
        System.out.println("[" + result[0] + ", " + result[1] + "]");
    }
}`,

  cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution below
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    auto res = sol.twoSum(nums, 9);
    cout << "[" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}`,

  c: `#include <stdio.h>
#include <stdlib.h>

// Return an array of size *returnSize.
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));

    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return NULL;
}

int main(void) {
    int nums[] = {2, 7, 11, 15};
    int size = 0;
    int* res = twoSum(nums, 4, 9, &size);
    if (res) {
        printf("[%d, %d]\\n", res[0], res[1]);
        free(res);
    }
    return 0;
}`,

  javascript: `function twoSum(nums, target) {
  // Write your solution below
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}

// Test your solution
const nums = [2, 7, 11, 15];
const target = 9;
console.log(twoSum(nums, target)); // Expected: [0, 1]`,
}

export default function Practice() {
  const [view, setView] = useState<"list" | "problem">("list")
  const [selectedDiff, setSelectedDiff] = useState("All")
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [practiceLang, setPracticeLang] = useState<PracticeLangKey>("python")
  const [code, setCode] = useState(PRACTICE_STARTERS.python)
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("Description")

  const filtered = codingProblems.filter((p) => {
    const matchDiff = selectedDiff === "All" || p.difficulty === selectedDiff
    const matchTopic =
      selectedTopic === "All" || p.topics.includes(selectedTopic)
    return matchDiff && matchTopic
  })

  const stats = {
    easy: codingProblems.filter((p) => p.difficulty === "Easy" && p.solved)
      .length,
    easyTotal: codingProblems.filter((p) => p.difficulty === "Easy").length,
    medium: codingProblems.filter((p) => p.difficulty === "Medium" && p.solved)
      .length,
    mediumTotal: codingProblems.filter((p) => p.difficulty === "Medium").length,
    hard: codingProblems.filter((p) => p.difficulty === "Hard" && p.solved)
      .length,
    hardTotal: codingProblems.filter((p) => p.difficulty === "Hard").length,
  }

  const handleLangSelect = (newLang: PracticeLangKey) => {
    setPracticeLang(newLang)
    setCode(PRACTICE_STARTERS[newLang])
    setOutput("")
  }

  const runCode = () => {
    setRunning(true)
    setOutput("")
    setTimeout(() => {
      setRunning(false)
      setOutput(
        `Running test cases in ${practiceLang.toUpperCase()}...\n\n` +
          `[PASS] Test 1: nums=[2,7,11,15], target=9  ->  [0, 1]\n` +
          `[PASS] Test 2: nums=[3,2,4], target=6      ->  [1, 2]\n` +
          `[PASS] Test 3: nums=[3,3], target=6         ->  [0, 1]\n\n` +
          `All 3/3 test cases passed!\n` +
          `Runtime: 38ms | Memory: 14.1 MB`,
      )
    }, 1200)
  }

  const submit = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setSubmitted(true)
    }, 1500)
  }

  const currentLangObj =
    PRACTICE_LANGUAGES.find((l) => l.id === practiceLang) ||
    PRACTICE_LANGUAGES[0]

  if (view === "problem") {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
        {/* Problem header bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Back to Problems
          </button>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {["Description", "Hints", "Solutions"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === t
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={runCode}
              disabled={running}
              className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {running ? (
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
            <button
              onClick={submit}
              disabled={running}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Split layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problem panel (Left) */}
          <div className="w-[420px] shrink-0 overflow-y-auto bg-white border-r border-slate-200 p-5">
            {submitted ? (
              <div className="text-center py-8">
                <Trophy className="w-14 h-14 text-amber-500 mx-auto mb-3" />
                <h2
                  className="text-xl font-bold text-green-600 mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Accepted!
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Your solution passed all test cases
                </p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Runtime", value: "38ms", sub: "Faster than 89%" },
                    {
                      label: "Memory",
                      value: "14.1 MB",
                      sub: "Better than 76%",
                    },
                    {
                      label: "Language",
                      value: currentLangObj.label,
                      sub: "Compiled OK",
                    },
                    { label: "Score", value: "+100 XP", sub: "Bonus applied" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-green-50 rounded-xl p-3 text-center"
                    >
                      <div
                        className="font-bold text-green-700"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {s.value}
                      </div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                      <div className="text-xs text-green-600 mt-0.5">
                        {s.sub}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-indigo-600 font-semibold hover:underline"
                >
                  ← Edit solution again
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">
                      Problem #1
                    </span>
                    <h2
                      className="text-lg font-bold text-slate-900"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Two Sum
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Easy
                      </span>
                      <span className="text-xs text-slate-400">
                        Acceptance: 73%
                      </span>
                    </div>
                  </div>
                </div>

                {activeTab === "Description" && (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                      <p>
                        Given an array of integers{" "}
                        <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-indigo-700">
                          nums
                        </code>{" "}
                        and an integer{" "}
                        <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-indigo-700">
                          target
                        </code>
                        , return indices of the two numbers such that they add
                        up to{" "}
                        <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-indigo-700">
                          target
                        </code>
                        .
                      </p>
                      <p>
                        You may assume that each input would have exactly one
                        solution, and you may not use the same element twice.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          input: "nums = [2,7,11,15], target = 9",
                          output: "[0,1]",
                          explain:
                            "Because nums[0] + nums[1] == 9, return [0, 1].",
                        },
                        {
                          input: "nums = [3,2,4], target = 6",
                          output: "[1,2]",
                          explain: null,
                        },
                        {
                          input: "nums = [3,3], target = 6",
                          output: "[0,1]",
                          explain: null,
                        },
                      ].map((ex, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 rounded-lg p-3 text-xs font-mono space-y-1 border border-slate-100"
                        >
                          <p className="text-slate-500 font-semibold">
                            Example {i + 1}:
                          </p>
                          <p>
                            <span className="text-slate-400">Input: </span>
                            <span className="text-slate-900">{ex.input}</span>
                          </p>
                          <p>
                            <span className="text-slate-400">Output: </span>
                            <span className="text-green-600 font-semibold">
                              {ex.output}
                            </span>
                          </p>
                          {ex.explain && (
                            <p>
                              <span className="text-slate-400">Explain: </span>
                              <span className="text-slate-600 font-sans">
                                {ex.explain}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">
                        Constraints:
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1 font-mono">
                        <li>• 2 ≤ nums.length ≤ 10⁴</li>
                        <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                        <li>• -10⁹ ≤ target ≤ 10⁹</li>
                        <li>• Only one valid answer exists.</li>
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Arrays", "Hash Map", "Two Pointers"].map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Hints" && (
                  <div className="space-y-3">
                    {[
                      "A brute-force solution is O(n²) — check every pair. Can you do better?",
                      "For each number, what other number would complete the pair? (complement = target - num)",
                      "A hash map / dictionary can tell you if a complement already exists in O(1) time.",
                    ].map((hint, i) => (
                      <div
                        key={i}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                      >
                        <p className="text-xs font-semibold text-amber-700 mb-1">
                          Hint {i + 1}
                        </p>
                        <p className="text-sm text-slate-700">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Solutions" && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Here is the optimal{" "}
                      <strong>O(n) Time / O(n) Space</strong> solution using a
                      hash map in <strong>{currentLangObj.label}</strong>:
                    </p>
                    <CodeBlock
                      code={PRACTICE_STARTERS[practiceLang]}
                      language={practiceLang}
                      filename={`solution.${currentLangObj.ext}`}
                      showLineNumbers={true}
                      maxHeight="320px"
                    />
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                      <p>
                        <strong>Time Complexity:</strong> O(n) — single pass
                        through the array.
                      </p>
                      <p>
                        <strong>Space Complexity:</strong> O(n) — stores at most
                        n elements in the hash map.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Code Editor Panel (Right) */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Editor Top Bar with Language Selector */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 font-medium">
                  <TechIcon name={currentLangObj.id} className="w-4 h-4" />
                  <span>solution.{currentLangObj.ext}</span>
                </span>
              </div>

              {/* Language selection toggle */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                {PRACTICE_LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLangSelect(l.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      practiceLang === l.id
                        ? "bg-indigo-600 text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <TechIcon name={l.id} className="w-3.5 h-3.5" />
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Syntax Highlighted Interactive Editor */}
            <div className="flex-1 flex overflow-hidden">
              <CodeEditor
                code={code}
                onChange={setCode}
                language={practiceLang}
                fontSize="sm"
              />
            </div>

            {/* Test Results Output */}
            {output && (
              <div className="h-44 border-t border-slate-800 bg-slate-900/90 p-4 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Test Execution Output
                  </span>
                  <button
                    onClick={() => setOutput("")}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>
                <pre className="text-green-400 font-mono text-xs leading-5 whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700">Coding Practice</span>
          </nav>
          <h1
            className="text-3xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Coding Lab
          </h1>
          <p className="text-slate-500 mt-1">
            Practice problems with multi-language syntax highlighting in Python,
            Java, C++, C, and JavaScript
          </p>
        </div>
        <Link
          to="/compiler"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Terminal className="w-4 h-4" />
          <span>Open Free Compiler</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Easy",
            solved: stats.easy,
            total: stats.easyTotal,
            color: "text-green-600 bg-green-50",
            bar: "bg-green-500",
          },
          {
            label: "Medium",
            solved: stats.medium,
            total: stats.mediumTotal,
            color: "text-amber-600 bg-amber-50",
            bar: "bg-amber-500",
          },
          {
            label: "Hard",
            solved: stats.hard,
            total: stats.hardTotal,
            color: "text-red-600 bg-red-50",
            bar: "bg-red-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.color} rounded-xl p-4 border border-current border-opacity-20`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{s.label}</span>
              <span className="text-sm font-bold">
                {s.solved}/{s.total}
              </span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${s.bar} rounded-full transition-all`}
                style={{ width: `${(s.solved / s.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">
            Difficulty:
          </span>
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDiff(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDiff === d
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">
            Topic:
          </span>
          {topicTags.slice(0, 6).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTopic === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Problem list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
          <div className="col-span-1">Status</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Acceptance</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((prob) => (
            <div
              key={prob.id}
              className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-1">
                {prob.solved ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="col-span-5">
                <button
                  onClick={() => setView("problem")}
                  className="font-semibold text-slate-900 hover:text-indigo-600 text-left text-sm"
                >
                  {prob.id}. {prob.title}
                </button>
                <div className="flex gap-1.5 mt-1">
                  {prob.topics.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[prob.difficulty]}`}
                >
                  {prob.difficulty}
                </span>
              </div>
              <div className="col-span-2 text-xs text-slate-500 font-mono">
                {prob.acceptance}
              </div>
              <div className="col-span-2 text-right">
                <button
                  onClick={() => setView("problem")}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  Solve →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
