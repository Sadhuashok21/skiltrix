import { Link } from "react-router-dom";

const team = [
  { name: "Maya Chen", role: "Head of Curriculum", avatar: "MC", color: "from-blue-500 to-indigo-500" },
  { name: "James Okafor", role: "Lead Engineer", avatar: "JO", color: "from-emerald-500 to-teal-500" },
  { name: "Priya Nair", role: "Learning Designer", avatar: "PN", color: "from-pink-500 to-rose-500" },
  { name: "Sam Torres", role: "Community Lead", avatar: "ST", color: "from-amber-500 to-orange-500" },
];

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            About <span className="text-indigo-400">SkillTrix</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            We believe everyone deserves access to world-class developer education — regardless of background, age, or experience.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Our Mission</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-4">
              SkillTrix exists to make developer education accessible, practical, and effective for everyone — from curious beginners to experienced developers preparing for their next big opportunity.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We combine structured learning, interactive coding practice, community support, and career preparation into one cohesive platform that adapts to your pace and goals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🎯", title: "Mission", desc: "Make quality tech education accessible to all" },
              { icon: "👁️", title: "Vision", desc: "A world where anyone can build software and shape their career" },
              { icon: "🤝", title: "Community", desc: "Learn better together through sharing and collaboration" },
              { icon: "💼", title: "Careers", desc: "Bridge the gap between learning and employment" },
            ].map(c => (
              <div key={c.title} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-2xl mb-2">{c.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.title}</h3>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Our Learning Philosophy</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🧠", title: "Learn by Doing", desc: "Theory is just the start. We emphasize hands-on coding practice and real project building." },
              { icon: "📈", title: "Progress Matters", desc: "Every lesson completed, problem solved, and quiz taken is a step forward. We track and celebrate it." },
              { icon: "🌍", title: "Inclusive by Design", desc: "Content and design crafted to be welcoming and usable by people of all ages, backgrounds, and abilities." },
              { icon: "💬", title: "Community Learning", desc: "Learning with others accelerates growth. Our community is a place to ask, share, and help." },
              { icon: "🎯", title: "Career-Focused", desc: "We align our content with what real employers and internship programs actually look for." },
              { icon: "🔄", title: "Always Improving", desc: "Our curriculum and platform evolve with technology and learner feedback." },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="text-2xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>The Team Behind SkillTrix</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(m => (
            <div key={m.name} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3`}>{m.avatar}</div>
              <h3 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-14">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to start your journey?</h2>
          <p className="text-indigo-100 mb-6">Join 50,000+ learners already growing with SkillTrix</p>
          <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
            Browse Courses →
          </Link>
        </div>
      </section>
    </div>
  );
}
