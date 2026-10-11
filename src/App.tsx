import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams, useParams } from "react-router-dom"
import Layout from "./components/Layout"
import { SkiltrixDataProvider } from "./context/SkiltrixDataContext"
import { ThemeProvider } from "./context/ThemeContext"
import { getGlobalSignInUrl } from "./api/auth"
import api from "./api/client"
import { AuthProvider, AuthCallback, initiateLogin } from "./auth"

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
const PrivacyPolicy        = lazy(() => import("./pages/PrivacyPolicy"))
const ABAPCompilerLanding  = lazy(() => import("./pages/abap/ABAPCompilerLanding"))
const ABAPPractice         = lazy(() => import("./pages/abap/ABAPPractice"))
const ABAPPrograms         = lazy(() => import("./pages/abap/ABAPPrograms"))
const ABAPOOPSGuide        = lazy(() => import("./pages/abap/ABAPOOPSGuide"))
const ABAPInterview        = lazy(() => import("./pages/abap/ABAPInterview"))
const SQLPractice          = lazy(() => import("./pages/SQLPractice"))
const PHPCompilerLanding   = lazy(() => import("./pages/PHPCompilerLanding"))
const DjangoTutorials      = lazy(() => import("./pages/DjangoTutorials"))
const AssessmentView       = lazy(() => import("./pages/AssessmentView"))
const PlacementPreparation = lazy(() => import("./pages/PlacementPreparation"))
const TutorialHub          = lazy(() => import("./pages/tutorials/TutorialHub"))
const TutorialViewer       = lazy(() => import("./pages/tutorials/TutorialViewer"))
const TutorialTryEditorPage = lazy(() => import("./pages/tutorials/TutorialTryEditorPage"))
const CertificateViewPage  = lazy(() => import("./pages/tutorials/CertificateViewPage"))
const RoadmapDashboard     = lazy(() => import("./pages/roadmap/RoadmapDashboard"))
const RoadmapDetail        = lazy(() => import("./pages/roadmap/RoadmapDetail"))
const HardwareDashboard    = lazy(() => import("./pages/hardware/HardwareDashboard"))
const FirmwareIDE          = lazy(() => import("./pages/hardware/FirmwareIDE"))
const PcbWorkspace         = lazy(() => import("./pages/hardware/PcbWorkspace"))
const CircuitSimulator     = lazy(() => import("./pages/hardware/CircuitSimulator"))


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

const COMPILER_ROUTES = [
  "/compiler",
  "/compiler/:lang",
  "/compilers",
  "/compilers/java-compiler",
  "/compilers/python-compiler",
  "/compilers/cpp-compiler",
  "/compilers/c-compiler",
  "/compilers/javascript-compiler",
  "/compilers/sql-compiler",
  "/compilers/html-compiler",
  "/compilers/css-compiler",
  "/compilers/php-compiler",
  "/rust-compiler",
  "/go-compiler",
  "/csharp-compiler",
  "/typescript-compiler",
  "/ruby-compiler",
  "/kotlin-compiler",
  "/swift-compiler",
  "/dart-compiler",
  "/r-compiler",
  "/compilers/rust-compiler",
  "/compilers/go-compiler",
  "/compilers/csharp-compiler",
  "/compilers/typescript-compiler",
  "/compilers/ruby-compiler",
  "/compilers/kotlin-compiler",
  "/compilers/swift-compiler",
  "/compilers/dart-compiler",
  "/compilers/r-compiler",
  "/java-compiler",
  "/python-compiler",
  "/cpp-compiler",
  "/c-compiler",
  "/javascript-compiler",
  "/js-compiler",
  "/sql-compiler",
  "/html-compiler",
  "/css-compiler",
  "/php-compiler",
]

function NotFoundPage() {
  return (
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
  )
}

function DynamicCompilerRoute() {
  const { compilerSlug, slug } = useParams<{ compilerSlug?: string; slug?: string }>()
  const target = (compilerSlug || slug || "").toLowerCase()
  if (target === "abap-oops") return <Layout><ABAPOOPSGuide /></Layout>
  if (target === "abap-compiler" || target === "abap-online-compiler") return <Layout><ABAPCompilerLanding /></Layout>
  if (target === "abap-practice") return <Layout><ABAPPractice /></Layout>
  if (target === "abap-programs") return <Layout><ABAPPrograms /></Layout>
  if (target === "abap-interview-questions") return <Layout><ABAPInterview /></Layout>
  if (target && target.endsWith("-compiler") && target !== "abap-compiler") {
    return <CompilerPage />
  }
  return <NotFoundPage />
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
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider config={{ clientId: "skiltrix" }}>
          <SkiltrixDataProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Full-screen IDE layout — no outer Layout */}
            <Route path="/codelab/project/:projectId" element={<CodeLabIDE />} />
            <Route path="/hardware/ide/:projectId" element={<FirmwareIDE />} />
            <Route path="/hardware/pcb/:projectId" element={<PcbWorkspace />} />
            <Route path="/hardware/simulator" element={<CircuitSimulator />} />
            <Route path="/hardware/simulator/:projectId" element={<CircuitSimulator />} />
            <Route
              path="/hardware"
              element={
                <Layout>
                  <HardwareDashboard />
                </Layout>
              }
            />
            <Route path="/codelab/assessment/:assessmentId" element={<AssessmentView />} />
            <Route path="/assessment/:assessmentId" element={<AssessmentView />} />
            <Route
              path="/placement-preparation"
              element={
                <Layout>
                  <PlacementPreparation />
                </Layout>
              }
            />
            <Route
              path="/codelab/company-assessments"
              element={
                <Layout>
                  <PlacementPreparation />
                </Layout>
              }
            />
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

            {/* Compiler routes */}
            {COMPILER_ROUTES.map((path) => (
              <Route key={path} path={path} element={<CompilerPage />} />
            ))}

            <Route path="/login" element={<RedirectToGlobalSignIn />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Standard Layout pages */}
            <Route path="/"            element={<Layout><Home /></Layout>} />
            <Route path="/tutorials"   element={<Layout><TutorialHub /></Layout>} />
            <Route path="/tutorials/:trackSlug" element={<Layout noFooter><TutorialViewer /></Layout>} />
            <Route path="/tutorials/:trackSlug/:lessonSlug" element={<Layout noFooter><TutorialViewer /></Layout>} />
            <Route path="/tutorials/:trackSlug/:lessonSlug/try" element={<TutorialTryEditorPage />} />
            <Route path="/certificates/:certId" element={<Layout><CertificateViewPage /></Layout>} />
            <Route path="/roadmaps"    element={<Layout><RoadmapDashboard /></Layout>} />
            <Route path="/roadmaps/:roadmapKey" element={<Layout><RoadmapDetail /></Layout>} />
            <Route path="/roadmap"     element={<Navigate to="/roadmaps" replace />} />
            <Route path="/roadmap/:roadmapKey" element={<Navigate to="/roadmaps/:roadmapKey" replace />} />
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
            <Route path="/privacy"     element={<Layout><PrivacyPolicy /></Layout>} />

            {/* Flagship ABAP Hub & SEO Pages under /compilers/ */}
            <Route path="/compilers/abap-oops" element={<Layout><ABAPOOPSGuide /></Layout>} />
            <Route path="/compilers/abap-compiler" element={<Layout><ABAPCompilerLanding /></Layout>} />
            <Route path="/compilers/abap-online-compiler" element={<Layout><ABAPCompilerLanding /></Layout>} />
            <Route path="/compilers/abap-practice" element={<Layout><ABAPPractice /></Layout>} />
            <Route path="/compilers/abap-programs" element={<Layout><ABAPPrograms /></Layout>} />
            <Route path="/compilers/abap-interview-questions" element={<Layout><ABAPInterview /></Layout>} />

            {/* Backwards compatibility redirects for legacy root paths */}
            <Route path="/abap-oops" element={<Navigate to="/compilers/abap-oops" replace />} />
            <Route path="/abap-compiler" element={<Navigate to="/compilers/abap-compiler" replace />} />
            <Route path="/abap-online-compiler" element={<Navigate to="/compilers/abap-compiler" replace />} />
            <Route path="/abap-practice" element={<Navigate to="/compilers/abap-practice" replace />} />
            <Route path="/abap-programs" element={<Navigate to="/compilers/abap-programs" replace />} />
            <Route path="/abap-interview-questions" element={<Navigate to="/compilers/abap-interview-questions" replace />} />

            {/* Specialized Practice & Tutorials */}
            <Route path="/sql-practice" element={<Layout><SQLPractice /></Layout>} />
            <Route path="/php-guide" element={<Layout><PHPCompilerLanding /></Layout>} />
            <Route path="/php-tutorials" element={<Layout><PHPCompilerLanding /></Layout>} />
            <Route path="/django-tutorials" element={<Layout><DjangoTutorials /></Layout>} />

            {/* Dynamic slug route for any language compiler (e.g. /scala-compiler) */}
            <Route path="/compilers/:slug" element={<DynamicCompilerRoute />} />
            <Route path="/:compilerSlug" element={<DynamicCompilerRoute />} />

            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </SkiltrixDataProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  )
}
