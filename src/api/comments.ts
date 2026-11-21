import api from "./client"
import { asList } from "./data"

export interface ApiComment {
  id: number
  comment: string
  video_id: string
  video_title?: string
  user?: string
  user_name?: string
  created_at?: string
}

export const getComments = async (videoId?: string | number) => {
  const query = videoId ? `?video_id=${encodeURIComponent(String(videoId))}` : ""
  const { data } = await api.get(`/comments/${query}`)
  return asList<ApiComment>(data, "comments")
}

export const createComment = async (data: {
  video_id: string | number
  comment: string
}) => {
  const response = await api.post("/comments/", {
    video_id: String(data.video_id),
    comment: data.comment,
  })
  return response.data as ApiComment
}

export const deleteComment = async (id: number | string) => {
  await api.delete(`/comments/${id}/`)
  return true
}

