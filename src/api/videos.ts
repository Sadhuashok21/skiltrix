import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiVideo {
  video_id: string
  title: string
  description: string
  video: string
  image: string
  like: number
  share: number
  views: number
  course_name?: string
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
