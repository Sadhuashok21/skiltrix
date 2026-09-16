import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Compiler from "./pages/Compiler";
import Practice from "./pages/Practice";
import Videos from "./pages/Videos";
import Quizzes from "./pages/Quizzes";
import Progress from "./pages/Progress";
import Community from "./pages/Community";
import Internships from "./pages/Internships";
import Interview from "./pages/Interview";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import About from "./pages/About";
import Terms from "./pages/Terms";

function CompilerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }} className="text-xl text-slate-900">
              Skill<span className="text-indigo-600">Trix</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/practice" className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors">Practice Problems</a>
            <a href="/courses" className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors">Courses</a>
          </div>
        </div>
      </div>
      <div className="pt-16 flex-1">
        <Compiler />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Compiler gets its own layout (no footer, dark IDE feel) */}
        <Route path="/compiler" element={<CompilerPage />} />

        {/* All other pages use the standard Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/courses" element={<Layout><Courses /></Layout>} />
        <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />
        <Route path="/practice" element={<Layout noFooter><Practice /></Layout>} />
        <Route path="/videos" element={<Layout><Videos /></Layout>} />
        <Route path="/quizzes" element={<Layout><Quizzes /></Layout>} />
        <Route path="/progress" element={<Layout><Progress /></Layout>} />
        <Route path="/community" element={<Layout><Community /></Layout>} />
        <Route path="/internships" element={<Layout><Internships /></Layout>} />
        <Route path="/internships/:company" element={<Layout><Internships /></Layout>} />
        <Route path="/interview" element={<Layout><Interview /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/privacy" element={<Layout><Terms /></Layout>} />

        {/* 404 fallback */}
        <Route path="*" element={
          <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="text-8xl mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Page Not Found</h1>
              <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
