import React from "react"
import { ShieldCheck, Lock, Eye, FileText, CheckCircle } from "lucide-react"

export default function PrivacyPolicy() {
  const sections = [
    {
      id: "collection",
      title: "1. Information We Collect",
      content:
        "We collect information you provide directly to us when creating an account, updating your profile, purchasing courses, solving coding assessments, or communicating with us. This includes your name, email address, profile information, code submissions, assessment results, and transaction records.",
    },
    {
      id: "usage",
      title: "2. How We Use Information",
      content:
        "We use your information to operate and improve SkilTrix, authenticate your identity, execute and evaluate your code submissions, personalize learning recommendations, process secure payments, provide customer support, and detect and prevent security abuse or academic integrity violations.",
    },
    {
      id: "proctoring",
      title: "3. Assessment & Integrity Monitoring",
      content:
        "During company mock assessments or timed tests, SkilTrix may monitor fullscreen status, tab switches, and voluntary screen-sharing session metadata solely for proctoring and assessment integrity verification. We do not sell or monetize candidate telemetry.",
    },
    {
      id: "payments",
      title: "4. Payment Information",
      content:
        "Payment transactions on SkilTrix are processed securely via certified payment gateways such as Razorpay. We do not store full credit card or debit card numbers on our servers. Transaction identifiers, amounts, and completion timestamps are retained for order management and billing records.",
    },
    {
      id: "security",
      title: "5. Data Security",
      content:
        "We apply industry-standard security measures including SSL/TLS encryption for all data in transit, token-based authentication, isolated sandbox execution environments for code, and encrypted database storage to protect your personal information against unauthorized access.",
    },
    {
      id: "sharing",
      title: "6. Data Sharing & Third Parties",
      content:
        "We never sell or rent your personal information to third parties. We may share information only with trusted cloud infrastructure providers (e.g., hosting, payment processors) strictly necessary to run the platform, or when required by legal regulations.",
    },
    {
      id: "rights",
      title: "7. Your Rights & Data Portability",
      content:
        "You have the right to access, update, or request deletion of your personal account data at any time through your Profile Settings or by reaching out to support@skiltrix.com.",
    },
    {
      id: "cookies",
      title: "8. Cookies & Storage",
      content:
        "We use essential cookies and browser local storage to maintain your authentication session, preserve your dark/light theme preferences, and autosave coding drafts to prevent loss of progress during network fluctuations.",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy & Trust
          </span>
          <span className="text-xs text-slate-400">Last updated: October 2026</span>
        </div>
        <h1
          className="text-3xl font-extrabold text-slate-900 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          At SkilTrix, your privacy and data security are our top priorities. This policy outlines how we gather, protect, and handle your information across our learning and coding platforms.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-slate-100 last:border-b-0 pb-6 last:pb-0">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {section.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed pl-6">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <span>Questions about your data or privacy? Contact our data protection officer at <strong className="text-slate-700">privacy@skiltrix.com</strong></span>
      </div>
    </div>
  )
}
