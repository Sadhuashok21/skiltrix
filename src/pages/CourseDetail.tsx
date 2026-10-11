import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { BookOpen, Check, Clock, Lock, Play, UserRound, ShieldCheck, CreditCard, Sparkles, AlertCircle } from "lucide-react"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { enrollCourse, verifyEnrollmentPayment, cancelEnrollmentPayment } from "../api/courses"
import { getGlobalSignInUrl } from "../api/auth"
import { getStImageUrl } from "../utils/cdn"

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => { open: () => void; on: (event: string, callback: (event: any) => void) => void }
  }
}

export default function CourseDetail() {
  const { id } = useParams()
  const { courses, enrollments, refresh, loading } = useSkiltrixData()
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [enrolling, setEnrolling] = useState(false)
  const course = courses.find((item) => item.course_id === id)
  const enrollment = enrollments.find((item) => item.course.course_id === id)
  const lessons = (course?.modules ?? []).flatMap((module) => module.lessons ?? [])

  const enroll = async () => {
    if (!course) return
    const token = localStorage.getItem("skiltrix_access_token") || localStorage.getItem("access_token")
    const userId = localStorage.getItem("user_id")
    if (!token && !userId) {
      window.location.assign(getGlobalSignInUrl(`/courses/${course.course_id}`))
      return
    }

    setEnrolling(true)
    setError("")
    setSuccessMessage("")

    try {
      const res = await enrollCourse(course.course_id)

      // Free course or already enrolled
      if (!res.requires_payment) {
        setSuccessMessage(res.message || "Enrolled successfully!")
        refresh()
        setEnrolling(false)
        return
      }

      // Paid course -> Launch Razorpay Account Checkout Modal
      const scriptUrl = "https://checkout.razorpay.com/v1/checkout.js"
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.src = scriptUrl
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Razorpay Checkout script could not be loaded."))
          document.body.appendChild(script)
        })
      }
      if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable.")

      const checkout = new window.Razorpay({
        key: res.key_id,
        amount: res.amount_paise,
        currency: res.currency || "INR",
        name: "SkilTrix",
        description: `Enrollment in ${course.name}`,
        image: "/logo.png",
        order_id: res.order_id,
        prefill: {
          name: res.user_name || "",
          email: res.user_email || "",
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async (paymentResult: any) => {
          try {
            setEnrolling(true)
            const verified = await verifyEnrollmentPayment({
              razorpay_order_id: paymentResult.razorpay_order_id || res.order_id!,
              razorpay_payment_id: paymentResult.razorpay_payment_id,
              razorpay_signature: paymentResult.razorpay_signature,
              course_id: course.course_id,
            })
            setSuccessMessage(verified.message || `Payment verified! You are now enrolled in ${course.name}.`)
            refresh()
          } catch (verErr: any) {
            setError(verErr?.response?.data?.message || "Payment processed. Confirming enrollment with server…")
            refresh()
          } finally {
            setEnrolling(false)
          }
        },
        modal: {
          ondismiss: () => {
            if (res.order_id) {
              cancelEnrollmentPayment(res.order_id).catch(() => undefined)
            }
            setEnrolling(false)
          },
        },
      })

      checkout.open()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not initiate enrollment.")
      setEnrolling(false)
    }
  }

  if (!course) {
    if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">Loading course…</div>
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">Course not found or not available yet.</div>
  }

  const isPaid = Boolean(course.is_paid && course.price > 0)

  return (
    <main className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span>
        <Link to="/courses" className="hover:text-indigo-600">Courses</Link><span>/</span>
        <span className="text-slate-700">{course.name}</span>
      </nav>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      <section className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {course.image && <img src={getStImageUrl(course.image)} alt={course.name} className="w-full h-64 object-cover" />}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">{course.type || "Course"}</span>
                {isPaid ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> Premium Course
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">Free Access</span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{course.name}</h1>
              {course.modules?.some((module) => module.description) && (
                <p className="text-slate-600 leading-relaxed">{course.modules.map((module) => module.description).filter(Boolean).join(" ")}</p>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mt-6 pt-6 border-t border-slate-100">
                <span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-600" />{lessons.length} lessons</span>
                <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-600" />{lessons.reduce((minutes, lesson) => minutes + (lesson.duration_minutes || 0), 0)} minutes</span>
                {course.instructor_name && <span className="inline-flex items-center gap-2"><UserRound className="w-4 h-4 text-indigo-600" />{course.instructor_name}</span>}
              </div>
            </div>
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Course Syllabus &amp; Modules</h2>
              <span className="text-xs text-slate-400 font-medium">{course.modules?.length ?? 0} modules &bull; {lessons.length} lessons</span>
            </div>
            {course.modules?.length ? (
              <div className="space-y-4">
                {course.modules.map((module, mIdx) => (
                  <article key={module.module_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          <span className="text-indigo-600 mr-2 font-mono">Module {mIdx + 1}:</span>
                          {module.title}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">{module.lessons?.length ?? 0} lessons</span>
                      </div>
                      {module.description && <p className="text-xs text-slate-500 mt-1">{module.description}</p>}
                    </div>
                    {module.lessons?.length ? (
                      <ul className="divide-y divide-slate-100">
                        {module.lessons.map((lesson) => {
                          const canAccess = enrollment || lesson.is_free_preview || !isPaid
                          return (
                            <li key={lesson.lesson_id} className="px-4 py-3 flex items-center gap-3 text-sm hover:bg-slate-50/80 transition-colors">
                              {canAccess ? (
                                <Play className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className={`flex-1 ${canAccess ? "text-slate-800 font-medium" : "text-slate-500"}`}>{lesson.title}</span>
                              {lesson.duration_minutes > 0 && <span className="text-xs text-slate-400">{lesson.duration_minutes} min</span>}
                              {lesson.is_free_preview && !enrollment && isPaid && (
                                <span className="text-[10px] uppercase tracking-wide bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">Preview</span>
                              )}
                              {!canAccess && (
                                <span className="text-[10px] text-slate-400 font-medium">Locked</span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="p-4 text-sm text-slate-400">No lessons published in this module.</p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">Course modules have not been published yet.</div>
            )}
          </section>
        </div>

        {/* Enrollment & Checkout Aside Card */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Course Access</span>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="font-extrabold text-slate-900 text-3xl">
                {isPaid ? `₹${course.price.toLocaleString("en-IN")}` : "Free"}
              </h2>
              {isPaid && (
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  One-time payment
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isPaid ? "Lifetime full access · Certificate upon completion" : "Free access for all registered SkilTrix students"}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600 mb-5">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full curriculum: {lessons.length} video lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive coding practice &amp; quizzes</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accessible on mobile and desktop</span>
            </div>
          </div>

          <div>
            {enrollment ? (
              <div className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold py-3.5 rounded-xl text-sm">
                <Check className="w-4 h-4" /> Enrolled &bull; {enrollment.progress_percent}% completed
              </div>
            ) : (
              <button
                onClick={() => void enroll()}
                disabled={enrolling}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
              >
                {enrolling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Enrollment…</span>
                  </>
                ) : isPaid ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{course.price.toLocaleString("en-IN")} &amp; Enroll Now</span>
                  </>
                ) : (
                  <span>Enroll in Free Course</span>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {isPaid && !enrollment && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] justify-center mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>100% Secure Checkout powered by <strong>Razorpay</strong></span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase font-semibold">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">UPI</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">Cards</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">NetBanking</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">Wallets</span>
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}
