import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiTestCase {
  test_case_id: string
  input_data: string
  expected_output: string
  is_sample: boolean
  is_hidden: boolean
  points: number
  order: number
}

export interface ApiProblem {
  problem_id: string
  title: string
  slug: string
  difficulty: "Easy" | "Medium" | "Hard"
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
  starter_codes?: Record<string, string>
  hints?: string[]
  sample_test_cases?: ApiTestCase[]
}

export interface TestCaseResult {
  test_case_id: string
  order?: number
  is_sample: boolean
  is_hidden: boolean
  input_data?: string
  expected_output?: string
  actual_output?: string
  verdict: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compile Error" | "Runtime Error"
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

export const getProblems = async () => {
  const userId = localStorage.getItem("user_id")
  const { data } = await api.get("/problems/", { params: userId ? { user_id: userId } : undefined })
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
