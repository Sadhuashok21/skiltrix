import React, { useState, useEffect, useRef } from "react"
import Editor, { type OnMount, type Monaco } from "@monaco-editor/react"
import {
  Database,
  Table,
  Play,
  RotateCcw,
  Download,
  History,
  Key,
  ChevronRight,
  ChevronDown,
  Columns,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  X,
  Check,
} from "lucide-react"

import {
  getSqlSchema,
  executeSql,
  resetSqlDatabase,
  exportSqlCsvUrl,
  listSqlTemplates,
  type SqlSchemaResponse,
  type SqlExecuteResponse,
  type SqlTemplate,
  type SqlDatabaseMeta,
} from "../../api/sql"
import { setProjectDjangoDatabase } from "../../api/django"
import { diagnoseProjectFile, type SourceDiagnostic } from "../../api/diagnostics"

interface SqlPlaygroundPanelProps {
  projectId: string
}

export default function SqlPlaygroundPanel({ projectId }: SqlPlaygroundPanelProps) {
  const [schema, setSchema] = useState<SqlSchemaResponse | null>(null)
  const [activeDatabase, setActiveDatabase] = useState<string>("default_db")
  const [templates, setTemplates] = useState<SqlTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("company_hr")

  const [query, setQuery] = useState<string>(
    "-- SkilTrix Multi-Database SQL Playground\n-- Try creating, inspecting, and switching databases:\n-- CREATE DATABASE company_db;\n-- USE company_db;\n-- SHOW DATABASES;\n\nSELECT e.emp_id, e.first_name, e.last_name, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nORDER BY e.salary DESC;\n"
  )

  const [expandedDatabases, setExpandedDatabases] = useState<Record<string, boolean>>({
    default_db: true,
  })
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<"results" | "history" | "statements">("results")
  const [queryHistory, setQueryHistory] = useState<Array<{ query: string; time: string; success: boolean }>>([])

  const [executing, setExecuting] = useState(false)
  const [loadingSchema, setLoadingSchema] = useState(false)
  const [result, setResult] = useState<SqlExecuteResponse | null>(null)
  const [diagnostics, setDiagnostics] = useState<SourceDiagnostic[]>([])
  const [isCheckingDiagnostics, setIsCheckingDiagnostics] = useState(false)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const diagnosticRunId = useRef(0)

  // New Database Modal State
  const [showNewDbModal, setShowNewDbModal] = useState(false)
  const [newDbName, setNewDbName] = useState("")
  const [newDbError, setNewDbError] = useState<string | null>(null)
  const [creatingDb, setCreatingDb] = useState(false)

  const loadSchema = async (targetDb?: string) => {
    try {
      setLoadingSchema(true)
      const data = await getSqlSchema(projectId, targetDb || activeDatabase)
      setSchema(data)
      const active = data.active_database || targetDb || activeDatabase
      setActiveDatabase(active)

      // Ensure active database is expanded
      setExpandedDatabases((prev) => ({
        ...prev,
        [active]: prev[active] !== undefined ? prev[active] : true,
      }))

      // Auto-expand first table in active db if none expanded
      if (data.tables.length > 0 && Object.keys(expandedTables).length === 0) {
        setExpandedTables({ [`${active}/${data.tables[0].name}`]: true })
      }
    } catch (err: any) {
      console.error("Failed to load schema", err)
    } finally {
      setLoadingSchema(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const tmpls = await listSqlTemplates()
      setTemplates(tmpls)
    } catch (err) {
      console.error("Failed to list templates", err)
    }
  }

  useEffect(() => {
    if (projectId) {
      loadSchema()
      loadTemplates()
    }
  }, [projectId])

  useEffect(() => {
    const runId = ++diagnosticRunId.current
    const controller = new AbortController()
    setDiagnostics([])
    setIsCheckingDiagnostics(true)
    const timer = window.setTimeout(() => {
      diagnoseProjectFile(projectId, "__query__.sql", query, runId, activeDatabase, controller.signal)
        .then((response) => {
          if (runId === diagnosticRunId.current && response.project_id === projectId) setDiagnostics(response.diagnostics)
        })
        .catch((error) => {
          if (!controller.signal.aborted && runId === diagnosticRunId.current) {
            setDiagnostics([{
              file: "SQL Console", severity: "warning", code: "SQL_DIAGNOSTIC_REQUEST_FAILED",
              message: error?.response?.data?.detail || error.message || "SQL diagnostics request failed.",
              source: "SkilTrix diagnostics", category: "tooling",
            }])
          }
        })
        .finally(() => {
          if (runId === diagnosticRunId.current) setIsCheckingDiagnostics(false)
        })
    }, 450)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [projectId, query, activeDatabase])

  useEffect(() => {
    const model = editorRef.current?.getModel()
    const monaco = monacoRef.current
    if (!model || !monaco) return
    monaco.editor.setModelMarkers(model, "skiltrix-sql-diagnostics", diagnostics
      .filter((item) => item.startLine)
      .map((item) => ({
        severity: item.severity === "error" ? monaco.MarkerSeverity.Error : item.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Info,
        message: `${item.code}: ${item.message}`,
        source: item.source,
        startLineNumber: item.startLine!,
        startColumn: item.startColumn || 1,
        endLineNumber: item.endLine || item.startLine!,
        endColumn: item.endColumn || (item.startColumn || 1) + 1,
      })))
  }, [diagnostics, query])

  const handleSqlEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  const toggleDatabase = (dbName: string) => {
    setExpandedDatabases((prev) => ({ ...prev, [dbName]: !prev[dbName] }))
  }

  const toggleTable = (dbName: string, tableName: string) => {
    const key = `${dbName}/${tableName}`
    setExpandedTables((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleRefreshTable = async (dbName: string, tableName: string) => {
    try {
      setExecuting(true)
      const selectQuery = `SELECT * FROM ${tableName} LIMIT 50;`
      setQuery(selectQuery)
      if (dbName !== activeDatabase) {
        setActiveDatabase(dbName)
      }
      const [res] = await Promise.all([
        executeSql(projectId, selectQuery, dbName),
        loadSchema(dbName),
      ])
      setResult(res)
      setActiveTab("results")
    } catch (err: any) {
      console.error("Failed to refresh table:", err)
    } finally {
      setExecuting(false)
    }
  }

  const handleSwitchDatabase = async (dbName: string) => {
    try {
      setExecuting(true)
      const res = await executeSql(projectId, `USE ${dbName};`, dbName)
      setResult(res)
      if (res.status && res.active_database) {
        setActiveDatabase(res.active_database)
        await loadSchema(res.active_database)
      }
    } catch (err: any) {
      alert(`Failed to switch database: ${err.message}`)
    } finally {
      setExecuting(false)
    }
  }

  const handleSetDjangoDatabase = async (dbName: string) => {
    try {
      setLoadingSchema(true)
      await setProjectDjangoDatabase(projectId, dbName)
      await loadSchema()
    } catch (err: any) {
      alert(`Failed to set Django database: ${err.message}`)
    } finally {
      setLoadingSchema(false)
    }
  }

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = newDbName.trim()
    if (!clean) {
      setNewDbError("Database name cannot be empty.")
      return
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean)) {
      setNewDbError("Database name must start with a letter/underscore and contain only alphanumeric characters.")
      return
    }

    try {
      setCreatingDb(true)
      setNewDbError(null)
      const res = await executeSql(projectId, `CREATE DATABASE ${clean};`, activeDatabase)
      setResult(res)
      if (res.status) {
        setShowNewDbModal(false)
        setNewDbName("")
        const nextDb = res.active_database || clean
        setActiveDatabase(nextDb)
        await loadSchema(nextDb)
      } else {
        setNewDbError(res.error || "Failed to create database.")
      }
    } catch (err: any) {
      setNewDbError(err?.response?.data?.error || err.message)
    } finally {
      setCreatingDb(false)
    }
  }

  const handleExecute = async () => {
    if (!query.trim()) return
    try {
      setExecuting(true)
      const res = await executeSql(projectId, query, activeDatabase)
      setResult(res)
      setDiagnostics((current) => [
        ...current.filter((item) => item.category !== "runtime"),
        ...(!res.status && res.error ? [{
          file: "SQL Console", severity: "error" as const, code: "SQL_EXECUTION_ERROR",
          message: res.error, source: "SQLite 3", category: "runtime" as const,
        }] : []),
      ])
      setActiveTab("results")

      setQueryHistory((prev) => [
        { query: query.trim(), time: new Date().toLocaleTimeString(), success: res.status },
        ...prev.slice(0, 20),
      ])

      // If active_database changed (e.g. via USE or CREATE DATABASE) or if DDL/DML, refresh schema
      if (res.status) {
        const nextActive = res.active_database || activeDatabase
        if (nextActive !== activeDatabase) {
          setActiveDatabase(nextActive)
        }
        await loadSchema(nextActive)
      }
    } catch (err: any) {
      setDiagnostics((current) => [...current.filter((item) => item.category !== "runtime"), {
        file: "SQL Console", severity: "error", code: "SQL_EXECUTION_ERROR",
        message: err?.response?.data?.error || err.message || "Query failed to execute.",
        source: "SQLite 3", category: "runtime",
      }])
      setResult({
        status: false,
        duration_ms: 0,
        error: err?.response?.data?.error || err.message || "Query failed to execute.",
      })
    } finally {
      setExecuting(false)
    }
  }

  const handleReset = async (templateKey: string) => {
    if (!confirm(`Reset active database '${activeDatabase}' with '${templateKey}' seed data? All current changes will be overwritten.`)) {
      return
    }
    try {
      setLoadingSchema(true)
      await resetSqlDatabase(projectId, templateKey, activeDatabase)
      setSelectedTemplate(templateKey)
      await loadSchema(activeDatabase)
      setResult(null)
      alert(`Database '${activeDatabase}' reset successfully.`)
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`)
    } finally {
      setLoadingSchema(false)
    }
  }

  const databasesList = schema?.databases || []

  return (
    <div className="flex h-full w-full bg-[#11111b] text-slate-200 overflow-hidden font-sans select-none relative">
      {/* Left Sidebar: Database Catalog & Schema Explorer */}
      <div className="w-80 shrink-0 border-r border-slate-800 bg-[#181825] flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Database Explorer
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setNewDbName("")
                setNewDbError(null)
                setShowNewDbModal(true)
              }}
              title="Create New Database (CREATE DATABASE)"
              className="p-1 hover:bg-slate-700/60 rounded text-teal-400 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => loadSchema()}
              disabled={loadingSchema}
              title="Refresh Databases & Tables Catalog"
              className="p-1 hover:bg-slate-700/60 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loadingSchema ? "animate-spin text-teal-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Active Database context badge */}
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/70 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active DB:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-950/80 border border-teal-500/40 text-teal-300 truncate">
              {activeDatabase}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {databasesList.length} db{databasesList.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Database selector / reset banner */}
        <div className="p-2.5 border-b border-slate-800/60 bg-slate-900/40 text-xs">
          <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Seed Template (Active DB):
          </div>
          <select
            value={selectedTemplate}
            onChange={(e) => handleReset(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="company_hr">Company HR & Payroll</option>
            <option value="ecommerce">E-Commerce & Orders</option>
            <option value="university">University Academic Portal</option>
          </select>
        </div>

        {/* Databases Catalog Tree */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-1 py-0.5">
            Databases ({databasesList.length})
          </div>

          {loadingSchema && !schema ? (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading catalog...
            </div>
          ) : databasesList.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No databases found. Run CREATE DATABASE company_db;
            </div>
          ) : (
            databasesList.map((db) => {
              const isDbExpanded = !!expandedDatabases[db.name]
              const isCurrentActive = db.name === activeDatabase

              return (
                <div
                  key={db.name}
                  className={`rounded border transition-colors ${
                    isCurrentActive
                      ? "border-teal-500/50 bg-[#121c29]"
                      : "border-slate-800/70 bg-slate-900/30"
                  }`}
                >
                  {/* Database Node Header */}
                  <div
                    onClick={() => toggleDatabase(db.name)}
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-800/50 rounded transition-colors text-xs font-medium"
                  >
                    <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                      <span className="text-slate-500 hover:text-slate-300 shrink-0">
                        {isDbExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <Database
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isCurrentActive ? "text-teal-400" : "text-slate-400"
                        }`}
                      />
                      <span className={`truncate font-mono ${isCurrentActive ? "text-teal-200 font-bold" : "text-slate-300"}`}>
                        {db.name}
                      </span>
                      {isCurrentActive && (
                        <span className="text-[9px] uppercase px-1 rounded bg-teal-900/80 text-teal-300 border border-teal-500/30 font-bold shrink-0">
                          active
                        </span>
                      )}
                      {(db.is_django || schema?.django_database === db.name) && (
                        <span className="text-[9px] uppercase px-1 rounded bg-purple-900/80 text-purple-300 border border-purple-500/40 font-bold shrink-0">
                          Django DB
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          loadSchema(db.name)
                        }}
                        disabled={loadingSchema}
                        title={`Refresh tables in database '${db.name}'`}
                        className="p-1 hover:bg-slate-700/60 rounded text-slate-400 hover:text-teal-300 transition-colors"
                      >
                        <RotateCcw className={`w-3 h-3 ${loadingSchema ? "animate-spin text-teal-400" : ""}`} />
                      </button>
                      {!isCurrentActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSwitchDatabase(db.name)
                          }}
                          title={`Switch to ${db.name} (USE ${db.name})`}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-teal-700 text-slate-300 hover:text-white rounded transition-colors"
                        >
                          USE
                        </button>
                      )}
                      {schema?.django_database !== db.name && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetDjangoDatabase(db.name)
                          }}
                          title={`Set '${db.name}' as the Django project database`}
                          className="text-[9px] px-1.5 py-0.5 bg-purple-950/70 hover:bg-purple-800 text-purple-300 hover:text-white rounded border border-purple-700/40 transition-colors"
                        >
                          Set Django DB
                        </button>
                      )}
                      <span className="text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono">
                        {db.tables_count} tbl
                      </span>
                    </div>
                  </div>

                  {/* Tables List inside Database */}
                  {isDbExpanded && (
                    <div className="pl-4 pr-2 pb-2 pt-1 border-t border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between px-1 py-1 text-[10px] text-slate-400 font-semibold uppercase">
                        <span>Tables ({db.tables.length})</span>
                        <button
                          type="button"
                          onClick={() => loadSchema(db.name)}
                          disabled={loadingSchema}
                          title={`Refresh ${db.name} tables`}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-teal-300 transition-colors"
                        >
                          <RotateCcw className={`w-2.5 h-2.5 ${loadingSchema ? "animate-spin text-teal-400" : ""}`} />
                          <span>Refresh Tables</span>
                        </button>
                      </div>

                      {db.tables.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic py-1 px-2">
                          No tables. Run CREATE TABLE in this database.
                        </div>
                      ) : (
                        db.tables.map((t) => {
                          const tableKey = `${db.name}/${t.name}`
                          const isTableExpanded = !!expandedTables[tableKey]

                          return (
                            <div key={t.name} className="rounded border border-slate-800/40 bg-slate-950/40">
                              <div
                                onClick={() => toggleTable(db.name, t.name)}
                                className="flex items-center justify-between p-1.5 cursor-pointer hover:bg-slate-800/40 rounded transition-colors text-xs font-mono"
                              >
                                <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                                  {isTableExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                                  )}
                                  <Table className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="truncate text-slate-300">{t.name}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRefreshTable(db.name, t.name)
                                    }}
                                    title={`View & refresh ${t.name} table records`}
                                    className="p-1 hover:bg-slate-700/60 rounded text-slate-400 hover:text-teal-300 transition-colors"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="text-[10px] text-slate-500">
                                    {t.row_count} r
                                  </span>
                                </div>
                              </div>

                              {isTableExpanded && (
                                <div className="px-3 pb-2 pt-1 border-t border-slate-800/40 space-y-0.5 font-mono text-[10px]">
                                  {t.columns.map((col) => (
                                    <div
                                      key={col.name}
                                      className="flex items-center justify-between py-0.5 text-slate-400"
                                    >
                                      <span className="flex items-center gap-1 truncate">
                                        {col.pk && <Key className="w-2.5 h-2.5 text-amber-400" />}
                                        <span className={col.pk ? "text-amber-300 font-bold" : ""}>
                                          {col.name}
                                        </span>
                                      </span>
                                      <span className="text-[9px] text-slate-600 uppercase">
                                        {col.type || "ANY"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Column: SQL Editor + Query Output Grid */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Editor Controls Bar */}
        <div className="flex items-center justify-between px-3 h-10 bg-[#181825] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-400" /> SQL Query Console
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400 font-mono">
              Database: <strong className="text-teal-300">{activeDatabase}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1 rounded shadow transition-colors"
              title="Execute SQL (Ctrl+Enter)"
            >
              {executing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Execute</span>
            </button>
          </div>
        </div>

        {/* Monaco SQL Editor */}
        <div className="h-64 shrink-0 relative border-b border-slate-800">
          <Editor
            height="100%"
            language="sql"
            theme="vs-dark"
            value={query}
            onMount={handleSqlEditorMount}
            onChange={(val) => setQuery(val ?? "")}
            options={{
              fontSize: 13,
              fontFamily: "'Fira Code', Consolas, monospace",
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: "on",
              lineNumbers: "on",
            }}
          />
        </div>
        <div className="h-8 shrink-0 border-b border-slate-800 bg-[#181825] px-3 flex items-center gap-3 text-[11px] overflow-hidden">
          <span className="font-semibold text-slate-300">Problems</span>
          <span className="text-red-400">{diagnostics.filter((item) => item.severity === "error").length} errors</span>
          <span className="text-amber-300">{diagnostics.filter((item) => item.severity === "warning").length} warnings</span>
          {isCheckingDiagnostics ? <span className="text-slate-500">Checking SQLite syntax…</span> : diagnostics[0] ? <button type="button" className="truncate text-slate-300 hover:text-white" title={diagnostics[0].message} onClick={() => {
            const item = diagnostics[0]
            if (item.startLine) {
              editorRef.current?.setPosition({ lineNumber: item.startLine, column: item.startColumn || 1 })
              editorRef.current?.revealLineInCenter(item.startLine)
              editorRef.current?.focus()
            }
          }}>{diagnostics[0].message}</button> : <span className="text-slate-500">No SQL diagnostics.</span>}
        </div>

        {/* Bottom Output & Grid Section */}
        <div className="flex-1 flex flex-col bg-[#0f141c] overflow-hidden select-text">
          {/* Sub-tabs bar */}
          <div className="flex items-center justify-between px-3 h-9 bg-[#181825] border-b border-slate-800">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className={`px-3 h-9 text-xs border-b-2 font-medium transition-colors ${
                  activeTab === "results"
                    ? "border-teal-400 text-teal-300 bg-[#0f141c]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Query Results {result?.primary?.is_query && `(${result.primary.row_count} rows)`}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("statements")}
                className={`px-3 h-9 text-xs border-b-2 font-medium transition-colors ${
                  activeTab === "statements"
                    ? "border-teal-400 text-teal-300 bg-[#0f141c]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Statements ({result?.results?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3 h-9 text-xs border-b-2 font-medium transition-colors ${
                  activeTab === "history"
                    ? "border-teal-400 text-teal-300 bg-[#0f141c]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                History ({queryHistory.length})
              </button>
            </div>

            {/* Toolbar: Refresh, Metrics and CSV download */}
            <div className="flex items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={handleExecute}
                disabled={executing}
                title="Re-run active query / refresh table data"
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3 h-3 ${executing ? "animate-spin text-teal-400" : ""}`} />
                <span>Refresh Data</span>
              </button>

              {result && (
                <>
                  <span className="text-slate-400 text-[11px]">
                    Execution: <strong>{result.duration_ms} ms</strong>
                  </span>

                  {result.primary?.is_query && (
                    <a
                      href={exportSqlCsvUrl(projectId, query, activeDatabase)}
                      download
                      className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" /> Export CSV
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-auto p-3">
            {activeTab === "results" && (
              <div>
                {executing ? (
                  <div className="flex items-center gap-2 text-indigo-400 text-xs p-4 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing SQL against database '{activeDatabase}'...</span>
                  </div>
                ) : !result ? (
                  <div className="text-slate-500 italic text-xs p-4">
                    Press "Execute" to run queries. Tabular results and execution times will appear here.
                  </div>
                ) : !result.status ? (
                  <div className="p-3 bg-red-950/20 border border-red-900/60 rounded-lg text-red-300 font-mono text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertCircle className="w-4 h-4 text-red-400" /> SQL Error:
                    </div>
                    <pre className="whitespace-pre-wrap">{result.error}</pre>
                  </div>
                ) : result.primary?.is_query ? (
                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 uppercase tracking-wider text-[11px]">
                        <tr>
                          {result.primary.columns?.map((col) => (
                            <th key={col} className="px-3 py-2 border-r border-slate-800 last:border-r-0">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {result.primary.rows?.length === 0 ? (
                          <tr>
                            <td
                              colSpan={result.primary.columns?.length || 1}
                              className="text-center py-6 text-slate-500 italic"
                            >
                              Query returned 0 rows.
                            </td>
                          </tr>
                        ) : (
                          result.primary.rows?.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-3 py-1.5 border-r border-slate-800/60 last:border-r-0 whitespace-nowrap"
                                >
                                  {cell === null ? (
                                    <span className="text-slate-500 italic">NULL</span>
                                  ) : (
                                    String(cell)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/60 rounded-lg text-emerald-300 font-mono text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{result.primary?.message || "Statements executed successfully."}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "statements" && (
              <div className="space-y-2">
                {!result?.results || result.results.length === 0 ? (
                  <div className="text-slate-500 text-xs italic p-4">No statements executed yet.</div>
                ) : (
                  result.results.map((stmtRes, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded border border-slate-800 bg-slate-900/40 text-xs font-mono space-y-1"
                    >
                      <div className="text-slate-400 truncate">{stmtRes.statement}</div>
                      <div className="text-teal-400 text-[11px] flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-teal-400" />
                        <span>
                          {stmtRes.is_query
                            ? `Returned ${stmtRes.row_count} row(s)`
                            : stmtRes.message}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-2">
                {queryHistory.length === 0 ? (
                  <div className="text-slate-500 text-xs italic p-4">No queries executed yet.</div>
                ) : (
                  queryHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setQuery(item.query)}
                      className="p-2.5 rounded border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 cursor-pointer text-xs font-mono flex items-center justify-between"
                    >
                      <pre className="truncate flex-1 text-slate-300 mr-4">{item.query}</pre>
                      <span className="text-[10px] text-slate-500 shrink-0">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE DATABASE MODAL */}
      {showNewDbModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181825] border border-slate-700 rounded-xl max-w-sm w-full p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-slate-200">Create New Database</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDbModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDatabase} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Database Identifier
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newDbName}
                  onChange={(e) => {
                    setNewDbName(e.target.value)
                    setNewDbError(null)
                  }}
                  placeholder="e.g. company_db"
                  className="w-full bg-[#11111b] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-teal-500"
                />
                {newDbError && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{newDbError}</span>
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-500">
                This will execute <code>CREATE DATABASE &lt;name&gt;</code> and register it in the project database catalog.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewDbModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingDb || !newDbName.trim()}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creatingDb && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Create Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
