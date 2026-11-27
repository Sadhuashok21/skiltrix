import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  CheckCircle2,
  FlaskConical,
  Folder,
  Globe,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Send,
  Square,
  Terminal,
  XCircle,
} from "lucide-react"
import ProjectFileExplorer from "./ProjectFileExplorer"
import MonacoEditorPanel from "./MonacoEditorPanel"
import OutputTerminalPanel from "./OutputTerminalPanel"
import WebPreviewPanel from "./WebPreviewPanel"
import {
  createProjectFile,
  deleteProjectFile,
  duplicateProjectFile,
  getFileContent,
  getProjectFiles,
  moveProjectFile,
  renameProjectFile,
  saveFileContent,
  type ApiProjectFile,
  type ExecutionResponse,
} from "../../api/codelab"
import {
  getDjangoServerStatus,
  restartDjangoServer,
  startDjangoServer,
  stopDjangoServer,
} from "../../api/django"
import { diagnoseProject, diagnoseProjectFile, type SourceDiagnostic } from "../../api/diagnostics"
import { isCurrentDiagnosticResponse, removeFileDiagnostics, replaceFileDiagnostics } from "../../utils/diagnosticState"
import type { CodeRunResponse, ProblemSubmitResponse } from "../../api/codingAssessments"

interface OpenTab {
  path: string
  name: string
  content: string
  isDirty: boolean
  revision: number
  fileId: string
}

const normalizePath = (p: string | null | undefined): string => {
  if (!p) return ""
  return p.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "").trim()
}

interface AssessmentCodeLabWorkspaceProps {
  projectId: string
  projectTitle: string
  lockedPaths?: string[]
  starterFiles?: Record<string, string>
  runningTests: boolean
  submittingSolution: boolean
  runOutcome: CodeRunResponse | null
  submitOutcome: ProblemSubmitResponse | null
  execError: string | null
  onRunTests: (filesOverride?: Record<string, string>) => Promise<void>
  onSubmitSolution: (filesOverride?: Record<string, string>) => Promise<void>
  onResetWorkspace: () => Promise<void>
  onFilesSnapshot?: (filesMap: Record<string, string>) => void
}

export default function AssessmentCodeLabWorkspace({
  projectId,
  projectTitle,
  lockedPaths = [],
  runningTests,
  submittingSolution,
  runOutcome,
  submitOutcome,
  execError,
  onRunTests,
  onSubmitSolution,
  onResetWorkspace,
  onFilesSnapshot,
}: AssessmentCodeLabWorkspaceProps) {
  const [files, setFiles] = useState<ApiProjectFile[]>([])
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activePath, setActivePath] = useState<string | null>(null)
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Panels & right side tabs ("preview" | "tests") matching Image 2/3
  const [showFiles, setShowFiles] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [showRightPane, setShowRightPane] = useState(true)
  const [rightTab, setRightTab] = useState<"preview" | "tests">("preview")

  // Live Django runserver state
  const [serverStatus, setServerStatus] = useState<"starting" | "running" | "stopped" | "failed">("stopped")
  const [serverPort, setServerPort] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")

  // Diagnostics & terminal state
  const [diagnostics, setDiagnostics] = useState<SourceDiagnostic[]>([])
  const [isCheckingDiagnostics, setIsCheckingDiagnostics] = useState(false)
  const [execution, setExecution] = useState<ExecutionResponse | null>(null)
  const [stdinValue, setStdinValue] = useState("")

  const openTabsRef = useRef<OpenTab[]>([])
  const activePathRef = useRef<string | null>(null)
  const diagnosticRunId = useRef(0)
  const diagnosticAbort = useRef<AbortController | null>(null)
  const initialLoadedProjectRef = useRef<string>("")

  useEffect(() => {
    openTabsRef.current = openTabs
  }, [openTabs])

  useEffect(() => {
    activePathRef.current = activePath
  }, [activePath])

  const lockedSet = useMemo(() => new Set(lockedPaths.map(normalizePath)), [lockedPaths])

  const dirtyFilePaths = useMemo(() => {
    const s = new Set<string>()
    openTabs.forEach((t) => {
      if (t.isDirty) s.add(t.path)
    })
    return s
  }, [openTabs])

  const handleOpenFile = useCallback(
    async (rawPath: string) => {
      const targetPath = normalizePath(rawPath)
      if (!targetPath || !projectId) return

      const existing = openTabsRef.current.find((t) => normalizePath(t.path) === targetPath)
      if (existing) {
        setActivePath(existing.path)
        return
      }

      try {
        const fileData = await getFileContent(projectId, targetPath)
        const canonicalPath = normalizePath(fileData.path || targetPath)
        const newTab: OpenTab = {
          path: canonicalPath,
          name: fileData.name || canonicalPath.split("/").pop() || canonicalPath,
          content: fileData.content ?? "",
          isDirty: false,
          revision: fileData.revision,
          fileId: fileData.file_id,
        }
        setOpenTabs((prev) => {
          if (prev.some((t) => normalizePath(t.path) === canonicalPath)) return prev
          return [...prev, newTab]
        })
        setActivePath(canonicalPath)
      } catch {
        // ignore missing file
      }
    },
    [projectId]
  )

  const loadWorkspace = useCallback(async () => {
    if (!projectId) return
    try {
      setLoadingFiles(true)
      const list = await getProjectFiles(projectId)
      setFiles(list)

      if (initialLoadedProjectRef.current !== projectId) {
        initialLoadedProjectRef.current = projectId
        setOpenTabs([])
        setActivePath(null)

        const preferred = ["README.md", "posts/views.py", "posts/tests.py"]
        for (const candidate of preferred) {
          if (list.some((f) => !f.is_directory && normalizePath(f.path) === candidate)) {
            await handleOpenFile(candidate)
          }
        }
        // Focus posts/views.py if available so candidate sees buggy endpoint immediately
        if (list.some((f) => !f.is_directory && normalizePath(f.path) === "posts/views.py")) {
          setActivePath("posts/views.py")
        }
      }

      try {
        const sStatus = await getDjangoServerStatus(projectId)
        if (sStatus.status && sStatus.server_status === "running") {
          setServerStatus("running")
          setServerPort(sStatus.port)
          setPreviewUrl(`/apps/skiltrix/api/preview/${projectId}/`)
        } else {
          setServerStatus("stopped")
        }
      } catch {
        setServerStatus("stopped")
      }
    } finally {
      setLoadingFiles(false)
    }
  }, [projectId, handleOpenFile])

  useEffect(() => {
    void loadWorkspace()
  }, [loadWorkspace])

  // Diagnostics for active tab
  const activeDiagnosticTab = openTabs.find((t) => normalizePath(t.path) === normalizePath(activePath))
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
        .then((res) => {
          if (!isCurrentDiagnosticResponse(runId, diagnosticRunId.current, res.project_id, projectId, res.file_id, activeDiagnosticTab.fileId, res.version, runId)) return
          setDiagnostics((cur) => replaceFileDiagnostics(cur, path, res.diagnostics))
        })
        .catch(() => {})
        .finally(() => {
          if (runId === diagnosticRunId.current) setIsCheckingDiagnostics(false)
        })
    }, 450)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [projectId, activeDiagnosticTab?.path, activeDiagnosticTab?.content, activeDiagnosticTab?.fileId])

  const saveAllDirtyTabs = async (): Promise<Record<string, string>> => {
    const overrides: Record<string, string> = {}
    for (const tab of openTabsRef.current) {
      overrides[tab.path] = tab.content
      if (tab.isDirty && !lockedSet.has(normalizePath(tab.path))) {
        try {
          setIsSaving(true)
          const saved = await saveFileContent(projectId, tab.path, tab.content, tab.revision)
          setOpenTabs((prev) =>
            prev.map((t) =>
              normalizePath(t.path) === normalizePath(tab.path)
                ? { ...t, isDirty: false, revision: saved.revision }
                : t
            )
          )
        } catch {
          // still include in overrides so judge sees unsaved edit
        } finally {
          setIsSaving(false)
        }
      }
    }
    onFilesSnapshot?.(overrides)
    return overrides
  }

  const handleSaveActiveTab = async () => {
    if (!projectId || !activePath) return
    const tab = openTabs.find((t) => normalizePath(t.path) === normalizePath(activePath))
    if (!tab || !tab.isDirty || lockedSet.has(normalizePath(tab.path))) return
    try {
      setIsSaving(true)
      const saved = await saveFileContent(projectId, tab.path, tab.content, tab.revision)
      setOpenTabs((prev) =>
        prev.map((t) =>
          normalizePath(t.path) === normalizePath(tab.path)
            ? { ...t, isDirty: false, revision: saved.revision }
            : t
        )
      )
    } catch (err: any) {
      alert(err?.response?.data?.detail || `Failed to save: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangeContent = (rawPath: string, newContent: string) => {
    const p = normalizePath(rawPath)
    if (lockedSet.has(p)) return
    setDiagnostics((cur) => removeFileDiagnostics(cur, p))
    setOpenTabs((prev) => {
      const updated = prev.map((t) =>
        normalizePath(t.path) === p ? { ...t, content: newContent, isDirty: true } : t
      )
      const map: Record<string, string> = {}
      updated.forEach((t) => {
        map[t.path] = t.content
      })
      onFilesSnapshot?.(map)
      return updated
    })
  }

  const handleCloseTab = (rawPath: string) => {
    const p = normalizePath(rawPath)
    setOpenTabs((prev) => {
      const remaining = prev.filter((t) => normalizePath(t.path) !== p)
      if (normalizePath(activePathRef.current) === p) {
        setActivePath(remaining[0]?.path || null)
      }
      return remaining
    })
  }

  const handleRunServer = async () => {
    if (!projectId) return
    await saveAllDirtyTabs()
    try {
      setServerStatus("starting")
      setShowRightPane(true)
      setRightTab("preview")
      const res =
        serverStatus === "running"
          ? await restartDjangoServer(projectId)
          : await startDjangoServer(projectId)
      if (res.status) {
        setServerStatus("running")
        setServerPort(res.port || null)
        setPreviewUrl(res.url || `/apps/skiltrix/api/preview/${projectId}/`)
      } else {
        setServerStatus("failed")
        setShowTerminal(true)
      }
    } catch {
      setServerStatus("failed")
    }
  }

  const handleStopServer = async () => {
    if (!projectId) return
    try {
      await stopDjangoServer(projectId)
      setServerStatus("stopped")
      setServerPort(null)
    } catch {}
  }

  const handleRunTestsClick = async () => {
    const overrides = await saveAllDirtyTabs()
    setShowRightPane(true)
    setRightTab("tests")
    await onRunTests(overrides)
  }

  const handleSubmitClick = async () => {
    const overrides = await saveAllDirtyTabs()
    setShowRightPane(true)
    setRightTab("tests")
    await onSubmitSolution(overrides)
  }

  const handleResetClick = async () => {
    setIsResetting(true)
    try {
      await onResetWorkspace()
      initialLoadedProjectRef.current = ""
      await loadWorkspace()
    } finally {
      setIsResetting(false)
    }
  }

  const activeOutcome = submitOutcome || runOutcome
  const testResults = activeOutcome?.test_case_results || []

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#11111b] text-slate-100 overflow-hidden">
      {/* CodeLab Top Action Bar matching Image 3 (Run Server / Run Tests / Preview / Tests) */}
      <div className="h-11 shrink-0 bg-[#181825] border-b border-slate-800 px-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setShowFiles(!showFiles)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showFiles
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Files</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTerminal(!showTerminal)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showTerminal
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
          <button
            type="button"
            onClick={handleResetClick}
            disabled={isResetting || runningTests || submittingSolution}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 disabled:opacity-50"
            title="Reset workspace files to starter state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isResetting ? "Resetting..." : "Reset"}</span>
          </button>
          {serverStatus === "running" && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Server :{serverPort}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {serverStatus === "running" ? (
            <button
              type="button"
              onClick={handleStopServer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-xs font-bold text-rose-300"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop Server</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleRunServer}
            disabled={serverStatus === "starting"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-sm"
            title="Start or restart Django manage.py runserver & open Preview"
          >
            {serverStatus === "starting" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{serverStatus === "running" ? "Restart Server" : "Run Server"}</span>
          </button>
          <button
            type="button"
            onClick={handleRunTestsClick}
            disabled={runningTests || submittingSolution}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-emerald-300 disabled:opacity-50"
            title="Run manage.py test against posts/tests.py"
          >
            {runningTests ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FlaskConical className="w-3.5 h-3.5" />
            )}
            <span>{runningTests ? "Testing..." : "Run Tests"}</span>
          </button>
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={runningTests || submittingSolution}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submittingSolution ? "Judging..." : "Submit Code"}</span>
          </button>
        </div>
      </div>

      {/* Main Split CodeLab Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left File Explorer with Lock symbols */}
        {showFiles && (
          <div className="w-56 shrink-0 h-full border-r border-slate-800 bg-[#0a1420] overflow-hidden">
            {loadingFiles ? (
              <div className="p-4 text-xs text-slate-400">Loading workspace...</div>
            ) : (
              <ProjectFileExplorer
                files={files}
                projectName={projectTitle}
                projectType="django"
                activeFilePath={activePath}
                openFilePaths={openTabs.map((t) => t.path)}
                dirtyFilePaths={dirtyFilePaths}
                lockedPaths={lockedSet}
                onOpenFile={handleOpenFile}
                onCreateFile={async (p, isDir) => {
                  await createProjectFile(projectId, p, isDir)
                  const list = await getProjectFiles(projectId)
                  setFiles(list)
                  if (!isDir) await handleOpenFile(p)
                }}
                onCreateFolder={async (folder) => {
                  await createProjectFile(projectId, folder, true)
                  setFiles(await getProjectFiles(projectId))
                }}
                onRenamePath={async (oldP, newP) => {
                  await renameProjectFile(projectId, oldP, newP)
                  setFiles(await getProjectFiles(projectId))
                }}
                onMovePath={async (src, dst) => {
                  await moveProjectFile(projectId, src, dst)
                  setFiles(await getProjectFiles(projectId))
                }}
                onDuplicateFile={async (src) => {
                  const r = await duplicateProjectFile(projectId, src)
                  setFiles(await getProjectFiles(projectId))
                  if (r.file) await handleOpenFile(r.file.path)
                }}
                onDeletePath={async (p) => {
                  await deleteProjectFile(projectId, p)
                  handleCloseTab(p)
                  setFiles(await getProjectFiles(projectId))
                }}
                onRefresh={loadWorkspace}
                onCloseSidebar={() => setShowFiles(false)}
              />
            )}
          </div>
        )}

        {/* Center Editor + Terminal */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 relative">
            <MonacoEditorPanel
              openTabs={openTabs}
              activePath={activePath}
              theme="vs-dark"
              isRunning={runningTests}
              isSaving={isSaving}
              lockedPaths={lockedSet}
              hideRunButton={true}
              onSelectTab={(p) => setActivePath(p)}
              onCloseTab={handleCloseTab}
              onChangeContent={handleChangeContent}
              onSave={handleSaveActiveTab}
              onRun={() => void handleRunTestsClick()}
              diagnostics={diagnostics}
              isChecking={isCheckingDiagnostics}
              onCheckProject={async () => {
                const overrides = Object.fromEntries(openTabs.map((t) => [t.path, t.content]))
                const res = await diagnoseProject(projectId, undefined, undefined, overrides)
                setDiagnostics(res.diagnostics)
              }}
              onNavigate={(p) => void handleOpenFile(p)}
            />
          </div>

          {showTerminal && (
            <div className="h-44 shrink-0 border-t border-slate-800">
              <OutputTerminalPanel
                projectId={projectId}
                projectType="django"
                execution={execution}
                isRunning={runningTests}
                stdinValue={stdinValue}
                onChangeStdin={setStdinValue}
                onClearOutput={() => setExecution(null)}
                onRefreshFiles={loadWorkspace}
                onServerStarted={(url, port) => {
                  setServerStatus("running")
                  if (port) setServerPort(port)
                  setPreviewUrl(url)
                  setShowRightPane(true)
                  setRightTab("preview")
                }}
              />
            </div>
          )}
        </div>

        {/* Right Preview & Tests Pane matching Image 3 (Preview | Tests) */}
        {showRightPane && (
          <div className="w-[360px] xl:w-[420px] shrink-0 h-full border-l border-slate-800 bg-[#0f131f] flex flex-col overflow-hidden">
            <div className="h-9 shrink-0 bg-[#181825] border-b border-slate-800 px-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRightTab("preview")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                    rightTab === "preview"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab("tests")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                    rightTab === "tests"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tests</span>
                  {activeOutcome && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        activeOutcome.status === "Accepted"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {"passed_test_cases" in activeOutcome
                        ? `${activeOutcome.passed_test_cases}/${activeOutcome.total_test_cases}`
                        : `${activeOutcome.passed_count ?? 0}/${activeOutcome.total_count ?? 0}`}
                    </span>
                  )}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> tests.py checked
              </span>
            </div>

            {rightTab === "preview" ? (
              <div className="flex-1 min-h-0 overflow-hidden">
                <WebPreviewPanel
                  projectId={projectId}
                  previewUrl={previewUrl}
                  serverStatus={serverStatus}
                  projectType="django"
                  serverPort={serverPort}
                  onStartServer={handleRunServer}
                  onStopServer={handleStopServer}
                  onRestartServer={handleRunServer}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                {execError && (
                  <pre className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 whitespace-pre-wrap font-mono">
                    {execError}
                  </pre>
                )}

                {activeOutcome ? (
                  <>
                    <div className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
                      <span
                        className={`font-bold ${
                          activeOutcome.status === "Accepted"
                            ? "text-emerald-400"
                            : activeOutcome.status === "Partial Accepted"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {activeOutcome.status}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {activeOutcome.execution_time_ms} ms
                      </span>
                    </div>

                    <div className="space-y-2">
                      {testResults.map((tc) => (
                        <div
                          key={tc.case_number}
                          className={`rounded-lg border p-2.5 flex items-center justify-between gap-2 ${
                            tc.passed
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-rose-500/10 border-rose-500/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {tc.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span className="font-mono truncate text-slate-200">
                              {tc.is_hidden
                                ? `Hidden Test #${tc.case_number}`
                                : tc.name || `Test #${tc.case_number}`}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-bold shrink-0 ${
                              tc.passed ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {tc.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {(runOutcome?.stdout || submitOutcome?.error_message) && (
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                          manage.py test output
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-64">
                          {submitOutcome?.error_message || runOutcome?.stdout}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center text-slate-400 space-y-2">
                    <FlaskConical className="w-8 h-8 text-indigo-400/70 mx-auto" />
                    <p className="font-semibold text-slate-300">
                      Ready to verify <code className="text-indigo-300">posts/tests.py</code>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Click <strong>Run Tests</strong> above to execute unit tests against your Django backend.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
