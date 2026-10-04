import React, { useState, useEffect } from "react"
import {
  Layers,
  Database,
  Globe,
  Settings,
  Plus,
  Play,
  Square,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Folder,
  ArrowRight,
  Loader2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import {
  getDjangoNavigation,
  runDjangoCheck,
  runDjangoMigrations,
  runDjangoMakemigrations,
  runDjangoMigrate,
  runDjangoShowmigrations,
  runDjangoSqlmigrate,
  setProjectDjangoDatabase,
  createDjangoApp,
  startDjangoServer,
  stopDjangoServer,
  restartDjangoServer,
  type DjangoNavigationData,
} from "../../api/django"

interface DjangoNavigationPanelProps {
  projectId: string
  onOpenFile: (path: string) => void
  onRefreshFiles: () => void
}

export default function DjangoNavigationPanel({
  projectId,
  onOpenFile,
  onRefreshFiles,
}: DjangoNavigationPanelProps) {
  const [navData, setNavData] = useState<DjangoNavigationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [switchingDb, setSwitchingDb] = useState(false)
  const [actionOutput, setActionOutput] = useState<{
    title: string
    output: string
    isError: boolean
  } | null>(null)

  // New App Modal
  const [showNewAppModal, setShowNewAppModal] = useState(false)
  const [newAppName, setNewAppName] = useState("")
  const [newAppError, setNewAppError] = useState<string | null>(null)

  // Section collapse states
  const [expandedSections, setExpandedSections] = useState({
    apps: true,
    routes: true,
    models: true,
    migrations: false,
    templates: false,
    static: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const loadNavigation = async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const data = await getDjangoNavigation(projectId)
      setNavData(data)
    } catch (err: any) {
      console.error("Failed to load Django navigation:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNavigation()
  }, [projectId])

  // --- Quick Actions ---
  const handleCheckProject = async () => {
    try {
      setActionLoading("check")
      setActionOutput(null)
      const res = await runDjangoCheck(projectId)
      setActionOutput({
        title: "Django Project Check (manage.py check)",
        output: res.output || "System check identified no issues (0 silenced).",
        isError: !res.status,
      })
    } catch (err: any) {
      setActionOutput({
        title: "Django Project Check Error",
        output: err.message,
        isError: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMakemigrations = async () => {
    try {
      setActionLoading("makemigrations")
      setActionOutput(null)
      const res = await runDjangoMakemigrations(projectId)
      setActionOutput({
        title: "Django Make Migrations (manage.py makemigrations)",
        output: res.output || "No changes detected",
        isError: !res.status,
      })
      onRefreshFiles()
      loadNavigation()
    } catch (err: any) {
      setActionOutput({
        title: "Make Migrations Error",
        output: err.message,
        isError: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMigrate = async () => {
    try {
      setActionLoading("migrate")
      setActionOutput(null)
      const res = await runDjangoMigrate(projectId)
      setActionOutput({
        title: "Django Migrate Database (manage.py migrate)",
        output: res.output || "Database migrated successfully.",
        isError: !res.status,
      })
      onRefreshFiles()
      loadNavigation()
    } catch (err: any) {
      setActionOutput({
        title: "Migrate Error",
        output: err.message,
        isError: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleShowMigrations = async () => {
    try {
      setActionLoading("showmigrations")
      setActionOutput(null)
      const res = await runDjangoShowmigrations(projectId)
      setActionOutput({
        title: `Django Migration Status (${res.database || "Selected DB"})`,
        output: res.output || "No migrations found.",
        isError: !res.status,
      })
    } catch (err: any) {
      setActionOutput({
        title: "Show Migrations Error",
        output: err.message,
        isError: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSelectDatabase = async (dbName: string) => {
    try {
      setSwitchingDb(true)
      const target = dbName ? dbName : null
      const res = await setProjectDjangoDatabase(projectId, target)
      if (res.status) {
        setActionOutput({
          title: "Django Database Configured",
          output: target
            ? `Project migrations and runtime will now target '${target}'.`
            : "Project Django database unassigned.",
          isError: false,
        })
        await loadNavigation()
        onRefreshFiles()
      } else {
        setActionOutput({
          title: "Database Configuration Error",
          output: res.error || "Failed to update project database.",
          isError: true,
        })
      }
    } catch (err: any) {
      setActionOutput({
        title: "Database Configuration Error",
        output: err.message,
        isError: true,
      })
    } finally {
      setSwitchingDb(false)
    }
  }

  const handleStartServer = async () => {
    try {
      setActionLoading("server")
      const res = await startDjangoServer(projectId)
      if (res.status) {
        setActionOutput({
          title: "Development Server Started",
          output: `Django development server is running on port ${res.port}.\nPreview URL: ${res.url}`,
          isError: false,
        })
      } else {
        setActionOutput({
          title: "Server Start Failed",
          output: res.error || "Please check django_server.log",
          isError: true,
        })
      }
      loadNavigation()
    } catch (err: any) {
      const response = err?.response?.data
      setActionOutput({
        title: "Server Error",
        output: [response?.error || response?.detail || err.message || "Could not start the Django server.", response?.logs ? `Django startup logs:\n${response.logs}` : ""].filter(Boolean).join("\n\n"),
        isError: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleStopServer = async () => {
    try {
      setActionLoading("server")
      await stopDjangoServer(projectId)
      setActionOutput({
        title: "Server Stopped",
        output: "Django development server process stopped.",
        isError: false,
      })
      loadNavigation()
    } catch (err: any) {
      setActionOutput({
        title: "Server Stop Error",
        output: err.message,
        isError: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestartServer = async () => {
    try {
      setActionLoading("server")
      const res = await restartDjangoServer(projectId)
      setActionOutput({
        title: "Server Restarted",
        output: `Server restarted cleanly on port ${res.port}.`,
        isError: !res.status,
      })
      loadNavigation()
    } catch (err: any) {
      setActionOutput({
        title: "Restart Error",
        output: err.message,
        isError: true,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = newAppName.trim().toLowerCase()
    if (!cleanName) {
      setNewAppError("App name cannot be empty.")
      return
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(cleanName)) {
      setNewAppError("App name must start with a letter and contain only alphanumeric characters or underscores.")
      return
    }

    try {
      setActionLoading("newapp")
      setNewAppError(null)
      const res = await createDjangoApp(projectId, cleanName)
      if (res.status) {
        setShowNewAppModal(false)
        setNewAppName("")
        setActionOutput({
          title: `App '${cleanName}' Created`,
          output: `Successfully generated standard Django app structure for '${cleanName}' and registered it in settings.py INSTALLED_APPS.`,
          isError: false,
        })
        onRefreshFiles()
        loadNavigation()
      } else {
        setNewAppError(res.error || "Failed to create app.")
      }
    } catch (err: any) {
      setNewAppError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a1420] text-slate-200 text-xs overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-9 bg-[#0d1c2d] border-b border-[#182f47] text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Layers className="w-3.5 h-3.5" />
          <span>Django Navigator</span>
        </span>

        <button
          type="button"
          onClick={() => {
            setNewAppName("")
            setNewAppError(null)
            setShowNewAppModal(true)
          }}
          title="New Django App (startapp)"
          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>New App</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-4 text-slate-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Analyzing Django project structure...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
          {/* Project Details Banner */}
          <div className="p-2.5 rounded bg-[#0b1929] border border-[#162a40] space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Project:</span>
              <span className="text-white font-bold">{navData?.project_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Settings:</span>
              <span className="text-emerald-300 truncate">{navData?.settings_module}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Server:</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                  navData?.server_status === "running"
                    ? "bg-emerald-900/80 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {navData?.server_status} {navData?.port ? `:${navData.port}` : ""}
              </span>
            </div>

            {/* Project Django Database Setting */}
            <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-[#162a40]">
              <span className="text-slate-400 uppercase text-[10px] font-bold flex items-center gap-1">
                <Database className="w-3 h-3 text-purple-400" />
                Django DB:
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={navData?.selected_database || ""}
                  onChange={(e) => handleSelectDatabase(e.target.value)}
                  disabled={switchingDb}
                  className="bg-[#0f1f33] border border-[#1e3a5f] text-purple-300 text-[11px] rounded px-1.5 py-0.5 font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
                  title="Configure project database for Django migrations"
                >
                  <option value="">-- No Database --</option>
                  {navData?.available_databases?.map((db) => (
                    <option key={db} value={db}>
                      {db}
                    </option>
                  ))}
                </select>
                {switchingDb && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
              </div>
            </div>
          </div>

          {/* Missing Database Alert */}
          {!navData?.selected_database && (
            <div className="p-2 rounded bg-amber-950/40 border border-amber-600/50 text-amber-300 text-[11px] flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold">No Django database selected.</span>
                <p className="text-[10px] text-amber-300/80 mt-0.5">
                  Select a database in Django DB above. Migrations will only execute against the selected project database.
                </p>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="p-2 rounded bg-[#0b1929] border border-[#162a40] space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Django Actions
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleCheckProject}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#132338] hover:bg-[#1a3452] border border-[#1d3a5e] text-slate-200 text-[11px] transition-colors disabled:opacity-50"
              >
                {actionLoading === "check" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                )}
                <span>Check Project</span>
              </button>

              <button
                type="button"
                onClick={handleMakemigrations}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#132338] hover:bg-[#1a3452] border border-[#1d3a5e] text-slate-200 text-[11px] transition-colors disabled:opacity-50"
              >
                {actionLoading === "makemigrations" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                )}
                <span>Makemigrations</span>
              </button>

              <button
                type="button"
                onClick={handleMigrate}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#132338] hover:bg-[#1a3452] border border-[#1d3a5e] text-slate-200 text-[11px] transition-colors disabled:opacity-50"
              >
                {actionLoading === "migrate" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                ) : (
                  <Database className="w-3 h-3 text-amber-400" />
                )}
                <span>Migrate DB</span>
              </button>

              <button
                type="button"
                onClick={handleShowMigrations}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#132338] hover:bg-[#1a3452] border border-[#1d3a5e] text-slate-200 text-[11px] transition-colors disabled:opacity-50"
              >
                {actionLoading === "showmigrations" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                ) : (
                  <Layers className="w-3 h-3 text-purple-400" />
                )}
                <span>Show Migrations</span>
              </button>

              {navData?.server_status === "running" ? (
                <>
                  <button
                    type="button"
                    onClick={handleStopServer}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-[11px] transition-colors disabled:opacity-50"
                  >
                    <Square className="w-3 h-3 text-red-400" />
                    <span>Stop Server</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRestartServer}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#132338] hover:bg-[#1a3452] border border-[#1d3a5e] text-slate-200 text-[11px] transition-colors disabled:opacity-50"
                  >
                    <RotateCw className="w-3 h-3 text-indigo-400" />
                    <span>Restart</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartServer}
                  disabled={actionLoading !== null}
                  className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow transition-colors disabled:opacity-50"
                >
                  {actionLoading === "server" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Run Development Server</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Output Drawer */}
          {actionOutput && (
            <div
              className={`p-2.5 rounded border text-[11px] font-mono space-y-1 relative ${
                actionOutput.isError
                  ? "bg-red-950/30 border-red-900/60 text-red-300"
                  : "bg-emerald-950/30 border-emerald-900/60 text-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{actionOutput.title}</span>
                <button
                  type="button"
                  onClick={() => setActionOutput(null)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              <pre className="whitespace-pre-wrap max-h-36 overflow-y-auto font-mono text-[10px]">
                {actionOutput.output}
              </pre>
            </div>
          )}

          {/* Key Shortcuts */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1">
              Important Files
            </span>
            <div className="grid grid-cols-2 gap-1">
              {navData?.shortcuts?.map((sc) => (
                <button
                  key={sc.path}
                  type="button"
                  onClick={() => onOpenFile(sc.path)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0b1929] hover:bg-[#13283f] border border-[#162a40] text-slate-300 hover:text-white font-mono text-[11px] truncate transition-colors"
                >
                  <FileCode className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{sc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Installed Apps */}
          <div className="rounded border border-[#162a40] bg-[#0b1929] overflow-hidden">
            <div
              onClick={() => toggleSection("apps")}
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#11243a] transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                {expandedSections.apps ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Installed Apps</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {navData?.installed_apps?.length || 0}
              </span>
            </div>

            {expandedSections.apps && (
              <div className="p-2 border-t border-[#162a40] space-y-1 font-mono text-[11px]">
                {navData?.installed_apps?.map((app) => (
                  <div
                    key={app.name}
                    className="flex items-center justify-between py-0.5 px-1 hover:bg-[#11243a] rounded"
                  >
                    <span className={app.is_core ? "text-slate-400" : "text-emerald-300 font-bold"}>
                      {app.name}
                    </span>
                    <span className="text-[9px] uppercase px-1 rounded bg-[#122336] text-slate-400">
                      {app.is_core ? "core" : "app"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* URL Routes */}
          <div className="rounded border border-[#162a40] bg-[#0b1929] overflow-hidden">
            <div
              onClick={() => toggleSection("routes")}
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#11243a] transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                {expandedSections.routes ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>URL Routes</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {navData?.routes?.length || 0}
              </span>
            </div>

            {expandedSections.routes && (
              <div className="p-2 border-t border-[#162a40] space-y-1 font-mono text-[11px]">
                {navData?.routes?.length === 0 ? (
                  <div className="text-slate-500 italic p-1">No routes discovered.</div>
                ) : (
                  navData?.routes?.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => onOpenFile(r.file)}
                      className="p-1 hover:bg-[#11243a] rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-cyan-300 font-bold">
                        <span>/{r.route.replace(/^\//, "")}</span>
                        <span className="text-[9px] text-slate-500 font-normal">{r.file}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{r.handler}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Models */}
          <div className="rounded border border-[#162a40] bg-[#0b1929] overflow-hidden">
            <div
              onClick={() => toggleSection("models")}
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#11243a] transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                {expandedSections.models ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>ORM Models</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {navData?.models?.length || 0}
              </span>
            </div>

            {expandedSections.models && (
              <div className="p-2 border-t border-[#162a40] space-y-1 font-mono text-[11px]">
                {navData?.models?.length === 0 ? (
                  <div className="text-slate-500 italic p-1">No models found.</div>
                ) : (
                  navData?.models?.map((m) => (
                    <div
                      key={m.name}
                      onClick={() => onOpenFile(m.file)}
                      className="flex items-center justify-between py-1 px-1.5 hover:bg-[#11243a] rounded cursor-pointer text-sky-300"
                    >
                      <span className="font-bold flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-sky-400" />
                        <span>{m.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">{m.file}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Migrations */}
          <div className="rounded border border-[#162a40] bg-[#0b1929] overflow-hidden">
            <div
              onClick={() => toggleSection("migrations")}
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#11243a] transition-colors"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                {expandedSections.migrations ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Migrations</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {navData?.migrations?.length || 0}
              </span>
            </div>

            {expandedSections.migrations && (
              <div className="p-2 border-t border-[#162a40] space-y-1 font-mono text-[11px]">
                {navData?.migrations?.length === 0 ? (
                  <div className="text-slate-500 italic p-1">
                    No migration files generated yet. Run Migrate DB.
                  </div>
                ) : (
                  navData?.migrations?.map((mig) => (
                    <div
                      key={mig.path}
                      onClick={() => onOpenFile(mig.path)}
                      className="py-0.5 px-1 hover:bg-[#11243a] rounded cursor-pointer text-amber-300 truncate"
                    >
                      {mig.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Django App Modal */}
      {showNewAppModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#1d3552] rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create New Django App</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAppModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  App Name (e.g. accounts, blog, store)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="accounts"
                  className="w-full bg-[#070e17] border border-[#1a334f] rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {newAppError && (
                <div className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900/60">
                  {newAppError}
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                This will generate <code>models.py</code>, <code>views.py</code>, <code>urls.py</code>, <code>apps.py</code> and automatically register the new app in <code>settings.py INSTALLED_APPS</code>.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#182f47]">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-[#0e1d2f] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-3 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded font-semibold flex items-center gap-1"
                >
                  {actionLoading === "newapp" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Create App</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
