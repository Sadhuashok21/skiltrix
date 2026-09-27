import { Link } from "react-router-dom"
import logoImg from "../assets/logo.png"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-sm">
                <img
                  src={logoImg}
                  alt="SkilTrix Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                  }}
                  className="text-xl text-slate-900 leading-none block font-extrabold"
                >
                  Skil<span className="text-indigo-600">Trix</span>
                </span>
                <span className="text-xs text-indigo-600 font-semibold tracking-tight mt-0.5 block">
                  Developed by Ascentracore Solutions
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Learn. Practice. Build. Get Hired. Your complete developer
              learning platform.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Learn
            </h4>
            <ul className="space-y-2">
              {["Courses", "Videos", "Quizzes", "Practice"].map((l) => (
                <li key={l}>
                  <Link
                    to={`/${l.toLowerCase()}`}
                    className="text-sm text-slate-500 hover:text-indigo-600"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Prepare
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Internships", to: "/internships" },
                { label: "Interview Questions", to: "/interview" },
                { label: "DSA Practice", to: "/practice" },
                { label: "Mock Assessments", to: "/practice" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 hover:text-indigo-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Community
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Discussions", to: "/community" },
                { label: "Progress", to: "/progress" },
                { label: "Leaderboard", to: "/community" },
                { label: "About Us", to: "/about" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 hover:text-indigo-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Terms of Service", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Cookie Policy", to: "/privacy" },
                { label: "Community Guidelines", to: "/terms" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 hover:text-indigo-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 <strong className="font-semibold text-slate-700">SkilTrix</strong>. Developed by <strong className="font-semibold text-slate-700">Ascentracore Solutions</strong>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "Discord", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-sm text-slate-400 hover:text-indigo-600"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
