import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiQuiz {
  quiz_id: string
  title: string
  slug: string
  topic: string
  difficulty: string
  duration_minutes: number
  passing_score: number
  total_questions: number
  points: number
  icon: string
  best_score?: number
  attempts?: number
  questions?: {
    question_id: string
    question_text: string
    code_snippet?: string
    language?: string
    points: number
    options: { option_id: string; option_text: string; order: number }[]
  }[]
}

export const getQuizzes = async () => {
  const userId = localStorage.getItem("user_id")
  const { data } = await api.get("/quizzes/", { params: userId ? { user_id: userId } : undefined })
  return asList<ApiQuiz>(data, "quizzes")
}

export const getQuiz = async (id: string | number) => {
  const { data } = await api.get(`/quizzes/${encodeURIComponent(String(id))}/`)
  return asRecord<ApiQuiz>(data, "quiz")
}

export const submitQuiz = async (
  user_id: string,
  quiz_id: string,
  answers: {
    question_id: string
    selected_option_id: string
  }[],
  time_taken_seconds = 0,
) => {
  const response = await api.post("/actions/quiz-attempt/", {
    user_id,
    quiz_id,
    answers,
    time_taken_seconds,
  })
  return response.data
}
