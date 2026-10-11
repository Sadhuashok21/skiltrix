import { useParams, Link } from "react-router-dom"
import { ShieldCheck, Printer, ArrowRight, Award, ExternalLink } from "lucide-react"
import { getCertificateById } from "../../api/tutorialsApi"
import logoImg from "../../assets/logo.png"

export default function CertificateViewPage() {
  const { certId } = useParams<{ certId: string }>()
  const cert = getCertificateById(certId || "STX-DEV-1")

  if (!cert) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Certificate Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">The requested certificate ID could not be located.</p>
        <Link to="/tutorials" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Tutorials
        </Link>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Verification Status Pill */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold self-start">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Verified Credential • Authenticity Guaranteed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>
            <Link
              to="/tutorials"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Tutorials</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-14 shadow-xl">
          <div className="relative border-8 border-double border-indigo-950/20 dark:border-indigo-400/20 rounded-2xl p-8 sm:p-12 text-center bg-gradient-to-br from-indigo-50/20 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 p-2 flex items-center justify-center shadow-md">
                <img src={logoImg} alt="SkilTrix" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  SkilTrix
                </h2>
                <p className="text-[11px] uppercase tracking-widest font-mono text-indigo-600 dark:text-indigo-400">
                  Global Engineering Academy
                </p>
              </div>
            </div>

            <span className="text-xs uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400">
              Certificate of Completion
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This is to certify that
            </p>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-4 mb-2 font-serif underline decoration-amber-400/50 underline-offset-8">
              {cert.studentName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-4 leading-relaxed">
              has completed the comprehensive curriculum, coding exercises, interactive sandboxes, and skill assessments for
            </p>

            <div className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-300">
                {cert.trackTitle}
              </span>
            </div>

            {/* Credential Data Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-12 mt-10 border-t border-slate-200 dark:border-slate-800 items-end">
              <div className="text-left">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Date Issued</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {cert.issueDate}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Credential</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  ID: {cert.certificateId}
                </span>
              </div>

              <div className="text-right col-span-2 sm:col-span-1">
                <div className="font-serif italic text-base text-slate-700 dark:text-slate-300">
                  SkilTrix Academics
                </div>
                <span className="block text-[10px] uppercase font-mono text-slate-400">
                  Authorized Director
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

