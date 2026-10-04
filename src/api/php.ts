import api from "./client"

export interface PhpServerStatus {
  status: boolean
  server_status: "starting" | "running" | "stopped" | "failed"
  port: number | null
  url?: string
  pid?: number
  uptime_seconds?: number
  logs?: string
  error?: string
}

export const startPhpServer = async (projectId: string): Promise<PhpServerStatus> => {
  const response = await api.post(`/codelab/projects/${projectId}/php/start/`)
  return response.data
}

export const stopPhpServer = async (projectId: string): Promise<{ status: boolean; message: string }> => {
  const response = await api.post(`/codelab/projects/${projectId}/php/stop/`)
  return response.data
}

export const restartPhpServer = async (projectId: string): Promise<PhpServerStatus> => {
  const response = await api.post(`/codelab/projects/${projectId}/php/restart/`)
  return response.data
}

export const getPhpServerStatus = async (projectId: string): Promise<PhpServerStatus> => {
  const response = await api.get(`/codelab/projects/${projectId}/php/status/`)
  return response.data
}

