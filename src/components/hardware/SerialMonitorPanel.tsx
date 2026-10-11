import React, { useState, useEffect, useRef } from "react"
import {
  Play,
  Square,
  Trash2,
  Download,
  Send,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Terminal as TerminalIcon,
  HelpCircle,
} from "lucide-react"

interface SerialMonitorProps {
  defaultBaudRate?: number
  onLogReceived?: (line: string) => void
}

export default function SerialMonitorPanel({
  defaultBaudRate = 115200,
  onLogReceived,
}: SerialMonitorProps) {
  const [baudRate, setBaudRate] = useState<number>(defaultBaudRate)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [logs, setLogs] = useState<Array<{ timestamp: string; text: string; type: "rx" | "tx" | "sys" }>>([])
  const [inputMessage, setInputMessage] = useState<string>("")
  const [lineEnding, setLineEnding] = useState<string>("\r\n")
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const [portInfo, setPortInfo] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string>("")

  const portRef = useRef<any>(null)
  const readerRef = useRef<any>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const isWebSerialSupported = typeof navigator !== "undefined" && "serial" in navigator

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, autoScroll])

  const appendLog = (text: string, type: "rx" | "tx" | "sys" = "rx") => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false })
    setLogs((prev) => [...prev, { timestamp, text, type }])
    if (onLogReceived && type === "rx") {
      onLogReceived(text)
    }
  }

  const handleConnect = async () => {
    setErrorMsg("")
    if (!isWebSerialSupported) {
      setErrorMsg("WebSerial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera to connect physical USB hardware.")
      return
    }

    try {
      const serial = (navigator as any).serial
      const port = await serial.requestPort()
      await port.open({ baudRate: Number(baudRate) })

      portRef.current = port
      setIsConnected(true)
      setPortInfo(`Connected @ ${baudRate} baud`)
      appendLog(`[SERIAL] Port opened successfully at ${baudRate} baud.`, "sys")

      readSerialLoop(port)
    } catch (err: any) {
      console.error("Serial connection error:", err)
      setErrorMsg(err.message || "Failed to open serial port.")
      appendLog(`[ERROR] Connection failed: ${err.message || "User cancelled or port busy"}`, "sys")
      setIsConnected(false)
    }
  }

  const readSerialLoop = async (port: any) => {
    const textDecoder = new TextDecoderStream()
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable)
    const reader = textDecoder.readable.getReader()
    readerRef.current = reader

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        if (value) {
          appendLog(value, "rx")
        }
      }
    } catch (err: any) {
      if (portRef.current) {
        appendLog(`[SERIAL] Read error: ${err.message}`, "sys")
      }
    } finally {
      reader.releaseLock()
    }
  }

  const handleDisconnect = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel()
        readerRef.current = null
      }
      if (portRef.current) {
        await portRef.current.close()
        portRef.current = null
      }
    } catch (err: any) {
      console.warn("Disconnect cleanup notice:", err)
    } finally {
      setIsConnected(false)
      setPortInfo("")
      appendLog("[SERIAL] Device disconnected.", "sys")
    }
  }

  const handleSend = async () => {
    if (!inputMessage || !portRef.current || !isConnected) return

    try {
      const encoder = new TextEncoder()
      const dataToSend = inputMessage + lineEnding
      const writer = portRef.current.writable.getWriter()
      await writer.write(encoder.encode(dataToSend))
      writer.releaseLock()

      appendLog(inputMessage, "tx")
      setInputMessage("")
    } catch (err: any) {
      appendLog(`[SEND ERROR] ${err.message}`, "sys")
    }
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const handleExportLogs = () => {
    const textData = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`)
      .join("\n")
    const blob = new Blob([textData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `serial_logs_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 rounded-lg overflow-hidden">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Hardware Serial Monitor</span>
          {isConnected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE {portInfo ? `(${portInfo})` : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
              DISCONNECTED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Baud Rate Selector */}
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-[11px] text-slate-400">Baud:</span>
            <select
              value={baudRate}
              disabled={isConnected}
              onChange={(e) => setBaudRate(Number(e.target.value))}
              className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value={9600}>9600 (Uno Default)</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200 (ESP32 Standard)</option>
              <option value={230400}>230400</option>
              <option value={460800}>460800</option>
              <option value={921600}>921600 (High Speed)</option>
            </select>
          </div>

          {/* Connect / Disconnect Button */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-sans font-medium transition shadow-sm"
              title="Request USB serial port via WebSerial"
            >
              <Play className="w-3.5 h-3.5" />
              Connect USB Device
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-sans font-medium transition shadow-sm"
            >
              <Square className="w-3.5 h-3.5" />
              Disconnect
            </button>
          )}

          {/* Toolbar Utilities */}
          <button
            onClick={handleClearLogs}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportLogs}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            title="Export Serial Log to File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Browser compatibility / Warning banner if unsupported */}
      {!isWebSerialSupported && (
        <div className="bg-amber-950/60 border-b border-amber-800/80 px-3 py-2 text-amber-200 flex items-start gap-2 text-[11px]">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">WebSerial API Unready:</span> Native serial communication with ESP32/Arduino requires Google Chrome, Edge, or an authorized desktop browser. You can still compile firmware and download complete flashable ZIP packages!
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-3 py-1.5 text-rose-200 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Terminal Output Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1 select-text">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8 gap-2">
            <Cpu className="w-8 h-8 text-slate-600" />
            <p className="text-center">No serial data received yet.</p>
            <p className="text-[11px] text-slate-600 max-w-sm text-center">
              Plug your ESP32 or Arduino Uno/Nano via USB, click "Connect USB Device", and select your COM/TTY port.
            </p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 leading-relaxed whitespace-pre-wrap break-all ${
                log.type === "sys"
                  ? "text-sky-400 italic"
                  : log.type === "tx"
                  ? "text-amber-300"
                  : "text-emerald-300"
              }`}
            >
              <span className="text-slate-600 select-none text-[10px]">[{log.timestamp}]</span>
              {log.type === "tx" && <span className="text-amber-500 select-none font-bold">&gt;&gt;</span>}
              {log.type === "rx" && <span className="text-emerald-600 select-none font-bold">&lt;&lt;</span>}
              <span>{log.text}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Input / Command Sender */}
      <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          disabled={!isConnected}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend()
          }}
          placeholder={isConnected ? "Send AT command or serial payload (Press Enter)..." : "Connect hardware to send serial commands"}
          className="flex-1 bg-slate-950 text-slate-200 px-3 py-1.5 rounded border border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-40"
        />

        <select
          value={lineEnding}
          onChange={(e) => setLineEnding(e.target.value)}
          className="bg-slate-800 text-slate-300 text-xs px-2 py-1.5 rounded border border-slate-700 focus:outline-none"
        >
          <option value="\r\n">Both NL &amp; CR</option>
          <option value="\n">Newline (LF)</option>
          <option value="\r">Carriage Return (CR)</option>
          <option value="">No line ending</option>
        </select>

        <button
          onClick={handleSend}
          disabled={!isConnected || !inputMessage.trim()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-xs font-sans font-medium transition flex items-center gap-1 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </div>
    </div>
  )
}

