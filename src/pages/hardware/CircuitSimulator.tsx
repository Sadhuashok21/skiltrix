import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import Editor from "@monaco-editor/react"
import {
  Play,
  Pause,
  Square,
  RotateCw,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Save,
  Upload,
  Download,
  Search,
  Cpu,
  Code2,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Moon,
  ArrowLeft,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react"
import {
  COMPONENT_LIBRARY,
  DEFAULT_BLINK_CIRCUIT,
  PRESET_CIRCUITS,
  getCatalogItem,
} from "../../simulator/componentLibrary"
import {
  getPinWorldPosition,
  computeOrthogonalWirePoints,
  pointsToSvgPath,
  solveElectricalCircuit,
  type McuOutputState,
} from "../../simulator/electricalEngine"
import {
  compileArduinoSketch,
  ArduinoSimulatorRuntime,
} from "../../simulator/arduinoRuntime"
import ComponentRenderer from "../../simulator/ComponentRenderer"
import type {
  PlacedComponent,
  WireConnection,
  ComponentCategory,
  CompilerDiagnostic,
  CircuitProjectSchema,
} from "../../simulator/types"
import { getHardwareProject, updateHardwareProject } from "../../api/hardware"

const WIRE_COLORS = [
  { name: "Proteus Green", value: "#15803d" },
  { name: "Signal Red", value: "#dc2626" },
  { name: "Ground Black", value: "#1e293b" },
  { name: "Logic Blue", value: "#2563eb" },
  { name: "Analog Amber", value: "#d97706" },
  { name: "I2C Purple", value: "#7c3aed" },
]

const STORAGE_KEY_PREFIX = "skiltrix_circuit_sim_v1_"

export default function CircuitSimulator() {
  const { projectId } = useParams<{ projectId?: string }>()
  const storageKey = `${STORAGE_KEY_PREFIX}${projectId || "local_workspace"}`

  // Workspace state
  const [projectName, setProjectName] = useState<string>(DEFAULT_BLINK_CIRCUIT.name)
  const [components, setComponents] = useState<PlacedComponent[]>(DEFAULT_BLINK_CIRCUIT.components)
  const [wires, setWires] = useState<WireConnection[]>(DEFAULT_BLINK_CIRCUIT.wires)
  const [code, setCode] = useState<string>(DEFAULT_BLINK_CIRCUIT.code)
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Saved")

  // Undo / Redo history
  const [history, setHistory] = useState<
    Array<{ components: PlacedComponent[]; wires: WireConnection[] }>
  >([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)

  // Selection & Interaction state
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>("comp_uno_1")
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null)
  const [activeWireColor, setActiveWireColor] = useState<string>("#15803d")

  // Wire drawing state
  const [drawingWire, setDrawingWire] = useState<{
    fromComponentId: string
    fromPinId: string
    cursorX: number
    cursorY: number
  } | null>(null)
  const [hoveredPin, setHoveredPin] = useState<{
    componentId: string
    pinId: string
    label: string
    type: string
  } | null>(null)

  // Dragging component state
  const [draggingComp, setDraggingComp] = useState<{
    id: string
    offsetX: number
    offsetY: number
  } | null>(null)

  // Canvas Viewport (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 20 })
  const [isPanning, setIsPanning] = useState<boolean>(false)
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  })
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Theme (Proteus Schematic Beige vs Dark CAD)
  const [schematicLightMode, setSchematicLightMode] = useState<boolean>(true)

  // Component Library Filter
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | "all">("all")

  // Bottom Panel Tabs (Code, Serial Monitor, Serial Plotter, Diagnostics)
  const [bottomPanelOpen, setBottomPanelOpen] = useState<boolean>(true)
  const [bottomTab, setBottomTab] = useState<"code" | "serial" | "plotter" | "diagnostics">("code")

  // Simulation Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [simTimeMs, setSimTimeMs] = useState<number>(0)
  const [compilerDiagnostics, setCompilerDiagnostics] = useState<CompilerDiagnostic[]>([])
  const [serialLogs, setSerialLogs] = useState<Array<{ timestamp: string; text: string }>>([])
  const [plotterData, setPlotterData] = useState<number[]>([])

  // Mutable MCU output state & runtime references for real-time simulation loop
  const createEmptyMcuState = (): McuOutputState => ({
    pinModes: {},
    digitalOutputs: {},
    pwmOutputs: {},
    servoAngles: {},
    toneFrequencies: {},
    lcdState: {
      lines: ["                ", "                "],
      backlight: true,
    },
  })

  const [mcuStateVersion, setMcuStateVersion] = useState<number>(0)
  const mcuStateRef = useRef<McuOutputState>(createEmptyMcuState())
  const runtimeRef = useRef<ArduinoSimulatorRuntime | null>(null)
  const simTimeRef = useRef<number>(0)
  const nextStepAtMsRef = useRef<number>(0)
  const componentsRef = useRef<PlacedComponent[]>(components)
  const mcuPinInputsRef = useRef<
    Record<string, { digital: 0 | 1; analogAdc: number; voltage: number }>
  >({})

  useEffect(() => {
    componentsRef.current = components
  }, [components])

  // Solve electrical circuit whenever components, wires, or MCU outputs change
  const solverResult = useMemo(() => {
    return solveElectricalCircuit(components, wires, mcuStateRef.current, isRunning)
  }, [components, wires, isRunning, mcuStateVersion])

  useEffect(() => {
    mcuPinInputsRef.current = solverResult.mcuPinInputs
  }, [solverResult])

  // Record history snapshot helper
  const pushHistory = useCallback(
    (nextComponents: PlacedComponent[], nextWires: WireConnection[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1)
        return [...sliced.slice(-29), { components: nextComponents, wires: nextWires }]
      })
      setHistoryIndex((prev) => Math.min(29, prev + 1))
    },
    [historyIndex]
  )

  // Load saved circuit from localStorage or backend project on mount
  useEffect(() => {
    let loaded = false
    try {
      const savedRaw = localStorage.getItem(storageKey)
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as CircuitProjectSchema
        if (parsed && Array.isArray(parsed.components) && Array.isArray(parsed.wires)) {
          setProjectName(parsed.name || DEFAULT_BLINK_CIRCUIT.name)
          setComponents(parsed.components)
          setWires(parsed.wires)
          setCode(parsed.code || DEFAULT_BLINK_CIRCUIT.code)
          setHistory([{ components: parsed.components, wires: parsed.wires }])
          setHistoryIndex(0)
          loaded = true
        }
      }
    } catch (e) {
      console.warn("Failed to restore local circuit:", e)
    }

    if (projectId) {
      getHardwareProject(projectId)
        .then((proj) => {
          const savedCircuit = proj.build_settings?.circuit_schema as
            | CircuitProjectSchema
            | undefined
          if (savedCircuit && Array.isArray(savedCircuit.components)) {
            setProjectName(savedCircuit.name || proj.title)
            setComponents(savedCircuit.components)
            setWires(savedCircuit.wires || [])
            setCode(savedCircuit.code || DEFAULT_BLINK_CIRCUIT.code)
          } else if (!loaded) {
            setProjectName(`${proj.title} - Circuit Simulator`)
          }
        })
        .catch(() => {
          // Offline / local fallback works without backend
        })
    } else if (!loaded) {
      setHistory([{ components: DEFAULT_BLINK_CIRCUIT.components, wires: DEFAULT_BLINK_CIRCUIT.wires }])
      setHistoryIndex(0)
    }
  }, [projectId, storageKey])

  // Autosave to localStorage on change
  useEffect(() => {
    setAutoSaveStatus("Saving...")
    const timer = setTimeout(() => {
      const payload: CircuitProjectSchema = {
        schemaVersion: "1.0.0",
        projectId: projectId || "local_workspace",
        name: projectName,
        boardType: "arduino_uno",
        components,
        wires,
        code,
        updatedAt: new Date().toISOString(),
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(payload))
        setAutoSaveStatus("Autosaved")
      } catch {
        setAutoSaveStatus("Local")
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [projectName, components, wires, code, projectId, storageKey])

  // Save to cloud + localStorage explicitly
  const handleSaveProject = async () => {
    const payload: CircuitProjectSchema = {
      schemaVersion: "1.0.0",
      projectId: projectId || "local_workspace",
      name: projectName,
      boardType: "arduino_uno",
      components,
      wires,
      code,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(storageKey, JSON.stringify(payload))
    if (projectId) {
      try {
        await updateHardwareProject(projectId, {
          title: projectName,
          build_settings: { circuit_schema: payload },
        } as any)
        setAutoSaveStatus("Synced to Cloud")
      } catch {
        setAutoSaveStatus("Saved Locally")
      }
    } else {
      setAutoSaveStatus("Saved Locally")
    }
  }

  // Simulation Animation Loop
  useEffect(() => {
    if (!isRunning || isPaused) return

    const tickIntervalMs = 25
    const interval = setInterval(() => {
      simTimeRef.current += tickIntervalMs
      setSimTimeMs(simTimeRef.current)

      if (runtimeRef.current && simTimeRef.current >= nextStepAtMsRef.current) {
        try {
          const waitMs = runtimeRef.current.step()
          nextStepAtMsRef.current = simTimeRef.current + waitMs
        } catch (err: any) {
          console.error("Simulation runtime error:", err)
          setIsRunning(false)
        }
      }
    }, tickIntervalMs)

    return () => clearInterval(interval)
  }, [isRunning, isPaused])

  // Compile and Start Simulation
  const handleStartSimulation = () => {
    if (isRunning && isPaused) {
      setIsPaused(false)
      return
    }

    const res = compileArduinoSketch(code)
    setCompilerDiagnostics(res.diagnostics)

    if (!res.success || !res.transpiledCode) {
      setBottomPanelOpen(true)
      setBottomTab("diagnostics")
      return
    }

    // Reset MCU state & timers
    const freshMcu = createEmptyMcuState()
    mcuStateRef.current = freshMcu
    simTimeRef.current = 0
    nextStepAtMsRef.current = 0
    setSimTimeMs(0)
    setSerialLogs([])
    setPlotterData([])

    const rt = new ArduinoSimulatorRuntime(freshMcu, {
      onSerialPrint: (text) => {
        const ts = (simTimeRef.current / 1000).toFixed(2) + "s"
        setSerialLogs((prev) => [...prev.slice(-199), { timestamp: ts, text }])
        const num = Number(text.trim())
        if (!Number.isNaN(num) && text.trim() !== "") {
          setPlotterData((prev) => [...prev.slice(-99), num])
        }
      },
      onStateUpdated: () => {
        setMcuStateVersion((v) => v + 1)
      },
      getPinInput: (pinId) => {
        return mcuPinInputsRef.current[pinId] || { digital: 0, analogAdc: 0, voltage: 0 }
      },
      getComponents: () => componentsRef.current,
      getSimTimeMs: () => simTimeRef.current,
    })

    try {
      rt.initialize(res.transpiledCode)
      runtimeRef.current = rt
      setIsRunning(true)
      setIsPaused(false)
      // Execute initial step immediately so setup() and first loop instructions take effect at t=0
      const firstDelay = rt.step()
      nextStepAtMsRef.current = firstDelay
      setMcuStateVersion((v) => v + 1)
    } catch (err: any) {
      setCompilerDiagnostics([
        {
          line: 1,
          column: 1,
          severity: "error",
          message: `Runtime initialization error: ${err?.message || "Invalid C/C++ expression"}`,
        },
      ])
      setBottomPanelOpen(true)
      setBottomTab("diagnostics")
    }
  }

  const handlePauseSimulation = () => {
    if (!isRunning) return
    setIsPaused((prev) => !prev)
  }

  const handleStopSimulation = () => {
    setIsRunning(false)
    setIsPaused(false)
    runtimeRef.current = null
    mcuStateRef.current = createEmptyMcuState()
    setMcuStateVersion((v) => v + 1)
  }

  // Convert client mouse coordinates to SVG world coordinates
  const clientToWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 }
      const rect = svgRef.current.getBoundingClientRect()
      const x = (clientX - rect.left - pan.x) / zoom
      const y = (clientY - rect.top - pan.y) / zoom
      return { x: Math.round(x), y: Math.round(y) }
    },
    [pan, zoom]
  )

  // Add component from library
  const handleAddComponent = (type: string, customX?: number, customY?: number) => {
    const cat = getCatalogItem(type)
    if (!cat) return

    const existingCount = components.filter((c) => c.type === type).length
    const designator = `${cat.prefix}${existingCount + 1}`
    const newComp: PlacedComponent = {
      id: `comp_${type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
      type,
      designator,
      x: customX ?? Math.round((280 - pan.x) / zoom / 10) * 10,
      y: customY ?? Math.round((160 - pan.y) / zoom / 10) * 10,
      rotation: 0,
      properties: { ...cat.defaultProperties },
    }

    const nextComponents = [...components, newComp]
    setComponents(nextComponents)
    setSelectedComponentId(newComp.id)
    setSelectedWireId(null)
    pushHistory(nextComponents, wires)
  }

  // Interactive toggle during simulation (e.g., clicking pushbutton or switch)
  const handleToggleInteractive = (componentId: string, key: string, nextValue: any) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === componentId ? { ...c, properties: { ...c.properties, [key]: nextValue } } : c
      )
    )
    setMcuStateVersion((v) => v + 1)
  }

  // Pin click handler for wire creation
  const handlePinClick = (e: React.MouseEvent, componentId: string, pinId: string) => {
    e.stopPropagation()
    const comp = components.find((c) => c.id === componentId)
    const cat = comp ? getCatalogItem(comp.type) : undefined
    const pin = cat?.pins.find((p) => p.id === pinId)
    if (!comp || !pin) return

    const worldPos = getPinWorldPosition(comp, pin)

    if (!drawingWire) {
      setDrawingWire({
        fromComponentId: componentId,
        fromPinId: pinId,
        cursorX: worldPos.x,
        cursorY: worldPos.y,
      })
      setSelectedComponentId(null)
      setSelectedWireId(null)
    } else {
      // Complete wire if clicking a different pin
      if (
        drawingWire.fromComponentId === componentId &&
        drawingWire.fromPinId === pinId
      ) {
        setDrawingWire(null)
        return
      }

      const exists = wires.some(
        (w) =>
          (w.fromComponentId === drawingWire.fromComponentId &&
            w.fromPinId === drawingWire.fromPinId &&
            w.toComponentId === componentId &&
            w.toPinId === pinId) ||
          (w.fromComponentId === componentId &&
            w.fromPinId === pinId &&
            w.toComponentId === drawingWire.fromComponentId &&
            w.toPinId === drawingWire.fromPinId)
      )

      if (!exists) {
        const newWire: WireConnection = {
          id: `wire_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
          fromComponentId: drawingWire.fromComponentId,
          fromPinId: drawingWire.fromPinId,
          toComponentId: componentId,
          toPinId: pinId,
          color: activeWireColor,
        }
        const nextWires = [...wires, newWire]
        setWires(nextWires)
        setSelectedWireId(newWire.id)
        pushHistory(components, nextWires)
      }
      setDrawingWire(null)
    }
  }

  // Rotate / Duplicate / Delete selected item
  const handleRotateSelected = () => {
    if (!selectedComponentId) return
    const next = components.map((c) =>
      c.id === selectedComponentId
        ? { ...c, rotation: (((c.rotation + 90) % 360) as 0 | 90 | 180 | 270) }
        : c
    )
    setComponents(next)
    pushHistory(next, wires)
  }

  const handleDuplicateSelected = () => {
    if (!selectedComponentId) return
    const orig = components.find((c) => c.id === selectedComponentId)
    if (!orig) return
    const cat = getCatalogItem(orig.type)
    const count = components.filter((c) => c.type === orig.type).length
    const copy: PlacedComponent = {
      ...orig,
      id: `comp_${orig.type}_${Date.now().toString(36)}`,
      designator: `${cat?.prefix || "U"}${count + 1}`,
      x: orig.x + 40,
      y: orig.y + 40,
      properties: { ...orig.properties },
    }
    const next = [...components, copy]
    setComponents(next)
    setSelectedComponentId(copy.id)
    pushHistory(next, wires)
  }

  const handleDeleteSelected = useCallback(() => {
    if (selectedWireId) {
      const nextWires = wires.filter((w) => w.id !== selectedWireId)
      setWires(nextWires)
      setSelectedWireId(null)
      pushHistory(components, nextWires)
    } else if (selectedComponentId) {
      const nextComponents = components.filter((c) => c.id !== selectedComponentId)
      const nextWires = wires.filter(
        (w) =>
          w.fromComponentId !== selectedComponentId &&
          w.toComponentId !== selectedComponentId
      )
      setComponents(nextComponents)
      setWires(nextWires)
      setSelectedComponentId(null)
      pushHistory(nextComponents, nextWires)
    }
  }, [selectedWireId, selectedComponentId, wires, components, pushHistory])

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    if (prev) {
      setComponents(prev.components)
      setWires(prev.wires)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    if (next) {
      setComponents(next.components)
      setWires(next.wires)
      setHistoryIndex(historyIndex + 1)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "Escape") {
        setDrawingWire(null)
      } else if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        handleRedo()
      } else if (e.key.toLowerCase() === "r" && selectedComponentId) {
        handleRotateSelected()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleDeleteSelected, selectedComponentId, historyIndex, history])

  // Export / Import JSON circuit file
  const handleExportJson = () => {
    const payload: CircuitProjectSchema = {
      schemaVersion: "1.0.0",
      projectId: projectId || "exported_circuit",
      name: projectName,
      boardType: "arduino_uno",
      components,
      wires,
      code,
      updatedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName.replace(/\s+/g, "_").toLowerCase()}.circuit.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as CircuitProjectSchema
        if (parsed && Array.isArray(parsed.components) && Array.isArray(parsed.wires)) {
          handleStopSimulation()
          setProjectName(parsed.name || "Imported Circuit")
          setComponents(parsed.components)
          setWires(parsed.wires)
          if (parsed.code) setCode(parsed.code)
          pushHistory(parsed.components, parsed.wires)
        }
      } catch {
        alert("Invalid circuit JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const handleLoadPreset = (presetKey: string) => {
    handleStopSimulation()
    if (presetKey === "empty") {
      setProjectName("Untitled Circuit")
      setComponents([])
      setWires([])
      pushHistory([], [])
      return
    }
    const preset = PRESET_CIRCUITS[presetKey]
    if (!preset) return
    setProjectName(preset.name)
    setComponents(JSON.parse(JSON.stringify(preset.components)))
    setWires(JSON.parse(JSON.stringify(preset.wires)))
    setCode(preset.code)
    pushHistory(preset.components, preset.wires)
  }

  const selectedComponent = components.find((c) => c.id === selectedComponentId) || null
  const selectedCatalog = selectedComponent ? getCatalogItem(selectedComponent.type) : undefined
  const selectedWire = wires.find((w) => w.id === selectedWireId) || null

  const filteredCatalog = COMPONENT_LIBRARY.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* ====================================================================
          TOP TOOLBAR (Proteus / Tinkercad Circuits Style)
         ==================================================================== */}
      <header className="h-13 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Navigation & Project Title */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/hardware"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Back to Hardware Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded px-2.5 py-1 text-xs font-bold text-white w-56 focus:outline-none"
            />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              {autoSaveStatus}
            </span>
          </div>

          {/* Preset Circuit Loader */}
          <select
            onChange={(e) => {
              if (e.target.value) handleLoadPreset(e.target.value)
            }}
            defaultValue="blink_d13"
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
            title="Load Reference Circuit Preset"
          >
            <option value="blink_d13">Preset: Uno D13 LED + 220Ω (Reference)</option>
            <option value="button_input">Preset: Pushbutton Input D2 + LED D13</option>
            <option value="potentiometer_pwm">Preset: Potentiometer A0 + PWM + LCD</option>
            <option value="empty">Clear / Blank Schematic</option>
          </select>
        </div>

        {/* Center: Simulation Transport Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          <button
            onClick={handleStartSimulation}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold transition shadow ${
              isRunning && !isPaused
                ? "bg-emerald-500 text-slate-950"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning && isPaused ? "Resume" : isRunning ? "Running" : "Start Simulation"}
          </button>

          <button
            onClick={handlePauseSimulation}
            disabled={!isRunning}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              isPaused
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
            }`}
            title="Pause / Resume Simulation"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>

          <button
            onClick={handleStopSimulation}
            disabled={!isRunning}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-600/90 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-medium transition"
            title="Stop Simulation"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>

          <div className="pl-2 ml-1 border-l border-slate-800 font-mono text-[11px] text-slate-300 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning && !isPaused
                  ? "bg-emerald-400 animate-ping"
                  : isPaused
                  ? "bg-amber-400"
                  : "bg-slate-600"
              }`}
            />
            <span>{(simTimeMs / 1000).toFixed(2)}s</span>
          </div>
        </div>

        {/* Right: CAD Editing Tools (Undo, Redo, Rotate, Duplicate, Delete, Zoom, Save) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleRotateSelected}
            disabled={!selectedComponentId}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded transition"
            title="Rotate 90° (R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDuplicateSelected}
            disabled={!selectedComponentId}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded transition"
            title="Duplicate Component"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedComponentId && !selectedWireId}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 disabled:opacity-30 rounded transition"
            title="Delete Selected (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.15).toFixed(2))))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1)
              setPan({ x: 40, y: 20 })
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSchematicLightMode(!schematicLightMode)}
            className="p-1.5 text-amber-400 hover:bg-slate-800 rounded transition"
            title="Toggle Proteus Beige / Dark Blueprint Grid"
          >
            {schematicLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleSaveProject}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
            title="Save Circuit & Code"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={handleExportJson}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Export Circuit JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <label
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            title="Import Circuit JSON"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </header>

      {/* ====================================================================
          MAIN WORKSPACE (Left Component Library + Center Canvas + Right Inspector)
         ==================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Proteus DEVICES list + Searchable Component Library */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
          {/* Proteus-style Placed DEVICES Quick Selector */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
              <span>Placed Devices ({components.length})</span>
              <span>Schematic</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-0.5 pr-1">
              {components.map((c) => {
                const cat = getCatalogItem(c.type)
                const isSel = c.id === selectedComponentId
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedComponentId(c.id)
                      setSelectedWireId(null)
                    }}
                    className={`px-2 py-1 rounded text-xs font-mono cursor-pointer flex items-center justify-between ${
                      isSel
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{c.designator}</span>
                    <span className="text-[10px] opacity-80 truncate max-w-[120px]">
                      {cat?.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="p-2.5 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "microcontrollers", label: "MCUs" },
                  { id: "basic", label: "Basic" },
                  { id: "sensors", label: "Sensors" },
                  { id: "outputs", label: "Outputs" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    selectedCategory === tab.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Draggable & Clickable Component Catalog */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredCatalog.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/skiltrix-component", item.type)
                }}
                onClick={() => handleAddComponent(item.type)}
                className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 cursor-grab active:cursor-grabbing transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    +{item.prefix}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER: Interactive Circuit Canvas + Bottom Code Editor Dock */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Electrical Warnings / Active Wire Drawing Banner */}
          {(drawingWire || solverResult.warnings.length > 0) && (
            <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-1.5 pointer-events-none">
              {drawingWire && (
                <div className="self-center bg-indigo-950/95 border border-indigo-500 text-indigo-200 px-4 py-1.5 rounded-full text-xs font-medium shadow-lg pointer-events-auto flex items-center gap-3">
                  <span>
                    Wiring from <b>{drawingWire.fromPinId}</b> — Click any destination pin to connect
                  </span>
                  <button
                    onClick={() => setDrawingWire(null)}
                    className="px-2 py-0.5 bg-indigo-800 hover:bg-indigo-700 rounded text-[10px]"
                  >
                    Cancel (Esc)
                  </button>
                </div>
              )}

              {solverResult.warnings.map((w) => (
                <div
                  key={w.id}
                  className={`self-center px-4 py-1.5 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2 border ${
                    w.severity === "error"
                      ? "bg-rose-950/95 border-rose-500 text-rose-200"
                      : "bg-amber-950/95 border-amber-500 text-amber-200"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hovered Pin Tooltip */}
          {hoveredPin && (
            <div className="absolute top-3 right-3 z-20 bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg pointer-events-none flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{hoveredPin.label}</span>
              <span className="text-slate-400">({hoveredPin.type})</span>
              {solverResult.pinStates[`${hoveredPin.componentId}:${hoveredPin.pinId}`] && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                  {solverResult.pinStates[
                    `${hoveredPin.componentId}:${hoveredPin.pinId}`
                  ].voltage.toFixed(2)}
                  V
                </span>
              )}
            </div>
          )}

          {/* Interactive SVG Schematic Canvas */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              backgroundColor: schematicLightMode ? "#ebe6d8" : "#0b1120",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const type = e.dataTransfer.getData("application/skiltrix-component")
              if (type) {
                const pos = clientToWorld(e.clientX, e.clientY)
                handleAddComponent(
                  type,
                  Math.round((pos.x - 40) / 10) * 10,
                  Math.round((pos.y - 40) / 10) * 10
                )
              }
            }}
          >
            <svg
              ref={svgRef}
              className="w-full h-full cursor-crosshair"
              onWheel={(e) => {
                e.preventDefault()
                const delta = e.deltaY < 0 ? 0.1 : -0.1
                setZoom((z) => Math.max(0.4, Math.min(2.2, Number((z + delta).toFixed(2)))))
              }}
              onMouseDown={(e) => {
                if (e.button === 1 || (e.button === 0 && e.target === svgRef.current)) {
                  setSelectedComponentId(null)
                  setSelectedWireId(null)
                  setIsPanning(true)
                  panStartRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    panX: pan.x,
                    panY: pan.y,
                  }
                }
              }}
              onMouseMove={(e) => {
                const world = clientToWorld(e.clientX, e.clientY)
                if (drawingWire) {
                  setDrawingWire((prev) =>
                    prev ? { ...prev, cursorX: world.x, cursorY: world.y } : null
                  )
                }
                if (draggingComp) {
                  const snappedX = Math.round((world.x - draggingComp.offsetX) / 10) * 10
                  const snappedY = Math.round((world.y - draggingComp.offsetY) / 10) * 10
                  setComponents((prev) =>
                    prev.map((c) =>
                      c.id === draggingComp.id ? { ...c, x: snappedX, y: snappedY } : c
                    )
                  )
                } else if (isPanning) {
                  setPan({
                    x: panStartRef.current.panX + (e.clientX - panStartRef.current.x),
                    y: panStartRef.current.panY + (e.clientY - panStartRef.current.y),
                  })
                }
              }}
              onMouseUp={() => {
                if (draggingComp) {
                  pushHistory(components, wires)
                  setDraggingComp(null)
                }
                setIsPanning(false)
              }}
            >
              <defs>
                <pattern
                  id="minorGrid"
                  width={20 * zoom}
                  height={20 * zoom}
                  patternUnits="userSpaceOnUse"
                  x={pan.x}
                  y={pan.y}
                >
                  <path
                    d={`M ${20 * zoom} 0 L 0 0 0 ${20 * zoom}`}
                    fill="none"
                    stroke={schematicLightMode ? "#d6cfc2" : "#1e293b"}
                    strokeWidth={0.8}
                  />
                </pattern>
                <pattern
                  id="majorGrid"
                  width={100 * zoom}
                  height={100 * zoom}
                  patternUnits="userSpaceOnUse"
                  x={pan.x}
                  y={pan.y}
                >
                  <rect width={100 * zoom} height={100 * zoom} fill="url(#minorGrid)" />
                  <path
                    d={`M ${100 * zoom} 0 L 0 0 0 ${100 * zoom}`}
                    fill="none"
                    stroke={schematicLightMode ? "#bfb6a4" : "#334155"}
                    strokeWidth={1.2}
                  />
                </pattern>
              </defs>

              {/* Background Schematic Grid */}
              <rect width="100%" height="100%" fill="url(#majorGrid)" />

              {/* Viewport Transform Group */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Proteus Schematic Sheet Frame */}
                <rect
                  x={40}
                  y={20}
                  width={1100}
                  height={680}
                  fill="none"
                  stroke={schematicLightMode ? "#3b82f6" : "#1d4ed8"}
                  strokeWidth={1.5}
                  opacity={0.6}
                />

                {/* 1. Render Completed Orthogonal Wires */}
                {wires.map((w) => {
                  const c1 = components.find((c) => c.id === w.fromComponentId)
                  const c2 = components.find((c) => c.id === w.toComponentId)
                  if (!c1 || !c2) return null
                  const cat1 = getCatalogItem(c1.type)
                  const cat2 = getCatalogItem(c2.type)
                  const pin1 = cat1?.pins.find((p) => p.id === w.fromPinId)
                  const pin2 = cat2?.pins.find((p) => p.id === w.toPinId)
                  if (!pin1 || !pin2) return null

                  const p1 = getPinWorldPosition(c1, pin1)
                  const p2 = getPinWorldPosition(c2, pin2)
                  const pts = computeOrthogonalWirePoints(p1, p2)
                  const pathD = pointsToSvgPath(pts)
                  const isSel = w.id === selectedWireId

                  const pinState = solverResult.pinStates[`${w.fromComponentId}:${w.fromPinId}`]
                  const isEnergized = isRunning && (pinState?.voltage ?? 0) > 2.0

                  return (
                    <g
                      key={w.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedWireId(w.id)
                        setSelectedComponentId(null)
                      }}
                      className="cursor-pointer"
                    >
                      {/* Wide invisible click hit target */}
                      <path d={pathD} fill="none" stroke="transparent" strokeWidth={12} />
                      {isSel && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth={6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={0.5}
                        />
                      )}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={w.color || "#15803d"}
                        strokeWidth={isSel ? 3.2 : 2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Animated current flow dots when wire is HIGH during simulation */}
                      {isEnergized && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#facc15"
                          strokeWidth={1.6}
                          strokeDasharray="4 8"
                        />
                      )}
                      {/* Connection terminal dots */}
                      <circle cx={p1.x} cy={p1.y} r={3} fill={w.color || "#15803d"} />
                      <circle cx={p2.x} cy={p2.y} r={3} fill={w.color || "#15803d"} />
                    </g>
                  )
                })}

                {/* 2. Render Active Wire Preview While Drawing */}
                {drawingWire &&
                  (() => {
                    const c1 = components.find((c) => c.id === drawingWire.fromComponentId)
                    const cat1 = c1 ? getCatalogItem(c1.type) : undefined
                    const pin1 = cat1?.pins.find((p) => p.id === drawingWire.fromPinId)
                    if (!c1 || !pin1) return null
                    const p1 = getPinWorldPosition(c1, pin1)
                    const pts = computeOrthogonalWirePoints(p1, {
                      x: drawingWire.cursorX,
                      y: drawingWire.cursorY,
                      leadDirection: "none",
                    })
                    return (
                      <path
                        d={pointsToSvgPath(pts)}
                        fill="none"
                        stroke={activeWireColor}
                        strokeWidth={2.2}
                        strokeDasharray="5 4"
                        pointerEvents="none"
                      />
                    )
                  })()}

                {/* 3. Render Placed Components & Interactive Pin Terminals */}
                {components.map((comp) => {
                  const cat = getCatalogItem(comp.type)
                  if (!cat) return null
                  const isSel = comp.id === selectedComponentId
                  const cx = cat.width / 2
                  const cy = cat.height / 2

                  return (
                    <g key={comp.id}>
                      {/* Component Body with Position & Rotation */}
                      <g
                        transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation}, ${cx}, ${cy})`}
                        onMouseDown={(e) => {
                          if (e.button !== 0) return
                          e.stopPropagation()
                          setSelectedComponentId(comp.id)
                          setSelectedWireId(null)
                          const world = clientToWorld(e.clientX, e.clientY)
                          setDraggingComp({
                            id: comp.id,
                            offsetX: world.x - comp.x,
                            offsetY: world.y - comp.y,
                          })
                        }}
                        style={{ cursor: draggingComp?.id === comp.id ? "grabbing" : "grab" }}
                      >
                        {/* Selection Highlight Box */}
                        {isSel && (
                          <rect
                            x={-6}
                            y={-6}
                            width={cat.width + 12}
                            height={cat.height + 12}
                            rx={8}
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth={1.8}
                            strokeDasharray="4 3"
                          />
                        )}

                        <ComponentRenderer
                          component={comp}
                          runtimeState={solverResult.componentStates[comp.id]}
                          pinStates={solverResult.pinStates}
                          isSelected={isSel}
                          isSimulationRunning={isRunning}
                          onToggleInteractive={handleToggleInteractive}
                        />
                      </g>

                      {/* Interactive Electrical Pin Connection Points (in World Coordinates) */}
                      {cat.pins.map((pin) => {
                        const worldPin = getPinWorldPosition(comp, pin)
                        const isPinHovered =
                          hoveredPin?.componentId === comp.id && hoveredPin?.pinId === pin.id
                        const isWireStart =
                          drawingWire?.fromComponentId === comp.id &&
                          drawingWire?.fromPinId === pin.id
                        const pState = solverResult.pinStates[`${comp.id}:${pin.id}`]

                        // Proteus Logic Probe Color (Red = HIGH, Blue = LOW, Grey = Float)
                        let probeFill = "#ffffff"
                        if (isRunning && pState) {
                          probeFill =
                            pState.voltage >= 2.5
                              ? "#ef4444"
                              : pState.voltage <= 0.4
                              ? "#3b82f6"
                              : "#facc15"
                        }

                        return (
                          <g
                            key={`pin_${comp.id}_${pin.id}`}
                            transform={`translate(${worldPin.x}, ${worldPin.y})`}
                            onMouseEnter={() =>
                              setHoveredPin({
                                componentId: comp.id,
                                pinId: pin.id,
                                label: `${comp.designator}.${pin.label}`,
                                type: pin.type,
                              })
                            }
                            onMouseLeave={() => setHoveredPin(null)}
                            onMouseDown={(e) => handlePinClick(e, comp.id, pin.id)}
                            className="cursor-pointer"
                          >
                            {/* Invisible larger target for easy clicking */}
                            <circle r={8} fill="transparent" />
                            <circle
                              r={isPinHovered || isWireStart ? 5.5 : 3.5}
                              fill={isPinHovered || isWireStart ? "#22c55e" : probeFill}
                              stroke="#7f1d1d"
                              strokeWidth={1.5}
                            />
                          </g>
                        )
                      })}
                    </g>
                  )
                })}
              </g>
            </svg>

            {/* Bottom-Left Proteus-Style Status & Transport Bar Overlay */}
            <div className="absolute bottom-2.5 left-3 z-20 flex items-center gap-2 bg-slate-900/95 border border-slate-700 rounded-lg px-3 py-1 shadow-lg text-xs">
              <button
                onClick={handleStartSimulation}
                className={`p-1 rounded ${
                  isRunning && !isPaused ? "text-emerald-400" : "text-slate-300 hover:text-white"
                }`}
                title="Run"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                onClick={handlePauseSimulation}
                disabled={!isRunning}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-40"
                title="Pause"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStopSimulation}
                disabled={!isRunning}
                className="p-1 text-slate-300 hover:text-rose-400 disabled:opacity-40"
                title="Stop"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
              <span className="text-[11px] font-mono text-slate-400 pl-2 border-l border-slate-700">
                {isRunning
                  ? isPaused
                    ? `PAUSED @ ${(simTimeMs / 1000).toFixed(2)}s`
                    : `ANIMATING @ ${(simTimeMs / 1000).toFixed(2)}s`
                  : "ROOT - Sheet 1 (Ready)"}
              </span>
            </div>
          </div>

          {/* ================================================================
              BOTTOM PANEL: Arduino Code Editor, Serial Monitor, Plotter, Errors
             ================================================================ */}
          <div
            className={`bg-slate-900 border-t border-slate-800 flex flex-col transition-all duration-150 z-20 ${
              bottomPanelOpen ? "h-68" : "h-9"
            }`}
          >
            {/* Bottom Panel Header Tabs */}
            <div className="h-9 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setBottomTab("code")
                    setBottomPanelOpen(true)
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                    bottomTab === "code" && bottomPanelOpen
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Arduino C/C++ Code Editor
                </button>

                <button
                  onClick={() => {
                    setBottomTab("serial")
                    setBottomPanelOpen(true)
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                    bottomTab === "serial" && bottomPanelOpen
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Serial Monitor ({serialLogs.length})
                </button>

                <button
                  onClick={() => {
                    setBottomTab("plotter")
                    setBottomPanelOpen(true)
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                    bottomTab === "plotter" && bottomPanelOpen
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Serial Plotter
                </button>

                <button
                  onClick={() => {
                    setBottomTab("diagnostics")
                    setBottomPanelOpen(true)
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                    bottomTab === "diagnostics" && bottomPanelOpen
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <AlertTriangle
                    className={`w-3.5 h-3.5 ${
                      compilerDiagnostics.length > 0 ? "text-rose-400" : "text-slate-400"
                    }`}
                  />
                  Diagnostics ({compilerDiagnostics.length + solverResult.warnings.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartSimulation}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Compile &amp; Run
                </button>
                <button
                  onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  {bottomPanelOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Panel Content */}
            {bottomPanelOpen && (
              <div className="flex-1 overflow-hidden">
                {bottomTab === "code" && (
                  <Editor
                    height="100%"
                    language="cpp"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val ?? "")}
                    options={{
                      fontSize: 12.5,
                      fontFamily: "Fira Code, Consolas, monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbers: "on",
                      tabSize: 4,
                    }}
                  />
                )}

                {bottomTab === "serial" && (
                  <div className="h-full bg-slate-950 p-3 font-mono text-xs overflow-y-auto space-y-1 select-text">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                      <span>Arduino Serial Output (9600 baud)</span>
                      <button
                        onClick={() => setSerialLogs([])}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                      >
                        Clear Output
                      </button>
                    </div>
                    {serialLogs.length === 0 ? (
                      <div className="text-slate-500 py-6 text-center">
                        No serial output yet. Use <code>Serial.println(...)</code> and start the simulation.
                      </div>
                    ) : (
                      serialLogs.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-emerald-300">
                          <span className="text-slate-500">[{item.timestamp}]</span>
                          <span>{item.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {bottomTab === "plotter" && (
                  <div className="h-full bg-slate-950 p-3 flex flex-col">
                    <div className="text-[11px] text-slate-400 mb-2 flex justify-between">
                      <span>Real-Time Numeric Waveform Plotter (from Serial.println)</span>
                      <span className="font-mono text-amber-400">
                        Latest: {plotterData.length > 0 ? plotterData[plotterData.length - 1] : "—"}
                      </span>
                    </div>
                    <div className="flex-1 border border-slate-800 rounded bg-slate-900/50 relative overflow-hidden">
                      {plotterData.length < 2 ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                          Print numeric values via <code>Serial.println(value)</code> to plot live waveforms.
                        </div>
                      ) : (
                        <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                          {(() => {
                            const minVal = Math.min(0, ...plotterData)
                            const maxVal = Math.max(1, ...plotterData)
                            const span = maxVal - minVal || 1
                            const pts = plotterData
                              .map((v, i) => {
                                const x = (i / Math.max(1, plotterData.length - 1)) * 590 + 5
                                const y = 130 - ((v - minVal) / span) * 120
                                return `${x},${y}`
                              })
                              .join(" ")
                            return (
                              <polyline
                                fill="none"
                                stroke="#facc15"
                                strokeWidth={2}
                                points={pts}
                              />
                            )
                          })()}
                        </svg>
                      )}
                    </div>
                  </div>
                )}

                {bottomTab === "diagnostics" && (
                  <div className="h-full bg-slate-950 p-3 overflow-y-auto space-y-2 text-xs font-mono">
                    {compilerDiagnostics.length === 0 && solverResult.warnings.length === 0 ? (
                      <div className="flex items-center gap-2 text-emerald-400 py-4">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>No syntax errors or electrical rule violations detected.</span>
                      </div>
                    ) : (
                      <>
                        {compilerDiagnostics.map((d, i) => (
                          <div
                            key={`diag_${i}`}
                            className="p-2 rounded bg-rose-950/50 border border-rose-800 text-rose-200 flex items-center justify-between"
                          >
                            <span>
                              <b>Line {d.line}:</b> {d.message}
                            </span>
                            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-rose-900">
                              {d.severity}
                            </span>
                          </div>
                        ))}
                        {solverResult.warnings.map((w) => (
                          <div
                            key={w.id}
                            className="p-2 rounded bg-amber-950/50 border border-amber-800 text-amber-200"
                          >
                            [Electrical Check] {w.message}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            RIGHT SIDEBAR: Component Properties & Live Electrical Telemetry
           ================================================================== */}
        <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 overflow-y-auto p-3.5 space-y-4">
          {/* Wire Color Palette */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Wire Color
            </span>
            <div className="flex items-center gap-1.5">
              {WIRE_COLORS.map((wc) => (
                <button
                  key={wc.value}
                  onClick={() => {
                    setActiveWireColor(wc.value)
                    if (selectedWireId) {
                      setWires((prev) =>
                        prev.map((w) =>
                          w.id === selectedWireId ? { ...w, color: wc.value } : w
                        )
                      )
                    }
                  }}
                  style={{ backgroundColor: wc.value }}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    activeWireColor === wc.value
                      ? "border-white scale-110"
                      : "border-slate-700 opacity-80"
                  }`}
                  title={wc.name}
                />
              ))}
            </div>
          </div>

          {selectedComponent && selectedCatalog ? (
            <div className="space-y-4 border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-400 block">
                    Selected Component
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedCatalog.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-xs text-emerald-400">
                  {selectedComponent.designator}
                </span>
              </div>

              {/* Designator Input */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Component Designator
                </label>
                <input
                  type="text"
                  value={selectedComponent.designator}
                  onChange={(e) => {
                    const val = e.target.value
                    setComponents((prev) =>
                      prev.map((c) =>
                        c.id === selectedComponent.id ? { ...c, designator: val } : c
                      )
                    )
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              {/* Dynamic Component Properties */}
              {selectedCatalog.propertySchema.map((prop) => {
                const currentVal =
                  selectedComponent.properties[prop.key] ??
                  selectedCatalog.defaultProperties[prop.key]

                const updateProp = (nextVal: any) => {
                  setComponents((prev) =>
                    prev.map((c) =>
                      c.id === selectedComponent.id
                        ? { ...c, properties: { ...c.properties, [prop.key]: nextVal } }
                        : c
                    )
                  )
                  setMcuStateVersion((v) => v + 1)
                }

                return (
                  <div key={prop.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="text-slate-300 font-medium">{prop.label}</label>
                      {prop.unit && (
                        <span className="font-mono text-indigo-400">
                          {currentVal} {prop.unit}
                        </span>
                      )}
                    </div>

                    {prop.type === "select" ? (
                      <select
                        value={currentVal}
                        onChange={(e) => updateProp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                      >
                        {prop.options?.map((opt) => (
                          <option key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : prop.type === "range" ? (
                      <input
                        type="range"
                        min={prop.min ?? 0}
                        max={prop.max ?? 100}
                        step={prop.step ?? 1}
                        value={Number(currentVal)}
                        onChange={(e) => updateProp(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    ) : prop.type === "boolean" ? (
                      <button
                        onClick={() => updateProp(!currentVal)}
                        className={`w-full py-1.5 rounded text-xs font-bold transition ${
                          currentVal
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {currentVal ? "ACTIVE / CLOSED (ON)" : "OPEN / RELEASED (OFF)"}
                      </button>
                    ) : (
                      <input
                        type={prop.type === "number" ? "number" : "text"}
                        min={prop.min}
                        max={prop.max}
                        step={prop.step}
                        value={currentVal}
                        onChange={(e) =>
                          updateProp(
                            prop.type === "number" ? Number(e.target.value) : e.target.value
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                      />
                    )}
                  </div>
                )
              })}

              {/* Live Electrical Telemetry for Selected Component */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Live Electrical Telemetry
                </span>
                {solverResult.componentStates[selectedComponent.id]?.currentMa !== undefined && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Current Flow:</span>
                    <span className="text-emerald-300 font-bold">
                      {solverResult.componentStates[selectedComponent.id]?.currentMa?.toFixed(2)} mA
                    </span>
                  </div>
                )}
                {solverResult.componentStates[selectedComponent.id]?.voltageDrop !== undefined && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Voltage Drop:</span>
                    <span className="text-amber-300">
                      {solverResult.componentStates[selectedComponent.id]?.voltageDrop?.toFixed(2)} V
                    </span>
                  </div>
                )}

                <div className="space-y-1 pt-1 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 block">Pin Voltages:</span>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                    {selectedCatalog.pins.slice(0, 12).map((p) => {
                      const st = solverResult.pinStates[`${selectedComponent.id}:${p.id}`]
                      return (
                        <div
                          key={p.id}
                          className="px-1.5 py-0.5 rounded bg-slate-900 flex justify-between"
                        >
                          <span className="text-slate-400">{p.label}:</span>
                          <span
                            className={
                              (st?.voltage ?? 0) >= 2.5 ? "text-emerald-400 font-bold" : "text-slate-300"
                            }
                          >
                            {(st?.voltage ?? 0).toFixed(1)}V
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Load Example Code Button */}
              {selectedCatalog.codeExample && (
                <button
                  onClick={() => {
                    setCode(selectedCatalog.codeExample!)
                    setBottomPanelOpen(true)
                    setBottomTab("code")
                  }}
                  className="w-full py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-lg text-xs text-indigo-300 font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load {selectedCatalog.name.split(" ")[0]} Example Code
                </button>
              )}
            </div>
          ) : selectedWire ? (
            <div className="space-y-3 border-t border-slate-800 pt-3 text-xs">
              <span className="text-[10px] font-bold uppercase text-indigo-400 block">
                Selected Wire Connection
              </span>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <div>From: {selectedWire.fromPinId}</div>
                <div>To: {selectedWire.toPinId}</div>
              </div>
              <button
                onClick={handleDeleteSelected}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium"
              >
                Delete Wire
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-800 pt-3 space-y-3 text-xs text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Interactive Circuit Guide
              </span>
              <ul className="space-y-2 text-[11px] leading-relaxed">
                <li>
                  • <b>Place Components:</b> Drag any component from the left library onto the grid, or click to add.
                </li>
                <li>
                  • <b>Connect Wires:</b> Click any component pin, move the cursor, and click the target pin.
                </li>
                <li>
                  • <b>Interactive Inputs:</b> Click pushbuttons/switches directly on the canvas or adjust sensor sliders here while the simulation is running.
                </li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

