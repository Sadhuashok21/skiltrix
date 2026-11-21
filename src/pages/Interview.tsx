import { useState } from "react"
import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import CodeBlock from "../components/CodeBlock"
import { TechIcon } from "../components/TechIcons"
import { AlertTriangle, Terminal, Target } from "lucide-react"
import { renderInlineMarkdown } from "../utils/markdownRenderer"

export interface InterviewQuestion {
  id: string
  topic: string
  difficulty: string
  question: string
  shortAnswer: string
  explanation?: string
  code?: string
  tags?: string[]
  frequentCompanies?: string[]
}

const getCodeLanguage = (topic: string) => {
  const t = (topic || "").toLowerCase()
  if (t.includes("java") && !t.includes("script")) return "java"
  if (t.includes("sql")) return "sql"
  if (t.includes("script") || t.includes("react")) return "javascript"
  if (t.includes("html") || t.includes("css")) return "html"
  return "python"
}

export default function Interview() {
  const { interviews: apiQuestions } = useSkiltrixData()
  const interviewQs: InterviewQuestion[] = apiQuestions.map((item) => ({
    id: item.interview_id,
    topic: item.topic || "General",
    difficulty: item.difficulty || "Common",
    question: item.question,
    shortAnswer: item.short_answer,
    explanation: item.explanation,
    code: item.code,
    tags: Array.isArray(item.tags) ? item.tags : [],
    frequentCompanies: Array.isArray(item.frequent_companies) ? item.frequent_companies : [],
  }))
  const categories = [...new Set(interviewQs.map((question) => question.topic))].map((name) => ({
    name,
    icon: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
    count: interviewQs.filter((question) => question.topic === name).length,
  }))
  const [selectedQ, setSelectedQ] = useState<InterviewQuestion | null>(null)
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredQs =
    activeCategory === "All"
      ? interviewQs
      : interviewQs.filter(
          (q) => q.topic.toLowerCase() === activeCategory.toLowerCase(),
        )

  if (selectedQ) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <button
            onClick={() => setSelectedQ(null)}
            className="hover:text-indigo-600"
          >
            Interview Questions
          </button>
          <span>/</span>
          <span className="text-slate-700">{selectedQ.topic}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {/* Question */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  {selectedQ.topic}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {selectedQ.difficulty}
                </span>
              </div>
              <h1
                className="text-xl font-bold text-slate-900 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {renderInlineMarkdown(selectedQ.question)}
              </h1>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-indigo-900 mb-1">
                  Quick Answer
                </h3>
                <p className="text-sm text-indigo-800">
                  {renderInlineMarkdown(selectedQ.shortAnswer)}
                </p>
              </div>

              <h3
                className="font-bold text-slate-900 mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Detailed Explanation
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-5">
                {renderInlineMarkdown(selectedQ.explanation)}
              </p>

              {selectedQ.code && (
                <div className="mb-5">
                  <h3
                    className="font-bold text-slate-900 mb-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Code Example
                  </h3>
                  <CodeBlock
                    code={selectedQ.code}
                    language={getCodeLanguage(selectedQ.topic)}
                    filename={`solution.${
                      getCodeLanguage(selectedQ.topic) === "javascript"
                        ? "js"
                        : getCodeLanguage(selectedQ.topic) === "java"
                        ? "java"
                        : getCodeLanguage(selectedQ.topic) === "sql"
                        ? "sql"
                        : "py"
                    }`}
                  />
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-slate-100">
                <h3
                  className="font-bold text-slate-900 mb-2 flex items-center gap-1.5"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Key Interview Takeaway</span>
                </h3>
                <p className="text-sm text-indigo-900 bg-indigo-50/70 border border-indigo-200/60 rounded-xl p-3">
                  Always articulate trade-offs (time vs space complexity, mutability vs safety) when answering in technical rounds.
                </p>
              </div>
            </div>

            {/* Related questions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3
                className="font-bold text-slate-900 mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Related Questions
              </h3>
              <div className="space-y-2">
                {interviewQs
                  .filter((q) => q.id !== selectedQ.id)
                  .slice(0, 3)
                  .map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQ(q)}
                      className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all text-sm text-slate-700 hover:text-indigo-700 font-medium"
                    >
                      → {q.question}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3
                className="font-bold text-slate-900 mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Practice This
              </h3>
              <Link
                to="/compilers"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mb-2"
              >
                <Terminal className="w-4 h-4" />
                <span>Open Compiler</span>
              </Link>
              <Link
                to="/quizzes"
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Related Quiz</span>
              </Link>
            </div>
            {selectedQ.tags && selectedQ.tags.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3
                  className="font-bold text-slate-900 mb-3"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQ.tags.map((tag) => (
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

            {selectedQ.frequentCompanies && selectedQ.frequentCompanies.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3
                  className="font-bold text-slate-900 mb-3"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Asked at Companies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQ.frequentCompanies.map((comp) => (
                    <span
                      key={comp}
                      className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold border border-slate-200"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setSelectedQ(null)}
              className="w-full text-sm text-slate-500 hover:text-slate-900"
            >
              ← Back to all questions
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700">Interview Questions</span>
        </nav>
        <h1
          className="text-3xl font-extrabold text-slate-900 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Interview Questions
        </h1>
        <p className="text-slate-500">
          Master common interview questions with detailed explanations and code
          examples
        </p>
      </div>

      {/* Category grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <button
          onClick={() => setActiveCategory("All")}
          className={`group p-5 rounded-xl border text-left transition-all cursor-pointer ${
            activeCategory === "All"
              ? "border-indigo-400 bg-indigo-50 shadow-xs"
              : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <h3
            className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            All Questions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {interviewQs.length} questions
          </p>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`group p-5 rounded-xl border text-left transition-all cursor-pointer ${
              activeCategory === cat.name
                ? "border-indigo-400 bg-indigo-50 shadow-xs"
                : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
              <TechIcon name={cat.icon || cat.name} className="w-5 h-5 text-indigo-600" />
            </div>
            <h3
              className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {cat.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {cat.count} questions
            </p>
          </button>
        ))}
      </div>

      {/* Question list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2
            className="font-bold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {activeCategory === "All"
              ? "All Questions"
              : `${activeCategory} Questions`}
          </h2>
          <span className="text-xs text-slate-400">
            {filteredQs.length} questions
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredQs.length > 0 ? (
            filteredQs.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setSelectedQ(q)}
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-indigo-600 shrink-0 transition-colors">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {q.question}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {q.shortAnswer}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(q.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 mt-0.5">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                    {q.topic}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {q.difficulty}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 text-sm">
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {activeCategory === "All"
                  ? "There are no interview questions added yet."
                  : `There are no interview questions added for ${activeCategory} yet.`}
              </p>
              <p className="text-xs text-slate-400">
                Check back soon or select another category from above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
