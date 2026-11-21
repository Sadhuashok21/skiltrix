import { getStreakData } from "../api/tutorialsApi"

export interface UserLevelInfo {
  totalXp: number
  level: number
  nextLevel: number
  xpInCurrentLevel: number
  xpNeededForNextLevel: number
  levelFloorXp: number
  levelCeilXp: number
  progressPercent: number
  formattedTotalXp: string
  formattedXpNeeded: string
}

export const XP_PER_LEVEL = 1000

/**
 * Dynamically computes a learner's level, progress percentage, and XP remaining
 * based on live backend progress, profile records, and tutorial/problem activity.
 * Removes hardcoded mock data so zero-activity accounts start accurately at 0 XP / Level 1.
 */
export function getUserLevelInfo(
  progress?: Record<string, any> | null,
  profile?: Record<string, any> | null,
  defaultBaselineXp: number = 0
): UserLevelInfo {
  const backendXp = Number(progress?.xp ?? profile?.total_xp ?? profile?.xp ?? 0)

  // Compute live activity XP earned by the user
  let activityXp = 0

  // 1. Problems solved: 50 XP per problem
  const problemsSolved = Number(progress?.problems_solved ?? profile?.problems_solved ?? 0)
  activityXp += problemsSolved * 50

  // 2. Quizzes completed: 30 XP per quiz
  const quizzesPassed = Number(progress?.quizzes_passed ?? profile?.quizzes_completed ?? 0)
  activityXp += quizzesPassed * 30

  // 3. Tutorial lessons completed: 25 XP per lesson
  try {
    const rawProg = localStorage.getItem("skiltrix_tutorial_progress_v1")
    if (rawProg) {
      const parsed = JSON.parse(rawProg)
      let lessonCount = 0
      Object.values(parsed).forEach((track: any) => {
        if (Array.isArray(track?.completedLessons)) {
          lessonCount += track.completedLessons.length
        }
      })
      activityXp += lessonCount * 25
    }
  } catch {
    // ignore
  }

  // 4. Stored streak XP
  const streakXp = getStreakData()?.totalXp ?? 0

  // Combine live sources, with no mock fallback
  let totalXp = Math.max(backendXp, activityXp, streakXp)
  if (totalXp <= 0 && defaultBaselineXp > 0) {
    totalXp = defaultBaselineXp
  }

  const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1)
  const nextLevel = level + 1
  const levelFloorXp = (level - 1) * XP_PER_LEVEL
  const levelCeilXp = level * XP_PER_LEVEL
  const xpInCurrentLevel = totalXp - levelFloorXp
  const xpNeededForNextLevel = Math.max(0, levelCeilXp - totalXp)
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100)))

  return {
    totalXp,
    level,
    nextLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    levelFloorXp,
    levelCeilXp,
    progressPercent,
    formattedTotalXp: `${totalXp.toLocaleString()} XP`,
    formattedXpNeeded: `${xpNeededForNextLevel.toLocaleString()} XP to Level ${nextLevel}`,
  }
}

/**
 * Computes an accurate, dynamic daily streak by combining server activity logs,
 * local tutorial progress timestamps, and current active session dates.
 */
export function calculateDynamicStreak(
  progress?: Record<string, any> | null,
  profile?: Record<string, any> | null,
  activity?: Record<string, any>[] | null
): number {
  const allActiveDates = new Set<string>()

  // 1. From backend activity
  if (Array.isArray(activity)) {
    activity.forEach((act) => {
      if (act?.date) {
        try {
          const dStr = new Date(act.date).toISOString().slice(0, 10)
          allActiveDates.add(dStr)
        } catch {
          // ignore
        }
      }
    })
  }

  // 2. From stored tutorial progress
  try {
    const rawProg = localStorage.getItem("skiltrix_tutorial_progress_v1")
    if (rawProg) {
      const parsed = JSON.parse(rawProg)
      Object.values(parsed).forEach((tp: any) => {
        if (tp?.lastAccessedAt) {
          try {
            const dStr = new Date(tp.lastAccessedAt).toISOString().slice(0, 10)
            allActiveDates.add(dStr)
          } catch {
            // ignore
          }
        }
      })
    }
  } catch {
    // ignore
  }

  // 3. From streak data in localStorage
  try {
    const rawStreak = localStorage.getItem("skiltrix_tutorial_streak_v1")
    if (rawStreak) {
      const parsed = JSON.parse(rawStreak)
      if (Array.isArray(parsed?.activeDates)) {
        parsed.activeDates.forEach((d: string) => {
          if (typeof d === "string") allActiveDates.add(d.slice(0, 10))
        })
      }
      if (parsed?.lastActiveDate && typeof parsed.lastActiveDate === "string") {
        allActiveDates.add(parsed.lastActiveDate.slice(0, 10))
      }
    }
  } catch {
    // ignore
  }

  // User is actively browsing today
  const todayStr = new Date().toISOString().slice(0, 10)
  allActiveDates.add(todayStr)

  let streak = 0
  const check = new Date()
  while (true) {
    const dStr = check.toISOString().slice(0, 10)
    if (allActiveDates.has(dStr)) {
      streak++
      check.setDate(check.getDate() - 1)
    } else {
      break
    }
  }

  const backendStreak = Number(progress?.streak ?? profile?.current_streak ?? 0)
  return Math.max(streak, backendStreak)
}
