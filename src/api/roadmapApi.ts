import api from "./client"
import type { RoadmapTrack, RoadmapSummaryItem } from "../types/roadmap"
import {
  OFFICIAL_ROADMAPS_DATA,
  getLocalRoadmapWithProgress,
  getAllRoadmapsWithLocalProgress,
  setLocalStageCompleted,
  resetLocalRoadmapProgress,
  getLocalStageCompleted,
} from "../data/roadmapData"

export async function fetchCareerRoadmaps(
  category?: string,
  search?: string
): Promise<RoadmapSummaryItem[]> {
  try {
    const params: Record<string, string> = {}
    if (category && category !== "all") params.category = category
    if (search) params.q = search

    const res = await api.get("/learning-roadmaps/", { params })
    if (res.data?.status && Array.isArray(res.data.roadmaps)) {
      return res.data.roadmaps
    }
  } catch (err) {
    // Graceful fallback to rich local progress
  }

  // Fallback to local data
  let all = getAllRoadmapsWithLocalProgress()
  if (category && category !== "all") {
    all = all.filter((r) => r.category.toLowerCase() === category.toLowerCase())
  }
  if (search) {
    const q = search.toLowerCase()
    all = all.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.key.toLowerCase().includes(q)
    )
  }

  return all.map((r) => ({
    key: r.key,
    title: r.title,
    category: r.category,
    badge: r.badge,
    description: r.description,
    icon: r.icon,
    accent_color: r.accent_color,
    estimated_weeks: r.estimated_weeks,
    total_stages: r.total_stages,
    completed_stages: r.completed_stages,
    progress_percent: r.progress_percent,
    current_stage: r.current_stage || 1,
    stages_summary: r.stages.map((s) => ({
      stage_number: s.stage_number,
      title: s.title,
      completed: s.completed,
    })),
  }))
}

export async function fetchCareerRoadmapDetail(
  roadmapKey: string
): Promise<RoadmapTrack | null> {
  try {
    const res = await api.get(`/learning-roadmaps/${encodeURIComponent(roadmapKey)}/`)
    if (res.data?.status && res.data.roadmap) {
      const serverRoadmap = res.data.roadmap
      // Sync returned stages to local storage for offline use
      if (Array.isArray(serverRoadmap.stages)) {
        serverRoadmap.stages.forEach((st: any) => {
          setLocalStageCompleted(
            roadmapKey,
            st.stage_number,
            Boolean(st.completed),
            st.completed_subtopics
          )
        })
      }
      return serverRoadmap
    }
  } catch (err) {
    // Fallback to local storage
  }

  return getLocalRoadmapWithProgress(roadmapKey)
}

export async function toggleStageProgress(
  roadmapKey: string,
  stageNumber: number,
  completed?: boolean,
  completedSubtopics?: string[]
): Promise<{ completed: boolean; completed_stages: number; progress_percent: number }> {
  // Update local storage first (instant UI update)
  const currentState = getLocalStageCompleted(roadmapKey, stageNumber)
  const nextState = completed !== undefined ? completed : !currentState
  setLocalStageCompleted(roadmapKey, stageNumber, nextState, completedSubtopics)

  try {
    const res = await api.post(
      `/learning-roadmaps/${encodeURIComponent(roadmapKey)}/stage/${stageNumber}/toggle/`,
      {
        completed: nextState,
        completed_subtopics: completedSubtopics,
      }
    )
    if (res.data?.status) {
      return {
        completed: res.data.completed,
        completed_stages: res.data.completed_stages,
        progress_percent: res.data.progress_percent,
      }
    }
  } catch (err) {
    // Server unauthenticated or offline: return local calculation
  }

  const localUpdated = getLocalRoadmapWithProgress(roadmapKey)
  return {
    completed: nextState,
    completed_stages: localUpdated?.completed_stages || 0,
    progress_percent: localUpdated?.progress_percent || 0,
  }
}

export async function resetRoadmapProgressApi(
  roadmapKey: string
): Promise<boolean> {
  // Reset local
  resetLocalRoadmapProgress(roadmapKey)

  try {
    await api.post(`/learning-roadmaps/${encodeURIComponent(roadmapKey)}/reset/`)
    return true
  } catch (err) {
    return true
  }
}

export async function syncLocalProgressToServer(): Promise<void> {
  const payload: Record<string, number[]> = {}
  for (const rm of OFFICIAL_ROADMAPS_DATA) {
    const completedNums: number[] = []
    for (const st of rm.stages) {
      if (getLocalStageCompleted(rm.key, st.stage_number)) {
        completedNums.push(st.stage_number)
      }
    }
    if (completedNums.length > 0) {
      payload[rm.key] = completedNums
    }
  }

  if (Object.keys(payload).length > 0) {
    try {
      await api.post("/learning-roadmaps/sync/", { progress: payload })
    } catch {}
  }
}

