import type { ApiCourse } from "../api/courses"
import type { ApiProblem } from "../api/practice"
import type { ApiQuiz } from "../api/quizzes"
import type { ApiDiscussion } from "../api/community"
import { getStImageUrl } from "../utils/cdn"

export interface CourseCardData {
  id: string
  title: string
  description: string
  technology: string
  icon?: string
  difficulty: string
  lessons: number
  duration: string
  rating: number | null
  students: number
  progress: number
  color?: string
  image?: string
  topics: string[]
  price?: number
  compare_price?: number
  discount_percent?: number
  is_paid?: boolean
}

export interface ProblemCardData {
  id: number | string
  title: string
  difficulty: string
  topics: string[]
  category?: string
  question_type?: string
  solved: boolean
  attempts: number
  acceptance: string
  points: number
}

export interface QuizCardData {
  id: string
  title: string
  topic: string
  questions: number
  difficulty: string
  time: string
  bestScore: number
  attempts: number
  icon?: string
}

export interface DiscussionCardData {
  id: number | string
  user: {
    name: string
    username?: string
    avatar: string
    color: string
  }
  time: string
  tag: string
  tagColor?: string
  question: string
  content: string
  code?: string | null
  likes: number
  comments: number
  bookmarked?: boolean
}

export function mapCourse(course: ApiCourse, progress = 0): CourseCardData {
  const modules = Array.isArray(course?.modules) ? course.modules : []
  const lessons = modules.flatMap((module) => (Array.isArray(module?.lessons) ? module.lessons : []))
  const totalSeconds = lessons.reduce((total, lesson: any) => {
    if (typeof lesson?.duration_seconds === "number" && lesson.duration_seconds > 0) {
      return total + lesson.duration_seconds
    }
    if (typeof lesson?.duration_minutes === "number" && lesson.duration_minutes > 0) {
      return total + lesson.duration_minutes * 60
    }
    return total
  }, 0)
  const rawVideos = Array.isArray((course as any)?.videos) ? (course as any).videos : []
  const videoSeconds = rawVideos.reduce((acc: number, v: any) => {
    return acc + (Number(v?.duration_seconds) || 0)
  }, 0)
  const combinedSeconds = totalSeconds > 0 ? totalSeconds : videoSeconds
  const minutes = Math.round(combinedSeconds / 60)

  const formatDurationString = (mins: number, count: number): string => {
    if (mins > 0) {
      if (mins >= 60) {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return m > 0 ? `${h}h ${m}m` : `${h}h`
      }
      return `${mins} min`
    }
    return count > 0 ? `${count * 2} min` : "Self-paced"
  }
  const topics = modules.flatMap((module) => [
    module?.title,
    ...(Array.isArray(module?.lessons) ? module.lessons.map((lesson) => lesson?.title) : []),
  ]).filter(Boolean) as string[]
  const courseName = course?.name || "Course"
  const lowerName = courseName.toLowerCase()
  const knownTech = [
    ["cyber security", "Cyber Security"],
    ["cybersecurity", "Cyber Security"],
    ["sap abap", "SAP ABAP"],
    ["abap", "SAP ABAP"],
    ["typescript", "TypeScript"],
    ["javascript", "JavaScript"],
    ["python", "Python"],
    ["django", "Django"],
    ["react", "React"],
    ["java", "Java"],
    ["c++", "C++"],
    ["sql", "SQL"],
    ["linux", "Linux"],
    ["html", "HTML & CSS"],
  ].find(([needle]) => lowerName.includes(needle))

  const splitTech = courseName.split(/[:–\-|]/)[0]?.trim() || courseName
  const technology = knownTech
    ? knownTech[1]
    : (splitTech.length > 22 ? splitTech.split(/\s+/).slice(0, 2).join(" ") : splitTech)
  const realStudents = typeof course?.students_count === "number" ? course.students_count : 0
  const realRating = typeof course?.rating === "number" ? course.rating : null

  return {
    id: course?.course_id || String(Math.random()),
    title: courseName,
    description:
      modules.map((module) => module?.description).filter(Boolean).join(" ") ||
      "Hands-on curriculum with structured video lessons and practical examples.",
    technology,
    icon: (technology || "").toLowerCase(),
    difficulty: course?.type ? course.type[0].toUpperCase() + course.type.slice(1) : "Beginner",
    lessons: lessons.length || rawVideos.length,
    duration: formatDurationString(minutes, lessons.length || rawVideos.length),
    rating: realRating,
    students: realStudents,
    progress,
    color: "from-indigo-400 to-violet-400",
    image: (course as any)?.image_url || getStImageUrl(course?.image),
    topics: topics,
    price: typeof course?.price === "number" ? course.price : 0,
    compare_price: typeof course?.compare_price === "number" ? course.compare_price : 0,
    discount_percent:
      typeof course?.discount_percent === "number" && course.discount_percent > 0
        ? course.discount_percent
        : (typeof course?.compare_price === "number" && typeof course?.price === "number" && course.compare_price > course.price && course.price > 0)
          ? Math.round(((course.compare_price - course.price) / course.compare_price) * 100)
          : 0,
    is_paid: Boolean(course?.is_paid),
  }
}

export function mapProblem(problem: ApiProblem): ProblemCardData & { category?: string; question_type?: string } {
  const diffStr = problem?.difficulty ? String(problem.difficulty) : "Easy"
  const difficulty = diffStr.toLowerCase() === "medium" ? "Medium" : (diffStr[0]?.toUpperCase() + diffStr.slice(1)) || "Easy"
  const topics = Array.isArray(problem?.topics) ? problem.topics : String(problem?.topics ?? "").split(",").map((topic) => topic.trim()).filter(Boolean)
  return {
    id: (problem?.problem_id as unknown as number) || 1,
    title: problem?.title || "Problem",
    difficulty,
    topics: topics,
    category: problem?.category || "DSA",
    question_type: problem?.question_type || "algorithmic",
    solved: Boolean(problem?.is_solved),
    attempts: problem?.total_attempts || 0,
    acceptance: problem?.acceptance_rate !== undefined && problem?.acceptance_rate !== null ? `${problem.acceptance_rate}%` : "—",
    points: problem?.points || 0,
  }
}

export function mapQuiz(quiz: ApiQuiz): QuizCardData {
  const topicStr = quiz?.topic ? String(quiz.topic) : "General"
  return {
    id: quiz?.quiz_id || "quiz_1",
    title: quiz?.title || "Topic Quiz",
    topic: topicStr,
    questions: quiz?.total_questions || 0,
    difficulty: quiz?.difficulty || "Beginner",
    time: quiz?.duration_minutes ? `${quiz.duration_minutes} min` : "—",
    bestScore: quiz?.best_score ?? 0,
    attempts: quiz?.attempts ?? 0,
    icon: quiz?.icon || topicStr.toLowerCase(),
  }
}

export function mapDiscussion(post: ApiDiscussion): DiscussionCardData {
  const colors = ["from-pink-500 to-rose-500", "from-blue-500 to-indigo-500", "from-emerald-500 to-teal-500", "from-purple-500 to-violet-500"]
  return {
    id: post.discussion_id as unknown as number,
    user: {
      name: post.author_name || "SkilTrix learner",
      username: "",
      avatar: (post.author_name || "S").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      color: colors[0],
    },
    time: post.created_at ? new Date(post.created_at).toLocaleString() : "",
    tag: post.tag || "General",
    tagColor: "bg-indigo-100 text-indigo-700",
    question: post.title,
    content: post.content,
    code: post.code || null,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    bookmarked: false,
  }
}
