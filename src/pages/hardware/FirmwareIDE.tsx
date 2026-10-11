import React, { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import {
  FileCode,
  FolderTree,
  Play,
  Download,
  Layers,
  Terminal,
  Cpu,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Settings,
  ChevronDown,
  Activity,
  Radio,
  ExternalLink,
} from "lucide-react"
import {
  getHardwareProject,
  getSourceFile,
  createSourceFile,
  updateSourceFile,
  deleteSourceFile,
  exportProjectZip,
  triggerProjectBuild,
  type HardwareProject,
  type HardwareSourceFile,
  type HardwareBuildJob,
} from "../../api/hardware"
import SerialMonitorPanel from "../../components/hardware/SerialMonitorPanel"

export default function FirmwareIDE() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<HardwareProject | null>(null)
  const [activeFile, setActiveFile] = useState<HardwareSourceFile | null>(null)
  const [editorContent, setEditorContent] = useState<string>("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // Compile job state
  const [isCompiling, setIsCompiling] = useState<boolean>(false)
  const [latestBuild, setLatestBuild] = useState<HardwareBuildJob | null>(null)

  // Bottom dock active tab
  const [activeTab, setActiveTab] = useState<"build" | "serial" | "pinout">("build")
  const [bottomDockOpen, setBottomDockOpen] = useState<boolean>(true)

  // New file modal
  const [newFileModal, setNewFileModal] = useState<boolean>(false)
  const [newFilePath, setNewFilePath] = useState<string>("")

  const loadProject = async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const data = await getHardwareProject(projectId)
      setProject(data)
      if (data.recent_build) {
        setLatestBuild(data.recent_build)
      }

      if (data.source_files && data.source_files.length > 0) {
        // Prefer main entry file or first file
        let mainFile = data.source_files.find((f) => f.is_main_entry) || data.source_files[0]
        if (mainFile.content === undefined) {
          try {
            mainFile = await getSourceFile(mainFile.file_id)
          } catch {
            // fallback if detail fetch fails
          }
        }
        setActiveFile(mainFile)
        setEditorContent(mainFile.content || "")
      }
    } catch (err: any) {
      console.error("Failed to load hardware project:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProject()
  }, [projectId])

  const handleSelectFile = async (file: HardwareSourceFile) => {
    if (hasUnsavedChanges && activeFile) {
      if (!window.confirm("You have unsaved changes in current file. Discard and switch?")) {
        return
      }
    }
    let resolvedFile = file
    if (resolvedFile.content === undefined) {
      try {
        resolvedFile = await getSourceFile(file.file_id)
      } catch {
        // ignore
      }
    }
    setActiveFile(resolvedFile)
    setEditorContent(resolvedFile.content || "")
    setHasUnsavedChanges(false)
  }

  const handleEditorChange = (value: string | undefined) => {
    const newVal = value ?? ""
    setEditorContent(newVal)
    if (activeFile && newVal !== activeFile.content) {
      setHasUnsavedChanges(true)
    }
  }

  const handleSaveActiveFile = async () => {
    if (!activeFile) return
    try {
      setSaving(true)
      const updated = await updateSourceFile(activeFile.file_id, {
        content: editorContent,
      })
      setActiveFile(updated)
      setHasUnsavedChanges(false)

      // Update in project source_files state
      setProject((prev) => {
        if (!prev || !prev.source_files) return prev
        return {
          ...prev,
          source_files: prev.source_files.map((f) =>
            f.file_id === updated.file_id ? updated : f
          ),
        }
      })
    } catch (err: any) {
      alert("Failed to save file: " + (err?.message || "Unknown error"))
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNewFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !newFilePath.trim()) return

    try {
      const created = await createSourceFile({
        project: projectId,
        path: newFilePath.trim(),
        content: "// New source file\n#include <Arduino.h>\n",
      })
      setNewFileModal(false)
      setNewFilePath("")
      setProject((prev) => {
        if (!prev) return prev
        const files = prev.source_files || []
        return { ...prev, source_files: [...files, created] }
      })
      setActiveFile(created)
      setEditorContent(created.content)
      setHasUnsavedChanges(false)
    } catch (err: any) {
      alert("Failed to create file: " + (err?.response?.data?.detail || err?.message || "Error"))
    }
  }

  const handleDeleteFile = async (file: HardwareSourceFile, e: React.MouseEvent) => {
    e.stopPropagation()
    if (file.is_main_entry) {
      alert("Cannot delete main entry file.")
      return
    }
    if (!window.confirm(`Delete ${file.path}?`)) return

    try {
      await deleteSourceFile(file.file_id)
      setProject((prev) => {
        if (!prev || !prev.source_files) return prev
        return {
          ...prev,
          source_files: prev.source_files.filter((f) => f.file_id !== file.file_id),
        }
      })
      if (activeFile?.file_id === file.file_id) {
        const remaining = (project?.source_files || []).filter((f) => f.file_id !== file.file_id)
        if (remaining.length > 0) {
          handleSelectFile(remaining[0])
        } else {
          setActiveFile(null)
          setEditorContent("")
        }
      }
    } catch (err: any) {
      alert("Failed to delete file: " + (err?.message || "Error"))
    }
  }

  const handleCompile = async () => {
    if (!projectId) return
    // Auto save if dirty
    if (hasUnsavedChanges) {
      await handleSaveActiveFile()
    }

    try {
      setIsCompiling(true)
      setActiveTab("build")
      setBottomDockOpen(true)
      const job = await triggerProjectBuild(projectId)
      setLatestBuild(job)
    } catch (err: any) {
      console.error("Compilation execution failed:", err)
    } finally {
      setIsCompiling(false)
    }
  }

  const handleDownloadZip = async () => {
    if (!projectId || !project) return
    try {
      await exportProjectZip(projectId, project.title)
    } catch (err: any) {
      alert("Export failed: " + (err?.message || "Error"))
    }
  }

  // Determine Monaco syntax highlighting based on file extension
  const getEditorLanguage = (path: string): string => {
    if (path.endsWith(".h") || path.endsWith(".hpp") || path.endsWith(".cpp") || path.endsWith(".c") || path.endsWith(".ino")) {
      return "cpp"
    }
    if (path.endsWith(".ini")) return "ini"
    if (path.endsWith(".json")) return "json"
    if (path.endsWith(".csv")) return "plaintext"
    return "plaintext"
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading hardware workspace...</span>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Cpu className="w-12 h-12 text-slate-600" />
        <p className="text-lg font-semibold text-slate-300">Project not found or deleted.</p>
        <Link
          to="/hardware"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs"
        >
          Return to Hardware Dashboard
        </Link>
      </div>
    )
  }

  const board =
    project.target_board_detail ||
    (typeof project.target_board === "object" && project.target_board !== null
      ? project.target_board
      : undefined)
  const boardDisplayName =
    board?.name ||
    project.target_board_name ||
    (typeof project.target_board === "string" ? project.target_board : project.board_variant || "ESP32")

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar / Engineering Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/hardware"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{project.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {boardDisplayName}
                </span>
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={handleSaveActiveFile}
            disabled={saving || !hasUnsavedChanges}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              hasUnsavedChanges
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                : "bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save File"}
          </button>

          {/* Compile Button */}
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow-md"
            title="Compile firmware with PlatformIO / Arduino CLI"
          >
            {isCompiling ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Build Firmware
          </button>

          {/* Export PIO ZIP */}
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            title="Export complete PlatformIO directory structure"
          >
            <Download className="w-3.5 h-3.5" />
            Export ZIP
          </button>

          {/* Jump to Circuit Simulator */}
          <Link
            to={`/hardware/simulator/${project.project_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
            title="Open Interactive Electronics & Arduino Simulator"
          >
            <Activity className="w-3.5 h-3.5" />
            Circuit Simulator
          </Link>

          {/* Jump to PCB Design */}
          <Link
            to={`/hardware/pcb/${project.project_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition shadow-sm"
            title="Open linked KiCad PCB workspace"
          >
            <Layers className="w-3.5 h-3.5" />
            PCB Design
          </Link>
        </div>
      </header>

      {/* Main Body (Sidebar + Monaco Editor + Bottom Dock) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: File Tree & Hardware Spec */}
        <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* File Explorer Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                Files &amp; Modules
              </span>
              <button
                onClick={() => setNewFileModal(true)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                title="Create source or header file"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {(project.source_files || []).map((file) => {
                const isCurrent = activeFile?.file_id === file.file_id
                return (
                  <div
                    key={file.file_id}
                    onClick={() => handleSelectFile(file)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                      isCurrent
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode
                        className={`w-3.5 h-3.5 shrink-0 ${
                          file.is_main_entry
                            ? "text-emerald-400"
                            : file.path.endsWith(".h")
                            ? "text-purple-400"
                            : "text-sky-400"
                        }`}
                      />
                      <span className="truncate font-mono">{file.path}</span>
                    </div>

                    {!file.is_main_entry && (
                      <button
                        onClick={(e) => handleDeleteFile(file, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 rounded transition"
                        title="Delete file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Board Spec Card in Sidebar */}
          {board && (
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Target MCU:</span>
                <span className="font-mono text-emerald-400">{board.mcu}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-slate-400 font-mono text-[10px]">
                <div>Clock: {board.clock_speed_mhz}MHz</div>
                <div>Flash: {board.flash_size_mb}MB</div>
                <div>RAM: {board.ram_kb}KB</div>
                <div>Env: {board.platformio_env}</div>
              </div>
            </div>
          )}
        </aside>

        {/* Central Workspace: Monaco Editor & Bottom Dock */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Active File Tab / Breadcrumbs */}
          <div className="h-9 bg-slate-900/60 border-b border-slate-800 px-4 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-200">{activeFile?.path || "No file selected"}</span>
              {hasUnsavedChanges && <span className="text-amber-400 text-[10px]">* (unsaved)</span>}
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Lang: {activeFile ? getEditorLanguage(activeFile.path) : "none"}</span>
              <span>Baud: {project.baud_rate}</span>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden">
            {activeFile ? (
              <Editor
                height="100%"
                language={getEditorLanguage(activeFile.path)}
                theme="vs-dark"
                value={editorContent}
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  fontFamily: "Fira Code, Menlo, Monaco, 'Courier New', monospace",
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                  renderLineHighlight: "all",
                  tabSize: 4,
                  lineNumbers: "on",
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select a file from the explorer on the left to start editing.
              </div>
            )}
          </div>

          {/* Bottom Dock (Terminal / Serial Monitor / Pinout) */}
          <div className={`border-t border-slate-800 bg-slate-900 flex flex-col transition-all duration-150 ${
            bottomDockOpen ? "h-64" : "h-9"
          }`}>
            {/* Dock Header Tabs */}
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveTab("build")
                    setBottomDockOpen(true)
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                    activeTab === "build" && bottomDockOpen
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  Compiler Build Output
                  {latestBuild && (
                    <span className={`w-2 h-2 rounded-full ${
                      latestBuild.status === "success"
                        ? "bg-emerald-400"
                        : latestBuild.status === "building"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-rose-400"
                    }`} />
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("serial")
                    setBottomDockOpen(true)
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                    activeTab === "serial" && bottomDockOpen
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  USB Serial Monitor
                </button>

                <button
                  onClick={() => {
                    setActiveTab("pinout")
                    setBottomDockOpen(true)
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                    activeTab === "pinout" && bottomDockOpen
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  Board Pinout &amp; GPIOs
                </button>
              </div>

              {/* Toggle dock minimize / maximize */}
              <button
                onClick={() => setBottomDockOpen(!bottomDockOpen)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${bottomDockOpen ? "" : "rotate-180"}`} />
              </button>
            </div>

            {/* Dock Content Body */}
            {bottomDockOpen && (
              <div className="flex-1 overflow-hidden">
                {activeTab === "build" && (
                  <div className="h-full bg-slate-950 p-3 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 select-text">
                    {latestBuild ? (
                      <div>
                        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-[11px]">
                          <span className="text-slate-400">Toolchain: <b className="text-white">{latestBuild.toolchain}</b></span>
                          <span className="text-slate-400">Status: <b className={`uppercase ${
                            latestBuild.status === "success"
                              ? "text-emerald-400"
                              : latestBuild.status === "unsupported"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}>{latestBuild.status}</b></span>
                          <span className="text-slate-400">Duration: <b>{latestBuild.duration_seconds}s</b></span>
                        </div>

                        {latestBuild.stdout_log && (
                          <pre className="text-slate-300 whitespace-pre-wrap">{latestBuild.stdout_log}</pre>
                        )}
                        {latestBuild.stderr_log && (
                          <pre className="text-rose-400 whitespace-pre-wrap">{latestBuild.stderr_log}</pre>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6 gap-1">
                        <Terminal className="w-6 h-6 text-slate-600" />
                        <p>No active compilation job yet.</p>
                        <p className="text-[11px] text-slate-600">Click "Build Firmware" to compile with PlatformIO / Arduino CLI.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "serial" && (
                  <div className="h-full">
                    <SerialMonitorPanel defaultBaudRate={project.baud_rate} />
                  </div>
                )}

                {activeTab === "pinout" && (
                  <div className="h-full bg-slate-950 p-4 overflow-y-auto text-xs space-y-3 font-mono">
                    <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                      <span className="font-bold text-white">{board?.name || "Target Board"} Peripheral Layout</span>
                      <span className="text-slate-400">Logic Voltage: {board?.operating_voltage}V</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(board?.pinout_data || {}).map(([category, pins]) => (
                        <div key={category} className="p-2.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-indigo-400 font-bold block mb-1 uppercase text-[10px]">{category}</span>
                          <span className="text-slate-300 text-[11px] leading-relaxed">
                            {Array.isArray(pins) ? pins.join(", ") : JSON.stringify(pins)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal: Create File */}
      {newFileModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              Create Source or Header File
            </h3>

            <form onSubmit={handleCreateNewFile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  File Path (e.g. <code>src/sensors.cpp</code> or <code>include/config.h</code>)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFilePath}
                  onChange={(e) => setNewFilePath(e.target.value)}
                  placeholder="src/sensors.cpp"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewFileModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                >
                  Create File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

