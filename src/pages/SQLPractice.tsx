import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Database, Play, CheckCircle2, ArrowRight, Code2, Terminal, Sparkles, BookOpen, Layers } from "lucide-react"
import CodeBlock from "../components/CodeBlock"

interface SQLProblem {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  description: string
  initialQuery: string
  expectedOutput: string
}

const SQL_PROBLEMS: SQLProblem[] = [
  {
    id: "second-highest-salary",
    title: "Second Highest Salary",
    difficulty: "Medium",
    category: "Subqueries & Window Functions",
    description: "Write an SQL query to report the second highest distinct salary from the Employee table. If there is no second highest salary, report null.",
    initialQuery: `SELECT MAX(salary) AS SecondHighestSalary\nFROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);`,
    expectedOutput: `+---------------------+\n| SecondHighestSalary |\n+---------------------+\n| 95000               |\n+---------------------+`,
  },
  {
    id: "department-highest-salary",
    title: "Department Highest Salary",
    difficulty: "Medium",
    category: "JOIN & GROUP BY",
    description: "Write a query to find employees who have the highest salary in each of the departments.",
    initialQuery: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n  SELECT departmentId, MAX(salary)\n  FROM Employee\n  GROUP BY departmentId\n);`,
    expectedOutput: `+------------+----------+--------+\n| Department | Employee | Salary |\n+------------+----------+--------+\n| IT         | Jim      | 90000  |\n| Sales      | Henry    | 80000  |\n+------------+----------+--------+`,
  },
  {
    id: "consecutive-numbers",
    title: "Find Consecutive Numbers",
    difficulty: "Medium",
    category: "Self JOIN / LEAD-LAG",
    description: "Find all numbers that appear at least three times consecutively in the Logs table.",
    initialQuery: `SELECT DISTINCT l1.num AS ConsecutiveNums\nFROM Logs l1\nJOIN Logs l2 ON l1.id = l2.id - 1 AND l1.num = l2.num\nJOIN Logs l3 ON l1.id = l3.id - 2 AND l1.num = l3.num;`,
    expectedOutput: `+-----------------+\n| ConsecutiveNums |\n+-----------------+\n| 1               |\n+-----------------+`,
  },
  {
    id: "duplicate-emails",
    title: "Duplicate Emails",
    difficulty: "Easy",
    category: "GROUP BY & HAVING",
    description: "Write an SQL query to report all the duplicate emails in a table named Person.",
    initialQuery: `SELECT email AS Email\nFROM Person\nGROUP BY email\nHAVING COUNT(email) > 1;`,
    expectedOutput: `+---------+\n| Email   |\n+---------+\n| a@b.com |\n+---------+`,
  },
]

export default function SQLPractice() {
  const [selectedProblem, setSelectedProblem] = useState<SQLProblem>(SQL_PROBLEMS[0])
  const [activeTab, setActiveTab] = useState<"query" | "output">("query")

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3.5 h-3.5" />
              SQL Mastery Sandbox
            </span>
            <span className="text-xs text-slate-400">PostgreSQL · MySQL · SQLite</span>
          </div>
          <h1
            className="text-3xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            SQL Coding & Query Practice
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Solve real-world SQL problems testing joins, window functions, aggregations, and subqueries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/compilers/sql-compiler"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            Launch SQL Compiler
          </Link>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            All Practice Problems
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Featured SQL Assessment Challenges
          </div>
          {SQL_PROBLEMS.map((prob) => {
            const isSelected = prob.id === selectedProblem.id
            const diffClass =
              prob.difficulty === "Easy"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : prob.difficulty === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            return (
              <div
                key={prob.id}
                onClick={() => setSelectedProblem(prob)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-indigo-50/50 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${diffClass}`}>
                    {prob.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">{prob.category}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{prob.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{prob.description}</p>
              </div>
            )
          })}
        </div>

        {/* Right Column: Problem Workspace & Query Preview */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                {selectedProblem.category}
              </span>
              <span className="text-xs font-medium text-slate-400">Problem ID: {selectedProblem.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{selectedProblem.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedProblem.description}</p>
          </div>

          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900 text-white text-xs border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-slate-300">Solution Query (Standard SQL)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("query")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  activeTab === "query" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Query
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  activeTab === "output" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Expected Result
              </button>
            </div>
          </div>

          <div className="bg-slate-950 font-mono text-xs overflow-x-auto min-h-[220px]">
            {activeTab === "query" ? (
              <CodeBlock
                code={selectedProblem.initialQuery}
                language="sql"
                filename="solution.sql"
                maxHeight="400px"
              />
            ) : (
              <div className="p-5 text-slate-300 leading-relaxed whitespace-pre font-mono">
                {selectedProblem.expectedOutput}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Run interactive queries against live PostgreSQL in CodeLab or the SQL Compiler</span>
            </div>
            <Link
              to="/compilers/sql-compiler"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Open in SQL Compiler
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
