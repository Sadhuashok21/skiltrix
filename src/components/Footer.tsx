import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }} className="text-xl text-slate-900">
                Skill<span className="text-indigo-600">Trix</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">Learn. Practice. Build. Get Hired. Your complete developer learning platform.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Learn</h4>
            <ul className="space-y-2">
              {["Courses", "Videos", "Quizzes", "Practice"].map(l => (
                <li key={l}><Link to={`/${l.toLowerCase()}`} className="text-sm text-slate-500 hover:text-indigo-600">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Prepare</h4>
            <ul className="space-y-2">
              {[
                { label: "Internships", to: "/internships" },
                { label: "Interview Questions", to: "/interview" },
                { label: "DSA Practice", to: "/practice" },
                { label: "Mock Assessments", to: "/practice" },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="text-sm text-slate-500 hover:text-indigo-600">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Community</h4>
            <ul className="space-y-2">
              {[
                { label: "Discussions", to: "/community" },
                { label: "Progress", to: "/progress" },
                { label: "Leaderboard", to: "/community" },
                { label: "About Us", to: "/about" },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="text-sm text-slate-500 hover:text-indigo-600">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { label: "Terms of Service", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Cookie Policy", to: "/privacy" },
                { label: "Community Guidelines", to: "/terms" },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="text-sm text-slate-500 hover:text-indigo-600">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2026 SkillTrix. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "Discord", "LinkedIn"].map(s => (
              <a key={s} href="#" className="text-sm text-slate-400 hover:text-indigo-600">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
