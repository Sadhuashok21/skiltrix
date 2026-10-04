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
} from "lucide-react"
import logoImg from "../assets/logo.png"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { getGlobalSignInUrl, logoutUser } from "../api/auth"
import { useAuth } from "../auth"

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "CodeLab", to: "/codelab" },
  { label: "SAP ABAP", to: "/abap" },
  { label: "Practice", to: "/practice" },
  { label: "Videos", to: "/videos" },
  { label: "Quizzes", to: "/quizzes" },
  { label: "Internships", to: "/internships" },
  { label: "Community", to: "/community" },
]

export default function Navbar() {
  const { notifications, profile, progress } = useSkiltrixData()
  const { user: authUser, isAuthenticated } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
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
                  className="font-display text-xl text-slate-900 font-extrabold tracking-tight leading-none"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                  }}
                >
                  Skil<span className="text-indigo-600">Trix</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 leading-none">
                  Developed by <strong className="text-slate-600 font-semibold">Ascentracore Solutions</strong>
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
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
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
                onClick={() => setDarkMode(!darkMode)}
                className="hidden md:flex p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
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
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
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
                      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                    />
                  </svg>
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
                      className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
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
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-semibold text-slate-900 text-sm">
                            Notifications
                          </span>
                          <Link
                            to="/notifications"
                            className="text-xs text-indigo-600 hover:underline"
                            onClick={() => setNotifOpen(false)}
                          >
                            View all
                          </Link>
                        </div>
                        {recentNotifications.map((n) => (
                          <div key={n.id} className="px-4 py-3 hover:bg-slate-50 flex gap-3 items-start">
                            <span className={`w-8 h-8 rounded-lg ${n.color} flex items-center justify-center shrink-0`}>
                              {n.icon}
                            </span>
                            <div>
                              <p className="text-sm text-slate-700">{n.text}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
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
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100"
                      aria-label="Profile menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                        {userInitials || "?"}
                      </div>
                      <svg
                        className="w-4 h-4 text-slate-500 hidden md:block"
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
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900">
                            {userName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {String(user?.email ?? "")}
                          </p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                              Level {Math.floor(Number(progress?.xp ?? 0) / 1000) + 1}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-500" />
                              <span>{progress?.streak ?? 0}-day streak</span>
                            </span>
                          </div>
                        </div>
                        {[
                          {
                            label: "My Profile",
                            to: "/profile",
                            icon: <User className="w-4 h-4 text-slate-500" />,
                          },
                          {
                            label: "Progress",
                            to: "/progress",
                            icon: <BarChart3 className="w-4 h-4 text-slate-500" />,
                          },
                          {
                            label: "Dashboard",
                            to: "/dashboard",
                            icon: <LayoutDashboard className="w-4 h-4 text-slate-500" />,
                          },
                          {
                            label: "Settings",
                            to: "/profile",
                            icon: <Settings className="w-4 h-4 text-slate-500" />,
                          },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <span>{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-slate-100 mt-1">
                          <button
                            onClick={logoutUser}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
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
                    className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
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
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-lg ${
                  location.pathname === link.to
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 mt-2">
              {isSignedIn ? (
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logoutUser()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out ({userName})</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <a
                    href={getGlobalSignInUrl()}
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl"
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-slate-200">
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
                className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
              />
              <kbd className="hidden sm:flex items-center gap-1 text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
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
                    className="text-sm text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg"
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
                    icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
                  },
                  {
                    label: "Coding Practice",
                    to: "/practice",
                    icon: <Code2 className="w-4 h-4 text-indigo-600" />,
                  },
                  {
                    label: "Interview Prep",
                    to: "/interview",
                    icon: <Target className="w-4 h-4 text-indigo-600" />,
                  },
                  {
                    label: "Community",
                    to: "/community",
                    icon: <MessageSquare className="w-4 h-4 text-indigo-600" />,
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-700"
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
