import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { TechIcon } from "../components/TechIcons"
import {
  Check,
  BookOpen,
  Binary,
  Terminal,
  Target,
} from "lucide-react"

export default function Internships() {
  const { companies: apiCompanies, internships: openings, problems: apiProblems } = useSkiltrixData()
  const { company: routeCompany } = useParams()
  const [selectedCompany, setSelectedCompany] = useState<string | null>(routeCompany ?? null)
  const companies = apiCompanies.map((company) => ({
    id: company.company_id,
    name: company.name,
    logo: company.name,
    color: "border-slate-200",
    progress: 0,
    category: "Company Guide",
    description: company.description,
    roadmaps: company.roadmaps ?? [],
  }))

  if (selectedCompany) {
    const company = companies.find((c) => c.id === selectedCompany)
    if (!company) return <div className="max-w-[1440px] mx-auto px-4 py-16 text-center text-slate-500">Company preparation guide not found.</div>
    const progress = company.progress

    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <button
            onClick={() => setSelectedCompany(null)}
            className="hover:text-indigo-600"
          >
            Internships
          </button>
          <span>/</span>
          <span className="text-slate-700">{company.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Company header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2.5">
                  <TechIcon name={company.logo || company.name} className="w-8 h-8" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-extrabold text-slate-900"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {company.name} Internship Prep
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Structured preparation guide ·{" "}
                    <span className="text-amber-600 font-medium">
                      Preparation content only, not official material
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Overall progress</span>
                <span className="text-sm font-bold text-indigo-600">
                  {progress}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Roadmap */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2
                className="font-bold text-slate-900 mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Preparation Roadmap
              </h2>
              <div className="space-y-4">
                {company.roadmaps.map((r) => (
                  <div
                    key={r.roadmap_id}
                    className="flex gap-4 p-4 rounded-xl border border-slate-200"
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 font-bold text-sm"
                    >
                      {r.step_number}
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-slate-900 text-sm"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {r.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                    </div>
                    {(
                      <Link
                        to="/courses"
                        className="ml-auto text-xs font-semibold text-indigo-600 hover:underline shrink-0 mt-0.5"
                      >
                        Start →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Practice problems */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2
                className="font-bold text-slate-900 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Recommended Practice Problems
              </h2>
              <div className="space-y-3">
                {apiProblems.slice(0, 5).map((p) => (
                  <Link
                    to="/practice"
                    key={p.problem_id}
                    className="flex items-center gap-4 p-3.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all"
                  >
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.difficulty === "Easy"
                          ? "bg-green-100 text-green-700"
                          : p.difficulty === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-slate-900">
                      {p.title}
                    </span>
                    <span className="text-xs text-slate-400">{Array.isArray(p.topics) ? p.topics.join(", ") : p.topics}</span>
                    <span className="text-xs text-indigo-600 font-medium">
                      Solve →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Key skills */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3
                className="font-bold text-slate-900 mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Key Skills Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Python or Java",
                  "DSA",
                  "OOP",
                  "Problem Solving",
                  "SQL basics",
                  "System Design basics",
                  "Communication",
                  "STAR Method",
                ].map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Interview tips */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3
                className="font-bold text-slate-900 mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Interview Tips
              </h3>
              <div className="space-y-2.5">
                {[
                  "Clarify the problem before coding",
                  "Think out loud — explain your approach",
                  "Consider edge cases first",
                  "Start with brute force, then optimize",
                  "Know your time/space complexity",
                ].map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-slate-600"
                  >
                    <span className="text-indigo-500 shrink-0 font-bold">
                      →
                    </span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <h3
                className="font-bold text-amber-900 mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Behavioral Prep
              </h3>
              <p className="text-xs text-amber-700 mb-3">
                Practice the STAR method for situational questions
              </p>
              <ul className="space-y-1.5 text-xs text-amber-800">
                <li>• Tell me about a challenge you faced</li>
                <li>• Describe a time you led a project</li>
                <li>• How do you handle disagreements?</li>
                <li>• Why do you want to intern here?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700">Internship Prep</span>
        </nav>
        <h1
          className="text-3xl font-extrabold text-slate-900 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Prepare for Your Dream Internship
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Structured preparation guides, coding roadmaps, and interview practice
          for top tech companies. All content is educational preparation — not
          official company material.
        </p>
      </div>

      {/* General prep steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          {
            step: 1,
            title: "Master the Fundamentals",
            desc: "Python or Java, OOP, basic data structures",
            icon: BookOpen,
          },
          {
            step: 2,
            title: "Practice DSA",
            desc: "200+ problems across difficulty levels",
            icon: Binary,
          },
          {
            step: 3,
            title: "Prepare for Assessments",
            desc: "Company-style OA practice and timing",
            icon: Terminal,
          },
          {
            step: 4,
            title: "Ace the Interview",
            desc: "Technical + behavioral preparation",
            icon: Target,
          },
        ].map((s) => (
          <div
            key={s.step}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4">
              {s.step}
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3 text-indigo-600">
              <s.icon className="w-5 h-5" />
            </div>
            <h3
              className="font-bold text-slate-900 text-sm mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {s.title}
            </h3>
            <p className="text-xs text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Company cards */}
      <h2
        className="text-xl font-bold text-slate-900 mb-5"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Company Preparation Guides
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompany(c.id)}
            className={`group text-left bg-white rounded-xl border ${c.color} hover:shadow-lg transition-all p-6`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-sm">
                <TechIcon name={c.logo || c.name} className="w-7 h-7" />
              </div>
              <div>
                <h3
                  className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {c.name}
                </h3>
                <span className="text-xs text-slate-400">{c.category}</span>
              </div>
            </div>
            {c.progress > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-slate-500">Your progress</span>
                  <span className="font-bold text-indigo-600">
                    {c.progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <div className="mt-3 text-xs font-semibold text-indigo-600 group-hover:underline">
                  Continue preparation →
                </div>
              </div>
            ) : (
              <div className="text-xs font-semibold text-indigo-600 group-hover:underline flex items-center gap-1">
                Start preparation guide →
              </div>
            )}
          </button>
        ))}
      </div>
      {openings.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Open internship listings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {openings.map((opening) => (
              <article key={opening.internship_id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{opening.name}</h3>
                  <p className="text-sm text-slate-500">{opening.company_name || opening.company?.name || "Company not specified"} · {opening.location || opening.type} · {opening.is_paid ? `Paid · ${opening.price}` : "Unpaid"}</p>
                  <p className="text-xs text-slate-400 mt-1">Deadline: {opening.deadline || "Not specified"}</p>
                </div>
                {opening.apply_link && <a href={opening.apply_link} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-semibold text-indigo-600">Apply</a>}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
