import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Folder,
  Play,
  Terminal,
  Globe,
  Settings,
  Download,
  ArrowLeft,
  Columns,
  Maximize2,
  Code2,
  Database,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sidebar,
  Sun,
  Moon,
  Layers,
  Sparkles,
} from "lucide-react"

import {
  getProject,
  getProjectFiles,
  getFileContent,
  saveFileContent,
  createProjectFile,
  deleteProjectFile,
  renameProjectFile,
  moveProjectFile,
  duplicateProjectFile,
  executeCode,
  exportProjectZipUrl,
  type ApiProject,
  type ApiProjectFile,
  type ExecutionResponse,
} from "../api/codelab"

import ProjectFileExplorer from "../components/codelab/ProjectFileExplorer"
import DjangoNavigationPanel from "../components/codelab/DjangoNavigationPanel"
import MonacoEditorPanel from "../components/codelab/MonacoEditorPanel"
import OutputTerminalPanel from "../components/codelab/OutputTerminalPanel"
import WebPreviewPanel from "../components/codelab/WebPreviewPanel"
import SqlPlaygroundPanel from "../components/codelab/SqlPlaygroundPanel"
import {
  startDjangoServer,
  stopDjangoServer,
  restartDjangoServer,
  getDjangoServerStatus,
} from "../api/django"
import {
  startPhpServer,
  stopPhpServer,
  restartPhpServer,
  getPhpServerStatus,
} from "../api/php"
import { API_ORIGIN } from "../api/client"
import { diagnoseProject, diagnoseProjectFile, parseCompilerDiagnostics, type SourceDiagnostic } from "../api/diagnostics"
import { isCurrentDiagnosticResponse, removeFileDiagnostics, replaceFileDiagnostics } from "../utils/diagnosticState"

interface OpenTab {
  path: string
  name: string
  content: string
  isDirty: boolean
  revision: number
  fileId: string
}

// Helper to normalize relative paths consistently across platforms
const normalizePath = (p: string | null | undefined): string => {
  if (!p) return ""
  return p.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "").trim()
}

export default function CodeLabIDE() {
  const { projectId } = useParams<{ projectId: string }>()

  const [project, setProject] = useState<ApiProject | null>(null)
  const [files, setFiles] = useState<ApiProjectFile[]>([])
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activePath, setActivePath] = useState<string | null>(null)

  // Track latest open tabs and active path in refs to avoid stale closure issues
  const openTabsRef = useRef<OpenTab[]>([])
  const activePathRef = useRef<string | null>(null)
  const initialFileOpenedRef = useRef(false)

  useEffect(() => {
    openTabsRef.current = openTabs
  }, [openTabs])

  useEffect(() => {
    activePathRef.current = activePath
  }, [activePath])

  // Reset state when project ID changes
  useEffect(() => {
    initialFileOpenedRef.current = false
    setOpenTabs([])
    setActivePath(null)
  }, [projectId])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark")

  // Panel visibility & sidebar tab
  const [activeView, setActiveView] = useState<"code" | "database">("code")
  const [sidebarTab, setSidebarTab] = useState<"explorer" | "django">("explorer")
  const [showSidebar, setShowSidebar] = useState(true)
  const [showBottomPanel, setShowBottomPanel] = useState(true)
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)

  // Execution & Stdin
  const [execution, setExecution] = useState<ExecutionResponse | null>(null)
  const [diagnostics, setDiagnostics] = useState<SourceDiagnostic[]>([])
  const [isCheckingDiagnostics, setIsCheckingDiagnostics] = useState(false)
  const diagnosticRunId = useRef(0)
  const diagnosticAbort = useRef<AbortController | null>(null)
  const [stdinValue, setStdinValue] = useState("")

  // Server state for live previews
  const [serverStatus, setServerStatus] = useState<"starting" | "running" | "stopped" | "failed">("stopped")
  const [serverPort, setServerPort] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")

  // Open file in editor tab with strict deduplication
  const handleOpenFile = useCallback(async (rawFilePath: string) => {
    if (!rawFilePath) return
    const targetPath = normalizePath(rawFilePath)

    // Check if file is already open in tabs
    const existing = openTabsRef.current.find((t) => normalizePath(t.path) === targetPath)
    if (existing) {
      setActivePath(existing.path)
      return
    }

    try {
      if (!projectId) return
      const fileData = await getFileContent(projectId, targetPath)
      const canonicalPath = normalizePath(fileData.path || targetPath)
      const fileName = fileData.name || canonicalPath.split("/").pop() || canonicalPath

      const newTab: OpenTab = {
        path: canonicalPath,
        name: fileName,
        content: fileData.content ?? "",
        isDirty: false,
        revision: fileData.revision,
        fileId: fileData.file_id,
      }

      setOpenTabs((prev) => {
        // Double check against existing tabs to avoid race conditions
        if (prev.some((t) => normalizePath(t.path) === canonicalPath)) {
          return prev
        }
        return [...prev, newTab]
      })
      setActivePath(canonicalPath)
    } catch (err: any) {
      alert(`Could not open file: ${err.message}`)
    }
  }, [projectId])

  // Fetch project and file list
  const loadProjectData = useCallback(async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const proj = await getProject(projectId)
      setProject(proj)

      const fileList = await getProjectFiles(projectId)
      setFiles(fileList)

      // Auto-open primary entry file ONLY ONCE on initial project load if no tabs are open
      if (!initialFileOpenedRef.current && openTabsRef.current.length === 0 && fileList.length > 0) {
        const primary = fileList.find(
          (f) =>
            !f.is_directory &&
            (f.name === "manage.py" ||
              f.name.startsWith("main.") ||
              f.name.startsWith("Solution.") ||
              f.name.startsWith("index.") ||
              f.name === "App.jsx" ||
              f.name === "schema.sql")
        ) || fileList.find((f) => !f.is_directory)

        if (primary) {
          initialFileOpenedRef.current = true
          handleOpenFile(primary.path)
        }
      }

      // Check if project type is web (Django, React, PHP) to show preview panel by default
      if (["django", "react", "php"].includes(proj.project_type)) {
        setShowPreviewPanel(true)
        // Check live server status
        try {
          const sStatus =
            proj.project_type === "php"
              ? await getPhpServerStatus(proj.project_id)
              : await getDjangoServerStatus(proj.project_id)

          if (sStatus.status && sStatus.server_status === "running") {
            setServerStatus("running")
            setServerPort(sStatus.port)
            setPreviewUrl(`/apps/skiltrix/api/preview/${proj.project_id}/`)
          }
        } catch {
          // ignore
        }
      }

      // Check if project is SQL
      if (proj.project_type === "sql" || proj.language === "sql") {
        setActiveView("database")
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Failed to load project.")
    } finally {
      setLoading(false)
    }
  }, [projectId, handleOpenFile])

  useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  const activeDiagnosticTab = openTabs.find((tab) => normalizePath(tab.path) === normalizePath(activePath))
  useEffect(() => {
    if (!projectId || !activeDiagnosticTab) return
    const controller = new AbortController()
    diagnosticAbort.current?.abort()
    diagnosticAbort.current = controller
    const runId = ++diagnosticRunId.current
    const path = normalizePath(activeDiagnosticTab.path)
    setIsCheckingDiagnostics(true)
    const timer = window.setTimeout(() => {
      diagnoseProjectFile(projectId, path, activeDiagnosticTab.content, runId, undefined, controller.signal)
        .then((result) => {
          if (!isCurrentDiagnosticResponse(runId, diagnosticRunId.current, result.project_id, projectId, result.file_id, activeDiagnosticTab.fileId, result.version, runId)) return
          setDiagnostics((current) => replaceFileDiagnostics(current, path, result.diagnostics))
        })
        .catch((error) => {
          if (controller.signal.aborted || runId !== diagnosticRunId.current) return
          setDiagnostics((current) => replaceFileDiagnostics(current, path, [{
              file: path, severity: "warning", code: "DIAGNOSTIC_REQUEST_FAILED",
              message: error?.response?.data?.detail || error.message || "Diagnostics request failed.",
              source: "SkilTrix diagnostics", category: "tooling",
            }]))
        })
        .finally(() => {
          if (runId === diagnosticRunId.current) setIsCheckingDiagnostics(false)
        })
    }, 450)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [projectId, activeDiagnosticTab?.path, activeDiagnosticTab?.content, activeDiagnosticTab?.fileId])

  const handleCheckProject = async () => {
    if (!projectId) return
    diagnosticAbort.current?.abort()
    const runId = ++diagnosticRunId.current
    const controller = new AbortController()
    diagnosticAbort.current = controller
    setIsCheckingDiagnostics(true)
    try {
      const sourceOverrides = Object.fromEntries(openTabs.map((tab) => [normalizePath(tab.path), tab.content]))
      const result = await diagnoseProject(projectId, undefined, controller.signal, sourceOverrides)
      if (runId === diagnosticRunId.current && result.project_id === projectId) setDiagnostics(result.diagnostics)
    } catch (error: any) {
      if (!controller.signal.aborted && runId === diagnosticRunId.current) {
        setDiagnostics((current) => [...current, {
          file: "", severity: "warning", code: "PROJECT_CHECK_FAILED",
          message: error?.response?.data?.detail || error.message || "Project diagnostics failed.",
          source: "SkilTrix diagnostics", category: "tooling",
        }])
      }
    } finally {
      if (runId === diagnosticRunId.current) setIsCheckingDiagnostics(false)
    }
  }

  // Close tab
  const handleCloseTab = useCallback((rawFilePath: string) => {
    const targetPath = normalizePath(rawFilePath)
    setDiagnostics((current) => removeFileDiagnostics(current, targetPath))
    setOpenTabs((prev) => {
      const idx = prev.findIndex((t) => normalizePath(t.path) === targetPath)
      if (idx === -1) return prev
      const remaining = prev.filter((_, i) => i !== idx)
      if (normalizePath(activePathRef.current) === targetPath) {
        const nextActive =
          remaining.length > 0
            ? idx < remaining.length
              ? remaining[idx].path
              : remaining[remaining.length - 1].path
            : null
        setActivePath(nextActive)
      }
      return remaining
    })
  }, [])

  // Update content of active tab
  const handleChangeContent = (rawFilePath: string, newContent: string) => {
    const targetPath = normalizePath(rawFilePath)
    setDiagnostics((current) => removeFileDiagnostics(current, targetPath))
    setOpenTabs((prev) =>
      prev.map((tab) =>
        normalizePath(tab.path) === targetPath ? { ...tab, content: newContent, isDirty: true } : tab
      )
    )
  }

  // Save current active tab
  const handleSaveActiveTab = async () => {
    if (!projectId || !activePath) return
    const targetPath = normalizePath(activePath)
    const activeTab = openTabs.find((t) => normalizePath(t.path) === targetPath)
    if (!activeTab || !activeTab.isDirty) return

    try {
      setIsSaving(true)
      const saved = await saveFileContent(projectId, activeTab.path, activeTab.content, activeTab.revision)
      setOpenTabs((prev) =>
        prev.map((tab) =>
          normalizePath(tab.path) === targetPath ? { ...tab, isDirty: false, revision: saved.revision } : tab
        )
      )
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      alert(detail || `Failed to save file: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Create new file
  const handleCreateFile = async (path: string, isDirectory: boolean) => {
    if (!projectId) return
    try {
      await createProjectFile(projectId, path, isDirectory)
      const updatedList = await getProjectFiles(projectId)
      setFiles(updatedList)
      if (!isDirectory) {
        await handleOpenFile(path)
      }
    } catch (err: any) {
      alert(`Failed to create: ${err?.response?.data?.detail || err.message}`)
    }
  }

  // Create new folder
  const handleCreateFolder = async (folderPath: string) => {
    if (!projectId) return
    try {
      await createProjectFile(projectId, folderPath, true)
      const updatedList = await getProjectFiles(projectId)
      setFiles(updatedList)
    } catch (err: any) {
      alert(`Failed to create folder: ${err?.response?.data?.detail || err.message}`)
    }
  }

  // Rename file or folder
  const handleRenamePath = async (oldPathRaw: string, newPathRaw: string) => {
    if (!projectId) return
    const oldPath = normalizePath(oldPathRaw)
    const newPath = normalizePath(newPathRaw)
    try {
      await renameProjectFile(projectId, oldPath, newPath)
      setDiagnostics((current) => current.filter((item) => {
        const path = normalizePath(item.file)
        return path !== oldPath && !path.startsWith(`${oldPath}/`)
      }))
      const updatedList = await getProjectFiles(projectId)
      setFiles(updatedList)

      // Update open tabs
      setOpenTabs((prev) =>
        prev.map((tab) => {
          const tabNorm = normalizePath(tab.path)
          if (tabNorm === oldPath) {
            return { ...tab, path: newPath, name: newPath.split("/").pop() || newPath }
          }
          if (tabNorm.startsWith(`${oldPath}/`)) {
            const updatedSubPath = `${newPath}${tabNorm.slice(oldPath.length)}`
            return { ...tab, path: updatedSubPath, name: updatedSubPath.split("/").pop() || updatedSubPath }
          }
          return tab
        })
      )
      if (normalizePath(activePath) === oldPath) {
        setActivePath(newPath)
      } else if (activePath && normalizePath(activePath).startsWith(`${oldPath}/`)) {
        setActivePath(`${newPath}${normalizePath(activePath).slice(oldPath.length)}`)
      }
    } catch (err: any) {
      alert(`Failed to rename: ${err?.response?.data?.detail || err.message}`)
    }
  }

  // Move file or folder
  const handleMovePath = async (sourcePathRaw: string, targetFolderRaw: string) => {
    if (!projectId) return
    const sourcePath = normalizePath(sourcePathRaw)
    const targetFolder = targetFolderRaw ? normalizePath(targetFolderRaw) : ""
    try {
      await moveProjectFile(projectId, sourcePath, targetFolder)
      setDiagnostics((current) => current.filter((item) => {
        const path = normalizePath(item.file)
        return path !== sourcePath && !path.startsWith(`${sourcePath}/`)
      }))
      const updatedList = await getProjectFiles(projectId)
      setFiles(updatedList)

      const baseName = sourcePath.split("/").pop() || ""
      const newPath = targetFolder ? `${targetFolder}/${baseName}` : baseName

      // Update open tabs
      setOpenTabs((prev) =>
        prev.map((tab) => {
          const tabNorm = normalizePath(tab.path)
          if (tabNorm === sourcePath) {
            return { ...tab, path: newPath, name: baseName }
          }
          if (tabNorm.startsWith(`${sourcePath}/`)) {
            const updatedSubPath = `${newPath}${tabNorm.slice(sourcePath.length)}`
            return { ...tab, path: updatedSubPath, name: updatedSubPath.split("/").pop() || updatedSubPath }
          }
          return tab
        })
      )
      if (normalizePath(activePath) === sourcePath) {
        setActivePath(newPath)
      } else if (activePath && normalizePath(activePath).startsWith(`${sourcePath}/`)) {
        setActivePath(`${newPath}${normalizePath(activePath).slice(sourcePath.length)}`)
      }
    } catch (err: any) {
      alert(`Failed to move: ${err?.response?.data?.detail || err.message}`)
    }
  }

  // Duplicate file
  const handleDuplicateFile = async (sourcePathRaw: string) => {
    if (!projectId) return
    const sourcePath = normalizePath(sourcePathRaw)
    try {
      const res = await duplicateProjectFile(projectId, sourcePath)
      const updatedList = await getProjectFiles(projectId)
      setFiles(updatedList)
      if (res.file) {
        await handleOpenFile(res.file.path)
      }
    } catch (err: any) {
      alert(`Failed to duplicate: ${err?.response?.data?.detail || err.message}`)
    }
  }

  // Delete file or folder
  const handleDeleteFile = async (pathRaw: string) => {
    if (!projectId) return
    const path = normalizePath(pathRaw)
    try {
      await deleteProjectFile(projectId, path)
      setDiagnostics((current) => current.filter((item) => {
        const diagnosticPath = normalizePath(item.file)
        return diagnosticPath !== path && !diagnosticPath.startsWith(`${path}/`)
      }))
      setOpenTabs((prev) =>
        prev.filter((t) => {
          const tabNorm = normalizePath(t.path)
          return tabNorm !== path && !tabNorm.startsWith(`${path}/`)
        })
      )
      if (activePath && (normalizePath(activePath) === path || normalizePath(activePath).startsWith(`${path}/`))) {
        setActivePath(null)
      }
      const updatedList = await getProjectFiles(projectId)
      setFiles(updatedList)
    } catch (err: any) {
      alert(`Failed to delete: ${err?.response?.data?.detail || err.message}`)
    }
  }

  // Run Code
  const handleRunCode = async () => {
    if (!project) return
    const activeTab = openTabs.find((t) => t.path === activePath)
    if (!activeTab) {
      alert("Please open a file to execute.")
      return
    }

    // Auto-save before running
    if (activeTab.isDirty) {
      await handleSaveActiveTab()
    }

    try {
      setIsRunning(true)
      setShowBottomPanel(true)
      const res = await executeCode({
        code: activeTab.content,
        language: project.language,
        stdin: stdinValue,
        project_id: project.project_id,
        file_path: activeTab.path,
      })
      setExecution(res)
      const compilerDiagnostics = parseCompilerDiagnostics(res.stderr || "", activeTab.path)
      if (compilerDiagnostics.length) {
        setDiagnostics((current) => [
          ...current.filter((item) => normalizePath(item.file) !== normalizePath(activeTab.path)),
          ...compilerDiagnostics,
        ])
      }
    } catch (err: any) {
      setExecution({
        status: false,
        job_id: "error",
        execution_status: "failed",
        stdout: "",
        stderr: err?.response?.data?.detail || err.message || "Execution failed.",
        exit_code: 1,
        duration_ms: 0,
        memory_kb: 0,
      })
    } finally {
      setIsRunning(false)
    }
  }

  // Real Server start / stop / restart lifecycle (Django or PHP)
  const handleStartServer = async () => {
    if (!project) return
    try {
      setServerStatus("starting")
      const res =
        project.project_type === "php"
          ? await startPhpServer(project.project_id)
          : await startDjangoServer(project.project_id)

      if (res.status && res.server_status === "running") {
        setServerStatus("running")
        setServerPort(res.port)
        setPreviewUrl(`/apps/skiltrix/api/preview/${project.project_id}/`)
      } else {
        setServerStatus("failed")
        alert(`Failed to start server: ${res.error || "Please check server logs."}`)
      }
    } catch (err: any) {
      setServerStatus("failed")
      const response = err?.response?.data
      const detail = response?.error || response?.detail || err.message || "Could not start the project server."
      const logs = response?.logs
      alert(`Server start error: ${detail}${logs ? `\n\nDjango startup logs:\n${logs}` : ""}`)
    }
  }

  const handleStopServer = async () => {
    if (!project) return
    try {
      if (project.project_type === "php") {
        await stopPhpServer(project.project_id)
      } else {
        await stopDjangoServer(project.project_id)
      }
      setServerStatus("stopped")
      setServerPort(null)
      setPreviewUrl("")
    } catch (err: any) {
      alert(`Server stop error: ${err?.response?.data?.error || err.message}`)
    }
  }

  const handleRestartServer = async () => {
    if (!project) return
    try {
      setServerStatus("starting")
      const res =
        project.project_type === "php"
          ? await restartPhpServer(project.project_id)
          : await restartDjangoServer(project.project_id)

      if (res.status && res.server_status === "running") {
        setServerStatus("running")
        setServerPort(res.port)
        setPreviewUrl(`/apps/skiltrix/api/preview/${project.project_id}/`)
      } else {
        setServerStatus("failed")
      }
    } catch {
      setServerStatus("failed")
    }
  }

  const dirtyFilePaths = useMemo(
    () => new Set(openTabs.filter((t) => t.isDirty).map((t) => t.path)),
    [openTabs]
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#11111b] text-white">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-semibold">Initializing SkilTrix CodeLab IDE...</h2>
        <p className="text-sm text-slate-400 mt-1">Mounting virtual workspace and runtime...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#11111b] text-white p-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold">Workspace Error</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md text-center">{error}</p>
        <Link
          to="/codelab"
          className="mt-6 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Return to CodeLab Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#11111b] text-slate-200">
      {/* Top Application Header Bar */}
      <header className="flex items-center justify-between px-3 h-12 bg-[#181825] border-b border-slate-800 select-none shrink-0">
        {/* Left: Back & Project Info */}
        <div className="flex items-center gap-3">
          <Link
            to="/codelab"
            title="Back to CodeLab Projects"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-tight">
              {project.title}
            </span>
            <span className="text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold px-2 py-0.5 rounded uppercase">
              {project.language}
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {project.project_type}
            </span>
          </div>
        </div>

        {/* Center: Execution & Save Controls */}
        <div className="flex items-center gap-2">
          {/* View Switcher Pills */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg text-xs mr-2">
            <button
              type="button"
              onClick={() => setActiveView("code")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                activeView === "code"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("database")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                activeView === "database"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Studio</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Code</span>
          </button>

          <a
            href={exportProjectZipUrl(project.project_id)}
            download
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
            title="Download Project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export ZIP</span>
          </a>
        </div>

        {/* Right: Layout & Theme Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            title="Toggle File Explorer"
            className={`p-1.5 rounded ${
              showSidebar ? "bg-indigo-600/30 text-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sidebar className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowBottomPanel(!showBottomPanel)}
            title="Toggle Output Panel"
            className={`p-1.5 rounded ${
              showBottomPanel ? "bg-indigo-600/30 text-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewPanel(!showPreviewPanel)}
            title="Toggle Live Web Preview"
            className={`p-1.5 rounded ${
              showPreviewPanel ? "bg-indigo-600/30 text-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
            title="Toggle Theme"
            className="p-1.5 text-slate-400 hover:text-white rounded"
          >
            {theme === "vs-dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Activity Bar (thin 48px VS Code icon rail) */}
        <div className="w-12 bg-[#14141e] border-r border-slate-800/80 flex flex-col items-center py-3 gap-4 shrink-0 select-none">
          <button
            type="button"
            onClick={() => {
              if (showSidebar && sidebarTab === "explorer") {
                setShowSidebar(false)
              } else {
                setShowSidebar(true)
                setSidebarTab("explorer")
              }
            }}
            title="File Explorer"
            className={`p-2 rounded-lg transition-colors ${
              showSidebar && sidebarTab === "explorer"
                ? "text-indigo-400 bg-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Folder className="w-5 h-5" />
          </button>

          {project.project_type === "django" && (
            <button
              type="button"
              onClick={() => {
                if (showSidebar && sidebarTab === "django") {
                  setShowSidebar(false)
                } else {
                  setShowSidebar(true)
                  setSidebarTab("django")
                }
              }}
              title="Django Project Navigator"
              className={`p-2 rounded-lg transition-colors ${
                showSidebar && sidebarTab === "django"
                  ? "text-emerald-400 bg-emerald-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveView("code")}
            title="Code Editor"
            className={`p-2 rounded-lg transition-colors ${
              activeView === "code" ? "text-indigo-400 bg-indigo-600/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveView("database")}
            title="SQL Database Playground"
            className={`p-2 rounded-lg transition-colors ${
              activeView === "database" ? "text-indigo-400 bg-indigo-600/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowBottomPanel(!showBottomPanel)}
            title="Output & Terminal"
            className={`p-2 rounded-lg transition-colors ${
              showBottomPanel ? "text-indigo-400 bg-indigo-600/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewPanel(!showPreviewPanel)}
            title="Web Live Preview"
            className={`p-2 rounded-lg transition-colors ${
              showPreviewPanel ? "text-indigo-400 bg-indigo-600/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-5 h-5" />
          </button>
        </div>

        {/* Left Sidebar (File Explorer or Django Navigator) */}
        {showSidebar && (
          <div className="w-72 shrink-0 h-full border-r border-slate-800 flex flex-col bg-[#11111b] overflow-hidden">
            {/* Sidebar View Switcher for Django Projects */}
            {project.project_type === "django" && (
              <div className="flex items-center border-b border-slate-800 bg-[#161622] p-1 gap-1 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setSidebarTab("explorer")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded font-medium transition-colors ${
                    sidebarTab === "explorer"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Files</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("django")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded font-medium transition-colors ${
                    sidebarTab === "django"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Django</span>
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-hidden">
              {sidebarTab === "explorer" ? (
                <ProjectFileExplorer
                  files={files}
                  projectName={project.title}
                  projectType={project.project_type}
                  activeFilePath={activePath}
                  openFilePaths={openTabs.map((t) => t.path)}
                  dirtyFilePaths={dirtyFilePaths}
                  onOpenFile={handleOpenFile}
                  onCreateFile={handleCreateFile}
                  onCreateFolder={handleCreateFolder}
                  onRenamePath={handleRenamePath}
                  onMovePath={handleMovePath}
                  onDuplicateFile={handleDuplicateFile}
                  onDeletePath={handleDeleteFile}
                  onRefresh={loadProjectData}
                  onCloseSidebar={() => setShowSidebar(false)}
                />
              ) : (
                <DjangoNavigationPanel
                  projectId={project.project_id}
                  onOpenFile={handleOpenFile}
                  onRefreshFiles={loadProjectData}
                />
              )}
            </div>
          </div>
        )}

        {/* Center / Editor or SQL Playground */}
        {activeView === "database" ? (
          <div className="flex-1 h-full min-w-0 overflow-hidden">
            <SqlPlaygroundPanel projectId={project.project_id} />
          </div>
        ) : (
          <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
            {/* Editor Area */}
            <div className="flex-1 min-h-0 relative">
              <MonacoEditorPanel
                openTabs={openTabs}
                activePath={activePath}
                theme={theme}
                isRunning={isRunning}
                isSaving={isSaving}
                onSelectTab={(path) => setActivePath(path)}
                onCloseTab={handleCloseTab}
                onChangeContent={handleChangeContent}
                onSave={handleSaveActiveTab}
                onRun={handleRunCode}
                diagnostics={diagnostics}
                isChecking={isCheckingDiagnostics}
                onCheckProject={handleCheckProject}
                onNavigate={(path) => { void handleOpenFile(path) }}
              />
            </div>

            {/* Bottom Output / Terminal Panel */}
            {showBottomPanel && (
              <div className="h-64 shrink-0 min-h-[160px] max-h-[50%]">
                <OutputTerminalPanel
                  projectId={project.project_id}
                  projectType={project.project_type}
                  execution={execution}
                  isRunning={isRunning}
                  stdinValue={stdinValue}
                  onChangeStdin={setStdinValue}
                  onClearOutput={() => setExecution(null)}
                  onRefreshFiles={loadProjectData}
                  onServerStarted={(url, port) => {
                    setServerStatus("running")
                    if (port) setServerPort(port)
                    setPreviewUrl(url)
                    setShowPreviewPanel(true)
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Right Live Web Preview Panel */}
        {showPreviewPanel && (
          <div className="w-[440px] lg:w-[500px] shrink-0 h-full">
            <WebPreviewPanel
              projectId={project.project_id}
              previewUrl={previewUrl}
              serverStatus={serverStatus}
              projectType={project.project_type}
              serverPort={serverPort}
              onStartServer={handleStartServer}
              onStopServer={handleStopServer}
              onRestartServer={handleRestartServer}
            />
          </div>
        )}
      </div>
    </div>
  )
}

