import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiLesson {
  lesson_id: string
  title: string
  lesson_type: string
  duration_minutes: number
  is_free_preview: boolean
  order: number
}

export interface ApiModule {
  module_id: string
  title: string
  description: string
  order: number
  lessons: ApiLesson[]
}

export interface ApiCourse {
  course_id: string
  name: string
  image: string
  type: string
  is_paid: boolean
  price: number
  instructor_name?: string
  modules: ApiModule[]
}

export async function getCourses(): Promise<ApiCourse[]> {
  const { data } = await api.get("/courses/")
  return asList<ApiCourse>(data, "courses")
}

export async function getCourse(courseId: string): Promise<ApiCourse> {
  const { data } = await api.get(`/courses/${encodeURIComponent(courseId)}/`)
  return asRecord<ApiCourse>(data, "course")
}

export async function getCourseModules(courseId: string) {
  const { data } = await api.get("/modules/", { params: { course_id: courseId } })
  return asList<ApiModule>(data, "modules")
}

export async function enrollCourse(courseId: string) {
  const userId = localStorage.getItem("user_id")
  if (!userId) throw new Error("Sign in before enrolling in a course.")
  const { data } = await api.post("/actions/enroll-course/", { user_id: userId, course_id: courseId })
  return data
}
