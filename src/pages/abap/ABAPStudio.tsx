import React, { useState, useEffect, useRef, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import Editor, { OnMount, type Monaco } from "@monaco-editor/react"
import {
  Folder,
  Play,
  Save,
  CheckCircle,
  AlertTriangle,
  Database,
  Layers,
  Server,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  FileCode,
  Table,
  BookOpen,
  Bug,
  Terminal,
  Settings,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  Search,
  Code2,
  Eye,
  Check,
  Zap,
  Sparkles,
  Wrench,
} from "lucide-react"

import {
  getABAPProject,
  getABAPSourceFiles,
  getABAPFileContent,
  saveABAPFileContent,
  createABAPSourceFile,
  createABAPFolder,
  renameABAPPath,
  moveABAPPath,
  duplicateABAPFile,
  deleteABAPSourceFile,
  executeABAP,
  checkABAPSyntax,
  previewTableData,
  listABAPExercises,
  listSAPConnections,
  listABAPDictionaryTables,
  createABAPDictionaryTable,
  deleteABAPDictionaryTable,
  addRecordToTable,
  getApiErrorMessage,
  type ApiABAPProject,
  type ApiABAPSourceFile,
  type ApiABAPExercise,
  type ApiSAPConnection,
  type ApiABAPDictionaryTable,
  type ABAPExecutionResult,
} from "../../api/abap"
import { registerABAPLanguage } from "../../utils/abapMonarch"
import ABAPFileExplorer, { getABAPFileIcon } from "../../components/abap/ABAPFileExplorer"
import { lintABAPCode, formatABAPCode, type ABAPDiagnosticItem } from "../../services/abapLintService"

interface OpenEditorTab {
  name: string
  content: string
  isDirty: boolean
  objectType: string
}

export type ABAPDiagnostic = ABAPDiagnosticItem

export default function ABAPStudio() {
  const { projectId } = useParams<{ projectId: string }>()

  // Core State
  const [project, setProject] = useState<ApiABAPProject | null>(null)
  const [files, setFiles] = useState<ApiABAPSourceFile[]>([])
  const [openTabs, setOpenTabs] = useState<OpenEditorTab[]>([])
  const [activeTabName, setActiveTabName] = useState<string>("")
  const [connections, setConnections] = useState<ApiSAPConnection[]>([])
  const [exercises, setExercises] = useState<ApiABAPExercise[]>([])

  // Custom DDIC Tables State (SE11)
  const [customTables, setCustomTables] = useState<ApiABAPDictionaryTable[]>([])
  const [newTableModalOpen, setNewTableModalOpen] = useState(false)
  const [newTableError, setNewTableError] = useState<string | null>(null)
  const [newTableName, setNewTableName] = useState("ZCUSTOMERS")
  const [newTableDesc, setNewTableDesc] = useState("Custom Customer Master Table")
  const [newTableDeliveryClass, setNewTableDeliveryClass] = useState("A")
  const [isClientDependent, setIsClientDependent] = useState(false)
  const [newTableFields, setNewTableFields] = useState<
    Array<{ field: string; key: boolean; type: string; length: number; description: string }>
  >([
    { field: "CUST_ID", key: true, type: "CHAR", length: 10, description: "Customer ID" },
    { field: "NAME", key: false, type: "CHAR", length: 40, description: "Company Name" },
    { field: "CITY", key: false, type: "CHAR", length: 30, description: "City" },
    { field: "BALANCE", key: false, type: "CURR", length: 15, description: "Outstanding Balance" },
  ])
  const [creatingTable, setCreatingTable] = useState(false)

  const openNewTableModal = () => {
    setNewTableError(null)
    setNewTableModalOpen(true)
  }

  const closeNewTableModal = () => {
    setNewTableError(null)
    setNewTableModalOpen(false)
  }

  // Add Record Modal State (SE16N)
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false)
  const [targetTableForRecord, setTargetTableForRecord] = useState<ApiABAPDictionaryTable | null>(null)
  const [recordFormData, setRecordFormData] = useState<Record<string, any>>({})
  const [savingRecord, setSavingRecord] = useState(false)

  // Layout & UI State
  const [activeSidebarView, setActiveSidebarView] = useState<"explorer" | "dictionary" | "exercises" | "debugger" | "problems" | "settings">("explorer")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState<number>(270)
  const [enforceNamingRulesAsErrors, setEnforceNamingRulesAsErrors] = useState<boolean>(false)
  const isResizingSidebar = useRef(false)

  const handleMouseDownSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizingSidebar.current = true
    const startX = e.clientX
    const startWidth = sidebarWidth

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingSidebar.current) return
      const delta = moveEvent.clientX - startX
      const newWidth = Math.min(600, Math.max(200, startWidth + delta))
      setSidebarWidth(newWidth)
    }

    const onMouseUp = () => {
      isResizingSidebar.current = false
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }, [sidebarWidth])

  const [bottomPanelTab, setBottomPanelTab] = useState<"console" | "problems" | "preview" | "tables">("console")
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240)
  const [theme, setTheme] = useState<"sap-fiori-dark" | "vs-dark" | "light">("sap-fiori-dark")

  // Execution & Diagnostics State
  const [executionMode, setExecutionMode] = useState<"simulator" | "sap_connected">("simulator")
  const [selectedSapSystemId, setSelectedSapSystemId] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [isCheckingSyntax, setIsCheckingSyntax] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [outputConsole, setOutputConsole] = useState<string>("")
  const [executionResult, setExecutionResult] = useState<ABAPExecutionResult | null>(null)
  const [diagnostics, setDiagnostics] = useState<ABAPDiagnostic[]>([])
  const [diagnosticFilter, setDiagnosticFilter] = useState<"all" | "error" | "warning" | "info">("all")
  const diagnosticRunId = useRef(0)
  const diagnosticAbortRef = useRef<AbortController | null>(null)
  const [systemVariables, setSystemVariables] = useState<Record<string, any>>({
    "sy-subrc": 0,
    "sy-datum": new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    "sy-uzeit": new Date().toTimeString().slice(0, 8).replace(/:/g, ""),
    "sy-tabix": 0,
    "sy-index": 0,
    "sy-mandt": "100",
    "sy-uname": "DEVELOPER",
    "sy-dbcnt": 0,
  })

  // Table Data Preview State
  const [selectedTable, setSelectedTable] = useState<string>("KNA1")
  const [tablePreviewData, setTablePreviewData] = useState<{
    table_name: string
    description: string
    row_count: number
    columns: Array<{ name: string; type: string; key: boolean }>
    rows: Record<string, any>[]
  } | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingTables, setLoadingTables] = useState(false)

  // Modals & New File
  const [newFileModalOpen, setNewFileModalOpen] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileType, setNewFileType] = useState<"report" | "class" | "include">("report")

  // Refs
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [editorMounted, setEditorMounted] = useState(false)
  const pendingDiagnosticNavigation = useRef<{ file: string; line: number } | null>(null)

  // 1. Initial Load
  const loadProject = useCallback(async () => {
    if (!projectId) return
    try {
      const [projData, fileList, connList, exList] = await Promise.all([
        getABAPProject(projectId),
        getABAPSourceFiles(projectId),
        listSAPConnections(),
        listABAPExercises(),
      ])

      setProject(projData)
      setFiles(fileList)
      setConnections(connList)
      setExercises(exList)
      setExecutionMode(projData.execution_mode || "simulator")
      if (projData.sap_system_id) {
        setSelectedSapSystemId(projData.sap_system_id)
      }

      // Open first code file if available
      if (fileList.length > 0 && openTabs.length === 0) {
        const firstFile = fileList.find((f) => (f.object_type as string) !== "folder" && !f.name.endsWith("/.keep")) || fileList[0]
        if (firstFile && (firstFile.object_type as string) !== "folder") {
          setOpenTabs([
            {
              name: firstFile.name,
              content: firstFile.content || "",
              isDirty: false,
              objectType: firstFile.object_type,
            },
          ])
          setActiveTabName(firstFile.name)
        }
      }
    } catch (err: any) {
      console.error("Failed to load ABAP Project:", err)
      setOutputConsole(`[Error]: Unable to load project ${projectId}: ${getApiErrorMessage(err)}`)
    }
  }, [projectId])

  const loadCustomTables = useCallback(async () => {
    try {
      setLoadingTables(true)
      const tbls = await listABAPDictionaryTables()
      setCustomTables(tbls)
    } catch (e) {
      console.error("Failed to load dictionary tables:", e)
    } finally {
      setLoadingTables(false)
    }
  }, [])

  useEffect(() => {
    loadProject()
    loadCustomTables()
  }, [loadProject, loadCustomTables])

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewTableError(null)
    if (!newTableName.trim()) return
    if (!newTableFields.some((f) => f.key)) {
      const msg = "At least one key field is required to define a primary key."
      setNewTableError(msg)
      alert(msg)
      return
    }
    try {
      setCreatingTable(true)
      const cleanName = newTableName.trim().toUpperCase()
      const finalName = cleanName.startsWith("Z") || cleanName.startsWith("Y") ? cleanName : `Z${cleanName}`
      const created = await createABAPDictionaryTable({
        project_id: projectId,
        table_name: finalName,
        description: newTableDesc,
        delivery_class: newTableDeliveryClass,
        client_dependent: isClientDependent,
        fields_schema: newTableFields,
        sample_records: [],
      })
      setCustomTables((prev) => [created, ...prev.filter((t) => t.table_name !== created.table_name)])
      setNewTableModalOpen(false)
      setNewTableError(null)
      loadTablePreview(created.table_name)
      setBottomPanelTab("preview")
      setBottomPanelOpen(true)
    } catch (err: any) {
      const msg = getApiErrorMessage(err, "Failed to create table")
      setNewTableError(msg)
      alert(msg)
    } finally {
      setCreatingTable(false)
    }
  }

  const handleDeleteTable = async (tableId: string, tableName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Delete transparent table ${tableName}?`)) return
    try {
      await deleteABAPDictionaryTable(tableId)
      setCustomTables((prev) => prev.filter((t) => t.table_id !== tableId))
      if (selectedTable === tableName) {
        setSelectedTable("KNA1")
        loadTablePreview("KNA1")
      }
    } catch (err: any) {
      alert(getApiErrorMessage(err, "Failed to delete table"))
    }
  }

  const handleOpenAddRecord = (table: ApiABAPDictionaryTable, e: React.MouseEvent) => {
    e.stopPropagation()
    setTargetTableForRecord(table)
    const initialData: Record<string, any> = {}
    table.fields_schema.forEach((f) => {
      initialData[f.field] = f.field === "MANDT" ? "100" : ""
    })
    setRecordFormData(initialData)
    setAddRecordModalOpen(true)
  }

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetTableForRecord) return
    try {
      setSavingRecord(true)
      await addRecordToTable(targetTableForRecord.table_id, recordFormData)
      setAddRecordModalOpen(false)
      await loadCustomTables()
      loadTablePreview(targetTableForRecord.table_name)
      setBottomPanelTab("preview")
      setBottomPanelOpen(true)
    } catch (err: any) {
      alert(getApiErrorMessage(err, "Failed to add record"))
    } finally {
      setSavingRecord(false)
    }
  }

  // 2. Load Table Preview on selection
  const loadTablePreview = async (tableName: string) => {
    try {
      setLoadingPreview(true)
      setSelectedTable(tableName)
      const data = await previewTableData(tableName, projectId)
      setTablePreviewData(data)
    } catch (err) {
      console.error("Failed to load table preview:", err)
    } finally {
      setLoadingPreview(false)
    }
  }

  useEffect(() => {
    if (activeSidebarView === "dictionary" || bottomPanelTab === "preview") {
      loadTablePreview(selectedTable)
    }
  }, [activeSidebarView, bottomPanelTab])

  // 3. Tab Management
  const currentTab = openTabs.find((t) => t.name === activeTabName)

  useEffect(() => {
    const target = pendingDiagnosticNavigation.current
    if (!target || target.file !== activeTabName) return
    requestAnimationFrame(() => {
      editorRef.current?.setPosition({ lineNumber: target.line, column: 1 })
      editorRef.current?.revealLineInCenter(target.line)
      editorRef.current?.focus()
      pendingDiagnosticNavigation.current = null
    })
  }, [activeTabName])

  useEffect(() => {
    if (!currentTab) {
      setDiagnostics([])
      return
    }

    const knownTableNames = customTables.map((t) => t.table_name)
    const runId = ++diagnosticRunId.current

    // Debounce validation (300ms) to ensure clean editing experience without cascading false markers
    diagnosticAbortRef.current?.abort()
    const controller = new AbortController()
    diagnosticAbortRef.current = controller

    const timer = window.setTimeout(() => {
      if (runId !== diagnosticRunId.current) return

      // 1. Client-side AST diagnostics with @abaplint/core
      const localIssues = lintABAPCode(currentTab.content, currentTab.name, knownTableNames, { enforceNamingRulesAsErrors })
      if (runId !== diagnosticRunId.current) return
      setDiagnostics(localIssues)

      // 2. Secondary backend sandbox check
      checkABAPSyntax({ code: currentTab.content, execution_mode: executionMode }, controller.signal)
        .then((response) => {
          if (controller.signal.aborted || runId !== diagnosticRunId.current) return
          if (response.diagnostics && response.diagnostics.length > 0) {
            setDiagnostics((prev) => {
              const merged = [...prev]
              for (const bd of response.diagnostics) {
                // If not already detected locally, append backend diagnostic
                if (!merged.some((m) => m.line === bd.line && m.message === bd.message)) {
                  merged.push({
                    file: currentTab.name,
                    line: bd.line || 1,
                    column: bd.column || 1,
                    endLine: bd.line || 1,
                    endColumn: bd.endColumn || (bd.column || 1) + 1,
                    severity: bd.severity,
                    message: bd.message,
                    code: bd.code || (bd.severity === "info" ? "ABAP_SIMULATOR_LIMITATION" : "ABAP_SYNTAX_ERROR"),
                    category: bd.severity === "info" ? "ddic" : "syntax",
                    source: "SkilTrix ABAP Sandbox",
                  })
                }
              }
              return merged
            })
          }
        })
        .catch(() => {
          // Silent catch on background aborted requests
        })
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [currentTab?.name, currentTab?.content, executionMode, customTables])

  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    const model = editor?.getModel()
    if (!model || !monaco) return

    const markers = diagnostics
      .filter(
        (item): item is ABAPDiagnosticItem & { line: number } =>
          (!item.file || item.file === activeTabName) &&
          typeof item.line === "number" &&
          Number.isFinite(item.line) &&
          item.line > 0
      )
      .map((item) => {
        const line = Math.min(item.line, model.getLineCount())
        const lineContent = model.getLineContent(line)
        const startColumn = Math.max(1, Math.min(item.column || 1, lineContent.length + 1))
        return {
          startLineNumber: line,
          startColumn,
          endLineNumber: Math.min(item.endLine || line, model.getLineCount()),
          endColumn: Math.max(startColumn + 1, Math.min(item.endColumn || startColumn + 1, lineContent.length + 1)),
          message: `[${item.code}]: ${item.message}`,
          source: item.source || "SkilTrix ABAP Tooling",
          code: item.code,
          severity:
            item.severity === "error"
              ? monaco.MarkerSeverity.Error
              : item.severity === "warning"
              ? monaco.MarkerSeverity.Warning
              : monaco.MarkerSeverity.Info,
        }
      })

    monaco.editor.setModelMarkers(model, "abap-diagnostics", markers)
  }, [diagnostics, currentTab?.content, activeTabName, editorMounted])

  const handleSelectTab = (fileName: string) => {
    setActiveTabName(fileName)
  }

  const handleOpenFile = (file: ApiABAPSourceFile) => {
    const existing = openTabs.find((t) => t.name === file.name)
    if (existing) {
      setActiveTabName(file.name)
    } else {
      setOpenTabs((prev) => [
        ...prev,
        {
          name: file.name,
          content: file.content,
          isDirty: false,
          objectType: file.object_type,
        },
      ])
      setActiveTabName(file.name)
    }
  }

  const handleCloseTab = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const targetTab = openTabs.find((t) => t.name === fileName)
    if (targetTab?.isDirty) {
      const confirmed = window.confirm(`File "${fileName}" has unsaved changes. Do you want to close it and discard changes?`)
      if (!confirmed) return
    }
    const remaining = openTabs.filter((t) => t.name !== fileName)
    setOpenTabs(remaining)
    if (activeTabName === fileName) {
      if (remaining.length > 0) {
        setActiveTabName(remaining[remaining.length - 1].name)
      } else {
        setActiveTabName("")
      }
    }
  }

  const handleContentChange = (newContent: string | undefined) => {
    if (newContent === undefined || !activeTabName) return
    setDiagnostics([])
    setOpenTabs((prev) =>
      prev.map((t) => (t.name === activeTabName ? { ...t, content: newContent, isDirty: true } : t))
    )
  }

  // 4. Save & Activate (Ctrl+S)
  const handleSave = async () => {
    if (!projectId || !currentTab) return
    try {
      setIsSaving(true)
      await saveABAPFileContent(projectId, currentTab.name, currentTab.content, currentTab.objectType)
      setOpenTabs((prev) =>
        prev.map((t) => (t.name === activeTabName ? { ...t, isDirty: false } : t))
      )
      // Update in files list
      setFiles((prev) =>
        prev.map((f) => (f.name === currentTab.name ? { ...f, content: currentTab.content } : f))
      )
    } catch (err: any) {
      alert(getApiErrorMessage(err, "Save failed"))
    } finally {
      setIsSaving(false)
    }
  }

  // 5. Syntax Check (Ctrl+F2)
  const handleSyntaxCheck = async () => {
    if (!currentTab) return
    diagnosticAbortRef.current?.abort()
    const controller = new AbortController()
    diagnosticAbortRef.current = controller
    const runId = ++diagnosticRunId.current
    try {
      setIsCheckingSyntax(true)
      const knownTableNames = customTables.map((t) => t.table_name)
      const localIssues = lintABAPCode(currentTab.content, currentTab.name, knownTableNames, { enforceNamingRulesAsErrors })

      const res = await checkABAPSyntax(
        {
          code: currentTab.content,
          execution_mode: executionMode,
        },
        controller.signal
      )
      if (runId !== diagnosticRunId.current) return

      const combined = [...localIssues]
      if (res.diagnostics) {
        for (const bd of res.diagnostics) {
          if (!combined.some((d) => d.line === bd.line && d.message === bd.message)) {
            combined.push({
              file: currentTab.name,
              line: bd.line || 1,
              column: bd.column || 1,
              endLine: bd.line || 1,
              endColumn: bd.endColumn || (bd.column || 1) + 1,
              severity: bd.severity,
              message: bd.message,
              code: bd.code || (bd.severity === "info" ? "ABAP_SIMULATOR_LIMITATION" : "ABAP_SYNTAX_ERROR"),
              category: bd.severity === "info" ? "ddic" : "syntax",
              source: "SkilTrix ABAP Sandbox",
            })
          }
        }
      }

      setDiagnostics(combined)
      setBottomPanelTab("problems")
      setBottomPanelOpen(true)
      const errCount = combined.filter((d) => d.severity === "error").length
      if (errCount === 0) {
        setOutputConsole(
          (prev) =>
            `[Syntax Check]: Program ${currentTab.name} has 0 fatal syntax errors (${combined.length} lint notes).\n` +
            prev
        )
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setDiagnostics([
          {
            file: currentTab.name,
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: 10,
            severity: "warning",
            code: "ABAP_CHECK_FAILED",
            category: "syntax",
            source: "SkilTrix",
            message: err?.response?.data?.detail || err.message || "ABAP syntax check failed.",
          },
        ])
      }
    } finally {
      if (runId === diagnosticRunId.current) setIsCheckingSyntax(false)
    }
  }

  // 5b. Document Formatter (Shift+Alt+F)
  const handleFormatDocument = () => {
    if (!currentTab) return
    const formatted = formatABAPCode(currentTab.content, currentTab.name)
    if (formatted !== currentTab.content) {
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel()
        if (model) {
          const fullRange = model.getFullModelRange()
          editorRef.current.executeEdits("format-abap", [
            {
              range: fullRange,
              text: formatted,
              forceMoveMarkers: true,
            },
          ])
          handleContentChange(editorRef.current.getValue())
          return
        }
      }
      handleContentChange(formatted)
    }
  }

  // 5c. Apply Quick Fix
  const handleApplyQuickFix = (fix: NonNullable<ABAPDiagnosticItem["quickFix"]>) => {
    if (!currentTab || !editorRef.current || !monacoRef.current) return
    const editor = editorRef.current
    const model = editor.getModel()
    if (!model) return

    editor.executeEdits("quick-fix", [
      {
        range: new monacoRef.current.Range(
          fix.range.startLineNumber,
          fix.range.startColumn,
          fix.range.endLineNumber,
          fix.range.endColumn
        ),
        text: fix.newText,
        forceMoveMarkers: true,
      },
    ])
    handleContentChange(editor.getValue())
  }

  // 6. Execute Program (F8)
  // 6. Execute Program (F8)
  const handleExecute = async () => {
    if (!currentTab) return

    // Pre-flight check: validate syntax and prevent execution if blocking syntax errors exist
    const knownTableNames = customTables.map((t) => t.table_name)
    const localSyntaxIssues = lintABAPCode(currentTab.content, currentTab.name, knownTableNames, { enforceNamingRulesAsErrors })
    const blockingErrors = localSyntaxIssues.filter((d) => d.severity === "error")
    if (blockingErrors.length > 0) {
      setDiagnostics(localSyntaxIssues)
      setBottomPanelTab("problems")
      setBottomPanelOpen(true)
      setOutputConsole(
        `Compilation failed. Fix the ABAP syntax errors (${blockingErrors.length} error(s)) before running the program.\n\n` +
          blockingErrors.map((e) => `[Line ${e.line}]: ${e.message}`).join("\n")
      )
      return
    }

    try {
      setIsRunning(true)
      setBottomPanelTab("console")
      setBottomPanelOpen(true)

      // Auto-save before execute
      if (currentTab.isDirty) {
        await handleSave()
      }

      const startTime = performance.now()
      const result = await executeABAP({
        project_id: projectId,
        file_name: currentTab.name,
        code: currentTab.content,
        execution_mode: executionMode,
        sap_system_id: executionMode === "sap_connected" ? selectedSapSystemId : undefined,
      })
      const clientElapsed = Math.round(performance.now() - startTime)

      setExecutionResult(result)
      setOutputConsole(result.output || "(Program completed with no WRITE output)")

      // Keep existing source diagnostics and append any runtime diagnostics
      setDiagnostics((prev) => {
        const merged = [...prev.filter((d) => d.category !== "runtime")]
        if (result.diagnostics && result.diagnostics.length > 0) {
          for (const diagnostic of result.diagnostics) {
            const isSimulatorLimitation = /unsupported|not implemented|not supported/i.test(diagnostic.message)
            if (!merged.some((m) => m.line === diagnostic.line && m.message === diagnostic.message)) {
              merged.push({
                ...diagnostic,
                file: currentTab.name,
                line: diagnostic.line || 1,
                column: diagnostic.column || 1,
                endLine: diagnostic.endLine || diagnostic.line || 1,
                endColumn: diagnostic.endColumn || (diagnostic.column || 1) + 1,
                code: diagnostic.code || (isSimulatorLimitation ? "ABAP_SIMULATOR_LIMITATION" : "ABAP_RUNTIME_DIAGNOSTIC"),
                category: isSimulatorLimitation ? "simulator compatibility" : "runtime",
                severity: isSimulatorLimitation ? ("info" as const) : (diagnostic.severity || "error"),
                message: isSimulatorLimitation ? `Simulator limitation: ${diagnostic.message}` : diagnostic.message,
                source: "SkilTrix ABAP simulator",
              })
            }
          }
        }
        return merged
      })

      // Update system variables using genuine simulator state
      const simFields = result.system_fields || result.database_tables_state || {}
      const simSubrc = simFields["SY-SUBRC"] !== undefined ? simFields["SY-SUBRC"] : (result.status ? 0 : 4)
      const simDbcnt = simFields["SY-DBCNT"] !== undefined ? simFields["SY-DBCNT"] : 0
      setSystemVariables((prev) => ({
        ...prev,
        ...simFields,
        "sy-subrc": simSubrc,
        "sy-dbcnt": simDbcnt,
      }))
    } catch (err: any) {
      console.error("Execution failed:", err)
      setOutputConsole(`\n[RUNTIME ERROR]: ${getApiErrorMessage(err, "Execution failed.")}\n`)
    } finally {
      setIsRunning(false)
    }
  }

  // 7. Create New File
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !newFileName.trim()) return

    try {
      const created = await createABAPSourceFile(
        projectId,
        newFileName.trim(),
        newFileType,
        `*&---------------------------------------------------------------------*
*& Object: ${newFileName.trim()}
*&---------------------------------------------------------------------*
REPORT ${newFileName.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")}.

START-OF-SELECTION.
  WRITE: / 'Executing ${newFileName.trim()}...'.
`
      )
      setFiles((prev) => [...prev, created])
      handleOpenFile(created)
      setNewFileModalOpen(false)
      setNewFileName("")
    } catch (err: any) {
      alert(getApiErrorMessage(err, "Failed to create object"))
    }
  }

  // 8. Delete File
  const handleDeleteFile = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!projectId || !window.confirm(`Delete ABAP object ${fileName}?`)) return
    try {
      await deleteABAPSourceFile(projectId, fileName)
      setFiles((prev) => prev.filter((f) => f.name !== fileName))
      setOpenTabs((prev) => prev.filter((t) => t.name !== fileName))
      if (activeTabName === fileName) {
        setActiveTabName("")
      }
    } catch (err: any) {
      alert(getApiErrorMessage(err, "Failed to delete object"))
    }
  }

  // --- VS Code Explorer Handlers ---

  // Open file from explorer
  const handleOpenFileFromExplorer = async (path: string) => {
    const existing = openTabs.find((t) => t.name === path)
    if (existing) {
      setActiveTabName(path)
      return
    }
    const found = files.find((f) => f.name === path)
    if (found) {
      handleOpenFile(found)
      return
    }
    if (projectId) {
      try {
        const fetched = await getABAPFileContent(projectId, path)
        setOpenTabs((prev) => [
          ...prev,
          {
            name: fetched.name,
            content: fetched.content || "",
            isDirty: false,
            objectType: fetched.object_type,
          },
        ])
        setActiveTabName(fetched.name)
      } catch (err: any) {
        console.error("Failed to load file content:", err)
      }
    }
  }

  // Create file from explorer
  const handleCreateFileFromExplorer = async (path: string, objectType: string) => {
    if (!projectId) return
    const baseName = path.split("/").pop() || path
    const cleanId = baseName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9_]/g, "")
    const defaultContent = `*&---------------------------------------------------------------------*
*& Object: ${path}
*&---------------------------------------------------------------------*
REPORT ${cleanId || "zreport"}.

START-OF-SELECTION.
  WRITE: / 'Executing ${path}...'.
`
    const created = await createABAPSourceFile(projectId, path, objectType, defaultContent)
    const updated = await getABAPSourceFiles(projectId)
    setFiles(updated)
    const targetFile = updated.find((f) => f.name === created.name) || created
    handleOpenFile(targetFile)
  }

  // Create folder from explorer
  const handleCreateFolderFromExplorer = async (folderPath: string) => {
    if (!projectId) return
    await createABAPFolder(projectId, folderPath)
    const updated = await getABAPSourceFiles(projectId)
    setFiles(updated)
  }

  // Rename path
  const handleRenamePathFromExplorer = async (oldPath: string, newPath: string) => {
    if (!projectId) return
    const res = await renameABAPPath(projectId, oldPath, newPath)
    if (res.files) {
      setFiles(res.files)
    } else {
      const updated = await getABAPSourceFiles(projectId)
      setFiles(updated)
    }
    // Update open tabs
    setOpenTabs((prev) =>
      prev.map((tab) => {
        if (tab.name === oldPath) {
          return { ...tab, name: newPath }
        }
        if (tab.name.startsWith(oldPath + "/")) {
          return { ...tab, name: newPath + tab.name.slice(oldPath.length) }
        }
        return tab
      })
    )
    if (activeTabName === oldPath) {
      setActiveTabName(newPath)
    } else if (activeTabName.startsWith(oldPath + "/")) {
      setActiveTabName(newPath + activeTabName.slice(oldPath.length))
    }
  }

  // Move path
  const handleMovePathFromExplorer = async (sourcePath: string, targetFolder: string) => {
    if (!projectId) return
    const res = await moveABAPPath(projectId, sourcePath, targetFolder)
    if (res.files) {
      setFiles(res.files)
    } else {
      const updated = await getABAPSourceFiles(projectId)
      setFiles(updated)
    }
    const baseName = sourcePath.split("/").pop() || ""
    const destPath = targetFolder ? `${targetFolder}/${baseName}` : baseName

    setOpenTabs((prev) =>
      prev.map((tab) => {
        if (tab.name === sourcePath) {
          return { ...tab, name: destPath }
        }
        if (tab.name.startsWith(sourcePath + "/")) {
          return { ...tab, name: destPath + tab.name.slice(sourcePath.length) }
        }
        return tab
      })
    )
    if (activeTabName === sourcePath) {
      setActiveTabName(destPath)
    } else if (activeTabName.startsWith(sourcePath + "/")) {
      setActiveTabName(destPath + activeTabName.slice(sourcePath.length))
    }
  }

  // Duplicate file
  const handleDuplicateFileFromExplorer = async (sourcePath: string) => {
    if (!projectId) return
    const dup = await duplicateABAPFile(projectId, sourcePath)
    const updated = await getABAPSourceFiles(projectId)
    setFiles(updated)
    const targetFile = updated.find((f) => f.name === dup.name) || dup
    handleOpenFile(targetFile)
  }

  // Delete path
  const handleDeletePathFromExplorer = async (path: string) => {
    if (!projectId) return
    await deleteABAPSourceFile(projectId, path)
    const updated = await getABAPSourceFiles(projectId)
    setFiles(updated)
    // Close affected tabs
    setOpenTabs((prev) => {
      const remaining = prev.filter((t) => t.name !== path && !t.name.startsWith(path + "/"))
      if (activeTabName === path || activeTabName.startsWith(path + "/")) {
        if (remaining.length > 0) {
          setActiveTabName(remaining[remaining.length - 1].name)
        } else {
          setActiveTabName("")
        }
      }
      return remaining
    })
  }

  // Refresh explorer
  const handleRefreshExplorer = async () => {
    if (!projectId) return
    const updated = await getABAPSourceFiles(projectId)
    setFiles(updated)
  }

  // 9. Monaco Mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    setEditorMounted(true)

    // Register Monarch grammar & themes
    registerABAPLanguage(monaco)
    monaco.editor.setTheme(theme)

    // Keyboard Shortcuts
    // Ctrl+S: Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })
    // F8: Direct Run
    editor.addCommand(monaco.KeyCode.F8, () => {
      handleExecute()
    })
    // Ctrl+Enter: Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute()
    })
    // Ctrl+F2: Syntax Check
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.F2, () => {
      handleSyntaxCheck()
    })
    // Shift+Alt+F: Format Document
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      handleFormatDocument()
    })
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F8, () => {
      const model = editor.getModel()
      if (!model) return
      const markers = monaco.editor.getModelMarkers({ resource: model.uri }) as Array<{ startLineNumber: number; startColumn: number }>
      if (!markers.length) return
      const position = editor.getPosition()
      const next = markers.find((marker) => !position || marker.startLineNumber > position.lineNumber) || markers[0]
      editor.setPosition({ lineNumber: next.startLineNumber, column: next.startColumn })
      editor.revealLineInCenter(next.startLineNumber)
      editor.focus()
    })
  }

  // Update theme when state changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme)
    }
  }, [theme])

  // Standard SAP Transparent Tables for DDIC Preview
  const standardTables = [
    { name: "KNA1", desc: "General Customer Master", category: "Master Data" },
    { name: "VBAK", desc: "Sales Document Header", category: "Transaction Data" },
    { name: "VBAP", desc: "Sales Document Item", category: "Transaction Data" },
    { name: "MARA", desc: "General Material Master", category: "Master Data" },
    { name: "LFA1", desc: "Vendor Master Data", category: "Master Data" },
    { name: "MAKT", desc: "Material Descriptions", category: "Master Data" },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070e17] text-slate-200 select-none">
      {/* 1. LEFT ACTIVITY BAR (Slim SAP ADT Style) */}
      <div className="w-12 bg-[#050b12] border-r border-[#152538] flex flex-col items-center py-2.5 justify-between shrink-0 z-20">
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Back to ABAP Dashboard */}
          <Link
            to="/abap"
            title="Return to ABAP Lab Dashboard"
            className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-6 h-px bg-[#1a2f47]" />

          {/* Activity Icons */}
          <button
            onClick={() => {
              setActiveSidebarView("explorer")
              setSidebarOpen(true)
            }}
            title="Object Explorer (Source Files)"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeSidebarView === "explorer" && sidebarOpen
                ? "bg-[#183152] text-blue-400 border-l-2 border-blue-500 rounded-l-none"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#0f1f33]"
            }`}
          >
            <Folder className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSidebarView("dictionary")
              setSidebarOpen(true)
            }}
            title="SE11 ABAP Dictionary & Tables"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeSidebarView === "dictionary" && sidebarOpen
                ? "bg-[#183152] text-blue-400 border-l-2 border-blue-500 rounded-l-none"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#0f1f33]"
            }`}
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSidebarView("exercises")
              setSidebarOpen(true)
            }}
            title="ABAP Learning Repository (Question Bank)"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeSidebarView === "exercises" && sidebarOpen
                ? "bg-[#183152] text-blue-400 border-l-2 border-blue-500 rounded-l-none"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#0f1f33]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSidebarView("debugger")
              setSidebarOpen(true)
            }}
            title="ABAP Debugger & System Variables"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeSidebarView === "debugger" && sidebarOpen
                ? "bg-[#183152] text-blue-400 border-l-2 border-blue-500 rounded-l-none"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#0f1f33]"
            }`}
          >
            <Bug className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSidebarView("problems")
              setSidebarOpen(true)
            }}
            title={`Diagnostics & Problems (${diagnostics.length})`}
            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeSidebarView === "problems" && sidebarOpen
                ? "bg-[#183152] text-blue-400 border-l-2 border-blue-500 rounded-l-none"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#0f1f33]"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {diagnostics.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Bottom Activity Icons */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => {
              setActiveSidebarView("settings")
              setSidebarOpen(true)
            }}
            title="Studio Settings & System Connection"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeSidebarView === "settings" && sidebarOpen
                ? "bg-[#183152] text-blue-400"
                : "text-slate-400 hover:text-slate-100 hover:bg-[#0f1f33]"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. COLLAPSIBLE SIDE PANEL */}
      {sidebarOpen && (
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="relative bg-[#0a1523] border-r border-[#152538] flex flex-col shrink-0 overflow-hidden"
        >
          {/* Side Panel Header (Only shown for non-explorer views since explorer has its own toolbar) */}
          {activeSidebarView !== "explorer" && (
            <div className="h-10 px-3.5 border-b border-[#152538] flex items-center justify-between bg-[#08111d] shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                {activeSidebarView === "dictionary" && <Database className="w-3.5 h-3.5 text-cyan-400" />}
                {activeSidebarView === "exercises" && <BookOpen className="w-3.5 h-3.5 text-amber-400" />}
                {activeSidebarView === "debugger" && <Bug className="w-3.5 h-3.5 text-rose-400" />}
                {activeSidebarView === "problems" && <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />}
                {activeSidebarView === "settings" && <Settings className="w-3.5 h-3.5 text-slate-400" />}
                {activeSidebarView === "dictionary" && "SE11 Dictionary"}
                {activeSidebarView === "exercises" && "Repository"}
                {activeSidebarView === "debugger" && "Debugger"}
                {activeSidebarView === "problems" && "Problems"}
                {activeSidebarView === "settings" && "Studio Settings"}
              </span>

              <div className="flex items-center gap-1">
                {activeSidebarView === "dictionary" && (
                  <>
                    <button
                      onClick={() => loadCustomTables()}
                      disabled={loadingTables}
                      title="Refresh Dictionary Tables"
                      className="p-1 rounded hover:bg-[#15273e] text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingTables ? "animate-spin text-cyan-400" : ""}`} />
                    </button>
                    <button
                      onClick={openNewTableModal}
                      title="Create Custom Transparent Table (SE11)"
                      className="p-1 rounded hover:bg-[#15273e] text-cyan-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Hide Panel"
                  className="p-1 rounded hover:bg-[#15273e] text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Side Panel Body */}
          <div
            className={`flex-1 ${
              activeSidebarView === "explorer"
                ? "h-full overflow-hidden p-0 flex flex-col"
                : "overflow-y-auto p-2 text-xs"
            }`}
          >
            {/* VIEW A: OBJECT EXPLORER (VS Code-style) */}
            {activeSidebarView === "explorer" && (
              <ABAPFileExplorer
                files={files}
                projectName={project?.title || "ABAP_PROJECT"}
                packageName={project?.package_name || "$TMP"}
                activeFilePath={activeTabName}
                openFilePaths={openTabs.map((t) => t.name)}
                dirtyFilePaths={new Set(openTabs.filter((t) => t.isDirty).map((t) => t.name))}
                onOpenFile={handleOpenFileFromExplorer}
                onOpenToSide={handleOpenFileFromExplorer}
                onCreateFile={handleCreateFileFromExplorer}
                onCreateFolder={handleCreateFolderFromExplorer}
                onRenamePath={handleRenamePathFromExplorer}
                onMovePath={handleMovePathFromExplorer}
                onDuplicateFile={handleDuplicateFileFromExplorer}
                onDeletePath={handleDeletePathFromExplorer}
                onRefresh={handleRefreshExplorer}
                onCloseSidebar={() => setSidebarOpen(false)}
              />
            )}

            {/* VIEW B: SE11 DICTIONARY */}
            {activeSidebarView === "dictionary" && (
              <div className="space-y-4">
                {/* 1. Custom Database Tables (Z/Y) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      Custom Application Tables ({customTables.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadCustomTables()}
                        disabled={loadingTables}
                        title="Refresh Tables"
                        className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingTables ? "animate-spin text-cyan-400" : ""}`} />
                        <span>Refresh</span>
                      </button>
                      <button
                        onClick={openNewTableModal}
                        className="text-[10px] text-cyan-300 hover:text-white flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>New Table</span>
                      </button>
                    </div>
                  </div>

                  {customTables.length === 0 ? (
                    <div className="p-3 bg-[#0d1c2d] border border-[#182f47] rounded text-center">
                      <Table className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                      <p className="text-[11px] text-slate-400">No custom tables created yet.</p>
                      <button
                        onClick={openNewTableModal}
                        className="mt-2 text-[10px] px-2 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white rounded transition-colors"
                      >
                        + Create SE11 Table
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customTables.map((tbl) => {
                        const isSelected = selectedTable === tbl.table_name
                        const rowCount = Array.isArray(tbl.sample_records) ? tbl.sample_records.length : 0
                        return (
                          <div
                            key={tbl.table_id}
                            onClick={() => {
                              setSelectedTable(tbl.table_name)
                              setBottomPanelTab("preview")
                              setBottomPanelOpen(true)
                              loadTablePreview(tbl.table_name)
                            }}
                            className={`p-2.5 rounded cursor-pointer border transition-colors ${
                              isSelected
                                ? "bg-[#132c4a] border-cyan-500/70 text-white"
                                : "bg-[#0d1c2d] border-[#182f47] text-slate-300 hover:bg-[#11243a]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-300">{tbl.table_name}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#18314e] text-cyan-200">
                                  {rowCount} rows
                                </span>
                                <button
                                  onClick={(e) => handleDeleteTable(tbl.table_id, tbl.table_name, e)}
                                  title="Delete Table"
                                  className="p-1 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                              {tbl.description || "Transparent Database Table"}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-[#1a334d]">
                              <button
                                onClick={(e) => handleOpenAddRecord(tbl, e)}
                                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Row</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTable(tbl.table_name)
                                  setBottomPanelTab("preview")
                                  setBottomPanelOpen(true)
                                  loadTablePreview(tbl.table_name)
                                }}
                                title={`Refresh and preview ${tbl.table_name} data`}
                                className="flex items-center gap-1 text-cyan-300 hover:text-white transition-colors"
                              >
                                <RefreshCw className={`w-3 h-3 ${loadingPreview && selectedTable === tbl.table_name ? "animate-spin text-cyan-400" : ""}`} />
                                <span>Preview (SE16N)</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Standard Transparent Tables */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                    Standard SAP Tables ({standardTables.length})
                  </div>
                  <div className="space-y-1.5">
                    {standardTables.map((tbl) => (
                      <div
                        key={tbl.name}
                        onClick={() => {
                          setSelectedTable(tbl.name)
                          setBottomPanelTab("preview")
                          setBottomPanelOpen(true)
                          loadTablePreview(tbl.name)
                        }}
                        className={`p-2 rounded cursor-pointer border transition-colors ${
                          selectedTable === tbl.name
                            ? "bg-[#132c4a] border-blue-500/50 text-white"
                            : "bg-[#0d1c2d] border-[#182f47] text-slate-300 hover:bg-[#11243a]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-400">{tbl.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#18314e] text-slate-400">
                            {tbl.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tbl.desc}</div>
                        <div className="mt-1 flex items-center justify-between text-[10px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTable(tbl.name)
                              setBottomPanelTab("preview")
                              setBottomPanelOpen(true)
                              loadTablePreview(tbl.name)
                            }}
                            title={`Refresh and preview ${tbl.name} data`}
                            className="flex items-center gap-1 text-blue-300 hover:text-white transition-colors"
                          >
                            <RefreshCw className={`w-3 h-3 ${loadingPreview && selectedTable === tbl.name ? "animate-spin text-blue-400" : ""}`} />
                            <span>Preview (SE16N)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW C: EXERCISES REPOSITORY */}
            {activeSidebarView === "exercises" && (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 mb-1">Select an ABAP learning challenge:</div>
                {exercises.map((ex) => (
                  <div
                    key={ex.exercise_id}
                    className="p-2.5 rounded bg-[#0d1c2d] border border-[#182f47] hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{ex.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          ex.difficulty === "Easy"
                            ? "bg-emerald-950 text-emerald-400"
                            : ex.difficulty === "Medium"
                            ? "bg-amber-950 text-amber-400"
                            : "bg-rose-950 text-rose-400"
                        }`}
                      >
                        {ex.difficulty}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{ex.topic}</div>
                    <button
                      onClick={() => {
                        if (ex.starter_code && currentTab) {
                          if (window.confirm("Load exercise starter code into current editor?")) {
                            handleContentChange(ex.starter_code)
                          }
                        }
                      }}
                      className="mt-2 w-full py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[11px] font-medium transition-colors"
                    >
                      Load Exercise Code
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW D: DEBUGGER & SYSTEM VARIABLES */}
            {activeSidebarView === "debugger" && (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  SAP System Fields (SY-*)
                </div>
                <div className="bg-[#091421] border border-[#15293f] rounded p-2 divide-y divide-[#15293f]">
                  {Object.entries(systemVariables).map(([varName, val]) => (
                    <div key={varName} className="flex items-center justify-between py-1 text-[11px]">
                      <span className="font-mono text-cyan-400">{varName}</span>
                      <span className="font-mono text-amber-300 font-semibold">{String(val)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-4">
                  Execution Capabilities
                </div>
                <div className="p-2.5 rounded bg-[#0e1d2e] border border-[#1b3450] text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>AST Program Evaluator</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Open SQL Engine</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Standard/Sorted Tables</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>WRITE / ULINE List Output</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW E: PROBLEMS */}
            {activeSidebarView === "problems" && (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 mb-1">
                  Diagnostics ({diagnostics.length} issues found):
                </div>
                {diagnostics.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-[#09131e] rounded border border-[#152538]">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <span>No syntax problems detected.</span>
                  </div>
                ) : (
                  diagnostics.map((diag, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (editorRef.current && diag.line) {
                          editorRef.current.revealLineInCenter(diag.line)
                          editorRef.current.setPosition({ lineNumber: diag.line, column: 1 })
                        }
                      }}
                      className="p-2 bg-[#121c27] hover:bg-[#182838] border-l-2 border-red-500 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-red-400">Line {diag.line}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-red-950 text-red-300">
                          {diag.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 mt-0.5">{diag.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VIEW F: SETTINGS */}
            {activeSidebarView === "settings" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Execution Mode</label>
                  <select
                    value={executionMode}
                    onChange={(e) => setExecutionMode(e.target.value as any)}
                    className="w-full bg-[#112236] border border-[#1d3552] rounded px-2 py-1.5 text-xs text-white"
                  >
                    <option value="simulator">Mode B: Educational ABAP Simulator</option>
                    <option value="sap_connected">Mode A: Real SAP ADT Connected</option>
                  </select>
                </div>

                {executionMode === "sap_connected" && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target SAP System</label>
                    <select
                      value={selectedSapSystemId}
                      onChange={(e) => setSelectedSapSystemId(e.target.value)}
                      className="w-full bg-[#112236] border border-[#1d3552] rounded px-2 py-1.5 text-xs text-white"
                    >
                      <option value="">Select an SAP Connection...</option>
                      {connections.map((c) => (
                        <option key={c.connection_id} value={c.connection_id}>
                          {c.system_name} ({c.system_id} / Client {c.client})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Studio Editor Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="w-full bg-[#112236] border border-[#1d3552] rounded px-2 py-1.5 text-xs text-white"
                  >
                    <option value="sap-fiori-dark">SAP Fiori Dark</option>
                    <option value="vs-dark">VS Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-[#1d3552]">
                  <label className="text-[11px] text-slate-400 block mb-1">Naming Conventions Enforcement</label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={enforceNamingRulesAsErrors}
                      onChange={(e) => setEnforceNamingRulesAsErrors(e.target.checked)}
                      className="rounded border-[#1d3552] bg-[#112236] text-blue-500 focus:ring-0"
                    />
                    <span>Enforce naming rules as blocking errors</span>
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1">
                    When disabled (default), naming rules (e.g. local_class_naming) are reported as non-blocking style warnings.
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Resizable Sidebar Drag Handle */}
          <div
            onMouseDown={handleMouseDownSidebarResize}
            className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-500 transition-colors z-30"
            title="Drag to resize explorer panel"
          />
        </div>
      )}

      {/* 3. MAIN WORKSPACE (EDITOR + TOOLBAR + BOTTOM DRAWER) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP STATUS & CONTROL TOOLBAR */}
        <div className="h-12 bg-[#091421] border-b border-[#152538] flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span className="text-blue-500 font-extrabold">SAP</span>
              <span>ABAP Studio</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400 font-medium">{project?.title || "Z_ABAP_REPORT"}</span>

            {/* Execution Mode Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#112742] border border-blue-500/30 text-blue-300">
              <span className={`w-2 h-2 rounded-full ${executionMode === "simulator" ? "bg-emerald-400" : "bg-blue-400"} animate-pulse`} />
              <span>{executionMode === "simulator" ? "Simulator Mode (AST)" : "SAP Connected (ADT)"}</span>
            </div>
          </div>

          {/* Quick Actions (Run, Syntax Check, Format, Save) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatDocument}
              disabled={!currentTab}
              title="Format Document (Shift+Alt+F)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#122336] hover:bg-[#1a334d] text-slate-200 text-xs font-medium rounded border border-[#1e3b5e] transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Format (Shift+Alt+F)</span>
            </button>

            <button
              onClick={handleSyntaxCheck}
              disabled={isCheckingSyntax || !currentTab}
              title="Syntax Check (Ctrl+F2)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#122336] hover:bg-[#1a334d] text-slate-200 text-xs font-medium rounded border border-[#1e3b5e] transition-colors disabled:opacity-50"
            >
              <CheckCircle className={`w-3.5 h-3.5 text-cyan-400 ${isCheckingSyntax ? "animate-spin" : ""}`} />
              <span>Check (Ctrl+F2)</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !currentTab || !currentTab.isDirty}
              title="Save & Activate (Ctrl+S)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#122336] hover:bg-[#1a334d] text-slate-200 text-xs font-medium rounded border border-[#1e3b5e] transition-colors disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 text-blue-400 ${isSaving ? "animate-spin" : ""}`} />
              <span>Save (Ctrl+S)</span>
            </button>

            <button
              onClick={handleExecute}
              disabled={isRunning || !currentTab}
              title="Execute ABAP Program (F8)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running..." : "Direct Run (F8)"}</span>
            </button>
          </div>
        </div>

        {/* EDITOR TABS BAR */}
        <div className="h-9 bg-[#060c14] border-b border-[#142334] flex items-center px-2 overflow-x-auto no-scrollbar shrink-0 select-none">
          {openTabs.map((tab) => {
            const isActive = tab.name === activeTabName
            const displayName = tab.name.split("/").pop() || tab.name
            return (
              <div
                key={tab.name}
                onClick={() => handleSelectTab(tab.name)}
                title={tab.name}
                className={`group flex items-center gap-2 px-3 h-full border-r border-[#142334] text-xs cursor-pointer transition-colors max-w-xs ${
                  isActive
                    ? "bg-[#0b192c] text-blue-300 border-t-2 border-t-blue-500 font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#08121f]"
                }`}
              >
                <span className="shrink-0">{getABAPFileIcon(tab.name, tab.objectType)}</span>
                <span className="truncate max-w-[130px]">{displayName}</span>
                {tab.isDirty ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                ) : null}
                <button
                  onClick={(e) => handleCloseTab(tab.name, e)}
                  title="Close tab"
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-700/50 p-0.5 rounded text-slate-400 hover:text-white transition-opacity ml-1 shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>

        {/* MONACO CODE EDITOR CONTAINER */}
        <div className="flex-1 relative overflow-hidden bg-[#0b192c]">
          {currentTab ? (
            <Editor
              height="100%"
              language="abap"
              theme={theme}
              value={currentTab.content}
              onChange={handleContentChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                fontLigatures: true,
                minimap: { enabled: true },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                cursorBlinking: "smooth",
                folding: true,
                wordWrap: "off",
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <FileCode className="w-12 h-12 mb-2 text-slate-600" />
              <p className="text-sm font-medium">No ABAP object open in editor.</p>
              <p className="text-xs text-slate-600 mt-1">Select a report from Object Explorer or create a new one.</p>
            </div>
          )}
        </div>

        {/* 4. DOCKABLE BOTTOM DRAWER (Output / Problems / Data Preview / Internal Tables) */}
        {bottomPanelOpen && (
          <div
            style={{ height: `${bottomPanelHeight}px` }}
            className="border-t border-[#152538] bg-[#070e17] flex flex-col shrink-0 overflow-hidden"
          >
            {/* Drawer Tabs Bar */}
            <div className="h-8 bg-[#050c14] border-b border-[#142334] flex items-center justify-between px-2 shrink-0">
              <div className="flex items-center gap-1 h-full">
                <button
                  onClick={() => setBottomPanelTab("console")}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs font-semibold border-b-2 transition-colors ${
                    bottomPanelTab === "console"
                      ? "border-blue-500 text-blue-400 bg-[#091523]"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Output</span>
                </button>

                <button
                  onClick={() => setBottomPanelTab("problems")}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs font-semibold border-b-2 transition-colors ${
                    bottomPanelTab === "problems"
                      ? "border-blue-500 text-blue-400 bg-[#091523]"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Problems (
                    <span className="text-red-400 font-bold">{diagnostics.filter((item) => item.severity === "error").length}</span> E ·{" "}
                    <span className="text-amber-400 font-bold">{diagnostics.filter((item) => item.severity === "warning").length}</span> W)
                  </span>
                </button>

                <button
                  onClick={() => setBottomPanelTab("diagnostics")}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs font-semibold border-b-2 transition-colors ${
                    bottomPanelTab === "diagnostics"
                      ? "border-blue-500 text-blue-400 bg-[#091523]"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Diagnostics</span>
                </button>

                <button
                  onClick={() => setBottomPanelTab("preview")}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs font-semibold border-b-2 transition-colors ${
                    bottomPanelTab === "preview"
                      ? "border-blue-500 text-blue-400 bg-[#091523]"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Runtime Preview ({selectedTable})</span>
                </button>
              </div>

              {/* Panel Control Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomPanelHeight((prev) => (prev > 300 ? 180 : 380))}
                  title="Toggle Panel Height"
                  className="p-1 hover:bg-[#152538] text-slate-400 hover:text-white rounded"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setBottomPanelOpen(false)}
                  title="Minimize Panel"
                  className="p-1 hover:bg-[#152538] text-slate-400 hover:text-white rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-auto p-3 font-mono text-xs">
              {/* TAB 1: CONSOLE / ABAP LIST OUTPUT */}
              {bottomPanelTab === "console" && (
                <div className="space-y-1">
                  {executionResult && (
                    <div className="mb-2 pb-2 border-b border-[#1b2f47] text-[11px] text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${executionResult.status ? "text-emerald-400" : "text-red-400"}`}>
                          Status: {executionResult.status ? "Success" : "Failed"}
                        </span>
                        <span>Execution Time: {executionResult.execution_time_ms} ms</span>
                        <span>Mode: {executionResult.execution_mode}</span>
                      </div>
                      <span className="text-slate-500">Classic ABAP Spool / List Output</span>
                    </div>
                  )}
                  <pre className="text-slate-100 whitespace-pre-wrap leading-relaxed select-text">
                    {outputConsole || "Output terminal ready. Click 'Direct Run (F8)' to execute report."}
                  </pre>
                </div>
              )}

              {/* TAB 2: PROBLEMS */}
              {bottomPanelTab === "problems" && (
                <div className="space-y-2 font-sans">
                  <div className="flex items-center justify-between sticky top-0 bg-[#070e17] pb-2 border-b border-[#142334]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-semibold">Diagnostics:</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {diagnostics.filter((d) => d.severity === "error").length} Errors
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {diagnostics.filter((d) => d.severity === "warning").length} Warnings
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        {diagnostics.filter((d) => d.severity === "info").length} Info
                      </span>
                      {isCheckingSyntax && <span className="text-[11px] text-blue-400 animate-pulse">Checking…</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(["all", "error", "warning", "info"] as const).map((fil) => (
                        <button
                          key={fil}
                          onClick={() => setDiagnosticFilter(fil)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            diagnosticFilter === fil
                              ? "bg-blue-600 text-white"
                              : "bg-[#112236] text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {fil.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {diagnostics.filter((item) => diagnosticFilter === "all" || item.severity === diagnosticFilter).length === 0 ? (
                    <div className="text-slate-400 italic py-6 text-center">
                      ✓ No {diagnosticFilter === "all" ? "syntax errors or warnings" : `${diagnosticFilter}s`} found. Active code is clean!
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {diagnostics
                        .filter((item) => diagnosticFilter === "all" || item.severity === diagnosticFilter)
                        .map((d, i) => (
                          <div
                            key={`${d.file}:${d.line}:${d.code}:${i}`}
                            className="w-full flex items-start justify-between gap-3 text-left text-slate-200 hover:bg-[#10223a] rounded p-2 transition-colors border border-[#142334] hover:border-[#1d3a5e]"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (!d.line) return
                                const targetFile = d.file || activeTabName
                                pendingDiagnosticNavigation.current = { file: targetFile, line: d.line }
                                if (targetFile !== activeTabName) setActiveTabName(targetFile)
                                else {
                                  requestAnimationFrame(() => {
                                    editorRef.current?.setPosition({ lineNumber: d.line!, column: d.column || 1 })
                                    editorRef.current?.revealLineInCenter(d.line!)
                                    editorRef.current?.focus()
                                    pendingDiagnosticNavigation.current = null
                                  })
                                }
                              }}
                              className="flex items-start gap-2.5 text-left flex-1"
                            >
                              {d.severity === "error" ? (
                                <Bug className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                              ) : d.severity === "warning" ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : (
                                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {d.file && <span className="text-slate-400 text-[11px] font-mono">{d.file}</span>}
                                  <span
                                    className={`${
                                      d.severity === "error"
                                        ? "text-red-400 bg-red-500/10 border-red-500/30"
                                        : d.severity === "warning"
                                        ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
                                        : "text-sky-300 bg-sky-500/10 border-sky-500/30"
                                    } font-bold text-[11px] px-1.5 py-0.5 rounded border underline cursor-pointer`}
                                  >
                                    {d.line ? `Line ${d.line}:${d.column || 1}` : "File Scope"}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b1725] border border-[#1b2f47] text-slate-400 font-mono">
                                    {d.code || "ABAP"}
                                  </span>
                                  <span className="text-[10px] text-slate-500">[{d.source || "abaplint"}]</span>
                                </div>
                                <div className="text-slate-200 text-xs font-mono">{d.message}</div>
                              </div>
                            </button>

                            {d.quickFix && (
                              <button
                                type="button"
                                onClick={() => handleApplyQuickFix(d.quickFix!)}
                                title={d.quickFix.description}
                                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-medium transition-colors"
                              >
                                <Wrench className="w-3 h-3 text-cyan-300" />
                                <span>Quick Fix</span>
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DIAGNOSTICS & AST RULES */}
              {bottomPanelTab === "diagnostics" && (
                <div className="space-y-3 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-[#0b1725] border border-[#182f47] rounded p-2.5">
                      <div className="text-slate-400 text-[11px] mb-1">Language Dialect</div>
                      <div className="text-blue-400 font-bold">ABAP Standard (Modern & Classic)</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">@abaplint/core v2.120 + AST Engine</div>
                    </div>
                    <div className="bg-[#0b1725] border border-[#182f47] rounded p-2.5">
                      <div className="text-slate-400 text-[11px] mb-1">Syntax Validation</div>
                      <div className="text-emerald-400 font-bold">Active (Real-time debounced)</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Zero-latency Client + Sandbox</div>
                    </div>
                    <div className="bg-[#0b1725] border border-[#182f47] rounded p-2.5">
                      <div className="text-slate-400 text-[11px] mb-1">Active DDIC Catalog</div>
                      <div className="text-amber-400 font-bold">{customTables.length + 13} Registered Tables</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">ZEMPDETAILS, KNA1, VBAK, MARA...</div>
                    </div>
                    <div className="bg-[#0b1725] border border-[#182f47] rounded p-2.5">
                      <div className="text-slate-400 text-[11px] mb-1">Execution Mode</div>
                      <div className="text-purple-400 font-bold">
                        {executionMode === "simulator" ? "Simulator (In-memory DB)" : "SAP Connected (ADT/RFC)"}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Isolated Security Sandbox</div>
                    </div>
                  </div>

                  <div className="bg-[#0b1725] border border-[#182f47] rounded p-3 text-xs">
                    <div className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
                      <span>Supported Parser Rules & Engine Capabilities</span>
                      <span className="text-[11px] text-slate-400">Shortcut: Shift+Alt+F to format</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-300 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Space normalization (lv_count = 10)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Open SQL (INSERT, SELECT, COMMIT)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Block folding (IF, LOOP, CLASS, METHOD)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Statement terminator check ('.')
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Internal tables (APPEND, READ, LOOP)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> SE11 Transparent table resolution
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SE16N DATABASE PREVIEW */}
              {bottomPanelTab === "preview" && (
                <div className="space-y-2">
                  {loadingPreview ? (
                    <div className="flex items-center gap-2 text-slate-400 py-4">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Loading transparent table records for {selectedTable}...</span>
                    </div>
                  ) : tablePreviewData ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans font-bold text-slate-200 text-xs">
                          Table: <span className="text-blue-400">{tablePreviewData.table_name}</span> ({tablePreviewData.description}) - {tablePreviewData.row_count} rows
                        </span>
                        <button
                          onClick={() => loadTablePreview(selectedTable)}
                          disabled={loadingPreview}
                          title="Refresh Table Records (SE16N)"
                          className="px-2.5 py-1 bg-[#132338] hover:bg-[#1a3350] text-slate-300 hover:text-white text-[11px] rounded border border-[#203a5c] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? "animate-spin text-cyan-400" : ""}`} />
                          <span>Refresh Table</span>
                        </button>
                      </div>
                      <div className="overflow-x-auto border border-[#1b2f47] rounded">
                        <table className="w-full text-left text-[11px] divide-y divide-[#1b2f47]">
                          <thead className="bg-[#0b1725] text-slate-400">
                            <tr>
                              {tablePreviewData.columns.map((col) => (
                                <th key={col.name} className="px-3 py-1.5 font-semibold">
                                  {col.name} {col.key && <span className="text-amber-400 text-[9px]">[KEY]</span>}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#132336] bg-[#070f1a] text-slate-300">
                            {tablePreviewData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-[#0d1e32]">
                                {tablePreviewData.columns.map((col) => (
                                  <td key={col.name} className="px-3 py-1 font-mono whitespace-nowrap">
                                    {String(row[col.name] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 text-slate-400 bg-[#0d1c2d] border border-[#182f47] rounded">
                      <span>Select a table from the SE11 Dictionary view to preview.</span>
                      {selectedTable && (
                        <button
                          onClick={() => loadTablePreview(selectedTable)}
                          disabled={loadingPreview}
                          className="px-2.5 py-1 bg-[#132338] hover:bg-[#1a3350] text-slate-300 hover:text-white text-[11px] rounded border border-[#203a5c] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? "animate-spin text-cyan-400" : ""}`} />
                          <span>Refresh {selectedTable}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NEW OBJECT MODAL */}
      {newFileModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#1d3552] rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Create New ABAP Object</span>
            </h3>

            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Object Name (e.g. z_sales_report)</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="z_report_01"
                  className="w-full bg-[#070e17] border border-[#1a334f] rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ABAP Object Type</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value as any)}
                  className="w-full bg-[#070e17] border border-[#1a334f] rounded px-3 py-2 text-xs text-white"
                >
                  <option value="report">Executable Program (Report .prog.abap)</option>
                  <option value="class">ABAP OO Class (.clas.abap)</option>
                  <option value="include">Include Program (.incl.abap)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#182e47]">
                <button
                  type="button"
                  onClick={() => setNewFileModalOpen(false)}
                  className="px-3 py-1.5 bg-[#122336] hover:bg-[#1a334d] text-slate-300 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded"
                >
                  Create Object
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW SE11 TRANSPARENT TABLE MODAL */}
      {newTableModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#1d3552] rounded-xl max-w-2xl w-full p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#182e47]">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Create SE11 Transparent Table</span>
              </h3>
              <button
                onClick={closeNewTableModal}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4 pt-3 overflow-y-auto pr-1 flex-1">
              {newTableError && (
                <div className="p-2.5 bg-red-950/60 border border-red-500/60 rounded-md text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{newTableError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Table Name (must begin with Z or Y)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value.toUpperCase())}
                    placeholder="ZCUSTOMERS"
                    className="w-full bg-[#070e17] border border-[#1a334f] rounded px-3 py-2 text-xs text-white placeholder-slate-600 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Delivery Class</label>
                  <select
                    value={newTableDeliveryClass}
                    onChange={(e) => setNewTableDeliveryClass(e.target.value)}
                    className="w-full bg-[#070e17] border border-[#1a334f] rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="A">A - Application table (Master and Transaction Data)</option>
                    <option value="C">C - Customizing table (Maintenance only by customer)</option>
                    <option value="L">L - Table for storing temporary data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={newTableDesc}
                  onChange={(e) => setNewTableDesc(e.target.value)}
                  placeholder="Custom Customer Master Table"
                  className="w-full bg-[#070e17] border border-[#1a334f] rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 p-2 bg-[#070e17] border border-[#1a334f] rounded">
                <input
                  type="checkbox"
                  id="clientDependentToggle"
                  checked={isClientDependent}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setIsClientDependent(checked)
                    if (checked) {
                      if (!newTableFields.some((f) => f.field === "MANDT")) {
                        setNewTableFields((prev) => [
                          { field: "MANDT", key: true, type: "CLNT", length: 3, description: "Client Number" },
                          ...prev,
                        ])
                      }
                    } else {
                      setNewTableFields((prev) => prev.filter((f) => f.field !== "MANDT"))
                    }
                  }}
                  className="rounded border-[#1a334f] text-cyan-600 focus:ring-cyan-500 bg-[#0a1626]"
                />
                <label htmlFor="clientDependentToggle" className="text-xs text-slate-300 cursor-pointer">
                  Client-specific table (automatically manage client field <span className="font-mono text-cyan-400">MANDT</span>)
                </label>
              </div>

              {/* Fields Schema Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Table Fields Definition ({newTableFields.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewTableFields((prev) => [
                        ...prev,
                        {
                          field: `FIELD_${prev.length + 1}`,
                          key: false,
                          type: "CHAR",
                          length: 20,
                          description: "New Field",
                        },
                      ])
                    }
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="border border-[#182e47] rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#071321] text-slate-400 text-[11px]">
                      <tr>
                        <th className="px-2.5 py-1.5 font-semibold">Field Name</th>
                        <th className="px-2 py-1.5 font-semibold text-center">Key</th>
                        <th className="px-2 py-1.5 font-semibold">Data Type</th>
                        <th className="px-2 py-1.5 font-semibold">Length</th>
                        <th className="px-2 py-1.5 font-semibold">Description</th>
                        <th className="px-2 py-1.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#132336] bg-[#070e17] text-slate-200">
                      {newTableFields.map((f, fIdx) => (
                        <tr key={fIdx} className="hover:bg-[#0c1827]">
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={f.field}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase()
                                setNewTableFields((prev) =>
                                  prev.map((item, idx) => (idx === fIdx ? { ...item, field: val } : item))
                                )
                              }}
                              className="w-24 bg-[#0a1626] border border-[#1a334f] rounded px-1.5 py-1 text-xs text-white font-mono uppercase"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={f.key}
                              onChange={(e) => {
                                const chk = e.target.checked
                                setNewTableFields((prev) =>
                                  prev.map((item, idx) => (idx === fIdx ? { ...item, key: chk } : item))
                                )
                              }}
                              className="rounded border-[#1a334f]"
                            />
                          </td>
                          <td className="p-1.5">
                            <select
                              value={f.type}
                              onChange={(e) => {
                                const t = e.target.value
                                setNewTableFields((prev) =>
                                  prev.map((item, idx) => (idx === fIdx ? { ...item, type: t, length: t === "STRING" ? 0 : (item.length || 10) } : item))
                                )
                              }}
                              className="bg-[#0a1626] border border-[#1a334f] rounded px-1.5 py-1 text-xs text-white"
                            >
                              <option value="CHAR">CHAR</option>
                              <option value="NUMC">NUMC</option>
                              <option value="DATS">DATS</option>
                              <option value="CURR">CURR</option>
                              <option value="INT4">INT4</option>
                              <option value="CLNT">CLNT</option>
                              <option value="STRING">STRING</option>
                            </select>
                          </td>
                          <td className="p-1.5">
                            {f.type === "STRING" ? (
                              <input
                                type="text"
                                disabled
                                value="N/A"
                                title="STRING data type has variable length in SAP ABAP"
                                className="w-14 bg-[#0a1626]/50 border border-[#1a334f] rounded px-1.5 py-1 text-xs text-slate-500 cursor-not-allowed text-center select-none"
                              />
                            ) : (
                              <input
                                type="number"
                                value={f.length}
                                onChange={(e) => {
                                  const num = parseInt(e.target.value) || 1
                                  setNewTableFields((prev) =>
                                    prev.map((item, idx) => (idx === fIdx ? { ...item, length: num } : item))
                                  )
                                }}
                                className="w-14 bg-[#0a1626] border border-[#1a334f] rounded px-1.5 py-1 text-xs text-white"
                              />
                            )}
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={f.description}
                              onChange={(e) => {
                                const d = e.target.value
                                setNewTableFields((prev) =>
                                  prev.map((item, idx) => (idx === fIdx ? { ...item, description: d } : item))
                                )
                              }}
                              className="w-full bg-[#0a1626] border border-[#1a334f] rounded px-1.5 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setNewTableFields((prev) => prev.filter((_, idx) => idx !== fIdx))
                              }
                              className="p-1 hover:text-red-400 text-slate-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#182e47]">
                <button
                  type="button"
                  onClick={closeNewTableModal}
                  className="px-3.5 py-1.5 bg-[#122336] hover:bg-[#1a334d] text-slate-300 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTable}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded transition-all disabled:opacity-50"
                >
                  {creatingTable ? "Creating Table..." : "Create & Activate Table (SE11)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DATA ROW MODAL (SE16N) */}
      {addRecordModalOpen && targetTableForRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-[#1d3552] rounded-xl max-w-lg w-full p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#182e47]">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Insert Row into {targetTableForRecord.table_name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{targetTableForRecord.description}</p>
              </div>
              <button
                onClick={() => setAddRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3 pt-3 overflow-y-auto pr-1 flex-1">
              {targetTableForRecord.fields_schema.map((f) => (
                <div key={f.field}>
                  <label className="text-xs text-slate-300 flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-cyan-300">{f.field}</span>
                    {f.key && <span className="text-[10px] text-amber-400 font-bold">[KEY]</span>}
                    <span className="text-[10px] text-slate-500">
                      ({f.type} {f.length}) {f.description}
                    </span>
                  </label>
                  <input
                    type="text"
                    required={f.key}
                    value={recordFormData[f.field] ?? ""}
                    onChange={(e) =>
                      setRecordFormData((prev) => ({
                        ...prev,
                        [f.field]: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${f.field}...`}
                    className="w-full bg-[#070e17] border border-[#1a334f] rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#182e47]">
                <button
                  type="button"
                  onClick={() => setAddRecordModalOpen(false)}
                  className="px-3.5 py-1.5 bg-[#122336] hover:bg-[#1a334d] text-slate-300 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-all disabled:opacity-50"
                >
                  {savingRecord ? "Saving..." : "Save Record (SE16N)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

