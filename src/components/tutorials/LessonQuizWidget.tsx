import { useState, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { LessonQuiz } from "../../data/tutorialsCatalog"
import { recordLessonProgress, getStoredProgress } from "../../api/tutorialsApi"

interface LessonQuizWidgetProps {
  quiz: LessonQuiz
  lessonId: string
  trackId: string
  lessonSlug: string
  onQuizCompleted?: (score: number, passed: boolean) => void
}

export default function LessonQuizWidget({
  quiz,
  lessonId,
  trackId,
  lessonSlug,
  onQuizCompleted,
}: LessonQuizWidgetProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasPassed, setHasPassed] = useState(false)

  // Check if previously completed
  useEffect(() => {
    const progress = getStoredProgress()
    const prevScore = progress[trackId]?.quizScores?.[lessonId]
    if (prevScore !== undefined && prevScore > 0) {
      setSelectedIndex(quiz.correctIndex)
      setIsSubmitted(true)
      setHasPassed(true)
    } else {
      setSelectedIndex(null)
      setIsSubmitted(false)
      setHasPassed(false)
    }
  }, [lessonId, trackId, quiz.correctIndex])

  const handleSelect = (idx: number) => {
    if (isSubmitted) return
    setSelectedIndex(idx)
  }

  const handleSubmit = () => {
    if (selectedIndex === null) return
    const passed = selectedIndex === quiz.correctIndex
    setIsSubmitted(true)
    setHasPassed(passed)

    if (passed) {
      recordLessonProgress({
        trackId,
        lessonId,
        lessonSlug,
        quizScore: quiz.xpAward || 25,
      })
    }

    if (onQuizCompleted) {
      onQuizCompleted(passed ? (quiz.xpAward || 25) : 0, passed)
    }
  }

  const handleRetry = () => {
    setSelectedIndex(null)
    setIsSubmitted(false)
    setHasPassed(false)
  }

  const letters = ["A", "B", "C", "D", "E"]

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Knowledge Check</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Test what you learned in this lesson</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold text-xs border border-amber-200/50 dark:border-amber-800/40">
          <Trophy className="w-3.5 h-3.5" />
          <span>+{quiz.xpAward || 25} XP</span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-5">
        <p className="text-base font-medium text-slate-800 dark:text-slate-200 leading-snug">
          {quiz.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {quiz.options.map((option, idx) => {
          const isChosen = selectedIndex === idx
          const isCorrect = idx === quiz.correctIndex

          let optionStyle =
            "border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200"

          if (isSubmitted) {
            if (isCorrect) {
              optionStyle =
                "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium"
            } else if (isChosen && !isCorrect) {
              optionStyle =
                "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
            } else {
              optionStyle =
                "border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/30 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400"
            }
          } else if (isChosen) {
            optionStyle =
              "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs"
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isSubmitted}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold ${
                    isSubmitted && isCorrect
                      ? "bg-emerald-600 text-white"
                      : isSubmitted && isChosen && !isCorrect
                      ? "bg-rose-600 text-white"
                      : isChosen
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-700"
                  }`}
                >
                  {letters[idx] || idx + 1}
                </span>
                <span className="text-sm font-sans">{option}</span>
              </div>

              {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isSubmitted && isChosen && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation Banner */}
      {isSubmitted && (
        <div
          className={`p-4 rounded-xl border mb-5 text-xs leading-relaxed ${
            hasPassed
              ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold mb-1">
            {hasPassed ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Correct! You gained +{quiz.xpAward || 25} XP</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Incorrect! Review the explanation below:</span>
              </>
            )}
          </div>
          <p className="mt-1 font-sans">{quiz.explanation}</p>
        </div>
      )}

      {/* Submit / Retry Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {isSubmitted
            ? hasPassed
              ? "Quiz completed"
              : "Review concepts and try again"
            : selectedIndex !== null
            ? "Ready to check your answer"
            : "Select an option to submit"}
        </span>

        {isSubmitted ? (
          !hasPassed && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white shadow-xs transition-all"
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  )
}

