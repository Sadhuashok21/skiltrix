import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from "lucide-react"
import logoImg from "../assets/logo.png"

interface PromoVideoModalProps {
  isOpen: boolean
  onClose: () => void
}

const TOTAL_DURATION = 25 // 25 seconds
const SCENES = [
  { id: 1, title: "Welcome to SkilTrix", start: 0, end: 5 },
  { id: 2, title: "Interactive Compiler & IDE", start: 5, end: 10 },
  { id: 3, title: "120+ Courses & Coding Lab", start: 10, end: 15 },
  { id: 4, title: "Next-Gen Video Learning", start: 15, end: 20 },
  { id: 5, title: "Launch Your Career", start: 20, end: 25 },
]

export default function PromoVideoModal({ isOpen, onClose }: PromoVideoModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [downloadReady, setDownloadReady] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const logoImageRef = useRef<HTMLImageElement | null>(null)

  // Preload logo image
  useEffect(() => {
    const img = new Image()
    img.src = logoImg
    img.onload = () => {
      logoImageRef.current = img
    }
  }, [])

  // Web Audio Procedural Soundtrack (Futuristic Synth Chords & Beats)
  const playSoundEffect = useCallback((type: "transition" | "chord", noteFreq = 440) => {
    if (isMuted) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") ctx.resume()

      if (type === "chord") {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(noteFreq, ctx.currentTime)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 1.2)
      } else if (type === "transition") {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "triangle"
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      }
    } catch {
      // AudioContext unavailable or blocked by browser
    }
  }, [isMuted])

  // Canvas Drawing Engine for 25-second cinematic promo
  const drawFrame = useCallback((t: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // 1. Dynamic Deep Space Gradient Background
    const bgGradient = ctx.createRadialGradient(
      w / 2 + Math.sin(t * 0.5) * 150,
      h / 2 + Math.cos(t * 0.5) * 80,
      100,
      w / 2,
      h / 2,
      w * 0.8
    )
    bgGradient.addColorStop(0, "#1e1b4b") // deep indigo
    bgGradient.addColorStop(0.4, "#0f172a") // slate dark
    bgGradient.addColorStop(1, "#020617") // pitch slate
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, w, h)

    // 2. Animated Particle Stars / Grid Lines
    ctx.strokeStyle = "rgba(99, 102, 241, 0.08)"
    ctx.lineWidth = 1
    const gridSize = 60
    const gridOffset = (t * 20) % gridSize
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = gridOffset; y < h; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Floating particles
    for (let i = 0; i < 40; i++) {
      const px = (Math.sin(i * 99 + t * 0.3) * 0.5 + 0.5) * w
      const py = (Math.cos(i * 33 + t * 0.2) * 0.5 + 0.5) * h
      const pSize = (Math.sin(i + t) * 0.5 + 0.5) * 3 + 1
      ctx.fillStyle = i % 2 === 0 ? "rgba(129, 140, 248, 0.6)" : "rgba(192, 132, 252, 0.6)"
      ctx.beginPath()
      ctx.arc(px, py, pSize, 0, Math.PI * 2)
      ctx.fill()
    }

    // 3. Scene Breakdown
    if (t < 5) {
      // ================= SCENE 1 (0s - 5s): Brand Intro & Logo Reveal =================
      const p = t / 5 // 0 -> 1
      const scale = Math.min(1, p * 1.5)

      // Glowing lens flare aura
      const aura = ctx.createRadialGradient(w / 2, h / 2 - 40, 20, w / 2, h / 2 - 40, 280)
      aura.addColorStop(0, "rgba(99, 102, 241, 0.45)")
      aura.addColorStop(0.5, "rgba(139, 92, 246, 0.2)")
      aura.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = aura
      ctx.beginPath()
      ctx.arc(w / 2, h / 2 - 40, 280, 0, Math.PI * 2)
      ctx.fill()

      // Logo Image
      if (logoImageRef.current) {
        ctx.save()
        ctx.translate(w / 2, h / 2 - 90)
        ctx.scale(scale, scale)
        const logoSize = 140
        ctx.drawImage(logoImageRef.current, -logoSize / 2, -logoSize / 2, logoSize, logoSize)
        ctx.restore()
      }

      // Title
      ctx.textAlign = "center"
      ctx.font = "bold 64px 'Plus Jakarta Sans', system-ui, sans-serif"
      const titleGrad = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0)
      titleGrad.addColorStop(0, "#ffffff")
      titleGrad.addColorStop(0.5, "#a5b4fc")
      titleGrad.addColorStop(1, "#c084fc")
      ctx.fillStyle = titleGrad
      ctx.fillText("SkilTrix", w / 2, h / 2 + 35)

      // Subtitle
      ctx.font = "500 22px system-ui, sans-serif"
      ctx.fillStyle = "#818cf8"
      ctx.fillText("Developed by Ascentracore Solutions", w / 2, h / 2 + 75)

      // Tagline pill
      ctx.font = "600 18px system-ui, sans-serif"
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
      ctx.fillText("Next-Generation Interactive Learning & Coding Platform", w / 2, h / 2 + 120)

      ctx.font = "bold 15px 'Courier New', monospace"
      ctx.fillStyle = "#38bdf8"
      ctx.fillText("skitrix.ascentracoresolutions.com", w / 2, h / 2 + 155)
    } else if (t < 10) {
      // ================= SCENE 2 (5s - 10s): Interactive Compiler & Multi-Language IDE =================
      const p = (t - 5) / 5

      // Header
      ctx.textAlign = "center"
      ctx.font = "bold 44px 'Plus Jakarta Sans', system-ui, sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Built-In Multi-Language Compiler", w / 2, 90)

      ctx.font = "18px system-ui, sans-serif"
      ctx.fillStyle = "#94a3b8"
      ctx.fillText("Instant real-time execution with side-by-side syntax comparison", w / 2, 125)

      // Code editor mockup window
      const editorW = 860
      const editorH = 340
      const editorX = (w - editorW) / 2
      const editorY = 160

      // Window box
      ctx.fillStyle = "#090d16"
      ctx.strokeStyle = "rgba(99, 102, 241, 0.4)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(editorX, editorY, editorW, editorH, 16)
      ctx.fill()
      ctx.stroke()

      // Window titlebar
      ctx.fillStyle = "#111827"
      ctx.beginPath()
      ctx.roundRect(editorX, editorY, editorW, 40, [16, 16, 0, 0])
      ctx.fill()

      // Mac buttons
      const colors = ["#ef4444", "#f59e0b", "#10b981"]
      colors.forEach((c, idx) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(editorX + 24 + idx * 18, editorY + 20, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Tabs: Python 3, Java, C++, C
      const tabs = ["Python 3", "Java", "C++", "C"]
      tabs.forEach((tab, idx) => {
        const tabX = editorX + 100 + idx * 105
        ctx.fillStyle = idx === 0 ? "#1e1b4b" : "transparent"
        ctx.fillRect(tabX, editorY + 8, 95, 26)
        ctx.font = "bold 12px monospace"
        ctx.fillStyle = idx === 0 ? "#a5b4fc" : "#64748b"
        ctx.textAlign = "center"
        ctx.fillText(tab, tabX + 47, editorY + 25)
      })

      // Code Lines Typing Effect
      ctx.textAlign = "left"
      ctx.font = "15px 'Courier New', monospace"
      const lines = [
        `# Python 3 · Syntax Matrix Demo`,
        `def solve_problem(nums: list) -> int:`,
        `    result = sum(x * 2 for x in nums if x > 0)`,
        `    print(f"Optimal Score: {result}")`,
        `    return result`,
        ``,
        `solve_problem([10, 20, 30])  # >> Optimal Score: 120`,
      ]

      const visibleChars = Math.floor(p * 220)
      let charCounter = 0
      lines.forEach((line, idx) => {
        const lineY = editorY + 75 + idx * 28
        // Line number
        ctx.fillStyle = "#475569"
        ctx.fillText(`${idx + 1}`.padStart(2, " "), editorX + 24, lineY)

        // Line content
        if (charCounter < visibleChars) {
          const chunk = line.slice(0, Math.max(0, visibleChars - charCounter))
          ctx.fillStyle = line.startsWith("#") ? "#64748b" : line.includes("def") ? "#c084fc" : "#38bdf8"
          ctx.fillText(chunk, editorX + 65, lineY)
        }
        charCounter += line.length + 5
      })

      // Output console toast
      if (p > 0.6) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)"
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(w / 2 - 200, editorY + editorH - 65, 400, 42, 8)
        ctx.fill()
        ctx.stroke()
        ctx.font = "bold 14px monospace"
        ctx.fillStyle = "#34d399"
        ctx.textAlign = "center"
        ctx.fillText("✓ Execution Complete: 0.04s • Zero Errors", w / 2, editorY + editorH - 39)
      }
    } else if (t < 15) {
      // ================= SCENE 3 (10s - 15s): 120+ Courses & Coding Lab =================
      const p = (t - 10) / 5

      ctx.textAlign = "center"
      ctx.font = "bold 44px 'Plus Jakarta Sans', system-ui, sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Comprehensive Course Tracks & Lab", w / 2, 90)

      ctx.font = "18px system-ui, sans-serif"
      ctx.fillStyle = "#94a3b8"
      ctx.fillText("120+ structured courses, 200+ interview problems, and real-world projects", w / 2, 125)

      // 4 Floating technology cards
      const cards = [
        { title: "Python Fundamentals", tag: "Python", color: "#eab308", lessons: "48 Lessons" },
        { title: "JavaScript: Complete Guide", tag: "JavaScript", color: "#f59e0b", lessons: "62 Lessons" },
        { title: "Data Structures & Algos", tag: "DSA", color: "#a855f7", lessons: "95 Lessons" },
        { title: "React & Modern Web", tag: "React", color: "#06b6d4", lessons: "55 Lessons" },
      ]

      const cardW = 210
      const cardH = 240
      const gap = 20
      const startX = (w - (cards.length * cardW + (cards.length - 1) * gap)) / 2

      cards.forEach((card, idx) => {
        const floatY = Math.sin(t * 2 + idx) * 8
        const cx = startX + idx * (cardW + gap)
        const cy = 175 + floatY

        ctx.fillStyle = "rgba(15, 23, 42, 0.85)"
        ctx.strokeStyle = card.color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(cx, cy, cardW, cardH, 16)
        ctx.fill()
        ctx.stroke()

        // Card header icon pill
        ctx.fillStyle = card.color
        ctx.beginPath()
        ctx.arc(cx + 35, cy + 40, 16, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = "bold 13px system-ui, sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "left"
        ctx.fillText(card.tag, cx + 60, cy + 45)

        // Card title
        ctx.font = "bold 16px 'Plus Jakarta Sans', system-ui, sans-serif"
        ctx.fillStyle = "#f8fafc"
        const words = card.title.split(" ")
        ctx.fillText(words.slice(0, 2).join(" "), cx + 20, cy + 105)
        if (words.length > 2) {
          ctx.fillText(words.slice(2).join(" "), cx + 20, cy + 130)
        }

        ctx.font = "13px system-ui, sans-serif"
        ctx.fillStyle = "#94a3b8"
        ctx.fillText(card.lessons, cx + 20, cy + 175)

        // Rating
        ctx.fillStyle = "#facc15"
        ctx.fillText("★ 4.9 (42k learners)", cx + 20, cy + 205)
      })

      // Bottom banner
      ctx.textAlign = "center"
      ctx.font = "bold 16px system-ui, sans-serif"
      ctx.fillStyle = "#818cf8"
      ctx.fillText("Company Interview Prep: Google • Amazon • Microsoft • Meta", w / 2, 475)
    } else if (t < 20) {
      // ================= SCENE 4 (15s - 20s): Next-Gen Video Learning =================
      const p = (t - 15) / 5

      ctx.textAlign = "center"
      ctx.font = "bold 44px 'Plus Jakarta Sans', system-ui, sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Feature-Rich Video Platform", w / 2, 90)

      ctx.font = "18px system-ui, sans-serif"
      ctx.fillStyle = "#94a3b8"
      ctx.fillText("Multi-language subtitles, precision 10s scrub, speed & mini player", w / 2, 125)

      // Video Player illustration
      const vW = 760
      const vH = 280
      const vX = (w - vW) / 2
      const vY = 160

      ctx.fillStyle = "#020617"
      ctx.strokeStyle = "rgba(129, 140, 248, 0.5)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(vX, vY, vW, vH, 16)
      ctx.fill()
      ctx.stroke()

      // Center play symbol
      ctx.fillStyle = "#6366f1"
      ctx.beginPath()
      ctx.arc(w / 2, vY + vH / 2 - 20, 36, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.moveTo(w / 2 - 8, vY + vH / 2 - 32)
      ctx.lineTo(w / 2 + 14, vY + vH / 2 - 20)
      ctx.lineTo(w / 2 - 8, vY + vH / 2 - 8)
      ctx.fill()

      // Subtitles overlay on video
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
      ctx.beginPath()
      ctx.roundRect(w / 2 - 220, vY + vH - 95, 440, 32, 8)
      ctx.fill()
      ctx.font = "13px system-ui, sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText("CC: Multi-language Subtitles (English • Hindi • Spanish)", w / 2, vY + vH - 74)

      // Bottom scrubber bar
      ctx.fillStyle = "#334155"
      ctx.fillRect(vX + 24, vY + vH - 42, vW - 48, 6)
      ctx.fillStyle = "#6366f1"
      const scrubW = (vW - 48) * (0.35 + p * 0.4)
      ctx.fillRect(vX + 24, vY + vH - 42, scrubW, 6)
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(vX + 24 + scrubW, vY + vH - 39, 6, 0, Math.PI * 2)
      ctx.fill()

      // Floating feature badges
      const features = ["10s Skip", "Speed Control (0.5x - 2x)", "Picture-in-Picture", "Audio Tracks"]
      ctx.font = "bold 13px system-ui, sans-serif"
      features.forEach((feat, idx) => {
        const bx = vX + 30 + idx * 175
        ctx.fillStyle = "rgba(99, 102, 241, 0.18)"
        ctx.strokeStyle = "#818cf8"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(bx, vY + vH - 25, 160, 26, 6)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = "#e0e7ff"
        ctx.textAlign = "center"
        ctx.fillText(feat, bx + 80, vY + vH - 8)
      })
    } else {
      // ================= SCENE 5 (20s - 25s): Call to Action / Outro =================
      const p = (t - 20) / 5

      // Glowing central portal
      const portal = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 350)
      portal.addColorStop(0, "rgba(99, 102, 241, 0.5)")
      portal.addColorStop(0.5, "rgba(168, 85, 247, 0.25)")
      portal.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = portal
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 350, 0, Math.PI * 2)
      ctx.fill()

      // Logo
      if (logoImageRef.current) {
        ctx.save()
        ctx.translate(w / 2, h / 2 - 110)
        const s = 110
        ctx.drawImage(logoImageRef.current, -s / 2, -s / 2, s, s)
        ctx.restore()
      }

      ctx.textAlign = "center"
      ctx.font = "bold 52px 'Plus Jakarta Sans', system-ui, sans-serif"
      const endGrad = ctx.createLinearGradient(w / 2 - 250, 0, w / 2 + 250, 0)
      endGrad.addColorStop(0, "#ffffff")
      endGrad.addColorStop(0.5, "#a5b4fc")
      endGrad.addColorStop(1, "#f43f5e")
      ctx.fillStyle = endGrad
      ctx.fillText("Start Your Tech Journey Today", w / 2, h / 2 + 5)

      ctx.font = "bold 20px system-ui, sans-serif"
      ctx.fillStyle = "#818cf8"
      ctx.fillText("SkilTrix Developed by Ascentracore Solutions", w / 2, h / 2 + 45)

      // CTA Button
      const btnW = 460
      const btnH = 54
      const btnX = (w - btnW) / 2
      const btnY = h / 2 + 75

      const btnGrad = ctx.createLinearGradient(btnX, 0, btnX + btnW, 0)
      btnGrad.addColorStop(0, "#4f46e5")
      btnGrad.addColorStop(1, "#7c3aed")
      ctx.fillStyle = btnGrad
      ctx.beginPath()
      ctx.roundRect(btnX, btnY, btnW, btnH, 14)
      ctx.fill()

      ctx.font = "bold 16px 'Plus Jakarta Sans', system-ui, sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Visit skitrix.ascentracoresolutions.com →", w / 2, btnY + 34)

      ctx.font = "14px system-ui, sans-serif"
      ctx.fillStyle = "#94a3b8"
      ctx.fillText("Zero Setup • Free Multi-Language Compiler • 100% Online", w / 2, h / 2 + 165)
    }

    // Sound effect on scene change
    const currentSceneIndex = Math.floor(t / 5)
    const prevSceneIndex = Math.floor(lastTimeRef.current / 5)
    if (currentSceneIndex !== prevSceneIndex && t > 0) {
      playSoundEffect("transition")
      playSoundEffect("chord", 440 + currentSceneIndex * 80)
    }
    lastTimeRef.current = t
  }, [playSoundEffect])

  // Animation Loop
  useEffect(() => {
    if (!isOpen) return

    let lastTimestamp = performance.now()
    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTimestamp) / 1000
        setCurrentTime((prev) => {
          const next = prev + delta
          if (next >= TOTAL_DURATION) {
            setIsPlaying(false)
            return TOTAL_DURATION
          }
          return next
        })
      }
      lastTimestamp = now
      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isOpen, isPlaying])

  // Draw frame on currentTime change
  useEffect(() => {
    drawFrame(currentTime)
  }, [currentTime, drawFrame])

  // Replay
  const handleReplay = () => {
    setCurrentTime(0)
    setIsPlaying(true)
    playSoundEffect("chord", 523.25)
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  // Video recording and download (Export MP4 / WebM video file)
  const handleDownloadVideo = () => {
    // Direct instant download of the 25-second HD promo video
    const a = document.createElement("a")
    a.href = "/skiltrix_promo_25s.webm"
    a.download = "skiltrix_promotion_video_25s.webm"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setDownloadReady(true)
  }

  if (!isOpen) return null

  const currentScene = SCENES.find((s) => currentTime >= s.start && currentTime <= s.end) || SCENES[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>SkilTrix Official Promotion Video</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                  25s HD Promo
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Scene: <strong className="text-indigo-400">{currentScene.title}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadVideo}
              disabled={isRecording}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRecording ? "Recording Video..." : "Export HD Video"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain"
            onClick={() => setIsPlaying(!isPlaying)}
          />

          {/* Big Center Play Indicator when paused */}
          {!isPlaying && currentTime < TOTAL_DURATION && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={() => setIsPlaying(true)}
                className="pointer-events-auto w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
              >
                <Play className="w-8 h-8 fill-current ml-1 text-white" />
              </button>
            </div>
          )}

          {/* End Replay Banner */}
          {currentTime >= TOTAL_DURATION && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Promo Completed</h3>
              <p className="text-xs text-slate-300">
                SkilTrix Developed by Ascentracore Solutions
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReplay}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay Video</span>
                </button>
                <button
                  onClick={handleDownloadVideo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Video (HD)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Scene Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          {/* Interactive Timeline Seekbar */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              setCurrentTime(pct * TOTAL_DURATION)
            }}
            className="relative h-2 bg-slate-800 hover:h-3 rounded-full cursor-pointer transition-all group"
          >
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
            />
            {/* Scene Markers */}
            {SCENES.map((s) => (
              <div
                key={s.id}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-700 pointer-events-none"
                style={{ left: `${(s.start / TOTAL_DURATION) * 100}%` }}
              />
            ))}
          </div>

          {/* Control Buttons Row */}
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={handleReplay}
                title="Restart"
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="font-mono text-slate-400">
                00:{Math.floor(currentTime).toString().padStart(2, "0")} / 00:25
              </span>
            </div>

            {/* Scene Quick Jump Tabs */}
            <div className="hidden sm:flex items-center gap-1.5">
              {SCENES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentTime(s.start)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    currentScene.id === s.id
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  Scene {s.id}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
