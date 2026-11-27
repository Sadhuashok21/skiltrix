import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapCourse } from "../data/apiAdapters"
import { updateProfile } from "../api/profile"
import { getGlobalSignInUrl } from "../api/auth"
import { TechIcon } from "../components/TechIcons"
import { getUserLevelInfo, calculateDynamicStreak } from "../utils/levelSystem"
import { getBookmarks, toggleBookmark, UserBookmarkItem } from "../api/tutorialsApi"
import { TUTORIAL_TRACKS } from "../data/tutorialsCatalog"
import {
  CheckCircle2,
  Target,
  Code2,
  MessageSquare,
  Trophy,
  BookOpen,
  Flame,
  Zap,
  Check,
  Lock,
  Camera,
  Plus,
  Edit3,
  Save,
  X as XIcon,
  Bookmark,
  BookmarkCheck,
  Trash2,
  PlayCircle,
  ExternalLink,
  Clock,
  Sparkles,
  ChevronRight,
  GraduationCap,
  FolderHeart,
  Layers,
  Film,
} from "lucide-react"

const tabs = ["Overview", "Courses", "Achievements", "Activity", "Saved"]

interface CustomGoal {
  id: string
  text: string
  done: boolean
}

export default function Profile() {
  const {
    profile,
    progress,
    discussions,
    enrollments,
    badges: apiBadges,
    activity,
    refresh,
    videos,
    courses: catalogCourses,
  } = useSkiltrixData()

  const isSignedIn = Boolean(localStorage.getItem("user_id"))
  const courses = enrollments.map((item) => mapCourse(item.course, item.progress_percent))
  const earnedNames = (profile?.earned_badges as string[] | undefined) ?? []
  const badges = apiBadges.map((badge) => ({
    name: String(badge.name ?? "Badge"),
    icon: String(badge.icon ?? "trophy"),
    description: String(badge.description ?? ""),
    earned: earnedNames.includes(String(badge.name)),
  }))

  const activityFeed = activity.map((item) => ({
    icon: item.problems_solved ? Code2 : item.quizzes_completed ? Target : BookOpen,
    text: `${item.problems_solved ?? 0} problems solved · ${item.quizzes_completed ?? 0} quizzes completed`,
    time: item.date ? new Date(String(item.date)).toLocaleDateString() : "",
    color: "bg-indigo-50 text-indigo-600",
  }))

  const [activeTab, setActiveTab] = useState("Overview")
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState("")
  const [name, setName] = useState("")
  const [profileError, setProfileError] = useState("")
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem("skiltrix_custom_avatar"))

  // User Skills with persistent storage
  const [skills, setSkills] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("skiltrix_user_skills")
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return ["Python", "JavaScript", "Django", "React", "SQL", "DSA"]
  })
  const [newSkillText, setNewSkillText] = useState("")
  const [showAddSkill, setShowAddSkill] = useState(false)

  // Saved items states
  const [savedBookmarks, setSavedBookmarks] = useState<UserBookmarkItem[]>(() => getBookmarks())
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("skiltrix_saved_videos") || "[]")
    } catch {
      return []
    }
  })
  const [savedCourseIds, setSavedCourseIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("skiltrix_saved_courses") || "[]")
    } catch {
      return []
    }
  })
  const [savedCategory, setSavedCategory] = useState<"all" | "tutorials" | "videos" | "courses">("all")

  // Courses Tab Filter
  const [coursesFilter, setCoursesFilter] = useState<"all" | "in_progress" | "completed">("all")

  // Custom User Goals - Initialize cleanly without mock defaults
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>(() => {
    try {
      const stored = localStorage.getItem("skiltrix_custom_goals")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Filter out legacy mock goals
          return parsed.filter(
            (g: any) =>
              g &&
              g.id !== "g1" &&
              g.id !== "g2" &&
              g.text !== "Master ABAP OO Design Patterns" &&
              g.text !== "Complete Full-Stack React & Django Project"
          )
        }
      }
    } catch {
      // ignore
    }
    return []
  })
  const [newGoalText, setNewGoalText] = useState("")
  const [showAddGoal, setShowAddGoal] = useState(false)

  // Clean legacy mock goals from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("skiltrix_custom_goals")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (g: any) =>
              g &&
              g.id !== "g1" &&
              g.id !== "g2" &&
              g.text !== "Master ABAP OO Design Patterns" &&
              g.text !== "Complete Full-Stack React & Django Project"
          )
          if (cleaned.length !== parsed.length) {
            localStorage.setItem("skiltrix_custom_goals", JSON.stringify(cleaned))
          }
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Sync bookmarks and saved video state on tab focus or change
  useEffect(() => {
    setSavedBookmarks(getBookmarks())
    try {
      setSavedVideoIds(JSON.parse(localStorage.getItem("skiltrix_saved_videos") || "[]"))
      setSavedCourseIds(JSON.parse(localStorage.getItem("skiltrix_saved_courses") || "[]"))
    } catch {
      // ignore
    }
  }, [activeTab])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result)
          localStorage.setItem("skiltrix_custom_avatar", reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddSkill = () => {
    const s = newSkillText.trim()
    if (s && !skills.includes(s)) {
      const updated = [...skills, s]
      setSkills(updated)
      localStorage.setItem("skiltrix_user_skills", JSON.stringify(updated))
      setNewSkillText("")
      setShowAddSkill(false)
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove)
    setSkills(updated)
    localStorage.setItem("skiltrix_user_skills", JSON.stringify(updated))
  }

  const handleAddGoal = () => {
    const text = newGoalText.trim()
    if (text) {
      const updated = [...customGoals, { id: `g_${Date.now()}`, text, done: false }]
      setCustomGoals(updated)
      localStorage.setItem("skiltrix_custom_goals", JSON.stringify(updated))
      setNewGoalText("")
      setShowAddGoal(false)
    }
  }

  const handleToggleGoal = (id: string) => {
    const updated = customGoals.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    setCustomGoals(updated)
    localStorage.setItem("skiltrix_custom_goals", JSON.stringify(updated))
  }

  const handleDeleteGoal = (id: string) => {
    const updated = customGoals.filter((g) => g.id !== id)
    setCustomGoals(updated)
    localStorage.setItem("skiltrix_custom_goals", JSON.stringify(updated))
  }

  const handleRemoveBookmark = async (item: UserBookmarkItem) => {
    await toggleBookmark({
      lessonId: item.lessonId,
      trackId: item.trackId,
      title: item.title,
      slug: item.slug,
    })
    setSavedBookmarks(getBookmarks())
  }

  const handleRemoveSavedVideo = (vidId: string) => {
    const updated = savedVideoIds.filter((id) => id !== vidId)
    setSavedVideoIds(updated)
    localStorage.setItem("skiltrix_saved_videos", JSON.stringify(updated))
  }

  const handleRemoveSavedCourse = (courseId: string) => {
    const updated = savedCourseIds.filter((id) => id !== courseId)
    setSavedCourseIds(updated)
    localStorage.setItem("skiltrix_saved_courses", JSON.stringify(updated))
  }

  const userRecord = profile?.user as Record<string, unknown> | undefined
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?"

  // Dynamic calculations
  const dynamicStreak = calculateDynamicStreak(progress, profile, activity)
  const levelInfo = getUserLevelInfo(progress, profile)

  // Saved videos detail derivation
  const savedVideosList = savedVideoIds.map((vidId) => {
    const matched = videos.find((v) => String(v.video_id) === String(vidId))
    if (matched) return matched
    return {
      video_id: vidId,
      title: `Saved Lecture #${vidId}`,
      description: "Video lecture walkthrough and code demonstration.",
      course_name: "Video Course",
      views: 0,
      created_at: new Date().toISOString(),
    }
  })

  // Saved courses derivation
  const savedCoursesList = catalogCourses
    .filter((c) => savedCourseIds.includes(c.course_id))
    .map((c) => {
      const enrollment = enrollments.find((e) => e.course?.course_id === c.course_id)
      return mapCourse(c, enrollment?.progress_percent ?? 0)
    })

  // Total saved counts
  const totalSavedCount = savedBookmarks.length + savedVideosList.length + savedCoursesList.length

  useEffect(() => {
    setBio(String(profile?.bio ?? ""))
    const user = profile?.user as Record<string, unknown> | undefined
    setName([user?.name, user?.lastname].filter(Boolean).join(" ") || String(user?.username ?? "Learner"))
  }, [profile])

  if (!isSignedIn) {
    return (
      <main className="min-h-[60vh] grid place-items-center px-4 py-12">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Sign in to view your profile</h1>
          <p className="mt-2 text-sm text-slate-600">Your profile, progress, and saved activity are available after you sign in.</p>
          <a href={getGlobalSignInUrl()} className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">Sign in</a>
        </section>
      </main>
    )
  }

  const toggleEditing = async () => {
    if (!editing) { setProfileError(""); setEditing(true); return }
    setSaving(true)
    try {
      await updateProfile({ bio, name })
      setEditing(false)
      refresh()
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Profile could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  // Filtered courses for Courses tab
  const filteredCourses = courses.filter((c) => {
    if (coursesFilter === "completed") return c.progress >= 100
    if (coursesFilter === "in_progress") return c.progress > 0 && c.progress < 100
    return true
  })

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent_50%)]" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white shadow-lg overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm transition-colors cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-extrabold text-slate-900 border-b-2 border-indigo-500 outline-none bg-transparent"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              ) : (
                <h1
                  className="text-2xl font-extrabold text-slate-900"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {name}
                </h1>
              )}
              <p className="text-slate-500 text-sm">
                @{String(userRecord?.username ?? "")}{profile?.created_at ? ` · Member since ${new Date(String(profile.created_at)).toLocaleDateString()}` : ""}
              </p>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <button
                onClick={() => void toggleEditing()}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                  editing
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    : "border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                {saving ? (
                  "Saving…"
                ) : editing ? (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </>
                )}
              </button>

              {profileError && <p className="text-xs text-red-600">{profileError}</p>}
            </div>
          </div>

          {/* Stats row with dynamic streak & level */}
          <div className="flex flex-wrap gap-6 mb-5">
            {[
              { label: "Courses", value: String(progress?.courses_enrolled ?? courses.length ?? 0), icon: BookOpen },
              { label: "Problems Solved", value: String(progress?.problems_solved ?? 0), icon: Code2 },
              { label: "Quizzes", value: String(progress?.quizzes_passed ?? 0), icon: Target },
              { label: "Discussions", value: String(discussions.length), icon: MessageSquare },
              { label: "Streak", value: `${dynamicStreak}d`, icon: Flame },
              { label: "Level", value: String(levelInfo.level), icon: Zap },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <span>{s.value}</span>
                  <s.icon
                    className={`w-4 h-4 ${
                      s.label === "Streak"
                        ? "text-orange-500 fill-orange-500"
                        : s.label === "Level"
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-400"
                    }`}
                  />
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-sm text-slate-700 max-w-2xl leading-relaxed">
                {bio || "Passionate about software engineering, problem solving, and building modern apps."}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {skills.map((s) => (
              <span
                key={s}
                className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5"
              >
                <span>{s}</span>
                {editing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                    title={`Remove ${s}`}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {editing && (
              showAddSkill ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    placeholder="Skill name..."
                    autoFocus
                    className="text-xs border border-indigo-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 w-28 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSkill(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddSkill(true)}
                  className="text-xs font-medium border border-dashed border-indigo-300 text-indigo-500 hover:border-indigo-500 hover:text-indigo-600 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Skill
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 overflow-x-auto shadow-sm">
        {tabs.map((tab) => {
          const countBadge =
            tab === "Courses"
              ? courses.length
              : tab === "Saved"
                ? totalSavedCount
                : null

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{tab}</span>
              {countBadge !== null && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {countBadge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "Overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2
                className="font-bold text-slate-900 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Recent Activity
              </h2>
              {activityFeed.length > 0 ? (
                <div className="space-y-3">
                  {activityFeed.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center text-sm shrink-0`}
                      >
                        <a.icon className="w-4 h-4" />
                      </span>
                      <p className="text-sm text-slate-700 flex-1">{a.text}</p>
                      <span className="text-xs text-slate-400 shrink-0">
                        {a.time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 text-sm">
                  <p>No recent activity yet. Solve problems or take quizzes to see your timeline here!</p>
                  <div className="mt-3 flex justify-center gap-3">
                    <Link to="/practice" className="text-xs font-semibold text-indigo-600 hover:underline">
                      Solve Problems &rarr;
                    </Link>
                    <Link to="/quizzes" className="text-xs font-semibold text-indigo-600 hover:underline">
                      Take Quizzes &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Enrolled courses */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="font-bold text-slate-900"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Enrolled Courses
                </h2>
                {courses.length > 0 && (
                  <button
                    onClick={() => setActiveTab("Courses")}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    View All ({courses.length})
                  </button>
                )}
              </div>

              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <TechIcon name={course.icon || course.title} className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-indigo-600 shrink-0">
                            {course.progress}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 text-sm">
                  <p>You haven't enrolled in any courses yet.</p>
                  <Link
                    to="/courses"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Browse Course Catalog &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {/* Dynamic Level & XP card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-5 text-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold opacity-90 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" /> Current Progression
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Level {levelInfo.level}
                </span>
              </div>
              <div
                className="text-3xl font-extrabold mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {levelInfo.formattedTotalXp}
              </div>
              <div className="h-2 bg-white/20 rounded-full mb-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-indigo-100">
                <span>{levelInfo.formattedXpNeeded}</span>
                <span>{levelInfo.progressPercent}% to Lvl {levelInfo.nextLevel}</span>
              </div>
            </div>

            {/* Badges preview */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <Trophy className="w-4 h-4 text-amber-500" /> Badges & Achievements
                </h3>
                <button
                  onClick={() => setActiveTab("Achievements")}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {badges
                  .filter((b) => b.earned)
                  .map((b) => (
                    <div
                      key={b.name}
                      title={b.name}
                      className="flex flex-col items-center gap-1.5 p-2 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100/60 dark:border-amber-800/40 rounded-lg text-center"
                    >
                      <TechIcon name={b.icon || b.name} className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span
                        className="text-center leading-tight text-slate-700 dark:text-slate-200 font-semibold truncate w-full"
                        style={{ fontSize: "9px" }}
                      >
                        {b.name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                {badges
                  .filter((b) => !b.earned)
                  .slice(0, Math.max(0, 4 - badges.filter((b) => b.earned).length))
                  .map((b) => (
                    <div
                      key={b.name}
                      title={b.name}
                      className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg opacity-40 text-center"
                    >
                      <TechIcon name={b.icon || b.name} className="w-5 h-5 text-slate-400" />
                      <span
                        className="text-center leading-tight text-slate-400 font-medium truncate w-full"
                        style={{ fontSize: "9px" }}
                      >
                        Locked
                      </span>
                    </div>
                  ))}
              </div>
            </div>


          </div>
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === "Courses" && (
        <div className="space-y-6">
          {/* Courses Header & Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-bold text-slate-900"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  My Enrolled Courses
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage and continue your active coursework across specialized tracks.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: `All (${courses.length})` },
                  { id: "in_progress", label: `In Progress (${courses.filter((c) => c.progress > 0 && c.progress < 100).length})` },
                  { id: "completed", label: `Completed (${courses.filter((c) => c.progress >= 100).length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCoursesFilter(f.id as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      coursesFilter === f.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <TechIcon name={course.icon || course.title} className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          course.progress >= 100
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : course.progress > 0
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {course.progress >= 100
                          ? "Completed"
                          : course.progress > 0
                            ? `${course.progress}% Completed`
                            : "Not Started"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
                      {course.description || "In-depth structured curriculum with coding labs and practical projects."}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Progress</span>
                        <span className="font-bold text-indigo-600">{course.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {course.lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.duration || "Self-paced"}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <Link
                      to={`/courses/${course.id}`}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Continue Learning</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No courses match this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                Explore our rich selection of enterprise technical courses, interactive labs, and certified pathways.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <span>Browse Course Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACHIEVEMENTS */}
      {activeTab === "Achievements" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="font-bold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                All Badges & Achievements
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Badges unlocked by solving problems, passing technical quizzes, and maintaining consistency.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {badges.filter((b) => b.earned).length} / {badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((b) => (
              <div
                key={b.name}
                className={`p-4 rounded-xl border text-center transition-all ${
                  b.earned
                    ? "border-amber-200 bg-amber-50/70 shadow-sm"
                    : "border-slate-200 bg-slate-50 opacity-50"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-amber-200/60 shadow-sm flex items-center justify-center mx-auto mb-2.5">
                  <TechIcon name={b.icon || b.name} className="w-6 h-6 text-amber-600" />
                </div>
                <div
                  className="text-sm font-bold text-slate-900 mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {b.name}
                </div>
                <div className="text-xs text-slate-500 line-clamp-2">{b.description}</div>
                <div
                  className={`mt-2.5 text-xs font-semibold flex items-center justify-center gap-1 ${
                    b.earned ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {b.earned ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Earned</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY */}
      {activeTab === "Activity" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2
            className="font-bold text-slate-900 mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Activity History
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            A chronological timeline of your coding exercises, quizzes, and learning milestones.
          </p>

          {activityFeed.length > 0 ? (
            <div className="space-y-3">
              {activityFeed.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center shrink-0`}
                  >
                    <a.icon className="w-4 h-4" />
                  </span>
                  <p className="text-sm text-slate-700 flex-1">{a.text}</p>
                  <span className="text-xs text-slate-400">{a.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p>No activity records logged yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Your submissions and quiz attempts will automatically populate this activity log.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SAVED ITEMS (DYNAMIC TUTORIAL BOOKMARKS, VIDEOS, AND COURSES) */}
      {activeTab === "Saved" && (
        <div className="space-y-6">
          {/* Header & Category filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-bold text-slate-900 flex items-center gap-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <Bookmark className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                  Saved Items & Bookmarks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quickly jump back into bookmarked tutorial lessons, saved video lectures, and courses.
                </p>
              </div>

              {/* Sub-filter pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: `All (${totalSavedCount})` },
                  { id: "tutorials", label: `Tutorials (${savedBookmarks.length})` },
                  { id: "videos", label: `Videos (${savedVideosList.length})` },
                  { id: "courses", label: `Courses (${savedCoursesList.length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSavedCategory(f.id as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      savedCategory === f.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* If completely empty */}
          {totalSavedCount === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No saved items found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                You haven't bookmarked any lessons, saved videos, or saved courses yet. Bookmark your favorite tutorials as you learn to easily resume where you left off.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/tutorials"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse Tutorials</span>
                </Link>
                <Link
                  to="/videos"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Watch Video Lectures</span>
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Explore Courses</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SECTION 1: TUTORIAL LESSON BOOKMARKS */}
              {(savedCategory === "all" || savedCategory === "tutorials") && savedBookmarks.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="font-bold text-slate-900 flex items-center gap-2 text-sm"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      Bookmarked Tutorial Lessons ({savedBookmarks.length})
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedBookmarks.map((bm) => {
                      const track = TUTORIAL_TRACKS.find((t) => t.id.toLowerCase() === bm.trackId.toLowerCase())
                      return (
                        <div
                          key={bm.id || bm.lessonId}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                {track?.category || "Tutorial"}
                              </span>
                              <button
                                onClick={() => void handleRemoveBookmark(bm)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                title="Remove bookmark"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">
                              {bm.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                              {track?.title || bm.trackId}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              {bm.savedAt ? new Date(bm.savedAt).toLocaleDateString() : "Saved"}
                            </span>
                            <Link
                              to={`/tutorials/${bm.trackId}/${bm.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              <span>Open Lesson</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: SAVED VIDEO LECTURES */}
              {(savedCategory === "all" || savedCategory === "videos") && savedVideosList.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="font-bold text-slate-900 flex items-center gap-2 text-sm"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      <Film className="w-4 h-4 text-purple-600" />
                      Saved Video Lectures ({savedVideosList.length})
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedVideosList.map((v) => (
                      <div
                        key={v.video_id}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                            {v.image_url || v.image ? (
                              <img
                                src={v.image_url || v.image}
                                alt={v.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                                <PlayCircle className="w-10 h-10 opacity-70" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                              <PlayCircle className="w-10 h-10 text-white drop-shadow-md" />
                            </div>
                            <button
                              onClick={() => handleRemoveSavedVideo(String(v.video_id))}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:text-red-400 hover:bg-black/80 transition-colors cursor-pointer"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="p-4">
                            <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">
                              {v.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                              {v.course_name || "Enterprise Video Lecture"}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {v.views ? `${v.views.toLocaleString()} views` : "HD Video"}
                          </span>
                          <Link
                            to={`/videos?video_id=${v.video_id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            <span>Watch Now</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: SAVED COURSES */}
              {(savedCategory === "all" || savedCategory === "courses") && savedCoursesList.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="font-bold text-slate-900 flex items-center gap-2 text-sm"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      Saved Courses ({savedCoursesList.length})
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedCoursesList.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                              <TechIcon name={course.icon || course.title} className="w-5 h-5 text-indigo-600" />
                            </div>
                            <button
                              onClick={() => handleRemoveSavedCourse(course.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{course.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">{course.lessons} lessons</span>
                          <Link
                            to={`/courses/${course.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            <span>Open Course</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
