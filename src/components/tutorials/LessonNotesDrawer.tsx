import { useState, useEffect } from "react"
import { Edit3, Save, Trash2, X, Check } from "lucide-react"
import { getNoteForLesson, saveNote, deleteNote } from "../../api/tutorialsApi"

interface LessonNotesDrawerProps {
  isOpen: boolean
  onClose: () => void
  lessonId: string
  trackId: string
  lessonTitle: string
}

export default function LessonNotesDrawer({
  isOpen,
  onClose,
  lessonId,
  trackId,
  lessonTitle,
}: LessonNotesDrawerProps) {
  const [content, setContent] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const existing = getNoteForLesson(lessonId)
      setContent(existing ? existing.content : "")
      setIsSaved(false)
    }
  }, [isOpen, lessonId])

  const handleSave = async () => {
    if (!content.trim()) return
    await saveNote(lessonId, trackId, content)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleDelete = () => {
    deleteNote(lessonId)
    setContent("")
    setIsSaved(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Personal Lesson Notes</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lesson Context */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Lesson: <span className="font-semibold text-slate-700 dark:text-slate-300">{lessonTitle}</span>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-4 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setIsSaved(false)
            }}
            placeholder="Type your personal insights, key syntax reminders, or formulas here..."
            className="w-full flex-1 resize-none p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          {content && (
            <button
              onClick={handleDelete}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? "Saved!" : "Save Note"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

