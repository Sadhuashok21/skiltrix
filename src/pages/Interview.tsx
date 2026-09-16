import { useState } from "react";
import { Link } from "react-router-dom";
import { interviewQs } from "../data/mockData";

const categories = [
  { name: "Python", icon: "🐍", count: 48 },
  { name: "JavaScript", icon: "⚡", count: 42 },
  { name: "Java", icon: "☕", count: 38 },
  { name: "HTML & CSS", icon: "🌐", count: 30 },
  { name: "DSA", icon: "🧮", count: 65 },
  { name: "Django", icon: "🎸", count: 22 },
  { name: "SQL", icon: "🗄️", count: 28 },
  { name: "System Design", icon: "🏗️", count: 18 },
];

export default function Interview() {
  const [selectedQ, setSelectedQ] = useState<typeof interviewQs[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  if (selectedQ) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span>
          <button onClick={() => setSelectedQ(null)} className="hover:text-indigo-600">Interview Questions</button><span>/</span>
          <span className="text-slate-700">{selectedQ.topic}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {/* Question */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{selectedQ.topic}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{selectedQ.difficulty}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{selectedQ.question}</h1>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-indigo-900 mb-1">Quick Answer</h3>
                <p className="text-sm text-indigo-800">{selectedQ.shortAnswer}</p>
              </div>

              <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Detailed Explanation</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-5">{selectedQ.explanation}</p>

              <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Code Example</h3>
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                  <span className="text-xs text-slate-400 font-mono">example.py</span>
                  <button className="text-xs text-slate-400 hover:text-white">Copy</button>
                </div>
                <pre className="p-4 text-sm font-mono text-slate-200 leading-6 overflow-x-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedQ.code}</pre>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>⚠️ Common Mistake</h3>
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Confusing mutability with variable reassignment. A tuple is immutable but if it contains a list, that list can still be modified.
                </p>
              </div>
            </div>

            {/* Related questions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Related Questions</h3>
              <div className="space-y-2">
                {interviewQs.filter(q => q.id !== selectedQ.id).slice(0, 3).map(q => (
                  <button key={q.id} onClick={() => setSelectedQ(q)} className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all text-sm text-slate-700 hover:text-indigo-700 font-medium">
                    → {q.question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Practice This</h3>
              <Link to="/compiler" className="block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold text-center py-2.5 rounded-lg transition-colors mb-2">
                💻 Open Compiler
              </Link>
              <Link to="/quizzes" className="block bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-sm font-semibold text-center py-2.5 rounded-lg transition-colors">
                🎯 Related Quiz
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedQ.tags.map(tag => (
                  <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setSelectedQ(null)} className="w-full text-sm text-slate-500 hover:text-slate-900">← Back to all questions</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span><span className="text-slate-700">Interview Questions</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Interview Questions</h1>
        <p className="text-slate-500">Master common interview questions with detailed explanations and code examples</p>
      </div>

      {/* Category grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`group p-5 rounded-xl border text-left transition-all ${activeCategory === cat.name ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"}`}
          >
            <div className="text-2xl mb-2">{cat.icon}</div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cat.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{cat.count} questions</p>
          </button>
        ))}
      </div>

      {/* Question list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {activeCategory === "All" ? "All Questions" : `${activeCategory} Questions`}
          </h2>
          <span className="text-xs text-slate-400">{interviewQs.length} questions</span>
        </div>
        <div className="divide-y divide-slate-100">
          {interviewQs.map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQ(q)}
              className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:text-indigo-600 shrink-0 transition-colors">
                {q.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{q.question}</p>
                <p className="text-xs text-slate-500 mt-1">{q.shortAnswer.slice(0, 80)}...</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {q.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium shrink-0 mt-1">{q.topic}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
