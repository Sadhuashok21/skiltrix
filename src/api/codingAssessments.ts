import apiClient from "./client"

export type SupportedCodingLanguage = "python" | "java" | "c" | "cpp" | "javascript"

export type QuestionPaletteState =
  | "not_visited"
  | "not_attempted"
  | "attempted"
  | "marked_for_review"
  | "submitted"

export interface PublicTestCase {
  test_case_id: string
  input_data: string
  expected_output: string
  explanation?: string
  points?: number
  order?: number
}

export interface CodingProblemPayload {
  problem_id: string
  title: string
  slug: string
  difficulty: "Easy" | "Medium" | "Hard"
  question_type: string
  category: string
  topics: string[]
  marks: number
  points: number
  description: string
  input_format: string
  output_format: string
  constraints: string
  sample_input: string
  sample_output: string
  sample_explanation: string
  time_limit_seconds: number
  memory_limit_mb: number
  supported_languages: string[]
  starter_codes: Record<string, string>
  project_files?: Record<string, string>
  public_test_cases: PublicTestCase[]
  hidden_test_count: number
  total_test_count: number
}

export interface AssessmentQuestionNode {
  index: number
  item_id: string
  question_type: string
  section_id: string | null
  section_title: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  marks: number
  negative_marks: number
  supported_languages: string[]
  problem: CodingProblemPayload | null
  prompt?: string
  instructions?: string
  options?: Array<{ id?: string; text?: string; value?: string; label?: string } | string>
  buggy_code?: string
  starter_code?: string
  constraints?: string
  input_format?: string
  output_format?: string
  public_test_cases?: PublicTestCase[]
  starter_codes?: Record<string, string>
  project_files?: Record<string, string>
  codelab_project_id?: string
  locked_paths?: string[]
  time_limit_seconds?: number
  memory_limit_mb?: number
}

export interface CodingAssessmentItem {
  assessment_id: string
  title: string
  slug: string
  assessment_type: "mcq" | "technical" | "coding" | "company"
  category: string
  company_tag?: string
  description: string
  instructions?: string
  difficulty: "Easy" | "Medium" | "Hard"
  duration_minutes: number
  pass_percentage: number
  total_marks: number
  negative_marking: boolean
  negative_marking_percentage: number
  supported_languages: string[]
  start_time: string | null
  end_time: string | null
  effective_start_time: string | null
  effective_end_time: string | null
  schedule_status: "upcoming" | "live" | "ended" | "inactive"
  assignment_mode: "public" | "assigned"
  show_results_immediately: boolean
  is_company_mock: boolean
  proctoring_enabled: boolean
  require_fullscreen: boolean
  max_tab_switches: number
  active: boolean
  question_count: number
  coding_problem_count: number
  created_at: string
  latest_attempt?: {
    attempt_id: string
    status: string
    total_score: number
    max_possible_score: number
    percentage: number
    passed: boolean
    results_released: boolean
    problems_attempted: number
    problems_solved: number
    started_at: string
    completed_at: string | null
  } | null
}

export interface TestCaseRunOutcome {
  case_number: number
  name?: string
  is_hidden: boolean
  passed: boolean
  status: string
  execution_time_ms: number
  memory_kb: number
  input?: string
  expected_output?: string | null
  actual_output?: string
  stderr?: string
}

export interface CodeRunResponse {
  status: string
  mode: "custom_input" | "sample_tests"
  language: string
  passed: boolean
  passed_count?: number
  total_count?: number
  stdout: string
  stderr: string
  compile_output: string
  execution_time_ms: number
  memory_kb: number
  backend_used?: string
  test_case_results: TestCaseRunOutcome[]
}

export interface ProblemSubmitResponse {
  submission_id: string
  item_id: string
  problem_id: string
  status:
    | "Accepted"
    | "Partial Accepted"
    | "Wrong Answer"
    | "Compilation Error"
    | "Runtime Error"
    | "Time Limit Exceeded"
    | "Memory Limit Exceeded"
  language: string
  total_test_cases: number
  passed_test_cases: number
  failed_test_cases: number
  score: number
  max_score: number
  execution_time_ms: number
  memory_used_kb: number
  backend_used?: string
  compile_output?: string
  error_message?: string
  test_case_results: TestCaseRunOutcome[]
  question_states?: Record<string, QuestionPaletteState>
}

export interface ProblemPerformanceRow {
  item_id: string
  problem_id: string | null
  title: string
  question_type: string
  difficulty: string
  language: string | null
  status: string
  passed_test_cases: number
  total_test_cases: number
  score: number
  max_score: number
  execution_time_ms: number
  memory_kb: number
  submission_id: string | null
}

export interface AssessmentResultAnalytics {
  attempt_id: string
  assessment_id: string
  assessment_title: string
  assessment_type: string
  status: string
  auto_submitted: boolean
  results_released: boolean
  total_score: number | null
  max_score: number
  percentage: number | null
  passed: boolean | null
  pass_percentage: number
  total_problems: number
  problems_attempted: number
  problems_solved: number | null
  test_cases_passed: number | null
  test_cases_total: number
  accuracy: number | null
  time_taken_seconds: number
  duration_minutes: number
  section_scores: Record<
    string,
    { score: number; max_score: number; solved: number; total: number }
  >
  problem_wise_performance: ProblemPerformanceRow[]
  submissions?: CodingSubmissionRecord[]
  explanations?: Record<string, string>
  started_at: string
  completed_at: string | null
}

export interface CodingSubmissionRecord {
  submission_id: string
  student_id: string
  student_name: string
  problem_id: string
  problem_title: string
  assessment_id: string | null
  assessment_title: string | null
  language: string
  source_code: string
  status: string
  passed_test_cases: number
  total_test_cases: number
  score: number
  max_score: number
  execution_time_ms: number
  memory_kb: number
  error_message: string
  is_final_submission: boolean
  created_at: string
}

export const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python 3",
  java: "Java",
  c: "C (GCC)",
  cpp: "C++ (G++ 17)",
  javascript: "JavaScript (Node.js)",
  django: "Django (Python / manage.py test)",
}

export const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  javascript: "javascript",
  django: "python",
}

export async function getCodingAssessments(params?: {
  type?: string
  category?: string
  search?: string
}): Promise<CodingAssessmentItem[]> {
  const res = await apiClient.get<{ assessments: CodingAssessmentItem[] }>(
    "/assessments/coding/",
    { params }
  )
  return res.data?.assessments || []
}

export async function getCodingAssessmentDetail(assessmentId: string) {
  const res = await apiClient.get<
    CodingAssessmentItem & {
      questions: AssessmentQuestionNode[]
      server_now: string
    }
  >(`/assessments/coding/${assessmentId}/`)
  return res.data
}

export async function startCodingAssessment(assessmentId: string) {
  const res = await apiClient.post<{
    attempt: {
      attempt_id: string
      status: string
      started_at: string
      expires_at: string
      remaining_seconds: number
      selected_answers: Record<string, unknown>
      saved_drafts: {
        coding_drafts?: Record<
          string,
          { language: string; code: string; problem_id?: string; files?: Record<string, string> }
        >
      }
      question_states: Record<string, QuestionPaletteState>
      current_question_index: number
      tab_switch_count: number
      fullscreen_exit_count: number
    }
    assessment: CodingAssessmentItem
    questions: AssessmentQuestionNode[]
    submissions: CodingSubmissionRecord[]
    server_now: string
  }>(`/assessments/coding/${assessmentId}/start/`, {})
  return res.data
}

export async function runCodingAssessmentCode(
  assessmentId: string,
  payload: {
    attempt_id?: string
    item_id?: string
    problem_id?: string
    language: string
    source_code: string
    files?: Record<string, string>
    custom_input?: string
  }
): Promise<CodeRunResponse> {
  const res = await apiClient.post<CodeRunResponse>(
    `/assessments/coding/${assessmentId}/run/`,
    payload
  )
  return res.data
}

export async function submitCodingAssessmentProblem(
  assessmentId: string,
  payload: {
    attempt_id?: string
    item_id?: string
    problem_id?: string
    language: string
    source_code: string
    files?: Record<string, string>
  }
): Promise<ProblemSubmitResponse> {
  const res = await apiClient.post<ProblemSubmitResponse>(
    `/assessments/coding/${assessmentId}/submit-problem/`,
    payload
  )
  return res.data
}

export async function resetCodingAssessmentCodelab(
  assessmentId: string,
  payload: {
    attempt_id?: string
    item_id?: string
    problem_id?: string
  }
): Promise<{ status: boolean; codelab_project_id: string }> {
  const res = await apiClient.post<{ status: boolean; codelab_project_id: string }>(
    `/assessments/coding/${assessmentId}/codelab-reset/`,
    payload
  )
  return res.data
}

export async function autosaveCodingAssessment(
  assessmentId: string,
  payload: {
    attempt_id?: string
    coding_drafts?: Record<
      string,
      { language: string; code: string; problem_id?: string; files?: Record<string, string> }
    >
    selected_answers?: Record<string, unknown>
    question_states?: Record<string, QuestionPaletteState>
    current_question_index?: number
    current_section?: string
  }
) {
  const res = await apiClient.post(
    `/assessments/coding/${assessmentId}/autosave/`,
    payload
  )
  return res.data
}

export async function submitCodingAssessment(
  assessmentId: string,
  payload: {
    attempt_id?: string
    coding_drafts?: Record<
      string,
      { language: string; code: string; problem_id?: string; files?: Record<string, string> }
    >
    selected_answers?: Record<string, unknown>
    auto_submitted?: boolean
  }
): Promise<AssessmentResultAnalytics> {
  const res = await apiClient.post<AssessmentResultAnalytics>(
    `/assessments/coding/${assessmentId}/submit/`,
    payload
  )
  return res.data
}

export async function getCodingAssessmentResult(
  assessmentId: string,
  attemptId?: string
): Promise<AssessmentResultAnalytics> {
  const res = await apiClient.get<AssessmentResultAnalytics>(
    `/assessments/coding/${assessmentId}/result/`,
    { params: attemptId ? { attempt_id: attemptId } : undefined }
  )
  return res.data
}

export async function recordCodingAssessmentEvent(
  assessmentId: string,
  payload: {
    attempt_id: string
    event_type: "TAB_SWITCH" | "FULLSCREEN_EXIT" | "WINDOW_BLUR" | "NETWORK_DISCONNECT"
    metadata?: Record<string, unknown>
  }
) {
  const res = await apiClient.post(
    `/assessments/coding/${assessmentId}/event/`,
    payload
  )
  return res.data
}

export async function getMyCodingSubmissions(params?: {
  assessment_id?: string
  problem_id?: string
}): Promise<CodingSubmissionRecord[]> {
  const res = await apiClient.get<{ submissions: CodingSubmissionRecord[] }>(
    "/assessments/coding/submissions/",
    { params }
  )
  return res.data?.submissions || []
}
