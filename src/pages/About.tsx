import { Link } from "react-router-dom"
import {
  Target,
  Eye,
  Users,
  Briefcase,
  Brain,
  TrendingUp,
  Globe,
  MessageSquare,
  Compass,
  RefreshCw,
} from "lucide-react"
import logoImg from "../assets/logo.png"

const team = [
  {
    name: "Maya Chen",
    role: "Head of Curriculum",
    avatar: "MC",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "James Okafor",
    role: "Lead Engineer",
    avatar: "JO",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Priya Nair",
    role: "Learning Designer",
    avatar: "PN",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Sam Torres",
    role: "Community Lead",
    avatar: "ST",
    color: "from-amber-500 to-orange-500",
  },
]

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700/80 p-2.5 flex items-center justify-center shadow-2xl mb-5">
            <img src={logoImg} alt="SkilTrix Logo" className="w-full h-full object-contain" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            About <span className="text-indigo-400">SkilTrix</span>
          </h1>
          <p className="text-indigo-400 font-semibold text-sm mb-4">
            Developed by Ascentracore Solutions
          </p>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            We believe everyone deserves access to world-class developer
            education — engineered with excellence by Ascentracore Solutions.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl font-extrabold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Our Mission
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-4">
              SkillTrix exists to make developer education accessible,
              practical, and effective for everyone — from curious beginners to
              experienced developers preparing for their next big opportunity.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We combine structured learning, interactive coding practice,
              community support, and career preparation into one cohesive
              platform that adapts to your pace and goals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: <Target className="w-5 h-5 text-indigo-600" />,
                title: "Mission",
                desc: "Make quality tech education accessible to all",
              },
              {
                icon: <Eye className="w-5 h-5 text-indigo-600" />,
                title: "Vision",
                desc: "A world where anyone can build software and shape their career",
              },
              {
                icon: <Users className="w-5 h-5 text-indigo-600" />,
                title: "Community",
                desc: "Learn better together through sharing and collaboration",
              },
              {
                icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
                title: "Careers",
                desc: "Bridge the gap between learning and employment",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-2">
                  {c.icon}
                </div>
                <h3
                  className="font-bold text-slate-900 text-sm mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <h2
            className="text-3xl font-extrabold text-slate-900 text-center mb-10"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Our Learning Philosophy
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="w-5 h-5 text-indigo-600" />,
                title: "Learn by Doing",
                desc: "Theory is just the start. We emphasize hands-on coding practice and real project building.",
              },
              {
                icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
                title: "Progress Matters",
                desc: "Every lesson completed, problem solved, and quiz taken is a step forward. We track and celebrate it.",
              },
              {
                icon: <Globe className="w-5 h-5 text-indigo-600" />,
                title: "Inclusive by Design",
                desc: "Content and design crafted to be welcoming and usable by people of all ages, backgrounds, and abilities.",
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
                title: "Community Learning",
                desc: "Learning with others accelerates growth. Our community is a place to ask, share, and help.",
              },
              {
                icon: <Compass className="w-5 h-5 text-indigo-600" />,
                title: "Career-Focused",
                desc: "We align our content with what real employers and internship programs actually look for.",
              },
              {
                icon: <RefreshCw className="w-5 h-5 text-indigo-600" />,
                title: "Always Improving",
                desc: "Our curriculum and platform evolve with technology and learner feedback.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-xl p-5 border border-slate-200"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                  {v.icon}
                </div>
                <h3
                  className="font-bold text-slate-900 mb-1.5"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {v.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developed by Ascentracore Solutions */}
      <section className="bg-slate-50 border-y border-slate-200 py-14">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 md:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center gap-8 justify-between border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700/80 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
                <img src={logoImg} alt="SkilTrix Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Engineering & Software Development
                </span>
                <h3
                  className="text-2xl md:text-3xl font-extrabold text-white mt-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Developed by Ascentracore Solutions
                </h3>
                <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                  SkilTrix is envisioned, designed, and built by Ascentracore Solutions to provide an all-in-one developer learning environment — combining multi-language compilers, interactive coding labs, company interview preparation, and real-time community engagement.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                to="/compiler"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white transition-all text-center shadow-lg shadow-indigo-600/30 whitespace-nowrap"
              >
                Launch Compiler →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <h2
          className="text-3xl font-extrabold text-slate-900 text-center mb-10"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          The Team Behind SkilTrix
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m) => (
            <div
              key={m.name}
              className="bg-white rounded-xl border border-slate-200 p-5 text-center"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3`}
              >
                {m.avatar}
              </div>
              <h3
                className="font-bold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {m.name}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-14">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center">
          <h2
            className="text-3xl font-extrabold text-white mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ready to start your journey?
          </h2>
          <p className="text-indigo-100 mb-6">
            Join 50,000+ learners already growing with SkillTrix
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Browse Courses →
          </Link>
        </div>
      </section>
    </div>
  )
}
