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
 * based on live backend progress, profile records, and tutorial activity.
 */
export function getUserLevelInfo(
  progress?: Record<string, any> | null,
  profile?: Record<string, any> | null,
  defaultBaselineXp: number = 4280
): UserLevelInfo {
  const backendXp = Number(progress?.xp ?? profile?.total_xp ?? profile?.xp ?? 0)
  const streakXp = getStreakData()?.totalXp ?? 0

  // Combine backend progress XP with local tutorial/quiz achievements
  let totalXp = Math.max(backendXp, streakXp)
  if (totalXp <= 0) {
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

