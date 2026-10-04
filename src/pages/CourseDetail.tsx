import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { BookOpen, Check, Clock, Lock, Play, UserRound } from "lucide-react"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { enrollCourse } from "../api/courses"

export default function CourseDetail() {
  const { id } = useParams()
  const { courses, enrollments, refresh, loading } = useSkiltrixData()
  const [error, setError] = useState("")
  const [enrolling, setEnrolling] = useState(false)
  const course = courses.find((item) => item.course_id === id)
  const enrollment = enrollments.find((item) => item.course.course_id === id)
  const lessons = (course?.modules ?? []).flatMap((module) => module.lessons ?? [])

  const enroll = async () => {
    if (!course) return
    setEnrolling(true)
    setError("")
    try {
      await enrollCourse(course.course_id)
      refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not enroll in this course.")
    } finally {
      setEnrolling(false)
    }
  }

  if (!course) {
    if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">Loading course…</div>
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">Course not found or not available yet.</div>
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span>
        <Link to="/courses" className="hover:text-indigo-600">Courses</Link><span>/</span>
        <span className="text-slate-700">{course.name}</span>
      </nav>

      <section className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {course.image && <img src={course.image} alt="" className="w-full h-56 object-cover" />}
            <div className="p-6 md:p-8">
              <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold mb-2">{course.type || "Course"}</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{course.name}</h1>
              {course.modules?.some((module) => module.description) && <p className="text-slate-600 leading-relaxed">{course.modules.map((module) => module.description).filter(Boolean).join(" ")}</p>}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 mt-5">
                <span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4" />{lessons.length} lessons</span>
                <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4" />{lessons.reduce((minutes, lesson) => minutes + (lesson.duration_minutes || 0), 0)} minutes</span>
                {course.instructor_name && <span className="inline-flex items-center gap-2"><UserRound className="w-4 h-4" />{course.instructor_name}</span>}
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Course content</h2>
            {course.modules?.length ? <div className="space-y-3">
              {course.modules.map((module) => (
                <article key={module.module_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{module.title}</h3>
                      <span className="text-xs text-slate-400">{module.lessons?.length ?? 0} lessons</span>
                    </div>
                    {module.description && <p className="text-sm text-slate-500 mt-1">{module.description}</p>}
                  </div>
                  {module.lessons?.length ? <ul className="divide-y divide-slate-100">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.lesson_id} className="px-4 py-3 flex items-center gap-3 text-sm">
                        {lesson.is_free_preview ? <Play className="w-4 h-4 text-indigo-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
                        <span className="flex-1 text-slate-700">{lesson.title}</span>
                        {lesson.duration_minutes > 0 && <span className="text-xs text-slate-400">{lesson.duration_minutes} min</span>}
                        {lesson.is_free_preview && <span className="text-[10px] uppercase tracking-wide text-indigo-600 font-semibold">Preview</span>}
                      </li>
                    ))}
                  </ul> : <p className="p-4 text-sm text-slate-400">No lessons published in this module.</p>}
                </article>
              ))}
            </div> : <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">Course modules have not been published yet.</div>}
          </section>
        </div>

        <aside className="bg-white rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-6">
          <h2 className="font-bold text-slate-900 text-lg">{course.is_paid ? `₹${course.price}` : "Free course"}</h2>
          <p className="text-sm text-slate-500 mt-2">{lessons.length} lessons · {course.modules?.length ?? 0} modules</p>
          <div className="mt-5">
            {enrollment ? <div className="w-full inline-flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold py-3 rounded-xl"><Check className="w-4 h-4" />Enrolled · {enrollment.progress_percent}%</div> : <button onClick={() => void enroll()} disabled={enrolling} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">{enrolling ? "Enrolling…" : "Enroll in course"}</button>}
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          <p className="text-xs text-slate-400 mt-4">Course information and lessons are loaded from the SkilTrix catalog.</p>
        </aside>
      </section>
    </main>
  )
}
