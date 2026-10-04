import React, { useState, useEffect, useRef } from "react"
import {
  Globe,
  RotateCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Play,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Terminal,
  Layers,
  FileText,
  Clock,
  RefreshCw,
  Code2,
} from "lucide-react"

import {
  sendDjangoApiRequest,
  runDjangoMigrations,
  runDjangoTests,
  getDjangoServerStatus,
  type DjangoApiResponse,
  type DjangoMigrationResult,
  type DjangoTestResult,
} from "../../api/django"
import { getPhpServerStatus } from "../../api/php"
import api from "../../api/client"

interface WebPreviewPanelProps {
  projectId: string
  previewUrl?: string
  serverStatus: "starting" | "running" | "stopped" | "failed"
  projectType: string
  serverPort?: number | null
  onStartServer?: () => void
  onStopServer?: () => void
  onRestartServer?: () => void
}

export default function WebPreviewPanel({
  projectId,
  previewUrl,
  serverStatus,
  projectType,
  serverPort,
  onStartServer,
  onStopServer,
  onRestartServer,
}: WebPreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "api" | "tools" | "logs">("preview")
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [iframeKey, setIframeKey] = useState(0)
  const [previewPath, setPreviewPath] = useState("/")

  // API Tester State
  const [apiMethod, setApiMethod] = useState<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("GET")
  const [apiPath, setApiPath] = useState(projectType === "php" ? "/api.php" : "/api/tasks/")
  const [apiHeaders, setApiHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [apiBody, setApiBody] = useState('{\n  "title": "Complete CodeLab Task",\n  "completed": false\n}')
  const [apiLoading, setApiLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<DjangoApiResponse | null>(null)
  const [showHeaders, setShowHeaders] = useState(false)

  // Django Tools State
  const [migrationRunning, setMigrationRunning] = useState(false)
  const [migrationResult, setMigrationResult] = useState<DjangoMigrationResult | null>(null)

  const [testRunning, setTestRunning] = useState(false)
  const [testResult, setTestResult] = useState<DjangoTestResult | null>(null)

  // Server Logs State
  const [serverLogs, setServerLogs] = useState("")
  const [loadingLogs, setLoadingLogs] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1)
  }

  const getViewportWidth = () => {
    switch (viewportMode) {
      case "mobile":
        return "375px"
      case "tablet":
        return "768px"
      default:
        return "100%"
    }
  }

  // Load server logs
  const fetchLogs = async () => {
    if (!projectId) return
    try {
      setLoadingLogs(true)
      const res =
        projectType === "php"
          ? await getPhpServerStatus(projectId)
          : await getDjangoServerStatus(projectId)
      if (res.logs) {
        setServerLogs(res.logs)
      }
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs()
    }
  }, [activeTab, serverStatus])

  // Handle API Tester Send
  const handleSendApiRequest = async () => {
    if (!projectId) return
    try {
      setApiLoading(true)
      setApiResponse(null)

      let parsedHeaders: Record<string, string> | undefined
      try {
        if (apiHeaders.trim()) {
          parsedHeaders = JSON.parse(apiHeaders)
        }
      } catch {
        alert("Invalid JSON format in Request Headers.")
        setApiLoading(false)
        return
      }

      let res: any
      if (projectType === "php") {
        const response = await api.post(
          `/codelab/projects/${projectId}/php/api-request/`,
          {
            method: apiMethod,
            path: apiPath,
            headers: parsedHeaders,
            body: ["POST", "PUT", "PATCH"].includes(apiMethod) ? apiBody : undefined,
          }
        )
        res = response.data
      } else {
        res = await sendDjangoApiRequest(projectId, {
          method: apiMethod,
          path: apiPath,
          headers: parsedHeaders,
          body: ["POST", "PUT", "PATCH"].includes(apiMethod) ? apiBody : undefined,
        })
      }
      setApiResponse(res)
    } catch (err: any) {
      setApiResponse({
        status: false,
        error: err?.response?.data?.error || err.message || "Request failed.",
      })
    } finally {
      setApiLoading(false)
    }
  }

  // Handle Run Migrations
  const handleRunMigrations = async () => {
    if (!projectId) return
    try {
      setMigrationRunning(true)
      setMigrationResult(null)
      const res = await runDjangoMigrations(projectId)
      setMigrationResult(res)
    } catch (err: any) {
      setMigrationResult({
        status: false,
        success: false,
        exit_code: 1,
        output: err?.response?.data?.error || err.message,
        duration_ms: 0,
      })
    } finally {
      setMigrationRunning(false)
    }
  }

  // Handle Run Unit Tests
  const handleRunTests = async () => {
    if (!projectId) return
    try {
      setTestRunning(true)
      setTestResult(null)
      const res = await runDjangoTests(projectId)
      setTestResult(res)
    } catch (err: any) {
      setTestResult({
        status: false,
        success: false,
        exit_code: 1,
        output: err?.response?.data?.error || err.message,
        duration_ms: 0,
      })
    } finally {
      setTestRunning(false)
    }
  }

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
      case "POST":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40"
      case "PUT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40"
      case "PATCH":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
      case "DELETE":
        return "bg-red-500/20 text-red-400 border-red-500/40"
      default:
        return "bg-slate-700 text-slate-300"
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#181824] border-l border-slate-800 text-slate-200 select-none">
      {/* Panel Top Navigation Tabs */}
      <div className="flex items-center justify-between px-2 h-10 bg-[#161622] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "preview"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "api"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>API Tester</span>
          </button>

          {projectType === "django" && (
            <button
              type="button"
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === "tools"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Django Tools</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "logs"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>
        </div>

        {/* Server Start/Stop Quick Controls */}
        <div className="flex items-center gap-1.5">
          {serverStatus === "running" ? (
            <button
              type="button"
              onClick={onStopServer}
              className="flex items-center gap-1 bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-300 px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
              title="Stop server"
            >
              <Square className="w-2.5 h-2.5 fill-current" /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartServer}
              disabled={serverStatus === "starting"}
              className="flex items-center gap-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-medium transition-colors disabled:opacity-50"
              title="Start server"
            >
              {serverStatus === "starting" ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <Play className="w-2.5 h-2.5 fill-current" />
              )}
              <span>Start</span>
            </button>
          )}
        </div>
      </div>

      {/* Server Status Sub-bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#12121c] border-b border-slate-800/80 text-[11px] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Server:</span>
          {serverStatus === "running" && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Running {serverPort ? `(Port ${serverPort})` : ""}
            </span>
          )}
          {serverStatus === "starting" && (
            <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" /> Launching...
            </span>
          )}
          {serverStatus === "stopped" && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-600" /> Offline
            </span>
          )}
          {serverStatus === "failed" && (
            <span className="flex items-center gap-1.5 text-red-400 font-medium">
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          )}
        </div>

        {onRestartServer && serverStatus === "running" && (
          <button
            type="button"
            onClick={onRestartServer}
            title="Restart Server"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            <span>Restart</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* TAB 1: LIVE PREVIEW */}
        {activeTab === "preview" && (
          <div className="flex flex-col h-full">
            {/* Viewport & URL Controls */}
            {(() => {
              const cleanBaseUrl = (previewUrl || "").replace(/\/+$/, "")
              const cleanPath = previewPath ? (previewPath.startsWith("/") ? previewPath : `/${previewPath}`) : "/"
              const activeIframeUrl = previewUrl ? `${cleanBaseUrl}${cleanPath}` : ""

              return (
                <>
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#1b1b2a] border-b border-slate-800 gap-2 shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        reloadIframe()
                      }}
                      className="flex items-center gap-1.5 flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 overflow-hidden"
                    >
                      <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
                      {serverStatus === "running" && previewUrl ? (
                        <div className="flex items-center flex-1 min-w-0 font-mono text-[11px]">
                          <span className="text-slate-500 shrink-0 select-none">preview:</span>
                          <input
                            type="text"
                            value={previewPath}
                            onChange={(e) => setPreviewPath(e.target.value)}
                            placeholder="/"
                            title="Route Path (e.g. / or /api/tasks/)"
                            className="flex-1 ml-1 bg-transparent text-slate-200 outline-none border-none min-w-0"
                          />
                        </div>
                      ) : (
                        <span className="truncate font-mono text-[11px] text-slate-500">
                          {previewUrl || "(server offline)"}
                        </span>
                      )}
                    </form>

                    {/* Viewport Switcher */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => setViewportMode("desktop")}
                        title="Desktop View"
                        className={`p-1 rounded ${
                          viewportMode === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode("tablet")}
                        title="Tablet View (768px)"
                        className={`p-1 rounded ${
                          viewportMode === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Tablet className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode("mobile")}
                        title="Mobile View (375px)"
                        className={`p-1 rounded ${
                          viewportMode === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={reloadIframe}
                        title="Reload"
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      {activeIframeUrl && (
                        <a
                          href={activeIframeUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open in new window"
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Viewport Frame */}
                  <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-2">
                    <div
                      style={{ width: getViewportWidth(), height: "100%" }}
                      className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative border border-slate-800"
                    >
                      {serverStatus === "running" && activeIframeUrl ? (
                        <iframe
                          key={`${iframeKey}-${activeIframeUrl}`}
                          src={activeIframeUrl}
                          title="Live Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-forms allow-modals"
                        />
                      ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-[#0f172a] p-6 text-center select-none">
                    <Globe className="w-12 h-12 text-slate-700 mb-3" />
                    <h3 className="text-base font-semibold text-slate-200 mb-1">
                      Live Preview Offline
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mb-4">
                      {serverStatus === "starting"
                        ? "Server is initializing..."
                        : `Start your ${projectType} development server to view your live app.`}
                    </p>
                    {serverStatus !== "running" && onStartServer && (
                      <button
                        type="button"
                        onClick={onStartServer}
                        disabled={serverStatus === "starting"}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5"
                      >
                        {serverStatus === "starting" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>Launch Server</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )}

        {/* TAB 2: POSTMAN-LIKE API TESTER */}
        {activeTab === "api" && (
          <div className="flex flex-col h-full p-3 gap-3 overflow-y-auto">
            <div className="bg-[#1b1b2a] border border-slate-800 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>REST API Tester</span>
              </div>

              {/* URL & Method Row */}
              <div className="flex items-center gap-2 mb-2.5">
                <select
                  value={apiMethod}
                  onChange={(e) => setApiMethod(e.target.value as any)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none ${getMethodBadgeColor(
                    apiMethod
                  )} bg-slate-900`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={apiPath}
                  onChange={(e) => setApiPath(e.target.value)}
                  placeholder="/api/tasks/"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleSendApiRequest}
                  disabled={apiLoading || serverStatus !== "running"}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {apiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </div>

              {serverStatus !== "running" && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded px-2.5 py-1.5 text-[11px] text-amber-300 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Start the development server first to send live API requests.</span>
                </div>
              )}

              {/* Headers Toggle */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {showHeaders ? "- Hide Request Headers" : "+ Custom Request Headers"}
                </button>
                {showHeaders && (
                  <textarea
                    rows={3}
                    value={apiHeaders}
                    onChange={(e) => setApiHeaders(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none"
                    placeholder='{"Authorization": "Bearer ...", "Content-Type": "application/json"}'
                  />
                )}
              </div>

              {/* Request Body (for POST, PUT, PATCH) */}
              {["POST", "PUT", "PATCH"].includes(apiMethod) && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Request Body (JSON):
                  </label>
                  <textarea
                    rows={4}
                    value={apiBody}
                    onChange={(e) => setApiBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Response Area */}
            {apiResponse && (
              <div className="bg-[#1b1b2a] border border-slate-800 rounded-lg p-3 flex-1 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Response:</span>
                    {apiResponse.status_code && (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          apiResponse.status_code >= 200 && apiResponse.status_code < 300
                            ? "bg-emerald-950 border border-emerald-800 text-emerald-400"
                            : apiResponse.status_code >= 400
                            ? "bg-red-950 border border-red-800 text-red-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {apiResponse.status_code} {apiResponse.status_text}
                      </span>
                    )}
                  </div>

                  {apiResponse.duration_ms !== undefined && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {apiResponse.duration_ms} ms
                    </span>
                  )}
                </div>

                {apiResponse.error && (
                  <div className="bg-red-950/40 border border-red-800/60 rounded p-2 text-xs text-red-300 font-mono">
                    {apiResponse.error}
                  </div>
                )}

                {apiResponse.body !== undefined && (
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-mono text-slate-200 overflow-auto select-text whitespace-pre-wrap">
                    {apiResponse.is_json
                      ? JSON.stringify(apiResponse.json_data, null, 2)
                      : apiResponse.body}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DJANGO TOOLS (MIGRATIONS & TESTS) */}
        {activeTab === "tools" && (
          <div className="flex flex-col h-full p-3 gap-3 overflow-y-auto">
            {/* Tool 1: Database Migrations */}
            <div className="bg-[#1b1b2a] border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Database Migrations</h4>
                  <p className="text-[11px] text-slate-400">
                    Runs <code>makemigrations</code> and <code>migrate</code> against workspace SQLite database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunMigrations}
                  disabled={migrationRunning}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {migrationRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Run Migrations</span>
                </button>
              </div>

              {migrationResult && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span
                      className={`flex items-center gap-1.5 font-semibold ${
                        migrationResult.success ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {migrationResult.success ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Migrations Applied Successfully</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Migration Failed</span>
                        </>
                      )}
                    </span>
                    <span className="text-slate-500">{migrationResult.duration_ms} ms</span>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-300 max-h-36 overflow-auto select-text whitespace-pre-wrap">
                    {migrationResult.output || "No output."}
                  </pre>
                </div>
              )}
            </div>

            {/* Tool 2: Unit Tests */}
            <div className="bg-[#1b1b2a] border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Django Unit Tests</h4>
                  <p className="text-[11px] text-slate-400">
                    Executes test cases in <code>app/tests.py</code> using Django's test runner.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunTests}
                  disabled={testRunning}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {testRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Run Unit Tests</span>
                </button>
              </div>

              {testResult && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span
                      className={`flex items-center gap-1.5 font-semibold ${
                        testResult.success ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {testResult.success ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>All Django Tests Passed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Tests Failed</span>
                        </>
                      )}
                    </span>
                    <span className="text-slate-500">{testResult.duration_ms} ms</span>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-300 max-h-36 overflow-auto select-text whitespace-pre-wrap">
                    {testResult.output || "No test output."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE SERVER LOGS */}
        {activeTab === "logs" && (
          <div className="flex flex-col h-full p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-2 bg-[#12121c] border border-slate-800 rounded text-xs">
              <span className="text-slate-400 font-mono text-[11px]">django_server.log</span>
              <button
                type="button"
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                <RefreshCw className={`w-3 h-3 ${loadingLogs ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
            <pre className="flex-1 bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-mono text-slate-300 overflow-auto select-text whitespace-pre-wrap">
              {serverLogs || "(No log output yet. Start the server to see live logs.)"}
              <div ref={logsEndRef} />
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
