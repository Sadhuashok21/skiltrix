import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiTestCase {
  test_case_id: string
  input_data: string
  expected_output: string
  is_sample: boolean
  is_hidden: boolean
  category?: string
  explanation?: string
  points: number
  order: number
}

export interface ApiProblem {
  problem_id: string
  title: string
  slug: string
  difficulty: "Easy" | "Medium" | "Hard"
  question_type?: "algorithmic" | "debugging" | "sql"
  category?: string
  topics: string[] | string
  acceptance_rate: number | string
  points: number
  solved_count: number
  total_attempts: number
  is_solved: boolean
  description?: string
  input_format?: string
  output_format?: string
  constraints?: string
  expected_complexity?: string
  error_snippet?: string
  expected_behavior?: string
  time_limit_seconds?: number
  memory_limit_mb?: number
  starter_codes?: Record<string, string>
  hints?: string[]
  sample_test_cases?: ApiTestCase[]
  has_solution?: boolean
}

export interface TestCaseResult {
  test_case_id: string
  order?: number
  is_sample: boolean
  is_hidden: boolean
  category?: string
  failure_category?: string
  note?: string
  input_data?: string
  expected_output?: string
  actual_output?: string
  verdict: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compile Error" | "Runtime Error" | "Not Attempted"
  execution_time_ms: number
  memory_kb: number
  error_message?: string
}

export interface SubmissionResponse {
  status: boolean
  message: string
  submission: Record<string, unknown>
  result: {
    verdict: string
    passed: number
    total: number
    duration_ms: number
    points_earned: number
    performance_status?: "Optimal" | "Needs improvement"
    expected_complexity?: string
    explanation?: string
    solution_code?: string
    test_results: TestCaseResult[]
  }
}

export interface RunSampleResponse {
  status: boolean
  verdict: string
  passed: number
  total: number
  duration_ms: number
  test_results: TestCaseResult[]
}

export interface AssessmentQuestionItem {
  item_id: string
  order: number
  marks: number
  problem: ApiProblem
}

export interface ApiAssessment {
  assessment_id: string
  title: string
  slug: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  duration_minutes: number
  pass_percentage: number
  question_count?: number
  total_marks?: number
  company_tag?: string
  category?: string
  is_company_mock?: boolean
  is_pro_only?: boolean
  proctoring_enabled?: boolean
  require_fullscreen?: boolean
  require_screen_share?: boolean
  max_tab_switches?: number
  max_fullscreen_exits?: number
  allow_return_to_previous?: boolean
  auto_submit_on_violations?: boolean
  randomize_questions?: boolean
  sections?: ApiAssessmentSection[]
  question_items?: ApiAssessmentQuestionItem[]
  questions?: AssessmentQuestionItem[]
}

export interface ApiAssessmentSection {
  section_id: string
  title: string
  section_type: "quant" | "logical" | "verbal" | "coding" | "debugging" | "sql" | "core_cs" | "mixed"
  order: number
  duration_minutes: number
  instructions?: string
  total_marks: number
}

export interface ApiAssessmentQuestionItem {
  item_id: string
  section_id: string
  question_type: "mcq_single" | "mcq_multi" | "numerical" | "coding" | "debugging" | "sql"
  title: string
  prompt: string
  options?: string[]
  marks: number
  negative_marks: number
  order: number
  problem?: ApiProblem
}

export interface CompanyBlueprint {
  blueprint_id: string
  company_name: string
  slug: string
  description: string
  category: string
  sections_config: Array<{
    title: string
    type: string
    questions_count: number
    duration_minutes: number
    marks: number
  }>
  recommended_topics: string[]
  duration_minutes: number
  tier: "free" | "pro"
  icon_name: string
  is_active: boolean
}

export interface CompanyMockStat {
  blueprint_id: string
  company_name: string
  slug: string
  tier: "free" | "pro"
  duration_minutes: number
  description: string
  recommended_topics: string[]
  assessment_id?: string
  total_attempts: number
  best_score: number
  average_score: number
  sections_summary: Array<{
    title: string
    type: string
    questions_count: number
  }>
}

export interface AssessmentAttemptData {
  attempt_id: string
  assessment: string
  assessment_title: string
  duration_minutes: number
  status: "in_progress" | "completed" | "timed_out"
  started_at: string
  expires_at: string
  completed_at?: string | null
  total_score: number
  max_possible_score: number
  percentage: number
  passed: boolean
  integrity_score: number
  tab_switch_count: number
  fullscreen_exit_count: number
  screen_share_stop_count: number
  network_disconnect_count: number
  section_scores: Record<string, { marks_earned: number; marks_possible: number; percentage: number }>
  skill_breakdown: Record<string, number>
  selected_answers: Record<string, any>
  saved_drafts: Record<string, { language: string; code: string; saved_at?: string }>
}

export interface StartAssessmentResponse {
  status: boolean
  message: string
  attempt: AssessmentAttemptData
  assessment: ApiAssessment
  time_remaining_seconds: number
}

export interface AssessmentSubmissionResponse {
  status: boolean
  message: string
  attempt: AssessmentAttemptData
  score_summary: {
    total_score: number
    max_possible: number
    percentage: number
    passed: boolean
    pass_percentage: number
    section_breakdown: Record<string, { marks_earned: number; marks_possible: number; percentage: number }>
    skill_breakdown: Record<string, number>
    integrity_score: number
    integrity_rating: "Good" | "Acceptable" | "Needs Review"
    total_integrity_events: number
  }
  item_evaluations?: Array<{
    item_id: string
    question_type: string
    title: string
    marks_possible: number
    marks_earned: number
    is_correct: boolean
    selected_answer: any
  }>
  problem_evaluations: Array<{
    problem_id: string
    title: string
    difficulty: string
    category: string
    question_type: string
    marks_possible: number
    marks_earned: number
    verdict: string
    passed_tests: number
    total_tests: number
    duration_ms: number
    expected_complexity: string
    explanation: string
    solution_code: string
  }>
}

export interface AssessmentMonitoringCandidate {
  attempt_id: string
  user_email: string
  assessment_id: string
  assessment_title: string
  status: string
  started_at: string
  current_section: string
  integrity_score: number
  tab_switches: number
  fullscreen_exits: number
  screen_share_stops: number
  recent_events: Array<{
    event_type: string
    timestamp: string
    metadata: Record<string, any>
  }>
}

export const getProblems = async (params?: { category?: string; type?: string; difficulty?: string }) => {
  const userId = localStorage.getItem("user_id")
  const queryParams = {
    ...(userId ? { user_id: userId } : {}),
    ...(params?.category && params.category !== "All" ? { category: params.category } : {}),
    ...(params?.type && params.type !== "All" ? { type: params.type } : {}),
    ...(params?.difficulty && params.difficulty !== "All" ? { difficulty: params.difficulty } : {}),
  }
  const { data } = await api.get("/problems/", { params: queryParams })
  return asList<ApiProblem>(data, "problems")
}

export const getProblem = async (id: string) => {
  const { data } = await api.get(`/problems/${encodeURIComponent(id)}/`)
  return asRecord<ApiProblem>(data, "problem")
}

export const runSampleProblem = async (data: {
  problem_id: string
  language: string
  code: string
}): Promise<RunSampleResponse> => {
  const response = await api.post("/actions/run-sample-code/", data)
  return response.data
}

export const submitProblem = async (data: {
  user_id: string
  problem_id: string
  language: string
  code: string
}): Promise<SubmissionResponse> => {
  const response = await api.post("/actions/submit-code/", data)
  return response.data
}

export const getProblemExplanation = async (problemId: string) => {
  const userId = localStorage.getItem("user_id") || "guest"
  const { data } = await api.get(`/problems/${encodeURIComponent(problemId)}/explanation/`, {
    params: { user_id: userId }
  })
  return data
}

export const getAssessments = async (params?: { category?: string; company_tag?: string; difficulty?: string }) => {
  const { data } = await api.get("/assessments/", { params })
  return asList<ApiAssessment>(data, "assessments")
}

export const getAssessment = async (id: string) => {
  const { data } = await api.get(`/assessments/${encodeURIComponent(id)}/`)
  return asRecord<ApiAssessment>(data, "assessment")
}

export const getCompanyBlueprints = async () => {
  const { data } = await api.get("/blueprints/")
  return asList<CompanyBlueprint>(data, "blueprints")
}

export const getCompanyPreparationStats = async (): Promise<CompanyMockStat[]> => {
  const userId = localStorage.getItem("user_id") || "guest"
  const response = await api.get("/actions/company-preparation-stats/", {
    params: { user_id: userId }
  })
  return response.data?.blueprints || []
}

export const startAssessment = async (assessmentId: string): Promise<StartAssessmentResponse> => {
  const userId = localStorage.getItem("user_id") || "guest"
  const response = await api.post("/actions/start-assessment/", {
    user_id: userId,
    assessment_id: assessmentId,
  })
  return response.data
}

export const recordAssessmentEvent = async (data: {
  attempt_id: string
  event_type: "FULLSCREEN_ENTER" | "FULLSCREEN_EXIT" | "TAB_SWITCH" | "SCREEN_SHARE_STARTED" | "SCREEN_SHARE_STOPPED" | "WINDOW_BLUR" | "WINDOW_FOCUS" | "NETWORK_DISCONNECTED" | "NETWORK_RECONNECTED"
  metadata?: Record<string, any>
}) => {
  const response = await api.post("/actions/record-assessment-event/", data)
  return response.data
}

export const autosaveAssessmentDraft = async (data: {
  attempt_id: string
  problem_id?: string
  language?: string
  code?: string
  selected_answers?: Record<string, any>
  current_section?: string
  current_question_index?: number
}) => {
  const response = await api.post("/actions/autosave-assessment-draft/", data)
  return response.data
}

export const submitAssessment = async (data: {
  attempt_id: string
  submissions?: Record<string, { language: string; code: string }>
  selected_answers?: Record<string, any>
}): Promise<AssessmentSubmissionResponse> => {
  const response = await api.post("/actions/submit-assessment/", data)
  return response.data
}

export const getAdminAssessmentMonitoring = async (): Promise<AssessmentMonitoringCandidate[]> => {
  const response = await api.get("/actions/admin-assessment-monitoring/")
  return response.data?.candidates || []
}

