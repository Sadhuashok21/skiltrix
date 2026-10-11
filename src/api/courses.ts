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

export interface EnrollCourseResponse {
  status: boolean
  message?: string
  requires_payment?: boolean
  already_enrolled?: boolean
  created?: boolean
  order_id?: string
  amount_paise?: number
  amount_rupees?: number
  currency?: string
  key_id?: string
  course_name?: string
  user_name?: string
  user_email?: string
  enrollment?: any
}

export interface VerifyEnrollmentPaymentPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  course_id: string
  user_id?: string
}

export async function enrollCourse(courseId: string): Promise<EnrollCourseResponse> {
  const userId = localStorage.getItem("user_id")
  const { data } = await api.post("/actions/enroll-course/", { user_id: userId, course_id: courseId })
  return data
}

export async function verifyEnrollmentPayment(payload: VerifyEnrollmentPaymentPayload) {
  const userId = localStorage.getItem("user_id")
  const { data } = await api.post("/actions/verify-enrollment-payment/", {
    ...payload,
    user_id: payload.user_id || userId,
  })
  return data
}

export async function cancelEnrollmentPayment(orderId: string, reason?: string) {
  const { data } = await api.post("/actions/cancel-enrollment-payment/", {
    order_id: orderId,
    reason: reason || "Checkout closed by candidate",
  })
  return data
}

export async function getRazorpayConfig() {
  const { data } = await api.get("/actions/razorpay-config/")
  return data
}

