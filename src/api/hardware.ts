import api from "./client"

export interface HardwareBoard {
  board_id: string
  name: string
  family: "arduino" | "esp32" | "stm32" | "rp2040"
  mcu: string
  clock_speed_mhz: number
  flash_size_mb: number
  ram_kb: number
  operating_voltage: number
  gpio_count: number
  has_wifi: boolean
  has_ble: boolean
  platformio_env: string
  arduino_fqbn: string
  pinout_data: Record<string, any>
  schematic_symbol: string
  default_template_code: string
  is_active: boolean
}

export interface HardwareSourceFile {
  file_id: string
  project: string
  path: string
  name: string
  content: string
  is_main_entry: boolean
  size_bytes: number
  revision: number
  updated_at: string
}

export interface ComponentItem {
  component_id: string
  reference: string
  value: string
  footprint: string
  symbol: string
  manufacturer: string
  mpn: string
  datasheet_url: string
  quantity: number
  unit_cost_inr: number
  is_surface_mount: boolean
}

export interface PcbProject {
  pcb_id: string
  hardware_project: string
  title: string
  layer_count: number
  board_width_mm: number
  board_height_mm: number
  copper_weight_oz: number
  min_trace_width_mil: number
  min_clearance_mil: number
  solder_mask_color: string
  silkscreen_color: string
  surface_finish: string
  schematic_data: Record<string, any>
  layout_data: Record<string, any>
  erc_log: any[]
  drc_log: any[]
  status: "draft" | "erc_passed" | "drc_passed" | "ready_for_fab" | "violations"
  components?: ComponentItem[]
  updated_at: string
}

export interface HardwareBuildJob {
  job_id: string
  project: string
  toolchain: string
  status: "queued" | "building" | "success" | "failed" | "unsupported"
  stdout_log: string
  stderr_log: string
  flash_used_bytes: number
  ram_used_bytes: number
  duration_seconds: number
  binary_artifact_url: string
  created_at: string
}

export interface HardwareProject {
  project_id: string
  title: string
  slug: string
  description: string
  project_type: "arduino_sketch" | "esp_idf" | "platformio" | "bare_metal"
  target_board: string | HardwareBoard
  target_board_name?: string
  target_board_mcu?: string
  target_board_family?: string
  target_board_detail?: HardwareBoard
  board_variant: string
  baud_rate: number
  cpu_freq_mhz: number
  flash_mode: string
  partitions_config: string
  is_public: boolean
  status: "draft" | "configured" | "verified" | "error"
  source_files?: HardwareSourceFile[]
  pcb_project?: PcbProject
  recent_build?: HardwareBuildJob | null
  created_at: string
  updated_at: string
}

export interface ConnectedDevice {
  device_id: string
  name: string
  board: string | null
  serial_port: string
  baud_rate: number
  firmware_version: string
  is_online: boolean
  last_telemetry: Record<string, any>
  last_seen_at?: string
  created_at: string
}

// ==========================================
// API Operations
// ==========================================

export async function fetchHardwareBoards(): Promise<HardwareBoard[]> {
  const resp = await api.get<{ results?: HardwareBoard[] } | HardwareBoard[]>("/hardware/boards/")
  return Array.isArray(resp.data) ? resp.data : (resp.data.results || [])
}

export async function fetchHardwareProjects(): Promise<HardwareProject[]> {
  const resp = await api.get<{ results?: HardwareProject[] } | HardwareProject[]>("/hardware/projects/")
  return Array.isArray(resp.data) ? resp.data : (resp.data.results || [])
}

export async function getHardwareProject(projectId: string): Promise<HardwareProject> {
  const resp = await api.get<HardwareProject>(`/hardware/projects/${projectId}/`)
  return resp.data
}

export async function createHardwareProject(payload: {
  title: string
  description?: string
  target_board: string
  project_type?: string
  baud_rate?: number
}): Promise<HardwareProject> {
  const resp = await api.post<HardwareProject>("/hardware/projects/", payload)
  return resp.data
}

export async function updateHardwareProject(
  projectId: string,
  payload: Partial<HardwareProject>
): Promise<HardwareProject> {
  const resp = await api.patch<HardwareProject>(`/hardware/projects/${projectId}/`, payload)
  return resp.data
}

export async function deleteHardwareProject(projectId: string): Promise<void> {
  await api.delete(`/hardware/projects/${projectId}/`)
}

export async function exportProjectZip(projectId: string, title: string = "firmware_project"): Promise<void> {
  const resp = await api.get(`/hardware/projects/${projectId}/export-zip/`, {
    responseType: "blob",
  })
  const url = window.URL.createObjectURL(new Blob([resp.data], { type: "application/zip" }))
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${title.replace(/\s+/g, "_").toLowerCase()}_pio.zip`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function triggerProjectBuild(projectId: string): Promise<HardwareBuildJob> {
  const resp = await api.post<HardwareBuildJob>(`/hardware/projects/${projectId}/compile/`)
  return resp.data
}

export async function getSourceFile(fileId: string): Promise<HardwareSourceFile> {
  const resp = await api.get<HardwareSourceFile>(`/hardware/files/${fileId}/`)
  return resp.data
}

export async function createSourceFile(payload: {
  project: string
  path: string
  content?: string
  is_main_entry?: boolean
}): Promise<HardwareSourceFile> {
  const resp = await api.post<HardwareSourceFile>("/hardware/files/", payload)
  return resp.data
}

export async function updateSourceFile(
  fileId: string,
  payload: { content: string }
): Promise<HardwareSourceFile> {
  const resp = await api.patch<HardwareSourceFile>(`/hardware/files/${fileId}/`, payload)
  return resp.data
}

export async function deleteSourceFile(fileId: string): Promise<void> {
  await api.delete(`/hardware/files/${fileId}/`)
}

export async function fetchPcbProject(projectId: string): Promise<PcbProject> {
  const resp = await api.get<PcbProject>(`/hardware/pcb/${projectId}/`)
  return resp.data
}

export async function updatePcbProject(
  pcbId: string,
  payload: Partial<PcbProject>
): Promise<PcbProject> {
  const resp = await api.patch<PcbProject>(`/hardware/pcb/${pcbId}/`, payload)
  return resp.data
}

export async function runPcbDrc(pcbId: string): Promise<{ drc_status: string; violations: any[] }> {
  const resp = await api.post<{ drc_status: string; violations: any[] }>(`/hardware/pcb/${pcbId}/run-drc/`)
  return resp.data
}

export async function exportKiCadZip(pcbId: string, title: string = "pcb_design"): Promise<void> {
  const resp = await api.get(`/hardware/pcb/${pcbId}/export-kicad/`, {
    responseType: "blob",
  })
  const url = window.URL.createObjectURL(new Blob([resp.data], { type: "application/zip" }))
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${title.replace(/\s+/g, "_").toLowerCase()}_kicad8.zip`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function addPcbComponent(
  pcbId: string,
  payload: {
    reference: string
    value: string
    footprint: string
    mpn?: string
    unit_cost_inr?: number
    quantity?: number
  }
): Promise<ComponentItem> {
  const resp = await api.post<ComponentItem>(`/hardware/pcb/${pcbId}/add-component/`, payload)
  return resp.data
}

export async function fetchConnectedDevices(): Promise<ConnectedDevice[]> {
  const resp = await api.get<{ results?: ConnectedDevice[] } | ConnectedDevice[]>("/hardware/devices/")
  return Array.isArray(resp.data) ? resp.data : (resp.data.results || [])
}

export async function registerConnectedDevice(payload: {
  name: string
  board?: string
  serial_port?: string
  baud_rate?: number
}): Promise<ConnectedDevice> {
  const resp = await api.post<ConnectedDevice>("/hardware/devices/", payload)
  return resp.data
}

export async function sendDeviceTelemetry(
  deviceId: string,
  telemetry: Record<string, any>
): Promise<any> {
  const resp = await api.post(`/hardware/devices/${deviceId}/telemetry/`, telemetry)
  return resp.data
}
