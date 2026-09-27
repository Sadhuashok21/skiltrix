import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Captions,
  CaptionsOff,
  PictureInPicture2,
  Gauge,
  Headphones,
  Check,
  ChevronRight,
  Sliders,
  Sparkles,
} from "lucide-react"

export interface SubtitleItem {
  start: number
  end: number
  text: string
}

export interface ChapterItem {
  time: number
  title: string
}

interface VideoPlayerProps {
  videoUrl?: string
  poster?: string
  title: string
  instructor?: string
  initialDurationSec?: number
  subtitles?: Record<string, SubtitleItem[]>
  chapters?: ChapterItem[]
  onMiniPlayerToggle?: (active: boolean) => void
  onEnded?: () => void
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const QUALITY_OPTIONS = ["1080p HD", "720p", "480p", "Auto (1080p)"]
const AUDIO_TRACKS = [
  { id: "en-orig", label: "English (Original - Stereo 5.1)" },
  { id: "hi-dub", label: "Hindi (हिंदी - Studio Dub)" },
  { id: "es-dub", label: "Spanish (Español - Doblado)" },
]

export default function VideoPlayer({
  videoUrl,
  poster,
  title,
  instructor = "SkilTrix Instructor",
  initialDurationSec = 915, // 15:15 default duration
  subtitles = {},
  chapters = [],
  onMiniPlayerToggle,
  onEnded,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const seekbarRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDurationSec)
  const [bufferedPercent, setBufferedPercent] = useState(35)
  const [volume, setVolume] = useState(0.85)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [quality, setQuality] = useState("1080p HD")
  const [audioTrack, setAudioTrack] = useState("en-orig")
  const [showRemainingTime, setShowRemainingTime] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Subtitles
  const [subtitleLang, setSubtitleLang] = useState<string>("en")
  const [activeSubtitle, setActiveSubtitle] = useState<string>("")
  const [subtitleFontSize, setSubtitleFontSize] = useState<"normal" | "large">("normal")

  // Menus
  const [activeMenu, setActiveMenu] = useState<"none" | "settings" | "speed" | "subtitles" | "audio" | "quality">("none")
  
  // Seek preview
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState<number>(0)

  // Fallback timer when using poster / simulated video
  const timerRef = useRef<number | null>(null)

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Handle Play / Pause
  const togglePlay = useCallback(() => {
    if (videoRef.current && videoRef.current.src) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          // If video failed to play via network, fallback to simulation
          setIsPlaying((prev) => !prev)
        })
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    } else {
      setIsPlaying((prev) => !prev)
    }
  }, [])

  // 10s Skip Backward
  const skipBackward10 = () => {
    const newTime = Math.max(0, currentTime - 10)
    setCurrentTime(newTime)
    if (videoRef.current) videoRef.current.currentTime = newTime
  }

  // 10s Skip Forward
  const skipForward10 = () => {
    const newTime = Math.min(duration, currentTime + 10)
    setCurrentTime(newTime)
    if (videoRef.current) videoRef.current.currentTime = newTime
  }

  // Seekbar Click / Drag
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekbarRef.current) return
    const rect = seekbarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    const targetTime = percent * duration
    setCurrentTime(targetTime)
    if (videoRef.current) videoRef.current.currentTime = targetTime
  }

  // Seekbar Hover
  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekbarRef.current) return
    const rect = seekbarRef.current.getBoundingClientRect()
    const moveX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, moveX / rect.width))
    setHoverTime(percent * duration)
    setHoverPosition(moveX)
  }

  const handleSeekMouseLeave = () => {
    setHoverTime(null)
  }

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    setIsMuted(val === 0)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.volume = volume || 0.8
      }
    } else {
      setIsMuted(true)
      if (videoRef.current) {
        videoRef.current.muted = true
      }
    }
  }

  // Speed
  const changeSpeed = (s: number) => {
    setSpeed(s)
    if (videoRef.current) videoRef.current.playbackRate = s
    setActiveMenu("none")
  }

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {
      setIsFullscreen(!isFullscreen)
    }
  }

  // Native Picture-in-Picture
  const togglePiP = async () => {
    if (!videoRef.current) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture()
      } else if (onMiniPlayerToggle) {
        onMiniPlayerToggle(true)
      }
    } catch {
      if (onMiniPlayerToggle) onMiniPlayerToggle(true)
    }
  }

  // Synchronize subtitles with currentTime
  useEffect(() => {
    if (!subtitleLang || subtitleLang === "off") {
      setActiveSubtitle("")
      return
    }
    const currentSubs = subtitles[subtitleLang] || subtitles["en"] || []
    const match = currentSubs.find((s) => currentTime >= s.start && currentTime <= s.end)
    setActiveSubtitle(match ? match.text : "")
  }, [currentTime, subtitleLang, subtitles])

  // Simulation loop when video element has no native video stream or is paused
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            onEnded?.()
            return 0
          }
          return prev + 0.25 * speed
        })
      }, 250)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, duration, speed, onEnded])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return
      if (e.code === "Space" || e.code === "KeyK") {
        e.preventDefault()
        togglePlay()
      } else if (e.code === "ArrowLeft") {
        e.preventDefault()
        skipBackward10()
      } else if (e.code === "ArrowRight") {
        e.preventDefault()
        skipForward10()
      } else if (e.code === "KeyM") {
        e.preventDefault()
        toggleMute()
      } else if (e.code === "KeyF") {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.code === "KeyC") {
        e.preventDefault()
        setSubtitleLang((prev) => (prev === "off" ? "en" : "off"))
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay, isMuted, volume, isFullscreen])

  // Auto-hide controls when playing and inactive
  useEffect(() => {
    let timeout: number
    const resetTimer = () => {
      setShowControls(true)
      if (isPlaying && activeMenu === "none") {
        timeout = window.setTimeout(() => setShowControls(false), 3000)
      }
    }
    const elem = containerRef.current
    if (elem) {
      elem.addEventListener("mousemove", resetTimer)
      elem.addEventListener("click", resetTimer)
    }
    return () => {
      clearTimeout(timeout)
      if (elem) {
        elem.removeEventListener("mousemove", resetTimer)
        elem.removeEventListener("click", resetTimer)
      }
    }
  }, [isPlaying, activeMenu])

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={`relative group bg-slate-950 rounded-2xl overflow-hidden shadow-2xl select-none font-sans aspect-video ${
        isFullscreen ? "w-screen h-screen rounded-none fixed inset-0 z-[9999]" : "w-full"
      }`}
    >
      {/* Video element or interactive presentation */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
        }}
        onLoadedMetadata={() => {
          if (videoRef.current && videoRef.current.duration) {
            setDuration(videoRef.current.duration)
          }
        }}
        onProgress={() => {
          if (videoRef.current && videoRef.current.buffered.length > 0) {
            const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
            setBufferedPercent((end / (videoRef.current.duration || 1)) * 100)
          }
        }}
        onClick={togglePlay}
      />

      {/* Fallback Poster Background Overlay with interactive code simulation */}
      {!videoUrl && poster && (
        <div className="absolute inset-0 pointer-events-none">
          <img src={poster} alt={title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Animated Code Watermark overlay for coding lessons */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SkilTrix HD Engine • {quality}</span>
          </div>
        </div>
      )}

      {/* Synchronized Closed Captions / Subtitles Overlay */}
      {activeSubtitle && subtitleLang !== "off" && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-[85%] text-center pointer-events-none transition-all z-20">
          <span
            className={`inline-block px-4 py-1.5 rounded-lg bg-black/85 backdrop-blur-sm text-white font-medium shadow-lg leading-snug tracking-wide ${
              subtitleFontSize === "large" ? "text-lg sm:text-xl" : "text-sm sm:text-base"
            }`}
          >
            {activeSubtitle}
          </span>
        </div>
      )}

      {/* Big Center Play / Pause Indicator overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <button
            onClick={togglePlay}
            className="pointer-events-auto w-20 h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/40 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 group/btn"
          >
            <Play className="w-8 h-8 fill-current ml-1 text-white" />
          </button>
        </div>
      )}

      {/* Top Bar (Title & Quick PiP / Mini player) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white transition-opacity duration-300 z-30 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="min-w-0 pr-4">
          <h2 className="text-sm sm:text-base font-bold truncate drop-shadow">{title}</h2>
          <p className="text-xs text-slate-300 truncate">{instructor}</p>
        </div>
        <div className="flex items-center gap-2">
          {onMiniPlayerToggle && (
            <button
              onClick={() => onMiniPlayerToggle(true)}
              title="Dock into Mini Player"
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mini Player</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings & Subtitles Popover Panels */}
      {activeMenu !== "none" && (
        <div className="absolute bottom-20 right-4 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white z-40 animate-in fade-in zoom-in-95 duration-150">
          {activeMenu === "settings" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Settings</span>
                <button
                  onClick={() => setActiveMenu("none")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Quality button */}
              <button
                onClick={() => setActiveMenu("quality")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Quality</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                  <span>{quality}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Speed button */}
              <button
                onClick={() => setActiveMenu("speed")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Gauge className="w-4 h-4 text-indigo-400" />
                  <span>Playback Speed</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                  <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Subtitles button */}
              <button
                onClick={() => setActiveMenu("subtitles")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Captions className="w-4 h-4 text-indigo-400" />
                  <span>Subtitles (CC)</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                  <span>
                    {subtitleLang === "off" ? "Off" : subtitleLang === "en" ? "English" : subtitleLang === "hi" ? "Hindi" : "Spanish"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Audio Track button */}
              <button
                onClick={() => setActiveMenu("audio")}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  <span>Audio Track</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                  <span>{audioTrack.split("-")[0].toUpperCase()}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          )}

          {/* Speed submenu */}
          {activeMenu === "speed" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <button
                  onClick={() => setActiveMenu("settings")}
                  className="text-xs font-semibold text-indigo-400 hover:underline"
                >
                  ← Back
                </button>
                <span className="text-xs font-bold text-slate-400">Speed</span>
              </div>
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    speed === s ? "bg-indigo-600 text-white" : "hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <span>{s === 1 ? "1.0x (Normal)" : `${s}x`}</span>
                  {speed === s && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}

          {/* Subtitles submenu */}
          {activeMenu === "subtitles" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <button
                  onClick={() => setActiveMenu("settings")}
                  className="text-xs font-semibold text-indigo-400 hover:underline"
                >
                  ← Back
                </button>
                <span className="text-xs font-bold text-slate-400">Subtitles / CC</span>
              </div>
              {[
                { id: "off", label: "Off" },
                { id: "en", label: "English [CC]" },
                { id: "hi", label: "Hindi (हिंदी)" },
                { id: "es", label: "Spanish (Español)" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSubtitleLang(sub.id)
                    setActiveMenu("none")
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    subtitleLang === sub.id ? "bg-indigo-600 text-white" : "hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <span>{sub.label}</span>
                  {subtitleLang === sub.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}

              <div className="pt-2 border-t border-slate-800 mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Font Size:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSubtitleFontSize("normal")}
                    className={`px-2 py-0.5 rounded ${subtitleFontSize === "normal" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
                  >
                    Regular
                  </button>
                  <button
                    onClick={() => setSubtitleFontSize("large")}
                    className={`px-2 py-0.5 rounded ${subtitleFontSize === "large" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
                  >
                    Large
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quality submenu */}
          {activeMenu === "quality" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <button
                  onClick={() => setActiveMenu("settings")}
                  className="text-xs font-semibold text-indigo-400 hover:underline"
                >
                  ← Back
                </button>
                <span className="text-xs font-bold text-slate-400">Quality</span>
              </div>
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuality(q)
                    setActiveMenu("none")
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    quality === q ? "bg-indigo-600 text-white" : "hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <span>{q}</span>
                  {quality === q && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}

          {/* Audio Track submenu */}
          {activeMenu === "audio" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <button
                  onClick={() => setActiveMenu("settings")}
                  className="text-xs font-semibold text-indigo-400 hover:underline"
                >
                  ← Back
                </button>
                <span className="text-xs font-bold text-slate-400">Audio Track</span>
              </div>
              {AUDIO_TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setAudioTrack(t.id)
                    setActiveMenu("none")
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    audioTrack === t.id ? "bg-indigo-600 text-white" : "hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <span className="truncate pr-2">{t.label}</span>
                  {audioTrack === t.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 z-30 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Interactive Seekbar Timeline */}
        <div
          ref={seekbarRef}
          onClick={handleSeek}
          onMouseMove={handleSeekMouseMove}
          onMouseLeave={handleSeekMouseLeave}
          className="relative group/seek h-3 flex items-center cursor-pointer mb-3"
        >
          {/* Hover timestamp tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-indigo-950/90 border border-indigo-500/50 text-[11px] font-mono text-white shadow pointer-events-none"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Background track */}
          <div className="w-full h-1.5 group-hover/seek:h-2.5 bg-slate-700/60 rounded-full overflow-hidden transition-all relative">
            {/* Buffered bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-slate-500/40 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-400 rounded-full transition-all duration-75"
              style={{ width: `${playedPercent}%` }}
            />
          </div>

          {/* Draggable Scrubber Knob */}
          <div
            className="absolute w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow-md -translate-x-1/2 scale-0 group-hover/seek:scale-100 transition-transform pointer-events-none"
            style={{ left: `${playedPercent}%` }}
          />
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          {/* Left Controls: Play, -10s, +10s, Volume, Duration */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              title={isPlaying ? "Pause (Space/K)" : "Play (Space/K)"}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* 10s Backward */}
            <button
              onClick={skipBackward10}
              title="10s Backward (←)"
              className="relative p-1.5 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5 font-mono">
                10
              </span>
            </button>

            {/* 10s Forward */}
            <button
              onClick={skipForward10}
              title="10s Forward (→)"
              className="relative p-1.5 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
            >
              <RotateCw className="w-5 h-5" />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5 font-mono">
                10
              </span>
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                title="Mute / Unmute (M)"
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 opacity-80 group-hover/vol:opacity-100 transition-opacity"
              />
            </div>

            {/* Duration Display */}
            <button
              onClick={() => setShowRemainingTime(!showRemainingTime)}
              title="Click to toggle remaining time"
              className="ml-1 sm:ml-2 font-mono text-[11px] sm:text-xs text-slate-300 hover:text-white transition-colors"
            >
              {formatTime(currentTime)} /{" "}
              {showRemainingTime ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(duration)}
            </button>
          </div>

          {/* Right Controls: Subtitles, Audio, Speed, Settings, PiP, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Subtitles / CC Toggle */}
            <button
              onClick={() => {
                setSubtitleLang(subtitleLang === "off" ? "en" : "off")
              }}
              title="Closed Captions / Subtitles (C)"
              className={`p-1.5 rounded-lg transition-colors ${
                subtitleLang !== "off"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {subtitleLang !== "off" ? (
                <Captions className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <CaptionsOff className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Audio Track button */}
            <button
              onClick={() => setActiveMenu(activeMenu === "audio" ? "none" : "audio")}
              title="Audio Track Language"
              className={`p-1.5 rounded-lg transition-colors ${
                activeMenu === "audio"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Speed quick pill */}
            <button
              onClick={() => setActiveMenu(activeMenu === "speed" ? "none" : "speed")}
              title="Playback Speed"
              className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1 ${
                speed !== 1 ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{speed}x</span>
            </button>

            {/* Settings menu */}
            <button
              onClick={() => setActiveMenu(activeMenu === "settings" ? "none" : "settings")}
              title="Player Settings"
              className={`p-1.5 rounded-lg transition-colors ${
                activeMenu === "settings"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              title="Picture in Picture (P)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Fullscreen (F)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
