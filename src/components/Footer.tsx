import { Link } from "react-router-dom"
import logoImg from "../assets/logo.png"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
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
                  className="text-xl text-slate-900 dark:text-white leading-none block font-extrabold"
                >
                  Skil<span className="text-indigo-600 dark:text-indigo-400">Trix</span>
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-tight mt-0.5 block">
                  Learn, Practice &amp; Code Online
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-4">
              Master programming with browser-based compilers, interactive CodeLab workspaces,
              hands-on practice problems, and comprehensive developer courses.
            </p>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Methodology: <strong className="text-slate-600 dark:text-slate-300 font-medium">Learn → Practice → Code → Test → Improve</strong>
            </div>
          </div>

          {/* Products & Compilers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Compilers &amp; Labs
            </h4>
            <ul className="space-y-2">
              {[
                { label: "SAP ABAP Compiler", to: "/compilers/abap-compiler" },
                { label: "CodeLab IDE", to: "/codelab" },
                { label: "Online Compiler", to: "/compilers" },
                { label: "SQL Practice", to: "/sql-practice" },
                { label: "PHP Compiler", to: "/compilers/php-compiler" },
                { label: "Django Coding", to: "/django-tutorials" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ABAP Learning Hub */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              SAP ABAP Hub
            </h4>
            <ul className="space-y-2">
              {[
                { label: "ABAP Compiler", to: "/compilers/abap-compiler" },
                { label: "ABAP Practice", to: "/compilers/abap-practice" },
                { label: "ABAP Programs", to: "/compilers/abap-programs" },
                { label: "ABAP Objects (OOPS)", to: "/compilers/abap-oops" },
                { label: "ABAP Interview Q&A", to: "/compilers/abap-interview-questions" },
                { label: "ABAP Pro Pricing", to: "/abap/pricing" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn & Prepare */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Learn &amp; Prepare
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Courses", to: "/courses" },
                { label: "Coding Practice", to: "/practice" },
                { label: "Interview Prep", to: "/interview" },
                { label: "Internships", to: "/internships" },
                { label: "Videos", to: "/videos" },
                { label: "Quizzes", to: "/quizzes" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Platform &amp; Legal
            </h4>
            <ul className="space-y-2">
              {[
                { label: "About Us", to: "/about" },
                { label: "Community", to: "/community" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Learning Dashboard", to: "/dashboard" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 <strong className="font-semibold text-slate-700 dark:text-slate-300">SkilTrix</strong>. Developed by <strong className="font-semibold text-slate-700 dark:text-slate-300">Ascentracore Solutions</strong>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "Discord", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-sm text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
