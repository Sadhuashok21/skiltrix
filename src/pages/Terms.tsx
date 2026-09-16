export default function Terms() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using SkillTrix, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform. We reserve the right to update these terms at any time with notice." },
    { id: "use", title: "2. Acceptable Use", content: "You agree to use SkillTrix for lawful educational purposes only. You may not share your account, post harmful content, plagiarize solutions, or attempt to disrupt the platform or other users' experience." },
    { id: "content", title: "3. Educational Content", content: "All course content, coding problems, quizzes, and resources on SkillTrix are for personal educational use only. Reproduction or commercial redistribution of content is prohibited without prior written consent." },
    { id: "community", title: "4. Community Guidelines", content: "Our community is built on mutual respect. You agree to be kind, constructive, and inclusive in all interactions. Harassment, hate speech, spam, or deliberately misleading content will result in account suspension." },
    { id: "ip", title: "5. Intellectual Property", content: "SkillTrix and its content are protected by copyright. Your original code submissions remain your intellectual property. By posting in discussions, you grant SkillTrix a non-exclusive license to display that content." },
    { id: "accounts", title: "6. Accounts & Security", content: "You are responsible for maintaining the security of your account and password. Notify us immediately of any unauthorized use. SkillTrix is not liable for losses resulting from your failure to secure your credentials." },
    { id: "termination", title: "7. Termination", content: "We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your profile settings." },
    { id: "liability", title: "8. Limitation of Liability", content: "SkillTrix is provided 'as is' without warranties. We are not liable for indirect or consequential damages resulting from your use of the platform. Our liability is limited to the amount paid in the preceding 12 months." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Terms of Service</h1>
        <p className="text-slate-500 text-sm">Last updated: September 1, 2026</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* TOC */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contents</h3>
            <nav className="space-y-1">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} className="block text-xs text-slate-600 hover:text-indigo-600 py-1">{s.title}</a>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">Please read these terms carefully before using SkillTrix. By using our platform, you agree to these terms.</p>
          </div>
          {sections.map(s => (
            <div key={s.id} id={s.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
          <p className="text-xs text-slate-400">Questions about our terms? Contact us at legal@skilltrix.com</p>
        </div>
      </div>
    </div>
  );
}
