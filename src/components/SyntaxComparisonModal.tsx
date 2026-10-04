import { useState } from "react"
import CodeBlock from "./CodeBlock"
import { TechIcon } from "./TechIcons"
import { Zap, Play, X } from "lucide-react"

interface SyntaxComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadCode: (code: string, language: string) => void
  topics: Array<{ id: string; title: string; description: string; snippets: Record<string, { code: string; notes: string }> }>
  languages: Array<{ id: string; label: string; filename: string }>
}

export default function SyntaxComparisonModal({
  isOpen,
  onClose,
  onLoadCode,
  topics,
  languages,
}: SyntaxComparisonModalProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    "",
  )
  const [viewMode, setViewMode] = useState<"side-by-side" | "single">(
    "side-by-side",
  )
  const [activeLang, setActiveLang] = useState<string>("")

  if (!isOpen) return null

  const currentTopic = topics.find((t) => t.id === selectedTopicId) || topics[0]
  const comparisonLanguages = languages.filter((language) => currentTopic?.snippets[language.id])
  const selectedLang = comparisonLanguages.find((language) => language.id === activeLang) || comparisonLanguages[0]
  if (!currentTopic || !comparisonLanguages.length) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"><div className="rounded-xl bg-slate-900 p-6 text-slate-300">No syntax comparisons are available from the API.<button onClick={onClose} className="ml-4 text-indigo-400">Close</button></div></div>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Syntax Comparison Matrix</span>
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                  {comparisonLanguages.map((language) => language.label).join(" vs ")}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand how syntax, memory, and paradigms differ across major
                programming languages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "side-by-side"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Grid View (All languages)
              </button>
              <button
                onClick={() => setViewMode("single")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "single"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tabbed View
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Topic navigation tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 overflow-x-auto">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedTopicId === topic.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic Overview Banner */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <h3 className="text-base font-semibold text-white mb-1">
              {currentTopic.title}
            </h3>
            <p className="text-sm text-slate-300">{currentTopic.description}</p>
          </div>

          {/* Side-by-side 2x2 Grid View */}
          {viewMode === "side-by-side" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisonLanguages.map((lang) => {
                const snippetData = currentTopic.snippets[lang.id]
                return (
                  <div
                    key={lang.id}
                    className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-medium text-xs text-white">
                        <TechIcon name={lang.id} className="w-4 h-4" />
                        <span>{lang.label}</span>
                      </div>
                      <button
                        onClick={() => {
                          onLoadCode(snippetData.code, lang.id)
                          onClose()
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:text-white bg-indigo-950/60 hover:bg-indigo-600 border border-indigo-800/60 rounded transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Load into Editor</span>
                      </button>
                    </div>

                    <div className="flex-1">
                      <CodeBlock
                        code={snippetData.code}
                        language={lang.id}
                        filename={`syntax_${lang.id}.${lang.filename.split(".").pop() || "txt"}`}
                        showLineNumbers={true}
                        maxHeight="240px"
                      />
                    </div>

                    <div className="p-3 bg-slate-900/40 border-t border-slate-800/80 text-xs text-slate-400">
                      <strong className="text-slate-300">Syntax trait: </strong>
                      {snippetData.notes}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Single Tabbed View */
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {comparisonLanguages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveLang(lang.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeLang === lang.id
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <TechIcon name={lang.id} className="w-4 h-4" />
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>

              {selectedLang && <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Syntax notes: {currentTopic.snippets[selectedLang.id].notes}
                  </span>
                  <button
                    onClick={() => {
                      onLoadCode(
                        currentTopic.snippets[selectedLang.id].code,
                        selectedLang.id,
                      )
                      onClose()
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Load in Compiler</span>
                  </button>
                </div>

                <CodeBlock
                  code={currentTopic.snippets[selectedLang.id].code}
                  language={selectedLang.id}
                  filename={`syntax_${selectedLang.id}.${selectedLang.filename.split(".").pop() || "txt"}`}
                  showLineNumbers={true}
                  maxHeight="360px"
                />
              </div>}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Tip: Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Tab
            </kbd>{" "}
            in the editor for 4-space indentation.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
