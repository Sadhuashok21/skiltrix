import { Award, CheckCircle2, BookOpen } from "lucide-react"
import { TutorialTrackItem } from "../../data/tutorialsCatalog"
import { getTrackCompletionStats } from "../../api/tutorialsApi"

interface CourseProgressWidgetProps {
  track: TutorialTrackItem
  onClaimCertificate?: () => void
  className?: string
}

export default function CourseProgressWidget({
  track,
  onClaimCertificate,
  className = "",
}: CourseProgressWidgetProps) {
  const stats = getTrackCompletionStats(track)

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Track Progress
          </h4>
        </div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {stats.percent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(4, stats.percent)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span>{stats.completedCount} of {stats.totalLessons} lessons completed</span>
        {stats.isCompleted && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Done
          </span>
        )}
      </div>

      {/* Certificate Call-to-Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        {stats.isCompleted || stats.percent >= 80 ? (
          <button
            onClick={onClaimCertificate}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Claim Your Certificate</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Award className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="line-clamp-2">Complete all lessons in this course to earn your verified SkilTrix certificate.</span>
          </div>
        )}
      </div>
    </div>
  )
}

