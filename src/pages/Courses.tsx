import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { BookOpen, Clock, Users, Search, Star, ArrowRight, CheckCircle2 } from "lucide-react"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapCourse } from "../data/apiAdapters"
import { getStImageUrl } from "../utils/cdn"
import { TechIcon } from "../components/TechIcons"
import { API_ORIGIN } from "../api/client"

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]
const sortOptions = ["Popular", "Newest", "Highest Rated", "Most Students"]

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced: "bg-red-100 text-red-700",
  }
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[level] || "bg-slate-100 text-slate-600"}`}
    >
      {level}
    </span>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-600 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default function Courses() {
  const { courses: apiCourses, enrollments, loading: apiLoading } = useSkiltrixData()
  const [cmsCourses, setCmsCourses] = useState<any[]>([])

  useEffect(() => {
    const url = `${API_ORIGIN}/api/cms/courses/`
    fetch(url)
      .then(async (res) => {
        if (!res.ok) return null
        const contentType = res.headers.get("content-type") || ""
        if (!contentType.includes("application/json")) return null
        return res.json()
      })
      .then((data) => {
        if (data && data.courses) {
          const mapped = data.courses
            .filter((c: any) => c.status === "published")
            .map((c: any) => ({
              id: c.slug,
              course_id: c.course_id,
              title: c.title,
              description: c.description || "Structured curriculum with interactive lectures and topic guides.",
              technology: c.category || "Programming",
              difficulty: "Beginner",
              isCms: true,
              url: `/courses/${c.slug}/`,
              image: c.image_url || c.image || "",
              lessons: typeof c.published_count === "number" ? c.published_count : (c.pages_count || 0),
              duration: "Self-paced",
              students: 0,
              progress: 0,
              rating: null,
              price: 0,
              icon: c.icon || "code",
              page_count: c.pages_count || 1,
            }))
          setCmsCourses(mapped)
        }
      })
      .catch((err) => console.error("Failed to load CMS courses in catalog:", err))
  }, [])

  const progressByCourse = new Map(
    enrollments
      .filter((item) => item?.course?.course_id)
      .map((item) => [item.course.course_id, item.progress_percent || 0])
  )
  const enrolledCourseIds = new Set(
    enrollments.map((item) => item?.course?.course_id).filter(Boolean)
  )
  const mappedApiCourses = apiCourses.map((course) => mapCourse(course, progressByCourse.get(course.course_id) ?? 0))
  const courses = [...cmsCourses, ...mappedApiCourses]
  const loading = apiLoading && cmsCourses.length === 0
  const technologies = [...new Set(courses.map((course) => course.technology))].map((name) => ({ name, icon: name.toLowerCase(), color: "bg-indigo-50 text-indigo-700" }))
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const initialTech = searchParams.get("tech") || "All"
  const [search, setSearch] = useState(initialSearch)
  const [difficulty, setDifficulty] = useState("All")
  const [tech, setTech] = useState(initialTech)
  const [sort, setSort] = useState("Popular")

  useEffect(() => {
    const q = searchParams.get("search")
    const t = searchParams.get("tech")
    if (q !== null) setSearch(q)
    if (t !== null) setTech(t)
  }, [searchParams])

  const filtered = courses
    .filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.technology.toLowerCase().includes(search.toLowerCase())
      const matchDiff = difficulty === "All" || c.difficulty === difficulty
      const matchTech = tech === "All" || c.technology === tech
      return matchSearch && matchDiff && matchTech
    })
    .sort((a, b) => {
      if (sort === "Highest Rated") return (Number(b.rating) || 0) - (Number(a.rating) || 0)
      if (sort === "Most Students") return (Number(b.students) || 0) - (Number(a.students) || 0)
      if (sort === "Newest") return String(b.course_id || b.id).localeCompare(String(a.course_id || a.id))
      return 0
    })

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700">Courses</span>
        </nav>
        <h1
          className="text-3xl font-extrabold text-slate-900 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Explore Courses
        </h1>
        <p className="text-slate-500">
          Learn at your pace with structured, beginner-friendly to advanced
          courses.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.804 7.5 7.5 0 0015.803 15.803z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search courses, technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {difficulties.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={tech}
            onChange={(e) => setTech(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Technologies</option>
            {technologies.map((t) => (
              <option key={t.name}>{t.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {sortOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tech filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setTech("All")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tech === "All"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
          }`}
        >
          All
        </button>
        {technologies.map((t) => (
          <button
            key={t.name}
            onClick={() => setTech(t.name)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tech === t.name
                ? "bg-indigo-600 text-white shadow-sm"
                : `${t.color} hover:opacity-90`
            }`}
          >
            <TechIcon name={t.icon} className="w-4 h-4 shrink-0" />
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-5">
        {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Course grid */}
      {loading ? <div className="text-center py-20 text-slate-500">Loading course catalog…</div> : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3
            className="text-lg font-semibold text-slate-900 dark:text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            No courses found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Try a different search or clear filters.
          </p>
          <button
            onClick={() => {
              setSearch("")
              setDifficulty("All")
              setTech("All")
            }}
            className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const isEnrolled =
              enrolledCourseIds.has(course.id) ||
              (course.course_id ? enrolledCourseIds.has(course.course_id) : false)
            const lessonCount = Number(course.lessons) || 0
            const lessonLabel = course.isCms
              ? `${lessonCount} ${lessonCount === 1 ? "topic" : "topics"}`
              : `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`
            const studentCount = Number(course.students) || 0
            const learnerLabel =
              studentCount >= 1000
                ? `${(studentCount / 1000).toFixed(1).replace(/\.0$/, "")}K`
                : `${studentCount} learner${studentCount !== 1 ? "s" : ""}`

            return (
              <Link
                key={course.id}
                to={course.url || `/courses/${course.id}`}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50/60 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950/60">
                  {getStImageUrl(course.image) ? (
                    <img
                      src={getStImageUrl(course.image)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TechIcon name={course.icon || course.technology} className="w-14 h-14 text-indigo-500 dark:text-indigo-400 opacity-85" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <DifficultyBadge level={course.difficulty} />
                    {course.isCms && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600/95 text-white shadow-sm">
                        Curated Syllabus
                      </span>
                    )}
                  </div>
                  {(course.price || 0) > 0 && (course.discount_percent || 0) > 0 && (
                    <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                      {Math.round(course.discount_percent || 0)}% OFF
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 flex items-center justify-center shadow-md">
                    <TechIcon name={course.icon || course.technology} className="w-5 h-5" />
                  </div>
                  {course.rating !== null && course.rating !== undefined && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs font-semibold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{typeof course.rating === "number" ? course.rating.toFixed(1) : course.rating}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                      {course.technology}
                    </span>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {(course.price || 0) > 0 && (course.compare_price || 0) > (course.price || 0) && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
                          ₹{(course.compare_price || 0).toLocaleString("en-IN")}
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          (course.price || 0) > 0
                            ? "bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60"
                        }`}
                      >
                        {(course.price || 0) > 0 ? `₹${(course.price || 0).toLocaleString("en-IN")}` : "Free"}
                      </span>
                      {(course.price || 0) > 0 && (course.discount_percent || 0) > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          {Math.round(course.discount_percent || 0)}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    className="font-bold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2 min-h-[2.75rem]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.25rem] mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500/80 shrink-0" />
                        <span>{lessonLabel}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.duration || "Self-paced"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{learnerLabel}</span>
                      </span>
                    </div>

                    {isEnrolled ? (
                      <div>
                        {course.progress > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {course.progress >= 100 ? "Completed" : "In progress"}
                              </span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {course.progress}%
                              </span>
                            </div>
                            <ProgressBar value={course.progress} />
                          </div>
                        )}
                        <span className="inline-flex items-center justify-center gap-2 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:border-emerald-800/60 dark:text-emerald-300 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{course.progress > 0 ? `Enrolled • ${course.progress}%` : "Enrolled"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    ) : course.progress > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            In progress
                          </span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {course.progress}%
                          </span>
                        </div>
                        <ProgressBar value={course.progress} />
                        <span className="mt-3 inline-flex items-center justify-center gap-1.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    ) : (course.price || 0) > 0 ? (
                      <span className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
                        <span>Enroll Now &bull; ₹{(course.price || 0).toLocaleString("en-IN")}</span>
                        {(course.compare_price || 0) > (course.price || 0) && (
                          <span className="text-xs text-indigo-200 line-through font-normal">
                            ₹{(course.compare_price || 0).toLocaleString("en-IN")}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1.5 w-full bg-slate-900 dark:bg-indigo-600 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        <span>Start Free Course</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
