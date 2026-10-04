import api, { getApiErrorMessage } from "./client"

export { getApiErrorMessage }

export interface ApiABAPSourceFile {
  file_id: string
  name: string
  object_type: "report" | "include" | "class" | "interface" | "function_module" | "ddic_table" | "structure"
  content: string
  size_bytes: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApiABAPProject {
  project_id: string
  title: string
  slug: string
  package_name: string
  execution_mode: "simulator" | "sap_connected"
  sap_system_id?: string | null
  description: string
  status: string
  files_count?: number
  owner_username?: string
  source_files?: ApiABAPSourceFile[]
  last_opened_at: string
  created_at: string
  updated_at: string
}

export interface ApiABAPExercise {
  exercise_id: string
  title: string
  slug: string
  category: "Beginner" | "Intermediate" | "Advanced"
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  problem_statement?: string
  starter_code?: string
  solution_hint?: string
  supported_mode: "simulator" | "sap_only" | "both"
  points: number
  order: number
  submissions_count?: number
  sample_test_cases?: Array<{
    test_case_id: string
    input_data: string
    expected_output: string
    is_sample: boolean
    order: number
  }>
  created_at: string
}

export interface ApiSAPConnection {
  connection_id: string
  system_name: string
  system_id: string
  client: string
  host: string
  port: number
  auth_type: "basic" | "oauth2_btp" | "jwt_token"
  username: string
  has_credentials: boolean
  is_active: boolean
  last_connection_test?: string | null
  last_status_message?: string
  created_at: string
}

export interface ABAPExecutionResult {
  status: boolean
  output: string
  execution_time_ms: number
  diagnostics: Array<{
    line?: number
    column?: number
    code?: string
    severity: "error" | "warning" | "info"
    message: string
  }>
  execution_mode: "simulator" | "sap_connected"
  internal_tables_state?: Record<string, any[]>
  database_tables_state?: Record<string, any[]>
}

export const listABAPProjects = async (mode?: string): Promise<ApiABAPProject[]> => {
  const { data } = await api.get("/abap/projects/", {
    params: {
      ...(mode ? { mode } : {}),
    },
  })
  return Array.isArray(data) ? data : data.results || []
}

export const createABAPProject = async (payload: {
  title: string
  package_name?: string
  execution_mode?: "simulator" | "sap_connected"
  sap_system_id?: string
  description?: string
}): Promise<ApiABAPProject> => {
  const { data } = await api.post("/abap/projects/", payload)
  return data
}

export const getABAPProject = async (projectId: string): Promise<ApiABAPProject> => {
  const { data } = await api.get(`/abap/projects/${encodeURIComponent(projectId)}/`)
  return data
}

export const deleteABAPProject = async (projectId: string): Promise<void> => {
  await api.delete(`/abap/projects/${encodeURIComponent(projectId)}/`)
}

export const exportABAPProjectZipUrl = (projectId: string): string => {
  return `${api.defaults.baseURL}/abap/projects/${encodeURIComponent(projectId)}/export/`
}

export const getABAPSourceFiles = async (projectId: string): Promise<ApiABAPSourceFile[]> => {
  const { data } = await api.get(`/abap/projects/${encodeURIComponent(projectId)}/files/`)
  return Array.isArray(data) ? data : []
}

export const getABAPFileContent = async (
  projectId: string,
  fileName: string
): Promise<ApiABAPSourceFile> => {
  const { data } = await api.get(
    `/abap/projects/${encodeURIComponent(projectId)}/files/content/`,
    { params: { name: fileName } }
  )
  return data
}

export const saveABAPFileContent = async (
  projectId: string,
  fileName: string,
  content: string,
  objectType = "report"
): Promise<{ status: boolean; message: string }> => {
  const { data } = await api.post(
    `/abap/projects/${encodeURIComponent(projectId)}/files/save/`,
    { name: fileName, content, object_type: objectType }
  )
  return data
}

export const createABAPSourceFile = async (
  projectId: string,
  name: string,
  objectType = "report",
  content = ""
): Promise<ApiABAPSourceFile> => {
  const { data } = await api.post(
    `/abap/projects/${encodeURIComponent(projectId)}/files/create/`,
    { name, object_type: objectType, content }
  )
  return data
}

export const createABAPFolder = async (
  projectId: string,
  folderPath: string
): Promise<{ status: boolean; message: string; folder_path: string }> => {
  const { data } = await api.post(
    `/abap/projects/${encodeURIComponent(projectId)}/files/folder/`,
    { folder_path: folderPath }
  )
  return data
}

export const renameABAPPath = async (
  projectId: string,
  oldPath: string,
  newPath: string
): Promise<{ status: boolean; message: string; files: ApiABAPSourceFile[] }> => {
  const { data } = await api.post(
    `/abap/projects/${encodeURIComponent(projectId)}/files/rename/`,
    { old_path: oldPath, new_path: newPath }
  )
  return data
}

export const moveABAPPath = async (
  projectId: string,
  sourcePath: string,
  targetFolder: string
): Promise<{ status: boolean; message: string; files: ApiABAPSourceFile[] }> => {
  const { data } = await api.post(
    `/abap/projects/${encodeURIComponent(projectId)}/files/move/`,
    { source_path: sourcePath, target_folder: targetFolder }
  )
  return data
}

export const duplicateABAPFile = async (
  projectId: string,
  sourcePath: string,
  newPath?: string
): Promise<ApiABAPSourceFile> => {
  const { data } = await api.post(
    `/abap/projects/${encodeURIComponent(projectId)}/files/duplicate/`,
    { source_path: sourcePath, new_path: newPath }
  )
  return data
}

export const deleteABAPSourceFile = async (
  projectId: string,
  path: string
): Promise<void> => {
  await api.delete(
    `/abap/projects/${encodeURIComponent(projectId)}/files/delete/`,
    { params: { path, name: path } }
  )
}

export const listABAPExercises = async (params?: {
  category?: string
  difficulty?: string
  search?: string
}): Promise<ApiABAPExercise[]> => {
  const { data } = await api.get("/abap/exercises/", { params })
  return Array.isArray(data) ? data : data.results || []
}

export const getABAPExercise = async (exerciseId: string): Promise<ApiABAPExercise> => {
  const { data } = await api.get(`/abap/exercises/${encodeURIComponent(exerciseId)}/`)
  return data
}

export const listSAPConnections = async (): Promise<ApiSAPConnection[]> => {
  const { data } = await api.get("/abap/connections/")
  return Array.isArray(data) ? data : data.results || []
}

export const createSAPConnection = async (payload: {
  system_name: string
  system_id: string
  client: string
  host: string
  port?: number
  auth_type?: string
  username?: string
  password?: string
  btp_service_key_json?: string
}): Promise<ApiSAPConnection> => {
  const { data } = await api.post("/abap/connections/", payload)
  return data
}

export const testSAPConnection = async (
  connectionId: string
): Promise<{ status: boolean; message: string; duration_ms?: number; status_code?: number }> => {
  const { data } = await api.post(
    `/abap/connections/${encodeURIComponent(connectionId)}/test_connection/`
  )
  return data
}

export const getABAPHealth = async () => {
  const { data } = await api.get("/abap/health/")
  return data
}

export const executeABAP = async (payload: {
  project_id?: string
  file_name?: string
  code: string
  execution_mode: "simulator" | "sap_connected"
  sap_system_id?: string
  stdin?: string
}): Promise<ABAPExecutionResult> => {
  const { data } = await api.post("/abap/execute/", payload)
  return data
}

export const checkABAPSyntax = async (payload: {
  code: string
  execution_mode?: "simulator" | "sap_connected"
}, signal?: AbortSignal): Promise<{
  valid: boolean
  diagnostics: Array<{
    line?: number
    column?: number
    code?: string
    severity: "error" | "warning" | "info"
    message: string
  }>
}> => {
  const { data } = await api.post("/abap/syntax-check/", payload, { signal })
  return data
}

export const previewTableData = async (
  tableName: string,
  projectId?: string
): Promise<{
  table_name: string
  description: string
  row_count: number
  columns: Array<{ name: string; type: string; key: boolean }>
  rows: Record<string, any>[]
}> => {
  const { data } = await api.get(`/abap/dictionary/preview/`, {
    params: { table: tableName, ...(projectId ? { project_id: projectId } : {}) },
  })
  return data
}

export interface ApiABAPDictionaryTable {
  table_id: string
  project_id?: string
  table_name: string
  description: string
  delivery_class: string
  fields_schema: Array<{
    field: string
    key: boolean
    data_element?: string
    type: string
    length: number
    description: string
  }>
  sample_records?: Record<string, any>[]
  created_at: string
  updated_at: string
}

export const listABAPDictionaryTables = async (projectId?: string): Promise<ApiABAPDictionaryTable[]> => {
  const { data } = await api.get("/abap/dictionary/", {
    params: projectId ? { project_id: projectId } : undefined,
  })
  return Array.isArray(data) ? data : data.results || []
}

export const createABAPDictionaryTable = async (payload: {
  project_id?: string
  table_name: string
  description?: string
  delivery_class?: string
  fields_schema: Array<{
    field: string
    key: boolean
    data_element?: string
    type: string
    length: number
    description: string
  }>
  sample_records?: Record<string, any>[]
}): Promise<ApiABAPDictionaryTable> => {
  const userId = localStorage.getItem("user_id")
  const { data } = await api.post("/abap/dictionary/", {
    ...payload,
    user_id: userId,
  })
  return data
}

export const deleteABAPDictionaryTable = async (tableId: string): Promise<void> => {
  await api.delete(`/abap/dictionary/${encodeURIComponent(tableId)}/`)
}

export const addRecordToTable = async (
  tableId: string,
  record: Record<string, any>
): Promise<{ status: boolean; message: string; row_count: number; rows: Record<string, any>[] }> => {
  const { data } = await api.post(`/abap/dictionary/${encodeURIComponent(tableId)}/add_record/`, {
    record,
  })
  return data
}
