import api from "./client"

export interface SqlColumn {
  cid: number
  name: string
  type: string
  notnull: boolean
  default_value: string | null
  pk: boolean
}

export interface SqlForeignKey {
  id: number
  seq: number
  table: string
  from: string
  to: string
}

export interface SqlTableMeta {
  name: string
  row_count: number
  columns: SqlColumn[]
  foreign_keys: SqlForeignKey[]
}

export interface SqlDatabaseMeta {
  name: string
  created_at?: string
  is_active: boolean
  is_default?: boolean
  is_django?: boolean
  tables_count: number
  tables: SqlTableMeta[]
}

export interface SqlSchemaResponse {
  active_database: string
  django_database?: string | null
  databases: SqlDatabaseMeta[]
  tables: SqlTableMeta[]
  database_type: string
  total_tables: number
  total_databases: number
}

export interface SqlQueryResult {
  is_query: boolean
  columns?: string[]
  rows?: any[][]
  row_count?: number
  affected_rows?: number
  message?: string
  statement: string
}

export interface SqlExecuteResponse {
  status: boolean
  active_database?: string
  databases?: SqlDatabaseMeta[]
  duration_ms: number
  results?: SqlQueryResult[]
  primary?: SqlQueryResult
  error?: string
}

export interface SqlTemplate {
  key: string
  title: string
  description: string
}

export const getSqlSchema = async (
  projectId: string,
  database?: string
): Promise<SqlSchemaResponse> => {
  const { data } = await api.get(`/codelab/projects/${encodeURIComponent(projectId)}/sql/schema/`, {
    params: database ? { database } : undefined,
  })
  return data
}

export const executeSql = async (
  projectId: string,
  query: string,
  database?: string
): Promise<SqlExecuteResponse> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/sql/execute/`,
    { query, database }
  )
  return data
}

export const resetSqlDatabase = async (
  projectId: string,
  template = "company_hr",
  database?: string
): Promise<{ status: boolean; message: string }> => {
  const { data } = await api.post(
    `/codelab/projects/${encodeURIComponent(projectId)}/sql/reset/`,
    { template, database }
  )
  return data
}

export const exportSqlCsvUrl = (projectId: string, query: string, database?: string): string => {
  const dbParam = database ? `&database=${encodeURIComponent(database)}` : ""
  return `${api.defaults.baseURL}/codelab/projects/${encodeURIComponent(projectId)}/sql/export-csv/?query=${encodeURIComponent(query)}${dbParam}`
}

export const listSqlTemplates = async (): Promise<SqlTemplate[]> => {
  const { data } = await api.get("/codelab/sql/templates/")
  return data.templates || []
}
