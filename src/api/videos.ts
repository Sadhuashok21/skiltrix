import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiVideo {
  video_id: string
  title: string
  description: string
  video?: string
  image?: string
  video_url?: string
  image_url?: string
  duration?: string
  duration_seconds?: number
  like?: number
  share?: number
  views?: number
  course?: string
  course_name?: string
  instructor?: string
  comments_count?: number
  created_at: string
  subtitles?: { language_code: string; label: string; vtt_url: string }[]
}

export const getVideos = async () => {
  const { data } = await api.get("/videos/")
  return asList<ApiVideo>(data, "videos")
}

export const getVideo = async (id: string | number) => {
  const { data } = await api.get(`/videos/${encodeURIComponent(String(id))}/`)
  return asRecord<ApiVideo>(data, "video")
}

export const likeVideo = async (id: string | number, liked: boolean): Promise<{ status: string; like: number; liked: boolean }> => {
  const { data } = await api.post(`/videos/${encodeURIComponent(String(id))}/like/`, { liked })
  return data
}

export const recordVideoView = async (id: string | number): Promise<{ status: string; views: number }> => {
  const { data } = await api.post(`/videos/${encodeURIComponent(String(id))}/view/`)
  return data
}

export const recordVideoShare = async (id: string | number): Promise<{ status: string; share: number }> => {
  const { data } = await api.post(`/videos/${encodeURIComponent(String(id))}/share/`)
  return data
}

export const updateVideoDuration = async (id: string | number, durationSeconds: number): Promise<{ status: boolean; duration: string; duration_seconds: number }> => {
  const { data } = await api.post(`/videos/${encodeURIComponent(String(id))}/duration/`, { duration_seconds: durationSeconds })
  return data
}
