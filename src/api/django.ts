import api from "./client"

export interface DjangoServerStatus {
  status: boolean
  server_status: "starting" | "running" | "stopped" | "failed"
  port: number | null
  url?: string
  pid?: number
  uptime_seconds?: number
  logs?: string
  error?: string
}

export interface DjangoMigrationResult {
  status: boolean
  success: boolean
  exit_code: number
  output: string
  duration_ms: number
  error?: string
}

export interface DjangoTestResult {
  status: boolean
  success: boolean
  exit_code: number
  stdout?: string
  stderr?: string
  output: string
  duration_ms: number
  error?: string
}

export interface DjangoApiRequestParams {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  headers?: Record<string, string>
  body?: string
}

export interface DjangoApiResponse {
  status: boolean
  status_code?: number
  status_text?: string
  duration_ms?: number
  headers?: Record<string, string>
  content_type?: string
  body?: string
  is_json?: boolean
  json_data?: any
  error?: string
}

export const startDjangoServer = async (projectId: string): Promise<DjangoServerStatus> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/start/`)
  return response.data
}

export const stopDjangoServer = async (projectId: string): Promise<{ status: boolean; message: string }> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/stop/`)
  return response.data
}

export const restartDjangoServer = async (projectId: string): Promise<DjangoServerStatus> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/restart/`)
  return response.data
}

export const getDjangoServerStatus = async (projectId: string): Promise<DjangoServerStatus> => {
  const response = await api.get(`/codelab/projects/${projectId}/django/status/`)
  return response.data
}

export const runDjangoMigrations = async (projectId: string): Promise<DjangoMigrationResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/migrate/`)
  return response.data
}

export const runDjangoMakemigrations = async (projectId: string): Promise<DjangoMigrationResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/makemigrations/`)
  return response.data
}

export const runDjangoMigrate = async (
  projectId: string,
  appLabel: string = "",
  migrationName: string = ""
): Promise<DjangoMigrationResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/migrate-run/`, {
    app_label: appLabel,
    migration_name: migrationName,
  })
  return response.data
}

export const runDjangoTests = async (projectId: string): Promise<DjangoTestResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/test/`)
  return response.data
}

export interface DjangoCheckResult {
  status: boolean
  success: boolean
  exit_code: number
  output: string
  duration_ms: number
  error?: string
}

export const runDjangoCheck = async (projectId: string): Promise<DjangoCheckResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/check/`)
  return response.data
}

export interface DjangoCreateAppResult {
  status: boolean
  message: string
  app_name?: string
  files_created?: string[]
  error?: string
}

export const createDjangoApp = async (projectId: string, appName: string): Promise<DjangoCreateAppResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/create-app/`, {
    app_name: appName,
  })
  return response.data
}

export interface DjangoNavigationData {
  status: boolean
  project_id: string
  project_name: string
  root_dir: string
  settings_module: string
  selected_database?: string | null
  available_databases?: string[]
  active_sql_database?: string
  installed_apps: Array<{ name: string; is_core: boolean }>
  routes: Array<{ route: string; handler: string; file: string }>
  models: Array<{ name: string; file: string }>
  migrations: Array<{ name: string; path: string }>
  templates: string[]
  static: string[]
  shortcuts: Array<{ label: string; path: string }>
  server_status: "running" | "stopped" | "failed" | "starting"
  port: number | null
  url?: string
}

export const getDjangoNavigation = async (projectId: string): Promise<DjangoNavigationData> => {
  const response = await api.get(`/codelab/projects/${projectId}/django/navigation/`)
  return response.data
}

export interface DjangoDatabaseConfigResult {
  status: boolean
  django_database: string | null
  available_databases: string[]
  active_sql_database: string
  message?: string
  error?: string
}

export const getProjectDjangoDatabase = async (projectId: string): Promise<DjangoDatabaseConfigResult> => {
  const response = await api.get(`/codelab/projects/${projectId}/django/database/`)
  return response.data
}

export const setProjectDjangoDatabase = async (
  projectId: string,
  databaseName: string | null
): Promise<DjangoDatabaseConfigResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/database/`, {
    database: databaseName,
  })
  return response.data
}

export interface DjangoShowmigrationsResult {
  status: boolean
  success: boolean
  exit_code: number
  output: string
  database?: string
  migrations: Array<{ app: string; name: string; applied: boolean }>
  duration_ms: number
  error?: string
}

export const runDjangoShowmigrations = async (
  projectId: string,
  appLabel: string = ""
): Promise<DjangoShowmigrationsResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/showmigrations/`, {
    app_label: appLabel,
  })
  return response.data
}

export interface DjangoSqlmigrateResult {
  status: boolean
  success: boolean
  exit_code: number
  output: string
  sql?: string
  database?: string
  duration_ms: number
  error?: string
}

export const runDjangoSqlmigrate = async (
  projectId: string,
  appLabel: string,
  migrationName: string
): Promise<DjangoSqlmigrateResult> => {
  const response = await api.post(`/codelab/projects/${projectId}/django/sqlmigrate/`, {
    app_label: appLabel,
    migration_name: migrationName,
  })
  return response.data
}

export const sendDjangoApiRequest = async (
  projectId: string,
  params: DjangoApiRequestParams
): Promise<DjangoApiResponse> => {
  const response = await api.post(
    `/codelab/projects/${projectId}/django/api-request/`,
    params
  )
  return response.data
}

