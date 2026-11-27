import api from "./client"
import type { RoadmapTrack, RoadmapSummaryItem } from "../types/roadmap"

export class RoadmapAuthError extends Error {
  requiresAuth = true
  constructor(message = "Authentication required to access full roadmap.") {
    super(message)
    this.name = "RoadmapAuthError"
  }
}

export async function fetchCareerRoadmaps(
  category?: string,
  search?: string
): Promise<RoadmapSummaryItem[]> {
  const params: Record<string, string> = {}
  if (category && category !== "all") params.category = category
  if (search) params.q = search

  const res = await api.get("/learning-roadmaps/", { params })
  if (res.data?.status && Array.isArray(res.data.roadmaps)) {
    return res.data.roadmaps
  }
  return []
}

export async function fetchCareerRoadmapDetail(
  roadmapKey: string
): Promise<RoadmapTrack | null> {
  try {
    const res = await api.get(`/learning-roadmaps/${encodeURIComponent(roadmapKey)}/`)
    if (res.data?.status && res.data.roadmap) {
      return res.data.roadmap
    }
    return null
  } catch (err: any) {
    const code = err?.response?.status
    if (code === 401 || code === 403 || err?.response?.data?.requires_auth) {
      throw new RoadmapAuthError(err?.response?.data?.message || "Please sign in to access this full roadmap.")
    }
    throw err
  }
}

export async function toggleStageProgress(
  roadmapKey: string,
  stageNumber: number,
  completed?: boolean,
  completedSubtopics?: string[]
): Promise<{ completed: boolean; completed_stages: number; progress_percent: number }> {
  const res = await api.post(
    `/learning-roadmaps/${encodeURIComponent(roadmapKey)}/stage/${stageNumber}/toggle/`,
    {
      completed,
      completed_subtopics: completedSubtopics,
    }
  )
  return {
    completed: Boolean(res.data?.completed),
    completed_stages: Number(res.data?.completed_stages || 0),
    progress_percent: Number(res.data?.progress_percent || 0),
  }
}

export async function resetRoadmapProgressApi(
  roadmapKey: string
): Promise<boolean> {
  await api.post(`/learning-roadmaps/${encodeURIComponent(roadmapKey)}/reset/`)
  return true
}

export async function syncLocalProgressToServer(): Promise<void> {
  // Progress persists directly per authenticated user
}

