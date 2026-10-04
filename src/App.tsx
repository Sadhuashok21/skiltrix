import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import Layout from "./components/Layout"
import { SkiltrixDataProvider } from "./context/SkiltrixDataContext"
import { getGlobalSignInUrl } from "./api/auth"
import api from "./api/client"

// ── Lazy-loaded pages (code-split per route) ────────────────────────────────
const Home             = lazy(() => import("./pages/Home"))
const Dashboard        = lazy(() => import("./pages/Dashboard"))
const Courses          = lazy(() => import("./pages/Courses"))
const CourseDetail     = lazy(() => import("./pages/CourseDetail"))
const Compiler         = lazy(() => import("./pages/Compiler"))
const Practice         = lazy(() => import("./pages/Practice"))
const Videos           = lazy(() => import("./pages/Videos"))
const Quizzes          = lazy(() => import("./pages/Quizzes"))
const Progress         = lazy(() => import("./pages/Progress"))
const Community        = lazy(() => import("./pages/Community"))
const Internships      = lazy(() => import("./pages/Internships"))
const Interview        = lazy(() => import("./pages/Interview"))
const Profile          = lazy(() => import("./pages/Profile"))
const Notifications    = lazy(() => import("./pages/Notifications"))
const About            = lazy(() => import("./pages/About"))
const Terms            = lazy(() => import("./pages/Terms"))
const CodeLabDashboard = lazy(() => import("./pages/CodeLabDashboard"))
const CodeLabIDE       = lazy(() => import("./pages/CodeLabIDE"))
const ABAPDashboard    = lazy(() => import("./pages/abap/ABAPDashboard"))
const ABAPStudio       = lazy(() => import("./pages/abap/ABAPStudio"))
const ABAPPricing      = lazy(() => import("./pages/abap/ABAPPricing"))
const ABAPPaymentHistory = lazy(() => import("./pages/abap/ABAPPaymentHistory"))

// ── Page-level loading skeleton ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading…</span>
      </div>
    </div>
  )
}

function CompilerPage() {
  return (
    <Layout noFooter>
      <Compiler />
    </Layout>
  )
}

function ABAPEntitlementGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ allowed: boolean; isFree?: boolean } | null>(null)
  useEffect(() => {
    api.get<{ has_access: boolean; is_free?: boolean }>("/abap/access/")
      .then(({ data }) => setState({ allowed: data.has_access, isFree: data.is_free }))
      .catch(() => setState({ allowed: false, isFree: false }))
  }, [])
  if (state === null) return <PageLoader />
  if (state.allowed) return <>{children}</>

  // When free access has activated and user is unauthenticated, redirect straight to login
  // so upon login the user immediately opens the SAP ABAP editor without seeing pricing.
  if (state.isFree) {
    window.location.assign(getGlobalSignInUrl(window.location.pathname || "/abap"))
    return <PageLoader />
  }

  return <Navigate to="/abap/pricing" replace />
}

function ABAPEditorDirect() {
  const navigate = useNavigate()
  useEffect(() => {
    api.get<Array<{ project_id: string }>>("/abap/projects/")
      .then(({ data }) => {
        if (data && data.length > 0) {
          navigate(`/abap/studio/${data[0].project_id}`, { replace: true })
        } else {
          api.post<{ project_id: string }>("/abap/projects/", {
            title: "Z_MAIN_ABAP_REPORT",
            package_name: "$TMP",
            execution_mode: "simulator",
            description: "Default ABAP workspace",
          }).then((res) => {
            navigate(`/abap/studio/${res.data.project_id}`, { replace: true })
          }).catch(() => {
            navigate("/abap", { replace: true })
          })
        }
      })
      .catch(() => navigate("/abap", { replace: true }))
  }, [navigate])

  return <PageLoader />
}

import { AuthProvider, AuthCallback, initiateLogin } from "./auth"

function RedirectToGlobalSignIn() {
  const [searchParams] = useSearchParams()
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const requestedReturnTo = searchParams.get("returnTo") || "/"
    const safeReturnTo = requestedReturnTo.startsWith("/")
      && !requestedReturnTo.startsWith("//")
      && !requestedReturnTo.includes("\\")
      ? requestedReturnTo
      : "/"
    initiateLogin({
      clientId: "skiltrix",
      accountsPortalUrl: (import.meta.env.VITE_ACCOUNTS_URL || "http://localhost:5174").replace(/\/+$/, ""),
      apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, ""),
      redirectUri: `${window.location.origin}/auth/callback`,
    }, safeReturnTo)
  }, [searchParams])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider config={{ clientId: "skiltrix" }}>
        <SkiltrixDataProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Full-screen IDE layout — no outer Layout */}
            <Route path="/codelab/project/:projectId" element={<CodeLabIDE />} />
            <Route
              path="/codelab"
              element={
                <Layout>
                  <CodeLabDashboard />
                </Layout>
              }
            />

            {/* SAP ABAP Lab */}
            <Route path="/abap/pricing" element={<Layout><ABAPPricing /></Layout>} />
            <Route path="/abap/payments" element={<Layout><ABAPPaymentHistory /></Layout>} />
            <Route path="/abap/editor" element={<ABAPEntitlementGate><ABAPEditorDirect /></ABAPEntitlementGate>} />
            <Route path="/abap/studio/:projectId" element={<ABAPEntitlementGate><ABAPStudio /></ABAPEntitlementGate>} />
            <Route
              path="/abap"
              element={
                <ABAPEntitlementGate><Layout><ABAPDashboard /></Layout></ABAPEntitlementGate>
              }
            />

            {/* Compiler gets its own layout (no footer) */}
            <Route path="/compiler" element={<CompilerPage />} />

            <Route path="/login" element={<RedirectToGlobalSignIn />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Standard Layout pages */}
            <Route path="/"            element={<Layout><Home /></Layout>} />
            <Route path="/dashboard"   element={<Layout><Dashboard /></Layout>} />
            <Route path="/courses"     element={<Layout><Courses /></Layout>} />
            <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />
            <Route path="/practice"    element={<Layout noFooter><Practice /></Layout>} />
            <Route path="/videos"      element={<Layout><Videos /></Layout>} />
            <Route path="/quizzes"     element={<Layout><Quizzes /></Layout>} />
            <Route path="/progress"    element={<Layout><Progress /></Layout>} />
            <Route path="/community"   element={<Layout><Community /></Layout>} />
            <Route path="/internships" element={<Layout><Internships /></Layout>} />
            <Route path="/internships/:company" element={<Layout><Internships /></Layout>} />
            <Route path="/interview"   element={<Layout><Interview /></Layout>} />
            <Route path="/profile"     element={<Layout><Profile /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/about"       element={<Layout><About /></Layout>} />
            <Route path="/terms"       element={<Layout><Terms /></Layout>} />
            <Route path="/privacy"     element={<Layout><Terms /></Layout>} />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="36"
                        height="36"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="text-slate-400"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.804 7.5 7.5 0 0015.803 15.803z" />
                      </svg>
                    </div>
                    <h1
                      className="text-3xl font-extrabold text-slate-900 mb-3"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Page Not Found
                    </h1>
                    <p className="text-slate-500 mb-6 max-w-sm">
                      The page you're looking for doesn't exist or has been moved.
                    </p>
                    <a
                      href="/"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                    >
                      Go Home
                    </a>
                  </div>
                </Layout>
              }
            />
          </Routes>
        </Suspense>
        </SkiltrixDataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
