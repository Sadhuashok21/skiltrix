export interface RoadmapStage {
  stage_number: number
  badge_text: string
  title: string
  description: string
  color: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimated_hours: string
  topics: string[]
  completed: boolean
  completed_subtopics?: string[]
  tutorial_link?: string
  practice_link?: string
}

export interface RoadmapTrack {
  key: string
  title: string
  category: string
  badge: string
  description: string
  icon: string
  accent_color: string
  estimated_weeks: string
  stages: RoadmapStage[]
  total_stages: number
  completed_stages: number
  progress_percent: number
  current_stage?: number
}

export interface RoadmapSummaryItem {
  key: string
  title: string
  category: string
  badge: string
  description: string
  icon: string
  accent_color: string
  estimated_weeks: string
  total_stages: number
  completed_stages: number
  progress_percent: number
  current_stage: number
  stages_summary: Array<{
    stage_number: number
    title: string
    completed: boolean
  }>
}

