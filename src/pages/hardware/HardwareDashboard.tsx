import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Cpu,
  Layers,
  Terminal,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Zap,
  Radio,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Info,
  X,
  Settings2,
  RefreshCw,
  Search,
} from "lucide-react"
import {
  fetchHardwareBoards,
  fetchHardwareProjects,
  createHardwareProject,
  deleteHardwareProject,
  exportProjectZip,
  type HardwareBoard,
  type HardwareProject,
} from "../../api/hardware"

export default function HardwareDashboard() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState<HardwareBoard[]>([])
  const [projects, setProjects] = useState<HardwareProject[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedFamily, setSelectedFamily] = useState<string>("all")

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)
  const [pinoutModalBoard, setPinoutModalBoard] = useState<HardwareBoard | null>(null)
  const [newTitle, setNewTitle] = useState<string>("")
  const [newDesc, setNewDesc] = useState<string>("")
  const [newBoardId, setNewBoardId] = useState<string>("esp32_wroom_32")
  const [newFramework, setNewFramework] = useState<string>("platformio")
  const [newBaudRate, setNewBaudRate] = useState<number>(115200)
  const [creating, setCreating] = useState<boolean>(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [boardList, projectList] = await Promise.all([
        fetchHardwareBoards(),
        fetchHardwareProjects(),
      ])
      setBoards(boardList)
      setProjects(projectList)
    } catch (err: any) {
      console.error("Hardware dashboard data fetch error:", err)
      setError(err?.response?.data?.detail || "Failed to load hardware boards and projects.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setCreating(true)
      const created = await createHardwareProject({
        title: newTitle.trim(),
        description: newDesc.trim(),
        target_board: newBoardId,
        project_type: newFramework,
        baud_rate: newBaudRate,
      })
      setCreateModalOpen(false)
      setNewTitle("")
      setNewDesc("")
      navigate(`/hardware/ide/${created.project_id}`)
    } catch (err: any) {
      console.error("Error creating hardware project:", err)
      alert(err?.response?.data?.detail || "Failed to create project. Please verify user sign-in.")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (projectId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the hardware project "${title}"?`)) return
    try {
      await deleteHardwareProject(projectId)
      setProjects((prev) => prev.filter((p) => p.project_id !== projectId))
    } catch (err: any) {
      alert("Failed to delete project: " + (err?.message || "Unknown error"))
    }
  }

  const handleExportZip = async (projectId: string, title: string) => {
    try {
      await exportProjectZip(projectId, title)
    } catch (err: any) {
      alert("Failed to export ZIP package: " + (err?.message || "Unknown error"))
    }
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedFamily === "all") return matchesSearch
    const family =
      p.target_board_detail?.family ||
      p.target_board_family ||
      (typeof p.target_board === "object" && p.target_board !== null ? p.target_board.family : undefined)
    return matchesSearch && family === selectedFamily
  })

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-900/40 p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Real Embedded Systems &amp; KiCad Engineering
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Arduino, ESP32 &amp; Custom PCB Hardware Studio
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Design real production firmware for ESP32 and Arduino boards, manage multi-file PlatformIO and ESP-IDF source trees, run KiCad schematic and layout checks, and export native CAD packages for physical PCB fabrication.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-emerald-950/40"
              >
                <Plus className="w-4 h-4" />
                New Embedded Project
              </button>
              <Link
                to="/hardware/simulator"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-950/40"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                Interactive Circuit Simulator
              </Link>
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl font-medium text-sm border border-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Badges Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real C/C++ Toolchains</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Native KiCad 8 Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>WebSerial USB Monitor</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              <span>ESP32 Wi-Fi &amp; BLE APIs</span>
            </div>
          </div>
        </div>

        {/* Board Catalog Carousel / Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                Supported Hardware Microcontrollers &amp; SoCs
              </h2>
              <p className="text-xs text-slate-400">
                Architectural profiles, pinouts, clock frequencies, and memory limits
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {boards.map((b) => (
              <div
                key={b.board_id}
                className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col justify-between transition group shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        b.family === "esp32"
                          ? "bg-purple-950 text-purple-300 border border-purple-800"
                          : b.family === "arduino"
                          ? "bg-teal-950 text-teal-300 border border-teal-800"
                          : b.family === "rp2040"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-blue-950 text-blue-300 border border-blue-800"
                      }`}
                    >
                      {b.family}
                    </span>
                    <button
                      onClick={() => setPinoutModalBoard(b)}
                      className="text-slate-400 hover:text-indigo-400 text-xs flex items-center gap-1 transition"
                      title="Inspect pinout & peripherals"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Pinout
                    </button>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{b.mcu}</p>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500 block">Clock:</span>
                      <span className="font-mono text-slate-200">{b.clock_speed_mhz} MHz</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Flash:</span>
                      <span className="font-mono text-slate-200">
                        {b.flash_size_mb >= 1 ? `${b.flash_size_mb} MB` : `${b.flash_size_mb * 1024} KB`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">RAM:</span>
                      <span className="font-mono text-slate-200">{b.ram_kb} KB</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">GPIOs:</span>
                      <span className="font-mono text-slate-200">{b.gpio_count} pins</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {b.has_wifi && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-950 text-sky-400 border border-sky-800">
                        Wi-Fi
                      </span>
                    )}
                    {b.has_ble && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800">
                        BLE
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNewBoardId(b.board_id)
                      setCreateModalOpen(true)
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
                  >
                    Start Project &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Projects Section */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                Active Engineering Projects
              </h2>
              <p className="text-xs text-slate-400">
                Your firmware source trees, PlatformIO configurations, and PCB designs
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Targets</option>
                <option value="esp32">ESP32 Only</option>
                <option value="arduino">Arduino Only</option>
                <option value="stm32">STM32 Only</option>
                <option value="rp2040">RP2040 Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading engineering workspaces...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-200">No hardware projects found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Create a new project to start authoring Arduino or ESP32 firmware, managing header files, and generating custom PCB schematics.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition"
              >
                <Plus className="w-4 h-4" />
                Create First Hardware Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => (
                <div
                  key={p.project_id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {p.project_type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {p.target_board_detail?.name ||
                          p.target_board_name ||
                          (typeof p.target_board === "string" ? p.target_board : p.target_board?.name)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {p.description || "Production embedded firmware workspace."}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                        Baud: {p.baud_rate}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                        CPU: {p.cpu_freq_mhz} MHz
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        to={`/hardware/ide/${p.project_id}`}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        Firmware
                      </Link>
                      <Link
                        to={`/hardware/simulator/${p.project_id}`}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Simulate
                      </Link>
                      <Link
                        to={`/hardware/pcb/${p.project_id}`}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition shadow-sm"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        PCB CAD
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                      <button
                        onClick={() => handleExportZip(p.project_id, p.title)}
                        className="hover:text-slate-200 flex items-center gap-1 transition"
                        title="Export PlatformIO buildable ZIP"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        Export PIO ZIP
                      </button>
                      <button
                        onClick={() => handleDelete(p.project_id, p.title)}
                        className="hover:text-rose-400 flex items-center gap-1 transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Create Hardware Project */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  New Embedded Hardware Project
                </h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. ESP32_Telemetry_Station or Uno_Motor_Controller"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Board &amp; Microcontroller *
                  </label>
                  <select
                    value={newBoardId}
                    onChange={(e) => setNewBoardId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {boards.map((b) => (
                      <option key={b.board_id} value={b.board_id}>
                        {b.name} ({b.mcu} @ {b.clock_speed_mhz} MHz)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Framework / Structure
                    </label>
                    <select
                      value={newFramework}
                      onChange={(e) => setNewFramework(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="platformio">PlatformIO (C/C++ multi-file)</option>
                      <option value="arduino_sketch">Arduino IDE Compatible (.ino)</option>
                      <option value="esp_idf">ESP-IDF Native Framework</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Default Serial Baud
                    </label>
                    <select
                      value={newBaudRate}
                      onChange={(e) => setNewBaudRate(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={115200}>115200 (ESP32 Standard)</option>
                      <option value={9600}>9600 (Uno Default)</option>
                      <option value={230400}>230400</option>
                      <option value={921600}>921600</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Short description of sensor interfaces, peripherals, or PCB goals..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow-md flex items-center gap-1.5"
                  >
                    {creating && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Create Project Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Pinout Breakdown Viewer */}
        {pinoutModalBoard && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    {pinoutModalBoard.name} - Pinout &amp; Peripheral Matrix
                  </h3>
                  <p className="text-xs text-slate-400">{pinoutModalBoard.mcu}</p>
                </div>
                <button
                  onClick={() => setPinoutModalBoard(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Logic Level:</span>
                    <span className="font-semibold text-slate-200">{pinoutModalBoard.operating_voltage}V</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Clock Frequency:</span>
                    <span className="font-semibold text-slate-200">{pinoutModalBoard.clock_speed_mhz} MHz</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PlatformIO Env:</span>
                    <span className="font-semibold text-slate-200 font-mono">{pinoutModalBoard.platformio_env}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Arduino FQBN:</span>
                    <span className="font-semibold text-slate-200 font-mono">{pinoutModalBoard.arduino_fqbn}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-200 uppercase tracking-wide text-[11px]">
                    Pinout &amp; Bus Mappings
                  </h4>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-2 overflow-x-auto">
                    {Object.entries(pinoutModalBoard.pinout_data || {}).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-1 border-b border-slate-900 last:border-0">
                        <span className="text-indigo-400 font-semibold sm:w-36 shrink-0">{key}:</span>
                        <span className="text-slate-300">
                          {Array.isArray(value) ? value.join(", ") : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setPinoutModalBoard(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                >
                  Close Reference
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

