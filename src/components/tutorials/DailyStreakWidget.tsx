import { useEffect, useState } from "react"
import { Flame, Trophy, Calendar, Check, Zap } from "lucide-react"
import { getStreakData, UserStreakData } from "../../api/tutorialsApi"

interface DailyStreakWidgetProps {
  className?: string
  compact?: boolean
}

export default function DailyStreakWidget({
  className = "",
  compact = false,
}: DailyStreakWidgetProps) {
  const [streakData, setStreakData] = useState<UserStreakData>({
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    activeDates: [],
    totalXp: 120,
  })

  useEffect(() => {
    setStreakData(getStreakData())
  }, [])

  // Calculate past 7 days representation
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const today = new Date()
  const todayDayIndex = (today.getDay() + 6) % 7 // 0 = Mon, 6 = Sun

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 ${className}`}
      >
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{streakData.currentStreak} Day Streak</span>
        </div>
        <div className="h-3 w-[1px] bg-amber-300/60 dark:bg-amber-700/60" />
        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{streakData.totalXp} XP</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <Flame className="w-5 h-5 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {streakData.currentStreak} Day Streak
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {streakData.currentStreak > 1
                ? "Keep up the momentum! Study daily."
                : "Complete a lesson today to level up!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>{streakData.totalXp} XP</span>
        </div>
      </div>

      {/* Weekday Strip */}
      <div className="grid grid-cols-7 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === todayDayIndex
          const isPastOrToday = idx <= todayDayIndex
          // Show active for today and past days based on streak
          const isActive = isPastOrToday && (todayDayIndex - idx < streakData.currentStreak)

          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span className={`text-[11px] font-medium ${isToday ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                {day}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? "bg-amber-500 text-white shadow-xs scale-105"
                    : isToday
                    ? "border-2 border-dashed border-amber-400 text-amber-600 dark:text-amber-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {isActive ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

