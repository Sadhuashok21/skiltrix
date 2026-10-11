import api from "./client"
import {
  TUTORIAL_TRACKS,
  TUTORIAL_CATEGORIES,
  LEARNING_PATHS,
  TutorialTrackItem,
  TutorialLessonItem,
  TutorialModuleItem,
} from "../data/tutorialsCatalog"

// LocalStorage Keys for client-side persistence & offline support
const LS_PROGRESS_KEY = "skiltrix_tutorial_progress_v1"
const LS_BOOKMARKS_KEY = "skiltrix_tutorial_bookmarks_v1"
const LS_NOTES_KEY = "skiltrix_tutorial_notes_v1"
const LS_STREAK_KEY = "skiltrix_tutorial_streak_v1"
const LS_CERTS_KEY = "skiltrix_tutorial_certs_v1"

export interface UserProgressRecord {
  [trackId: string]: {
    completedLessons: string[] // lesson IDs
    quizScores: Record<string, number>
    lastLessonSlug?: string
    lastAccessedAt: string
  }
}

export interface UserBookmarkItem {
  id: string
  lessonId: string
  trackId: string
  title: string
  slug: string
  savedAt: string
}

export interface UserNoteItem {
  id: string
  lessonId: string
  trackId: string
  content: string
  updatedAt: string
}

export interface UserStreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string // YYYY-MM-DD
  activeDates: string[] // List of ISO date strings for current week
  totalXp: number
}

export interface IssuedCertificate {
  certificateId: string
  studentName: string
  trackId: string
  trackTitle: string
  issueDate: string
  grade?: string
  verificationUrl: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG ACCESS (HYBRID: Django REST API + In-Memory Fallback)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchTracks(): Promise<TutorialTrackItem[]> {
  try {
    const res = await api.get("/tutorials/tracks/")
    if (res.data?.success && Array.isArray(res.data.tracks) && res.data.tracks.length > 0) {
      // Merge backend tracks with catalog tracks
      const backendTrackMap = new Map<string, any>(res.data.tracks.map((t: any) => [t.id, t]))
      return TUTORIAL_TRACKS.map((catTrack) => {
        const remote = backendTrackMap.get(catTrack.id)
        if (!remote) return catTrack
        return {
          ...catTrack,
          title: remote.title || catTrack.title,
          description: remote.description || catTrack.description,
          icon: remote.icon || catTrack.icon,
        }
      })
    }
  } catch (err) {
    // Graceful fallback to static catalog
  }
  return TUTORIAL_TRACKS
}

export async function fetchTrackCurriculum(trackId: string): Promise<TutorialTrackItem | null> {
  const localTrack = TUTORIAL_TRACKS.find((t) => t.id.toLowerCase() === trackId.toLowerCase())
  try {
    const res = await api.get(`/tutorials/tracks/${encodeURIComponent(trackId)}/`)
    if (res.data?.success && res.data.track) {
      const remote = res.data.track
      if (localTrack) {
        return {
          ...localTrack,
          title: remote.title || localTrack.title,
          description: remote.description || localTrack.description,
          modules: localTrack.modules, // rich local curriculum
        }
      }
    }
  } catch (err) {
    // Use catalog fallback
  }
  return localTrack || null
}

export async function fetchLesson(
  trackId: string,
  lessonSlug: string
): Promise<{ track: TutorialTrackItem; module: TutorialModuleItem; lesson: TutorialLessonItem } | null> {
  const track = TUTORIAL_TRACKS.find((t) => t.id.toLowerCase() === trackId.toLowerCase())
  if (!track) return null

  for (const mod of track.modules) {
    const lesson = mod.lessons.find((l) => l.slug.toLowerCase() === lessonSlug.toLowerCase())
    if (lesson) {
      return { track, module: mod, lesson }
    }
  }

  // If slug was not found directly, try finding the first lesson in the first module
  if (track.modules.length > 0 && track.modules[0].lessons.length > 0) {
    const fallbackMod = track.modules[0]
    const fallbackLesson = fallbackMod.lessons[0]
    return { track, module: fallbackMod, lesson: fallbackLesson }
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS & COMPLETION TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export function getStoredProgress(): UserProgressRecord {
  try {
    const raw = localStorage.getItem(LS_PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveStoredProgress(progress: UserProgressRecord) {
  try {
    localStorage.setItem(LS_PROGRESS_KEY, JSON.stringify(progress))
  } catch (err) {
    console.error("Failed to save progress to localStorage:", err)
  }
}

export async function recordLessonProgress(payload: {
  trackId: string
  lessonId: string
  lessonSlug: string
  completed?: boolean
  quizScore?: number
  timeSpentSeconds?: number
}) {
  // Update local storage state immediately
  const progress = getStoredProgress()
  const trackProg = progress[payload.trackId] || {
    completedLessons: [],
    quizScores: {},
    lastLessonSlug: payload.lessonSlug,
    lastAccessedAt: new Date().toISOString(),
  }

  if (payload.completed && !trackProg.completedLessons.includes(payload.lessonId)) {
    trackProg.completedLessons.push(payload.lessonId)
  }
  if (payload.quizScore !== undefined) {
    trackProg.quizScores[payload.lessonId] = payload.quizScore
  }
  trackProg.lastLessonSlug = payload.lessonSlug
  trackProg.lastAccessedAt = new Date().toISOString()
  progress[payload.trackId] = trackProg
  saveStoredProgress(progress)

  // Update activity streak
  recordActivityStreak(payload.completed ? 25 : 5)

  // Sync with Django backend if available
  try {
    await api.post("/tutorials/progress/", {
      track_id: payload.trackId,
      lesson_id: payload.lessonId,
      is_completed: payload.completed ?? false,
      quiz_score: payload.quizScore ?? 0,
      time_spent_seconds: payload.timeSpentSeconds ?? 60,
    })
  } catch {
    // Silent catch, client-side is source of truth in offline mode
  }

  return trackProg
}

export function getTrackCompletionStats(track: TutorialTrackItem) {
  const progress = getStoredProgress()
  const trackProg = progress[track.id]
  const completedSet = new Set(trackProg?.completedLessons || [])

  let totalLessons = 0
  let completedCount = 0

  track.modules.forEach((mod) => {
    mod.lessons.forEach((l) => {
      totalLessons++
      if (completedSet.has(l.id)) {
        completedCount++
      }
    })
  })

  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  return {
    totalLessons,
    completedCount,
    percent,
    isCompleted: totalLessons > 0 && completedCount >= totalLessons,
    lastLessonSlug: trackProg?.lastLessonSlug,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY STREAK & XP SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export function getStreakData(): UserStreakData {
  const defaultStreak: UserStreakData = {
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    activeDates: [new Date().toISOString().slice(0, 10)],
    totalXp: 120,
  }
  try {
    const raw = localStorage.getItem(LS_STREAK_KEY)
    if (!raw) {
      localStorage.setItem(LS_STREAK_KEY, JSON.stringify(defaultStreak))
      return defaultStreak
    }
    return JSON.parse(raw)
  } catch {
    return defaultStreak
  }
}

export function recordActivityStreak(xpEarned: number = 10): UserStreakData {
  const data = getStreakData()
  const today = new Date().toISOString().slice(0, 10)

  if (data.lastActiveDate !== today) {
    const lastDate = new Date(data.lastActiveDate)
    const currentDate = new Date(today)
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      data.currentStreak += 1
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak
      }
    } else if (diffDays > 1) {
      data.currentStreak = 1
    }

    data.lastActiveDate = today
    if (!data.activeDates.includes(today)) {
      data.activeDates.push(today)
    }
  }

  data.totalXp += xpEarned

  try {
    localStorage.setItem(LS_STREAK_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }

  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────────────────────────────────────

export function getBookmarks(): UserBookmarkItem[] {
  try {
    const raw = localStorage.getItem(LS_BOOKMARKS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function toggleBookmark(item: {
  lessonId: string
  trackId: string
  title: string
  slug: string
}): Promise<boolean> {
  const bookmarks = getBookmarks()
  const idx = bookmarks.findIndex((b) => b.lessonId === item.lessonId)
  let isBookmarked = false

  if (idx >= 0) {
    bookmarks.splice(idx, 1)
    isBookmarked = false
  } else {
    bookmarks.unshift({
      id: `bm_${Date.now()}`,
      lessonId: item.lessonId,
      trackId: item.trackId,
      title: item.title,
      slug: item.slug,
      savedAt: new Date().toISOString(),
    })
    isBookmarked = true
  }

  try {
    localStorage.setItem(LS_BOOKMARKS_KEY, JSON.stringify(bookmarks))
  } catch {
    // ignore
  }

  try {
    await api.post("/tutorials/bookmarks/toggle/", {
      lesson_id: item.lessonId,
      track_id: item.trackId,
    })
  } catch {
    // silent catch
  }

  return isBookmarked
}

export function isLessonBookmarked(lessonId: string): boolean {
  const bookmarks = getBookmarks()
  return bookmarks.some((b) => b.lessonId === lessonId)
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────────────────────────

export function getNotes(): UserNoteItem[] {
  try {
    const raw = localStorage.getItem(LS_NOTES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getNoteForLesson(lessonId: string): UserNoteItem | undefined {
  const notes = getNotes()
  return notes.find((n) => n.lessonId === lessonId)
}

export async function saveNote(lessonId: string, trackId: string, content: string): Promise<UserNoteItem> {
  const notes = getNotes()
  const idx = notes.findIndex((n) => n.lessonId === lessonId)
  const noteItem: UserNoteItem = {
    id: idx >= 0 ? notes[idx].id : `note_${Date.now()}`,
    lessonId,
    trackId,
    content,
    updatedAt: new Date().toISOString(),
  }

  if (idx >= 0) {
    notes[idx] = noteItem
  } else {
    notes.unshift(noteItem)
  }

  try {
    localStorage.setItem(LS_NOTES_KEY, JSON.stringify(notes))
  } catch {
    // ignore
  }

  try {
    await api.post("/tutorials/notes/", {
      lesson_id: lessonId,
      track_id: trackId,
      content,
    })
  } catch {
    // silent catch
  }

  return noteItem
}

export function deleteNote(lessonId: string) {
  const notes = getNotes().filter((n) => n.lessonId !== lessonId)
  try {
    localStorage.setItem(LS_NOTES_KEY, JSON.stringify(notes))
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATES
// ─────────────────────────────────────────────────────────────────────────────

export function getIssuedCertificates(): IssuedCertificate[] {
  try {
    const raw = localStorage.getItem(LS_CERTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function issueCertificate(trackId: string, studentName: string): Promise<IssuedCertificate> {
  const track = TUTORIAL_TRACKS.find((t) => t.id === trackId)
  const trackTitle = track ? track.title : trackId.toUpperCase()
  const certId = `STX-${trackId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  const cert: IssuedCertificate = {
    certificateId: certId,
    studentName: studentName || "SkilTrix Scholar",
    trackId,
    trackTitle,
    issueDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    grade: "Distinction",
    verificationUrl: `${window.location.origin}/certificates/${certId}`,
  }

  const certs = getIssuedCertificates()
  certs.unshift(cert)
  try {
    localStorage.setItem(LS_CERTS_KEY, JSON.stringify(certs))
  } catch {
    // ignore
  }

  try {
    await api.post("/tutorials/certificate/issue/", {
      track_id: trackId,
      student_name: cert.studentName,
    })
  } catch {
    // fallback
  }

  return cert
}

export function getCertificateById(certId: string): IssuedCertificate | null {
  const certs = getIssuedCertificates()
  const found = certs.find((c) => c.certificateId.toLowerCase() === certId.toLowerCase())
  if (found) return found

  // Generate deterministic preview if opened via link
  const parts = certId.split("-")
  const trackCode = parts[1] || "DEV"
  const matchedTrack = TUTORIAL_TRACKS.find((t) => t.id.toLowerCase() === trackCode.toLowerCase())
  return {
    certificateId: certId,
    studentName: "SkilTrix Certified Developer",
    trackId: matchedTrack?.id || trackCode.toLowerCase(),
    trackTitle: matchedTrack?.title || `${trackCode.toUpperCase()} Professional`,
    issueDate: "October 2026",
    grade: "Verified Proficiency",
    verificationUrl: `${window.location.origin}/certificates/${certId}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE EXECUTION BRIDGE (Backend Sandbox / Client-Side Web)
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeExecutionResult {
  output: string
  success: boolean
  executionTimeMs?: number
  isClientSide?: boolean
}

export async function executeTutorialCode(
  language: string,
  code: string,
  stdin: string = ""
): Promise<CodeExecutionResult> {
  const langLower = language.toLowerCase()

  // Client-side HTML / CSS / JS sandbox execution
  if (langLower === "html" || langLower === "css") {
    return {
      output: code,
      success: true,
      isClientSide: true,
    }
  }

  if (langLower === "javascript" || langLower === "js") {
    // Client-side execution in a safe capture context
    try {
      const logs: string[] = []
      const fakeConsole = {
        log: (...args: any[]) => logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
        error: (...args: any[]) => logs.push("ERROR: " + args.join(" ")),
        warn: (...args: any[]) => logs.push("WARN: " + args.join(" ")),
        info: (...args: any[]) => logs.push(args.join(" ")),
      }
      const runFn = new Function("console", code)
      runFn(fakeConsole)
      return {
        output: logs.join("\n") || "Program completed with no output.",
        success: true,
        isClientSide: true,
      }
    } catch (err: any) {
      return {
        output: `Runtime Error: ${err.message || String(err)}`,
        success: false,
        isClientSide: true,
      }
    }
  }

  // Server-side execution for Java, Python, C++, C#, Go, Rust, PHP, SQL
  try {
    // Map language string to backend expected name
    const langMap: Record<string, string> = {
      java: "Java",
      python: "Python",
      py: "Python",
      cpp: "C++",
      "c++": "C++",
      c: "C",
      csharp: "C#",
      "c#": "C#",
      php: "PHP",
      go: "Go",
      rust: "Rust",
      sql: "SQL",
      typescript: "TypeScript",
      ts: "TypeScript",
    }
    const backendLang = langMap[langLower] || language

    const startTime = performance.now()
    const response = await api.post("/actions/execute-code/", {
      language: backendLang,
      code,
      stdin,
    })
    const elapsed = Math.round(performance.now() - startTime)

    return {
      output: response.data?.output || "Program completed with no output.",
      success: response.data?.success ?? true,
      executionTimeMs: elapsed,
      isClientSide: false,
    }
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.detail ||
      err?.response?.data?.output ||
      err?.message ||
      "Could not execute code on sandboxed backend."
    return {
      output: `Execution failed:\n${errorMsg}`,
      success: false,
      isClientSide: false,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchResultItem {
  id: string
  title: string
  snippet: string
  trackId: string
  trackTitle: string
  lessonSlug: string
  type: "track" | "lesson" | "syntax" | "challenge"
}

export function searchLocalTutorials(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: SearchResultItem[] = []

  TUTORIAL_TRACKS.forEach((track) => {
    // Check track title or description
    if (track.title.toLowerCase().includes(q) || track.description.toLowerCase().includes(q)) {
      results.push({
        id: `track_${track.id}`,
        title: `${track.title} Tutorial`,
        snippet: track.description,
        trackId: track.id,
        trackTitle: track.title,
        lessonSlug: track.modules[0]?.lessons[0]?.slug || "intro",
        type: "track",
      })
    }

    // Check modules and lessons
    track.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        const titleMatch = lesson.title.toLowerCase().includes(q)
        const expMatch = lesson.explanation.toLowerCase().includes(q)
        const objMatch = lesson.learningObjectives.some((obj) => obj.toLowerCase().includes(q))

        if (titleMatch || expMatch || objMatch) {
          // Extract matching snippet
          let snippet = lesson.learningObjectives[0] || lesson.title
          if (expMatch) {
            const idx = lesson.explanation.toLowerCase().indexOf(q)
            snippet = "..." + lesson.explanation.slice(Math.max(0, idx - 40), idx + 80) + "..."
          }

          results.push({
            id: `lesson_${lesson.id}`,
            title: `${lesson.title} (${track.title})`,
            snippet,
            trackId: track.id,
            trackTitle: track.title,
            lessonSlug: lesson.slug,
            type: "lesson",
          })
        }
      })
    })
  })

  return results.slice(0, 15)
}

