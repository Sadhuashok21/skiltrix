import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Layers,
  FileCode,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowLeft,
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  PackageCheck,
  Sliders,
  DollarSign,
  Maximize2,
  Grid,
} from "lucide-react"
import {
  fetchPcbProject,
  updatePcbProject,
  runPcbDrc,
  exportKiCadZip,
  addPcbComponent,
  type PcbProject,
  type ComponentItem,
} from "../../api/hardware"

export default function PcbWorkspace() {
  const { projectId } = useParams<{ projectId: string }>()
  const [pcb, setPcb] = useState<PcbProject | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<"bom" | "drc" | "stackup" | "mfg">("bom")
  const [activeLayer, setActiveLayer] = useState<"F.Cu" | "B.Cu" | "Edge.Cuts" | "F.SilkS">("F.Cu")

  // DRC check state
  const [runningDrc, setRunningDrc] = useState<boolean>(false)
  const [drcResults, setDrcResults] = useState<{ drc_status: string; violations: any[] } | null>(null)

  // Export state
  const [exporting, setExporting] = useState<boolean>(false)

  // Add component modal
  const [addCompModal, setAddCompModal] = useState<boolean>(false)
  const [newRef, setNewRef] = useState<string>("")
  const [newValue, setNewValue] = useState<string>("")
  const [newFootprint, setNewFootprint] = useState<string>("Resistor_SMD:R_0805_2012Metric")
  const [newMpn, setNewMpn] = useState<string>("")
  const [newCost, setNewCost] = useState<number>(1.0)

  const loadData = async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const data = await fetchPcbProject(projectId)
      setPcb(data)
      if (data.drc_log && data.drc_log.length > 0) {
        setDrcResults({ drc_status: data.status, violations: data.drc_log })
      }
    } catch (err: any) {
      console.error("Failed to load PCB project:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId])

  const handleRunDrc = async () => {
    if (!pcb) return
    try {
      setRunningDrc(true)
      const res = await runPcbDrc(pcb.pcb_id)
      const resolvedStatus = res.drc_status || (res as any).status || "drc_passed"
      setDrcResults({ drc_status: resolvedStatus, violations: res.violations || [] })
      setPcb((prev) =>
        prev ? { ...prev, status: resolvedStatus as any, drc_log: res.violations || [] } : prev
      )
      setActiveTab("drc")
    } catch (err: any) {
      alert("DRC execution failed: " + (err?.message || "Unknown error"))
    } finally {
      setRunningDrc(false)
    }
  }

  const handleExportKiCad = async () => {
    if (!pcb) return
    try {
      setExporting(true)
      await exportKiCadZip(pcb.pcb_id, pcb.title)
    } catch (err: any) {
      alert("KiCad export failed: " + (err?.message || "Unknown error"))
    } finally {
      setExporting(false)
    }
  }

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pcb || !newRef.trim() || !newValue.trim()) return
    try {
      const created = await addPcbComponent(pcb.pcb_id, {
        reference: newRef.trim().toUpperCase(),
        value: newValue.trim(),
        footprint: newFootprint.trim(),
        mpn: newMpn.trim(),
        unit_cost_inr: Number(newCost) || 1.0,
        quantity: 1,
      })
      setPcb((prev) =>
        prev ? { ...prev, components: [...(prev.components || []), created] } : prev
      )
      setAddCompModal(false)
      setNewRef("")
      setNewValue("")
      setNewMpn("")
    } catch (err: any) {
      alert("Failed to add component: " + (err?.message || "Error"))
    }
  }

  // Calculate estimated BOM prototype cost
  const totalBomCost = (pcb?.components || []).reduce(
    (acc, c) => acc + (c.unit_cost_inr || 0) * (c.quantity || 1),
    0
  )

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading KiCad CAD project...</span>
      </div>
    )
  }

  if (!pcb) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Layers className="w-12 h-12 text-slate-600" />
        <p className="text-lg font-semibold text-slate-300">PCB workspace not found.</p>
        <Link to="/hardware" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header */}
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
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{pcb.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  KiCad 8 | {pcb.layer_count}-Layer | {pcb.board_width_mm}x{pcb.board_height_mm}mm
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    pcb.status === "drc_passed"
                      ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                      : pcb.status === "violations"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {pcb.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to={`/hardware/simulator/${projectId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            title="Switch to Interactive Circuit Simulator"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            Circuit Simulator
          </Link>

          <Link
            to={`/hardware/ide/${projectId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            title="Switch to Firmware IDE"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            Firmware IDE
          </Link>

          <button
            onClick={handleRunDrc}
            disabled={runningDrc}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            {runningDrc ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            Run DRC / ERC
          </button>

          <button
            onClick={handleExportKiCad}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow-md"
            title="Download native KiCad 8 project (.kicad_pro, .kicad_sch, .kicad_pcb, BOM.csv)"
          >
            {exporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Export KiCad 8 (.zip)
          </button>
        </div>
      </header>

      {/* Main Grid: CAD 2D Visualizer on Left, Engineering Inspector on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Interactive 2D Board & Footprint Visualizer */}
        <div className="flex-1 flex flex-col bg-slate-950 border-r border-slate-800 overflow-hidden">
          {/* Layer Controls Bar */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                Active Layer:
              </span>
              {(["F.Cu", "B.Cu", "Edge.Cuts", "F.SilkS"] as const).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                    activeLayer === layer
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 text-slate-500" />
                Grid: 2.54mm / 100mil
              </span>
              <span>Thickness: 1.6mm FR4</span>
            </div>
          </div>

          {/* SVG Canvas Board Visualizer */}
          <div className="flex-1 relative flex items-center justify-center p-6 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden select-none">
            {/* The Physical PCB Board Representation */}
            <div
              style={{
                width: `${pcb.board_width_mm * 6}px`,
                height: `${pcb.board_height_mm * 6}px`,
                maxWidth: "90%",
                maxHeight: "90%",
              }}
              className="relative rounded-xl border-2 border-emerald-500/80 bg-emerald-950/70 shadow-2xl p-4 flex flex-col justify-between overflow-hidden transition-all duration-200"
            >
              {/* Copper Ground Plane Texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-emerald-950/80 to-slate-950/90 pointer-events-none" />

              {/* Board Outline Dimension Labels */}
              <div className="absolute top-1 left-2 text-[10px] font-mono text-emerald-400/80 font-bold select-none">
                {pcb.board_width_mm}mm x {pcb.board_height_mm}mm | 2-Layer
              </div>
              <div className="absolute top-1 right-2 text-[10px] font-mono text-emerald-300/80 font-semibold select-none">
                SkilTrix KiCad CAD Engine
              </div>

              {/* Visualized Components on PCB */}
              <div className="relative z-10 w-full h-full flex flex-wrap items-center justify-around gap-4 p-2">
                {/* ESP32 Module Footprint Representation */}
                <div className="w-36 h-28 bg-slate-900/90 border border-slate-600 rounded p-2 flex flex-col justify-between text-center shadow-lg">
                  <div className="h-6 bg-slate-800 rounded flex items-center justify-center text-[10px] font-mono text-slate-300 border border-slate-700">
                    PCB Antenna Keepout
                  </div>
                  <div className="font-mono text-xs font-bold text-amber-400">
                    ESP32-WROOM-32
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-slate-400 px-1">
                    <span>38-Pin SMD</span>
                    <span>3.3V Logic</span>
                  </div>
                </div>

                {/* AMS1117-3.3 Regulator */}
                <div className="w-20 h-16 bg-slate-900 border border-slate-700 rounded p-1 flex flex-col items-center justify-center shadow">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">U2</span>
                  <span className="text-[10px] font-mono text-slate-200">AMS1117</span>
                  <span className="text-[8px] text-slate-400">SOT-223</span>
                </div>

                {/* USB-C Connector */}
                <div className="w-20 h-14 bg-slate-800 border-2 border-slate-600 rounded flex flex-col items-center justify-center shadow">
                  <span className="text-[9px] font-mono text-sky-400 font-bold">USB-C</span>
                  <span className="text-[8px] text-slate-300">5V VBUS</span>
                </div>

                {/* Passives (Capacitors, Resistors, Buttons) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-amber-900/70 border border-amber-500 rounded text-[8px] font-mono flex items-center justify-center text-amber-200">
                      C1 10u
                    </div>
                    <div className="w-8 h-4 bg-amber-900/70 border border-amber-500 rounded text-[8px] font-mono flex items-center justify-center text-amber-200">
                      C2 100n
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-slate-800 border border-slate-500 rounded text-[8px] font-mono flex items-center justify-center text-slate-300">
                      R1 10k
                    </div>
                    <div className="w-8 h-4 bg-indigo-900/80 border border-indigo-400 rounded text-[8px] font-mono flex items-center justify-center text-indigo-200">
                      SW1
                    </div>
                  </div>
                </div>
              </div>

              {/* Mounting Holes at 4 corners */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-slate-950" title="M3 Mounting Hole" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-slate-950" title="M3 Mounting Hole" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-slate-950" title="M3 Mounting Hole" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-slate-950" title="M3 Mounting Hole" />
            </div>
          </div>
        </div>

        {/* Right Side: Engineering Inspector, BOM, DRC, Stackup */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="h-10 border-b border-slate-800 flex items-center px-2 gap-1 bg-slate-950">
            <button
              onClick={() => setActiveTab("bom")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                activeTab === "bom" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              BOM ({pcb.components?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("drc")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                activeTab === "drc" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              DRC Rules
            </button>
            <button
              onClick={() => setActiveTab("stackup")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                activeTab === "stackup" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Stackup
            </button>
            <button
              onClick={() => setActiveTab("mfg")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                activeTab === "mfg" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Fabrication
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Tab 1: BOM */}
            {activeTab === "bom" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-300">Bill of Materials</h3>
                    <p className="text-[11px] text-slate-500">
                      Est. Prototype Cost: <b className="text-emerald-400">₹{totalBomCost.toFixed(2)}</b>
                    </p>
                  </div>
                  <button
                    onClick={() => setAddCompModal(true)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                    title="Add component to BOM"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {(pcb.components || []).map((c) => (
                    <div
                      key={c.component_id}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">{c.reference}</span>
                        <span className="text-slate-200">{c.value}</span>
                        <span className="text-slate-400 text-[10px]">₹{c.unit_cost_inr}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate" title={c.footprint}>
                        Footprint: {c.footprint}
                      </div>
                      {c.mpn && (
                        <div className="text-[10px] text-slate-400 truncate">
                          MPN: {c.mpn}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: DRC Rules & Logs */}
            {activeTab === "drc" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-300">Design Rule Check</h3>
                  <p className="text-[11px] text-slate-500">
                    Physical manufacturing clearance and electrical sanity verification
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Trace Width:</span>
                    <span className="font-mono text-slate-200">{pcb.min_trace_width_mil} mil</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Clearance:</span>
                    <span className="font-mono text-slate-200">{pcb.min_clearance_mil} mil</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Copper Weight:</span>
                    <span className="font-mono text-slate-200">{pcb.copper_weight_oz} oz</span>
                  </div>
                </div>

                {drcResults ? (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block">
                      Violations &amp; Diagnostics ({drcResults.violations.length}):
                    </span>
                    {drcResults.violations.length === 0 ? (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>All physical and electrical design rules passed! Board is fabrication ready.</span>
                      </div>
                    ) : (
                      drcResults.violations.map((v, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs space-y-1"
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>{v.code}</span>
                          </div>
                          <p className="text-[11px] text-rose-200">{v.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Click "Run DRC / ERC" in the header to execute physical verification.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Layer Stackup */}
            {activeTab === "stackup" && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-300">Substrate Stackup</h3>
                  <p className="text-[11px] text-slate-500">Standard 2-Layer FR4 1.6mm Stackup</p>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 flex justify-between">
                    <span>1. Top Silkscreen (F.SilkS)</span>
                    <span>White</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 flex justify-between">
                    <span>2. Top Solder Mask (F.Mask)</span>
                    <span>Green</span>
                  </div>
                  <div className="p-2.5 rounded bg-amber-950 border border-amber-600 text-amber-300 flex justify-between font-bold">
                    <span>3. Top Copper (F.Cu)</span>
                    <span>1.0 oz (35um)</span>
                  </div>
                  <div className="p-4 rounded bg-slate-800 border border-slate-700 text-slate-300 flex justify-between">
                    <span>Core Dielectric (FR4)</span>
                    <span>1.5mm (Er=4.5)</span>
                  </div>
                  <div className="p-2.5 rounded bg-amber-950 border border-amber-600 text-amber-300 flex justify-between font-bold">
                    <span>4. Bottom Copper (B.Cu)</span>
                    <span>1.0 oz (35um)</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 flex justify-between">
                    <span>5. Bottom Solder Mask (B.Mask)</span>
                    <span>Green</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 flex justify-between">
                    <span>6. Bottom Silkscreen (B.SilkS)</span>
                    <span>White</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Manufacturing Checklist */}
            {activeTab === "mfg" && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-300">Fabrication Checklist</h3>
                  <p className="text-[11px] text-slate-500">
                    Physical manufacturing specs for JLCPCB, PCBWay, or local fab house
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">1. Solder Mask &amp; Finish</span>
                    <p className="text-slate-400 text-[11px]">
                      Lead-Free HASL (RoHS Compliant) | Green Solder Mask | White Legend
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">2. ESP32 RF Requirements</span>
                    <p className="text-slate-400 text-[11px]">
                      Ensure antenna overhangs board edge or has solid keepout area without ground copper underneath.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">3. Power Supply Decoupling</span>
                    <p className="text-slate-400 text-[11px]">
                      10uF bulk electrolytic/tantalum near LDO output + 100nF MLCC ceramic capacitors close to 3V3 pins.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">4. Native KiCad 8 Package</span>
                    <p className="text-slate-400 text-[11px]">
                      Export includes <code>.kicad_pro</code>, <code>.kicad_sch</code>, <code>.kicad_pcb</code>, and <code>BOM.csv</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Component Modal */}
      {addCompModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Component to BOM
            </h3>

            <form onSubmit={handleAddComponent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Reference (e.g. R2, C3, U4)</label>
                  <input
                    type="text"
                    required
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    placeholder="R2"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Value (e.g. 4.7k, 100nF)</label>
                  <input
                    type="text"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="4.7k"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">KiCad Footprint</label>
                <input
                  type="text"
                  required
                  value={newFootprint}
                  onChange={(e) => setNewFootprint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">MPN (Optional)</label>
                  <input
                    type="text"
                    value={newMpn}
                    onChange={(e) => setNewMpn(e.target.value)}
                    placeholder="RC0805FR-074K7L"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddCompModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                >
                  Add Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

