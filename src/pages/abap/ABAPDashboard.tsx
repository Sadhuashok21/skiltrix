import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../../api/client"
import {
  Layers,
  Plus,
  Play,
  Server,
  Cpu,
  BookOpen,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Code2,
  Database,
  Activity,
  Award,
  RefreshCw,
} from "lucide-react"

import {
  listABAPProjects,
  createABAPProject,
  deleteABAPProject,
  exportABAPProjectZipUrl,
  listABAPExercises,
  listSAPConnections,
  createSAPConnection,
  testSAPConnection,
  type ApiABAPProject,
  type ApiABAPExercise,
  type ApiSAPConnection,
} from "../../api/abap"

export default function ABAPDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"projects" | "curriculum" | "connections">("projects")
  const [projects, setProjects] = useState<ApiABAPProject[]>([])
  const [exercises, setExercises] = useState<ApiABAPExercise[]>([])
  const [connections, setConnections] = useState<ApiSAPConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modeFilter, setModeFilter] = useState<string>("all")
  const [isFree, setIsFree] = useState(false)

  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("Z_MY_ABAP_REPORT")
  const [newPackage, setNewPackage] = useState("$TMP")
  const [newMode, setNewMode] = useState<"simulator" | "sap_connected">("simulator")
  const [newSystemId, setNewSystemId] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [creating, setCreating] = useState(false)

  // New SAP Connection Modal State
  const [isConnModalOpen, setIsConnModalOpen] = useState(false)
  const [connSystemName, setConnSystemName] = useState("SAP S/4HANA Sandbox")
  const [connSystemId, setConnSystemId] = useState("S4H")
  const [connClient, setConnClient] = useState("100")
  const [connHost, setConnHost] = useState("s4h-sandbox.corp.example.com")
  const [connPort, setConnPort] = useState(443)
  const [connUsername, setConnUsername] = useState("DEVELOPER")
  const [connPassword, setConnPassword] = useState("")
  const [savingConn, setSavingConn] = useState(false)
  const [testingConnId, setTestingConnId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; msg: string; success: boolean } | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [projList, exList, connList] = await Promise.all([
        listABAPProjects(modeFilter === "all" ? undefined : modeFilter),
        listABAPExercises(),
        listSAPConnections(),
      ])
      setProjects(projList)
      setExercises(exList)
      setConnections(connList)
      api.get<{ has_access: boolean; is_free?: boolean }>("/abap/access/")
        .then(({ data }) => setIsFree(Boolean(data.is_free)))
        .catch(() => undefined)
    } catch (err) {
      console.error("Failed to load ABAP data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickOpenEditor = async () => {
    if (projects.length > 0) {
      navigate(`/abap/studio/${projects[0].project_id}`)
      return
    }
    try {
      setCreating(true)
      const created = await createABAPProject({
        title: "Z_MAIN_ABAP_REPORT",
        package_name: "$TMP",
        execution_mode: "simulator",
        description: "Primary SAP ABAP interactive workspace",
      })
      navigate(`/abap/studio/${created.project_id}`)
    } catch (err) {
      console.error("Failed to quick open editor:", err)
      setIsModalOpen(true)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [modeFilter])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setCreating(true)
      const created = await createABAPProject({
        title: newTitle,
        package_name: newPackage,
        execution_mode: newMode,
        sap_system_id: newSystemId || undefined,
        description: newDescription,
      })
      setIsModalOpen(false)
      setNewTitle("Z_MY_ABAP_REPORT")
      setNewDescription("")
      setProjects((prev) => [created, ...prev])
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message
      alert(`Failed to create ABAP project: ${detail}`)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (projectId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete ABAP project ${title}?`)) return
    try {
      await deleteABAPProject(projectId)
      setProjects((prev) => prev.filter((p) => p.project_id !== projectId))
    } catch (err: any) {
      alert(`Failed to delete project: ${err.message}`)
    }
  }

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingConn(true)
      const conn = await createSAPConnection({
        system_name: connSystemName,
        system_id: connSystemId,
        client: connClient,
        host: connHost,
        port: connPort,
        username: connUsername,
        password: connPassword,
      })
      setConnections((prev) => [conn, ...prev])
      setIsConnModalOpen(false)
      setConnPassword("")
    } catch (err: any) {
      alert(`Failed to save SAP connection: ${err.message}`)
    } finally {
      setSavingConn(false)
    }
  }

  const handleTestConnection = async (connectionId: string) => {
    try {
      setTestingConnId(connectionId)
      setTestResult(null)
      const res = await testSAPConnection(connectionId)
      setTestResult({
        id: connectionId,
        msg: res.message,
        success: res.status,
      })
    } catch (err: any) {
      setTestResult({
        id: connectionId,
        msg: `Connection failed: ${err.message}`,
        success: false,
      })
    } finally {
      setTestingConnId(null)
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Banner / SAP Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-900/40 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
                <Layers className="w-7 h-7" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    SkilTrix <span className="text-blue-400">SAP ABAP Lab</span>
                  </h1>
                  <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Enterprise Studio
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Enterprise SAP programming studio inspired by SAP GUI and ADT in Eclipse.
                  Develop ABAP reports, master internal tables, explore SAP SE11 dictionary objects,
                  and practice Open SQL in simulator and connected enterprise modes.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            {!isFree && (
              <>
                <Link to="/abap/pricing" className="rounded-xl border border-blue-400/40 px-4 py-2.5 font-medium text-blue-200 transition-colors hover:bg-blue-500/10">
                  Pricing & access
                </Link>
                <Link to="/abap/payments" className="rounded-xl border border-blue-400/40 px-4 py-2.5 font-medium text-blue-200 transition-colors hover:bg-blue-500/10">
                  Payment history
                </Link>
              </>
            )}
            {isFree && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Free Access Active</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleQuickOpenEditor}
              disabled={creating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Code2 className="w-4 h-4" />
              <span>Open ABAP Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create ABAP Program</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "projects"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>My ABAP Workspaces ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("curriculum")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "curriculum"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Question Repository ({exercises.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("connections")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "connections"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>SAP Systems ({connections.length})</span>
            </button>
          </div>

          {/* Mode Filter for Projects */}
          {activeTab === "projects" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Mode:</span>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Modes</option>
                <option value="simulator">Educational Simulator</option>
                <option value="sap_connected">Real SAP Connected</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: PROJECTS */}
        {activeTab === "projects" && (
          <div className="mt-6">
            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ABAP reports, packages, or descriptions..."
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                <p>Loading ABAP projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-12 text-center">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-200">No ABAP Projects Found</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  Create your first ABAP program to start writing reports, internal tables, and Open SQL queries.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New ABAP Report</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.project_id}
                    className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/70 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-md group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 bg-blue-950 text-blue-400 rounded-lg border border-blue-800/60 font-mono font-bold text-xs">
                            PROG
                          </span>
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors font-mono">
                              {proj.title}
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">
                              Package: <strong className="text-slate-300">{proj.package_name}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Mode badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            proj.execution_mode === "sap_connected"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/70"
                              : "bg-blue-950/80 text-blue-300 border-blue-800/70"
                          }`}
                        >
                          {proj.execution_mode === "sap_connected" ? "SAP Connected" : "Simulator"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                        {proj.description || "SkilTrix ABAP executable report."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <a
                          href={exportABAPProjectZipUrl(proj.project_id)}
                          download
                          title="Export as ZIP"
                          className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.project_id, proj.title)}
                          title="Delete Project"
                          className="p-1.5 hover:bg-red-950/60 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <Link
                        to={`/abap/studio/${proj.project_id}`}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Studio</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CURRICULUM REPOSITORY */}
        {activeTab === "curriculum" && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {exercises.map((ex) => (
                <div
                  key={ex.exercise_id}
                  className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                          ex.difficulty === "Easy"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                            : ex.difficulty === "Medium"
                            ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                            : "bg-red-950 text-red-400 border border-red-800/60"
                        }`}
                      >
                        {ex.difficulty}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {ex.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-3">
                      {ex.title}
                    </h3>
                    <p className="text-xs text-blue-400 mt-0.5">Topic: {ex.topic}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                      {ex.problem_statement}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      +{ex.points} Points
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTitle(ex.slug.toUpperCase().replace(/-/g, "_"))
                        setNewDescription(`Challenge: ${ex.title}`)
                        setIsModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      <span>Start Challenge</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SAP SYSTEMS */}
        {activeTab === "connections" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-400">
                Connect your team or university's authorized SAP S/4HANA or SAP BTP ABAP environment.
                Credentials remain securely stored server-side.
              </p>
              <button
                type="button"
                onClick={() => setIsConnModalOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add SAP System</span>
              </button>
            </div>

            {connections.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-10 text-center">
                <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-200">No Enterprise SAP Systems Connected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  By default, all code executes in the local SkilTrix Educational ABAP Simulator.
                  Add an authorized SAP system if you wish to run code against an S/4HANA or BTP tenant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((c) => (
                  <div
                    key={c.connection_id}
                    className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{c.system_name}</span>
                        <span className="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded text-blue-400">
                          {c.system_id} / Client {c.client}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">{c.host}:{c.port}</p>
                      {c.last_status_message && (
                        <p className="text-[11px] text-slate-400 mt-2 bg-slate-900/60 p-2 rounded">
                          {c.last_status_message}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">User: {c.username}</span>
                      <button
                        type="button"
                        onClick={() => handleTestConnection(c.connection_id)}
                        disabled={testingConnId === c.connection_id}
                        className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded text-slate-200 font-medium"
                      >
                        {testingConnId === c.connection_id ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                        ) : (
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>Test Ping</span>
                      </button>
                    </div>

                    {testResult && testResult.id === c.connection_id && (
                      <div
                        className={`mt-2 text-[11px] p-2 rounded border ${
                          testResult.success
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                            : "bg-red-950/60 text-red-300 border-red-800/60"
                        }`}
                      >
                        {testResult.msg}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: CREATE ABAP PROGRAM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Create New ABAP Program</h2>
            <p className="text-xs text-slate-400 mt-1">
              Initializes an ABAP report workspace with starter templates and isolated storage.
            </p>

            <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Report Name (PROG)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value.toUpperCase())}
                  placeholder="Z_MY_REPORT"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Must start with Z or Y (standard SAP customer namespace).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Development Package
                </label>
                <input
                  type="text"
                  required
                  value={newPackage}
                  onChange={(e) => setNewPackage(e.target.value.toUpperCase())}
                  placeholder="$TMP"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Use <code>$TMP</code> for local temporary test objects.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Execution Runtime Mode
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewMode("simulator")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                      newMode === "simulator"
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span>ABAP Simulator</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Local sandbox. No SAP credentials needed.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewMode("sap_connected")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                      newMode === "sap_connected"
                        ? "bg-emerald-600/20 border-emerald-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <span>Real SAP System</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Runs via configured SAP ADT Core.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Purpose of this ABAP program..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SAP SYSTEM CONNECTION */}
      {isConnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Add SAP System Profile</h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure credentials for an authorized development system (S/4HANA or BTP).
            </p>

            <form onSubmit={handleSaveConnection} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  required
                  value={connSystemName}
                  onChange={(e) => setConnSystemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    System ID (SID)
                  </label>
                  <input
                    type="text"
                    required
                    value={connSystemId}
                    onChange={(e) => setConnSystemId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Client
                  </label>
                  <input
                    type="text"
                    required
                    value={connClient}
                    onChange={(e) => setConnClient(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Host / FQDN
                  </label>
                  <input
                    type="text"
                    required
                    value={connHost}
                    onChange={(e) => setConnHost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={connPort}
                    onChange={(e) => setConnPort(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  SAP Username
                </label>
                <input
                  type="text"
                  required
                  value={connUsername}
                  onChange={(e) => setConnUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={connPassword}
                  onChange={(e) => setConnPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Encrypted server-side. Never shared or returned to browser.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConnModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConn}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {savingConn ? "Saving..." : "Save Connection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

