import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, BookOpen, Code, ArrowRight } from "lucide-react"
import { searchLocalTutorials, SearchResultItem } from "../../api/tutorialsApi"

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // Parent triggers open
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleSearchChange = (val: string) => {
    setQuery(val)
    if (val.trim()) {
      setResults(searchLocalTutorials(val))
    } else {
      setResults([])
    }
  }

  const handleSelectResult = (item: SearchResultItem) => {
    onClose()
    if (item.type === "track") {
      navigate(`/tutorials/${item.trackId}`)
    } else {
      navigate(`/tutorials/${item.trackId}/${item.lessonSlug}`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search 60+ programming languages, tutorials, and topics… (e.g. Java inheritance, React hooks)"
            className="w-full py-4 pl-3 pr-10 text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>Type a topic like "Java Syntax", "Python Lists", "Docker", "Algorithms" or "SQL"</p>
              <p className="mt-2 text-slate-500 font-mono">Press Esc to close</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No tutorials or lessons found matching "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      {item.type === "track" ? <BookOpen className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.snippet}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search 60+ programming tracks & thousands of lessons</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">ESC</kbd>
            <span>to exit</span>
          </div>
        </div>
      </div>
    </div>
  )
}

