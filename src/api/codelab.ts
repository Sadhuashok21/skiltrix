import api from "./client"

export interface ApiProjectFile {
  file_id: string
  path: string
  name: string
  is_directory: boolean
  size_bytes: number
  mime_type: string
  updated_at: string
}

export interface ApiProject {
  project_id: string
  title: string
  slug: string
  project_type: "single_file" | "django" | "react" | "php" | "sql" | "fullstack"
  language: string
  description: string
  is_public: boolean
  execution_settings?: Record<string, unknown>
  status: "ready" | "building" | "running" | "stopped" | "error"
  files_count?: number
  owner_username?: string
  preview_url?: string
  session_status?: string
  files?: ApiProjectFile[]
  last_opened_at: string
  created_at: string
  updated_at: string
}

export interface ExecutionResponse {
  status: boolean
  job_id: string
  execution_status: "completed" | "failed" | "timeout"
  stdout: string
  stderr: string
  exit_code: number
  duration_ms: number
  memory_kb: number
}

export const listProjects = async (): Promise<ApiProject[]> => {
  const { data } = await api.get("/codelab/projects/")
  return Array.isArray(data) ? data : data.results || []
}

export const createProject = async (payload: {
  title: string
  project_type: string
  language: string
  description?: string
  is_public?: boolean
}): Promise<ApiProject> => {
  const { data } = await api.post("/codelab/projects/", payload)
  return data
}

export const getProject = async (projectId: string): Promise<ApiProject> => {
  const { data } = await api.get(`/codelab/projects/${encodeURIComponent(projectId)}/`)
  return data
}

export const deleteProject = async (projectId: string): Promise<void> => {
  await api.delete(`/codelab/projects/${encodeURIComponent(projectId)}/`)
}

export const exportProjectZipUrl = (projectId: string): string => {
  return `${api.defaults.baseURL}/codelab/projects/${encodeURIComponent(projectId)}/export/`
}

export const getProjectFiles = async (projectId: string): Promise<ApiProjectFile[]> => {
  const { data } = await api.get(`/codelab/projects/${encodeURIComponent(projectId)}/files/`)
  return Array.isArray(data) ? data : []
}

export const getFileContent = async (
  projectId: string,
  filePath: string
): Promise<{ content: string; path: string; file_id: string; name?: string; updated_at: string; revision: number }> => {
  const { data } = await api.get(
    `/codelab/projects/${encodeURIComponent(projectId)}/files/content/`,
    { params: { path: filePath } }
  )
  return data
}

export const saveFileContent = async (
  projectId: string,
  filePath: string,
  content: string,
  expectedRevision: number
): Promise<{ status: boolean; message: string; updated_at: string; revision: number }> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/files/save/`,
    { path: filePath, content, expected_revision: expectedRevision }
  )
  return data
}

export const createProjectFile = async (
  projectId: string,
  filePath: string,
  isDirectory = false,
  content = ""
): Promise<ApiProjectFile> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/files/create/`,
    { path: filePath, is_directory: isDirectory, content }
  )
  return data
}

export const deleteProjectFile = async (
  projectId: string,
  filePath: string
): Promise<void> => {
  await api.delete(
    `/codelab/projects/${encodeURIComponent(projectId)}/files/delete/`,
    { params: { path: filePath } }
  )
}

export const renameProjectFile = async (
  projectId: string,
  oldPath: string,
  newPath: string
): Promise<{ status: boolean; message: string; old_path: string; new_path: string }> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/files/rename/`,
    { old_path: oldPath, new_path: newPath }
  )
  return data
}

export const moveProjectFile = async (
  projectId: string,
  sourcePath: string,
  targetFolder: string
): Promise<{ status: boolean; message: string; source_path: string; new_path: string }> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/files/move/`,
    { source_path: sourcePath, target_folder: targetFolder }
  )
  return data
}

export const duplicateProjectFile = async (
  projectId: string,
  sourcePath: string
): Promise<{ status: boolean; message: string; file: ApiProjectFile }> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/files/duplicate/`,
    { source_path: sourcePath }
  )
  return data
}

export const executeTerminalCommand = async (
  projectId: string,
  command: string
): Promise<{
  status: boolean
  exit_code: number
  output: string
  cwd: string
  is_server?: boolean
  server_port?: number
  preview_url?: string
}> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/terminal/execute/`,
    { command }
  )
  return data
}

export const executeCode = async (payload: {
  code: string
  language: string
  stdin?: string
  project_id?: string
  file_path?: string
}): Promise<ExecutionResponse> => {
  const { data } = await api.post("/codelab/execute/", payload)
  return data
}
