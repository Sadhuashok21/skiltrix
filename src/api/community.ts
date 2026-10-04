import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiDiscussion {
  discussion_id: string
  title: string
  content: string
  code?: string
  language?: string
  tag: string
  author_name: string
  author_profile?: string
  likes_count: number
  comments_count: number
  is_solved: boolean
  is_pinned: boolean
  created_at: string
  replies?: { reply_id: string; user_name: string; content: string; created_at: string }[]
}

export const getDiscussions = async () => {
  const { data } = await api.get("/discussions/")
  return asList<ApiDiscussion>(data, "discussions")
}

export const getDiscussion = async (id: string | number) => {
  const { data } = await api.get(`/discussions/${encodeURIComponent(String(id))}/`)
  return asRecord<ApiDiscussion>(data, "discussion")
}

export const createDiscussion = async (data: {
  title: string

  content: string
  user_id: string
  tag?: string
  code?: string
  language?: string
}) => {
  const response = await api.post("/discussions/", data)
  return response.data
}
