import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  MessageSquare,
  CheckCircle2,
  Trophy,
  Flame,
  User,
  BarChart3,
  LayoutDashboard,
  Settings,
  LogOut,
  BookOpen,
  Code2,
  Target,
  Sun,
  Moon,
} from "lucide-react"
import logoImg from "../assets/logo.png"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { useTheme } from "../context/ThemeContext"
import { getGlobalSignInUrl, logoutUser } from "../api/auth"
import { useAuth } from "../auth"
import { getUserLevelInfo } from "../utils/levelSystem"

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Tutorials", to: "/tutorials" },
  { label: "Roadmaps", to: "/roadmaps" },
  { label: "Courses", to: "/courses" },
  { label: "CodeLab", to: "/codelab" },
  { label: "Hardware & PCB", to: "/hardware" },
  { label: "Compilers", to: "/compilers" },
  { label: "SAP ABAP", to: "/compilers/abap-compiler" },
  { label: "Practice", to: "/practice" },
  { label: "Internships", to: "/internships" },
  { label: "Community", to: "/community" },
]


export default function Navbar() {
  const { notifications, profile, progress } = useSkiltrixData()
  const { user: authUser, isAuthenticated } = useAuth()
  const levelInfo = getUserLevelInfo(progress, profile)
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { toggleTheme, isDark } = useTheme()
  const hasToken = Boolean(localStorage.getItem("skiltrix_access_token") || localStorage.getItem("access_token"))
  const isSignedIn = Boolean(isAuthenticated && authUser) || (hasToken && Boolean(localStorage.getItem("user_id")))
  const user = (profile?.user as Record<string, unknown> | undefined) || (authUser as unknown as Record<string, unknown> | undefined)
  const userName = [user?.name, user?.lastname].filter(Boolean).join(" ") || String(user?.username ?? (authUser?.name || "Learner"))
  const userInitials = userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  const recentNotifications = (notifications || []).slice(0, 3).map((notice) => ({
    id: String(notice.notification_id),
    text: String(notice.title ?? "Notification"),
    time: notice.created_at ? new Date(String(notice.created_at)).toLocaleString() : "",
    color: "bg-indigo-50",
    icon: notice.category === "Achievements" ? <Trophy className="w-4 h-4 text-amber-500" /> : notice.category === "Community" ? <MessageSquare className="w-4 h-4 text-blue-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />,
  }))

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group py-1">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 p-0.5 flex items-center justify-center shadow-sm group-hover:border-indigo-500 transition-colors">
                <img
                  src={logoImg}
                  alt="SkilTrix Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-display text-xl text-slate-900 dark:text-white font-extrabold tracking-tight leading-none"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                  }}
                >
                  Skil<span className="text-indigo-600 dark:text-indigo-400">Trix</span>
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-tight mt-0.5 leading-none">
                  Learn, Practice &amp; Code
                </span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.804 7.5 7.5 0 0015.803 15.803z"
                  />
                </svg>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="flex p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform hover:-rotate-12" />
                )}
              </button>

              {isSignedIn ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setNotifOpen(!notifOpen)
                        setProfileOpen(false)
                      }}
                      className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      aria-label="Notifications"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                        />
                      </svg>
                      {notifications.some((notice) => !notice.read) && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>
                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white text-sm">
                            Notifications
                          </span>
                          <Link
                            to="/notifications"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            onClick={() => setNotifOpen(false)}
                          >
                            View all
                          </Link>
                        </div>
                        {recentNotifications.map((n) => (
                          <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex gap-3 items-start">
                            <span className={`w-8 h-8 rounded-lg ${n.color} flex items-center justify-center shrink-0`}>
                              {n.icon}
                            </span>
                            <div>
                              <p className="text-sm text-slate-700 dark:text-slate-200">{n.text}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setProfileOpen(!profileOpen)
                        setNotifOpen(false)
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Profile menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                        {userInitials || "?"}
                      </div>
                      <svg
                        className="w-4 h-4 text-slate-500 dark:text-slate-400 hidden md:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {userName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {String(user?.email ?? "")}
                          </p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                              Level {levelInfo.level}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-500" />
                              <span>{progress?.streak ?? 0}-day streak</span>
                            </span>
                          </div>
                        </div>
                        {[
                          {
                            label: "My Profile",
                            to: "/profile",
                            icon: <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
                          },
                          {
                            label: "Progress",
                            to: "/progress",
                            icon: <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
                          },
                          {
                            label: "Dashboard",
                            to: "/dashboard",
                            icon: <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
                          },
                          {
                            label: "Settings",
                            to: "/profile",
                            icon: <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
                          },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <span>{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1">
                          <button
                            onClick={logoutUser}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    href={getGlobalSignInUrl()}
                    className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href={getGlobalSignInUrl().replace('/login', '/signup')}
                    className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  >
                    Get Started
                  </a>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                aria-label="Open menu"
              >
                {mobileOpen ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-1 transition-colors">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Dark Mode Toggle */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 my-2 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>{isDark ? "Dark Theme" : "Light Theme"}</span>
              </span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                Toggle
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
              {isSignedIn ? (
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logoutUser()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out ({userName})</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <a
                    href={getGlobalSignInUrl()}
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl"
                  >
                    Sign In
                  </a>
                  <a
                    href={getGlobalSignInUrl().replace('/login', '/signup')}
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                  >
                    Get Started
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
              <svg
                className="w-5 h-5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.804 7.5 7.5 0 0015.803 15.803z"
                />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search courses, videos, problems, quizzes..."
                className="flex-1 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none bg-transparent"
              />
              <kbd className="hidden sm:flex items-center gap-1 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Python basics",
                  "DSA interview prep",
                  "JavaScript fundamentals",
                  "React hooks",
                  "SQL queries",
                  "System design",
                ].map((s) => (
                  <button
                    key={s}
                    className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-5">
                Quick navigation
              </p>
              <div className="space-y-1">
                {[
                  {
                    label: "Courses",
                    to: "/courses",
                    icon: <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
                  },
                  {
                    label: "Coding Practice",
                    to: "/practice",
                    icon: <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
                  },
                  {
                    label: "Interview Prep",
                    to: "/interview",
                    icon: <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
                  },
                  {
                    label: "Community",
                    to: "/community",
                    icon: <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for dropdowns */}
      {(notifOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotifOpen(false)
            setProfileOpen(false)
          }}
        />
      )}
    </>
  )
}
