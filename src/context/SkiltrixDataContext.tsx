import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { getCourses, type ApiCourse } from "../api/courses"
import { getVideos, type ApiVideo } from "../api/videos"
import { getProblems, type ApiProblem } from "../api/practice"
import { getQuizzes, type ApiQuiz } from "../api/quizzes"
import { getDiscussions, type ApiDiscussion } from "../api/community"
import { getCompanies, getInternshipPrograms, type ApiCompany, type ApiInternship } from "../api/internships"
import api from "../api/client"
import { asList } from "../api/data"

type SkiltrixData = {
  courses: ApiCourse[]
  enrollments: { course: ApiCourse; progress_percent: number; enrollment_id: string }[]
  videos: ApiVideo[]
  problems: ApiProblem[]
  quizzes: ApiQuiz[]
  quizAttempts: Record<string, any>[]
  discussions: ApiDiscussion[]
  companies: ApiCompany[]
  internships: ApiInternship[]
  interviews: Record<string, any>[]
  badges: Record<string, any>[]
  notifications: Record<string, any>[]
  activity: Record<string, any>[]
  progress: Record<string, any> | null
  profile: Record<string, any> | null
  loading: boolean
  error: string
  refresh: () => void
}

type DataPayload = Omit<SkiltrixData, "loading" | "error" | "refresh">

const emptyData: DataPayload = {
  courses: [], enrollments: [], videos: [], problems: [], quizzes: [], quizAttempts: [], discussions: [], companies: [],
  internships: [], interviews: [], badges: [], notifications: [], activity: [],
  progress: null, profile: null,
}

const SkiltrixDataContext = createContext<SkiltrixData>({
  ...emptyData,
  loading: true,
  error: "",
  refresh: () => undefined,
})

export function SkiltrixDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataPayload>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    const userId = localStorage.getItem("user_id")
    const getList = async <T,>(path: string, key: string, params?: Record<string, string>) => {
      const response = await api.get(path, { params })
      return asList<T>(response.data, key)
    }

    setLoading(true)
    setError("")
    Promise.allSettled([
      getCourses(), getVideos(), getProblems(), getQuizzes(), getDiscussions(),
      getCompanies(), getInternshipPrograms(), getList("/interview-questions/", "interviews"),
      getList("/badges/", "badges"),
      userId ? getList("/enrollments/", "enrollments", { user_id: userId }) : Promise.resolve([]),
      userId ? getList("/quiz-attempts/", "quiz_attempts", { user_id: userId }) : Promise.resolve([]),
      userId ? getList("/notifications/", "notifications", { user_id: userId }) : Promise.resolve([]),
      userId ? getList("/activity/", "activity", { user_id: userId }) : Promise.resolve([]),
      userId ? api.get("/actions/progress/", { params: { user_id: userId } }).then((r) => r.data) : Promise.resolve(null),
      userId ? getList("/profiles/", "profiles", { user_id: userId }).then((rows) => rows[0] ?? null) : Promise.resolve(null),
    ]).then((results) => {
      if (!active) return
      const values = results.map((r) => r.status === "fulfilled" ? r.value : null)
      const failures = results.filter((r) => r.status === "rejected")
      setData({
        courses: (values[0] ?? []) as ApiCourse[],
        videos: (values[1] ?? []) as ApiVideo[],
        problems: (values[2] ?? []) as ApiProblem[],
        quizzes: (values[3] ?? []) as ApiQuiz[],
        discussions: (values[4] ?? []) as ApiDiscussion[],
        companies: (values[5] ?? []) as ApiCompany[],
        internships: (values[6] ?? []) as ApiInternship[],
        interviews: (values[7] ?? []) as Record<string, any>[],
        badges: (values[8] ?? []) as Record<string, any>[],
        enrollments: (values[9] ?? []) as SkiltrixData["enrollments"],
        quizAttempts: (values[10] ?? []) as Record<string, any>[],
        notifications: (values[11] ?? []) as Record<string, any>[],
        activity: (values[12] ?? []) as Record<string, any>[],
        progress: values[13] as Record<string, any> | null,
        profile: values[14] as Record<string, any> | null,
      })
      if (failures.length === results.length) setError("SkilTrix content could not be loaded. Check the API connection.")
      setLoading(false)
    })
    return () => { active = false }
  }, [revision])

  const value = useMemo(() => ({ ...data, loading, error, refresh: () => setRevision((value) => value + 1) }), [data, loading, error])
  return <SkiltrixDataContext.Provider value={value}>{children}</SkiltrixDataContext.Provider>
}

export function useSkiltrixData() {
  return useContext(SkiltrixDataContext)
}
