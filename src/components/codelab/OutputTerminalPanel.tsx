import React, { useState, useEffect, useRef } from "react"
import { Terminal as XTerm } from "xterm"
import { FitAddon } from "@xterm/addon-fit"
import "xterm/css/xterm.css"
import {
  Terminal as TerminalIcon,
  PlaySquare,
  Keyboard,
  Trash2,
  Copy,
  Check,
  Clock,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
  RotateCw,
  Sparkles,
  Play,
  Loader2,
} from "lucide-react"
import type { ExecutionResponse } from "../../api/codelab"
import api from "../../api/client"

interface OutputTerminalPanelProps {
  projectId?: string
  projectType?: string
  execution: ExecutionResponse | null
  isRunning: boolean
  stdinValue: string
  onChangeStdin: (val: string) => void
  onClearOutput: () => void
  onRefreshFiles?: () => void
  onServerStarted?: (previewUrl: string, port?: number) => void
}

export default function OutputTerminalPanel({
  projectId,
  projectType,
  execution,
  isRunning,
  stdinValue,
  onChangeStdin,
  onClearOutput,
  onRefreshFiles,
  onServerStarted,
}: OutputTerminalPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"output" | "terminal" | "stdin">("output")
  const [copied, setCopied] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "websocket" | "http" | "disconnected">("connecting")
  const [runningCmd, setRunningCmd] = useState<string | null>(null)

  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermInstance = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const localInputBuffer = useRef("")

  // Quick command executor for Django tools
  const handleRunQuickCommand = async (cmd: string) => {
    if (!projectId || runningCmd) return
    try {
      setRunningCmd(cmd)
      setActiveSubTab("terminal")
      if (xtermInstance.current) {
        xtermInstance.current.writeln(`\r\n\x1b[36m$ ${cmd}\x1b[0m`)
      }
      const res = await api.post(`/codelab/projects/${encodeURIComponent(projectId)}/terminal/execute/`, {
        command: cmd,
      })
      const data = res.data
      if (xtermInstance.current) {
        const out = data.output || ""
        xtermInstance.current.writeln(out.replace(/\n/g, "\r\n"))
        xtermInstance.current.write("$ ")
      }
      onRefreshFiles?.()
      if (data.is_server || data.server_port || data.preview_url) {
        onServerStarted?.(data.preview_url || `/apps/skiltrix/api/preview/${projectId}/`, data.server_port)
      }
    } catch (err: any) {
      if (xtermInstance.current) {
        xtermInstance.current.writeln(`\x1b[31m[Error: ${err?.response?.data?.detail || err.message}]\x1b[0m`)
        xtermInstance.current.write("$ ")
      }
    } finally {
      setRunningCmd(null)
    }
  }

  // Initialize xterm.js and WebSocket when activeSubTab is 'terminal'
  useEffect(() => {
    if (activeSubTab !== "terminal" || !terminalRef.current) return

    let term = xtermInstance.current
    if (!term) {
      term = new XTerm({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
        theme: {
          background: "#11111b",
          foreground: "#cdd6f4",
          cursor: "#f5e0dc",
          selectionBackground: "#45475a",
        },
      })
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(terminalRef.current)
      fitAddon.fit()

      xtermInstance.current = term
      fitAddonRef.current = fitAddon
      term.writeln("\x1b[34m[CodeLab Virtual Terminal Initialized]\x1b[0m")
      term.write("$ ")
    }

    // Connect WebSocket
    const connectSocket = () => {
      if (!projectId) return

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsHost = window.location.hostname === "localhost" ? "127.0.0.1:8000" : window.location.host
      const wsUrl = `${wsProtocol}//${wsHost}/ws/codelab/terminal/${projectId}/`

      try {
        setConnectionStatus("connecting")
        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          setConnectionStatus("websocket")
        }

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            if (msg.data && xtermInstance.current) {
              xtermInstance.current.write(msg.data)
            }
          } catch {
            if (xtermInstance.current) {
              xtermInstance.current.write(event.data)
            }
          }
        }

        ws.onerror = () => {
          // Switch to HTTP fallback mode
          setConnectionStatus("http")
        }

        ws.onclose = () => {
          if (connectionStatus === "websocket") {
            setConnectionStatus("http")
          }
        }

        socketRef.current = ws
      } catch {
        setConnectionStatus("http")
      }
    }

    connectSocket()

    // Handle user keystrokes
    const dataDisposable = term.onData(async (data) => {
      const ws = socketRef.current
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Send raw keystroke over WebSocket
        ws.send(JSON.stringify({ action: "input", data }))
      } else {
        // HTTP Fallback interactive command processing
        if (data === "\r") {
          term?.write("\r\n")
          const cmd = localInputBuffer.current.trim()
          localInputBuffer.current = ""
          if (cmd && projectId) {
            try {
              const res = await api.post(`/codelab/projects/${encodeURIComponent(projectId)}/terminal/execute/`, {
                command: cmd,
              })
              const out = res.data.output || ""
              const formatted = out.replace(/\n/g, "\r\n")
              term?.writeln(formatted)
              onRefreshFiles?.()
              if (res.data.is_server || res.data.server_port || res.data.preview_url) {
                onServerStarted?.(res.data.preview_url || `/apps/skiltrix/api/preview/${projectId}/`, res.data.server_port)
              }
            } catch (err: any) {
              term?.writeln(`\x1b[31m[Error: ${err?.response?.data?.detail || err.message}]\x1b[0m`)
            }
          }
          term?.write("$ ")
        } else if (data === "\u007F" || data === "\b") {
          if (localInputBuffer.current.length > 0) {
            localInputBuffer.current = localInputBuffer.current.slice(0, -1)
            term?.write("\b \b")
          }
        } else if (data === "\u0003") {
          localInputBuffer.current = ""
          term?.write("^C\r\n$ ")
        } else {
          localInputBuffer.current += data
          term?.write(data)
        }
      }
    })

    return () => {
      dataDisposable.dispose()
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [activeSubTab, projectId])

  // Write new execution results into terminal when output changes
  useEffect(() => {
    if (execution && xtermInstance.current) {
      xtermInstance.current.writeln(`\r\n\x1b[32m[Execution Completed: ${execution.duration_ms}ms]\x1b[0m`)
      if (execution.stdout) {
        xtermInstance.current.writeln(execution.stdout.replace(/\n/g, "\r\n"))
      }
      if (execution.stderr) {
        xtermInstance.current.writeln(`\x1b[31m${execution.stderr.replace(/\n/g, "\r\n")}\x1b[0m`)
      }
      xtermInstance.current.write("$ ")
    }
  }, [execution])

  const copyToClipboard = () => {
    const textToCopy = `${execution?.stdout || ""}\n${execution?.stderr || ""}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearTerminal = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear()
      xtermInstance.current.write("$ ")
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#11111b] text-slate-200 border-t border-slate-800">
      {/* Tab Header Bar */}
      <div className="flex items-center justify-between px-3 h-9 bg-[#181825] border-b border-slate-800 select-none">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab("output")}
            className={`flex items-center gap-1.5 px-3 h-9 text-xs border-b-2 font-medium transition-colors ${
              activeSubTab === "output"
                ? "border-indigo-500 text-indigo-400 bg-[#11111b]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>Console Output</span>
            {execution && (
              <span
                className={`w-2 h-2 rounded-full ${
                  execution.exit_code === 0 ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("terminal")}
            className={`flex items-center gap-1.5 px-3 h-9 text-xs border-b-2 font-medium transition-colors ${
              activeSubTab === "terminal"
                ? "border-indigo-500 text-indigo-400 bg-[#11111b]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
            {activeSubTab === "terminal" && (
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "websocket"
                    ? "bg-emerald-500"
                    : connectionStatus === "http"
                    ? "bg-amber-500"
                    : "bg-slate-500"
                }`}
                title={
                  connectionStatus === "websocket"
                    ? "WebSocket Live PTY"
                    : connectionStatus === "http"
                    ? "HTTP Interactive Bridge"
                    : "Connecting..."
                }
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("stdin")}
            className={`flex items-center gap-1.5 px-3 h-9 text-xs border-b-2 font-medium transition-colors ${
              activeSubTab === "stdin"
                ? "border-indigo-500 text-indigo-400 bg-[#11111b]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Standard Input (stdin)</span>
            {stdinValue && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 text-xs">
          {activeSubTab === "output" && execution && (
            <div className="flex items-center gap-3 text-slate-400 text-[11px] mr-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {execution.duration_ms} ms
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {execution.memory_kb > 0 ? `${(execution.memory_kb / 1024).toFixed(1)} MB` : "< 1 MB"}
              </span>
            </div>
          )}

          {activeSubTab === "terminal" && (
            <div className="flex items-center gap-2 mr-2">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                {connectionStatus === "websocket" ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>Live WebSocket</span>
                  </>
                ) : connectionStatus === "http" ? (
                  <>
                    <Wifi className="w-3 h-3 text-blue-400" />
                    <span>HTTP Bridge</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Connecting...</span>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={clearTerminal}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                title="Clear Terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeSubTab === "output" && (
            <>
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy output"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={onClearOutput}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                title="Clear output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Django Quick Command Strip */}
      {projectType === "django" && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141420] border-b border-slate-800/80 overflow-x-auto text-[11px] shrink-0">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Django Tools:
          </span>
          <button
            type="button"
            onClick={() => handleRunQuickCommand("python -m venv .venv")}
            disabled={runningCmd !== null}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 font-mono text-[10px] disabled:opacity-50"
            title="Create Virtual Environment"
          >
            venv
          </button>
          <button
            type="button"
            onClick={() => handleRunQuickCommand("python -m pip install django")}
            disabled={runningCmd !== null}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 font-mono text-[10px] disabled:opacity-50"
            title="Install Django into Virtual Environment"
          >
            pip install django
          </button>
          <button
            type="button"
            onClick={() => handleRunQuickCommand("python manage.py check")}
            disabled={runningCmd !== null}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 font-mono text-[10px] disabled:opacity-50"
            title="Run Project Health Check"
          >
            manage.py check
          </button>
          <button
            type="button"
            onClick={() => handleRunQuickCommand("python manage.py makemigrations")}
            disabled={runningCmd !== null}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 font-mono text-[10px] disabled:opacity-50"
            title="Create Database Migrations"
          >
            makemigrations
          </button>
          <button
            type="button"
            onClick={() => handleRunQuickCommand("python manage.py migrate")}
            disabled={runningCmd !== null}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 font-mono text-[10px] disabled:opacity-50"
            title="Apply Migrations"
          >
            migrate
          </button>
          <button
            type="button"
            onClick={() => handleRunQuickCommand("python manage.py runserver")}
            disabled={runningCmd !== null}
            className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-700/50 transition-colors shrink-0 font-mono text-[10px] font-medium disabled:opacity-50"
            title="Run Django Development Server"
          >
            runserver
          </button>
          {runningCmd && (
            <span className="text-[10px] text-cyan-400 italic ml-2 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Running {runningCmd}...
            </span>
          )}
        </div>
      )}

      {/* Tab Body Contents */}
      <div className="flex-1 overflow-hidden relative">
        {/* SUBTAB 1: RAW CONSOLE OUTPUT */}
        {activeSubTab === "output" && (
          <div className="h-full overflow-auto p-3 font-mono text-xs select-text">
            {isRunning ? (
              <div className="flex items-center gap-2 text-indigo-400 py-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>Executing in sandbox worker...</span>
              </div>
            ) : execution ? (
              <div className="space-y-2">
                {/* Status Bar */}
                <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-[11px]">
                  {execution.exit_code === 0 ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Process exited with code 0 (Success)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Process exited with code {execution.exit_code} (Failed)
                    </span>
                  )}
                </div>

                {/* Stdout */}
                {execution.stdout && (
                  <pre className="text-slate-100 whitespace-pre-wrap">{execution.stdout}</pre>
                )}

                {/* Stderr */}
                {execution.stderr && (
                  <pre className="text-red-400 whitespace-pre-wrap">{execution.stderr}</pre>
                )}

                {!execution.stdout && !execution.stderr && (
                  <p className="text-slate-500 italic">Program executed successfully with no output.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 italic select-none">
                <p>Run your code or project to view execution output here.</p>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: INTERACTIVE XTERM.JS TERMINAL */}
        <div
          ref={terminalRef}
          className={`h-full w-full p-2 ${activeSubTab === "terminal" ? "block" : "hidden"}`}
        />

        {/* SUBTAB 3: STDIN INPUT CONFIG */}
        {activeSubTab === "stdin" && (
          <div className="h-full p-3 flex flex-col gap-2">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Standard Input buffer passed to program during execution:</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {stdinValue.length} characters
              </span>
            </div>
            <textarea
              value={stdinValue}
              onChange={(e) => onChangeStdin(e.target.value)}
              placeholder="Enter input parameters here (e.g. numbers, lines, or arguments)..."
              className="flex-1 w-full bg-[#161622] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}

