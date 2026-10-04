import type { ApiCourse } from "../api/courses"
import type { ApiProblem } from "../api/practice"
import type { ApiQuiz } from "../api/quizzes"
import type { ApiDiscussion } from "../api/community"
import type { courses as exampleCourses, codingProblems as exampleProblems, quizTopics as exampleQuizzes, discussions as exampleDiscussions } from "./mockData"

export type CourseCardData = typeof exampleCourses[number]
export type ProblemCardData = typeof exampleProblems[number]
export type QuizCardData = typeof exampleQuizzes[number]
export type DiscussionCardData = typeof exampleDiscussions[number]

export function mapCourse(course: ApiCourse, progress = 0): CourseCardData {
  const modules = Array.isArray(course?.modules) ? course.modules : []
  const lessons = modules.flatMap((module) => (Array.isArray(module?.lessons) ? module.lessons : []))
  const minutes = lessons.reduce((total, lesson) => total + (lesson?.duration_minutes || 0), 0)
  const topics = modules.flatMap((module) => [
    module?.title,
    ...(Array.isArray(module?.lessons) ? module.lessons.map((lesson) => lesson?.title) : []),
  ]).filter(Boolean) as string[]
  const courseName = course?.name || "Course"
  const technology = courseName.split(/[:–-]/)[0]?.trim() || courseName
  return {
    id: course?.course_id || String(Math.random()),
    title: courseName,
    description: modules.map((module) => module?.description).filter(Boolean).join(" ") || "Interactive hands-on programming curriculum.",
    technology,
    icon: (technology || "").toLowerCase(),
    difficulty: course?.type ? course.type[0].toUpperCase() + course.type.slice(1) : "Beginner",
    lessons: lessons.length || 12,
    duration: minutes ? `${minutes} min` : "16h",
    rating: 4.8,
    students: 1250,
    progress,
    color: "from-indigo-400 to-violet-400",
    image: course?.image || "",
    topics: topics.length > 0 ? topics : ["Fundamentals", "Practice", "Project"],
  }
}

export function mapProblem(problem: ApiProblem): ProblemCardData {
  const diffStr = problem?.difficulty ? String(problem.difficulty) : "Easy"
  const difficulty = diffStr.toLowerCase() === "medium" ? "Medium" : (diffStr[0]?.toUpperCase() + diffStr.slice(1)) || "Easy"
  const topics = Array.isArray(problem?.topics) ? problem.topics : String(problem?.topics ?? "").split(",").map((topic) => topic.trim()).filter(Boolean)
  return {
    id: (problem?.problem_id as unknown as number) || 1,
    title: problem?.title || "Problem",
    difficulty,
    topics: topics.length > 0 ? topics : ["Algorithms"],
    solved: Boolean(problem?.is_solved),
    attempts: problem?.total_attempts || 0,
    acceptance: `${problem?.acceptance_rate ?? 75}%`,
    points: problem?.points || 10,
  }
}

export function mapQuiz(quiz: ApiQuiz): QuizCardData {
  const topicStr = quiz?.topic ? String(quiz.topic) : "General"
  return {
    id: quiz?.quiz_id || "quiz_1",
    title: quiz?.title || "Topic Quiz",
    topic: topicStr,
    questions: quiz?.total_questions || 10,
    difficulty: quiz?.difficulty || "Beginner",
    time: `${quiz?.duration_minutes || 15} min`,
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
