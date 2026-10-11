import { useState } from "react"
import { Award, CheckCircle2, Download, Printer, Share2, X, ShieldCheck } from "lucide-react"
import { IssuedCertificate } from "../../api/tutorialsApi"
import logoImg from "../../assets/logo.png"

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  certificate: IssuedCertificate | null
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificate,
}: CertificateModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !certificate) return null

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(certificate.verificationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              SkilTrix Verified Certificate of Completion
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
              title="Copy verification link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame */}
        <div className="p-8 sm:p-12 print:p-0">
          <div className="relative border-8 border-double border-indigo-950/20 dark:border-indigo-400/20 rounded-2xl p-8 sm:p-10 text-center bg-gradient-to-br from-indigo-50/20 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 shadow-inner">
            {/* Top Seal & Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 p-1.5 flex items-center justify-center shadow-md">
                <img src={logoImg} alt="SkilTrix" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  SkilTrix
                </h2>
                <p className="text-[10px] uppercase tracking-widest font-mono text-indigo-600 dark:text-indigo-400">
                  Academy of Engineering & Technology
                </p>
              </div>
            </div>

            {/* Certificate Header */}
            <span className="text-xs uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400">
              Certificate of Completion
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This is to certify that
            </p>

            {/* Student Name */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3 mb-2 font-serif underline decoration-amber-400/50 underline-offset-8">
              {certificate.studentName}
            </h1>

            {/* Curriculum description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-4 leading-relaxed">
              has successfully mastered the comprehensive curriculum, coding exercises, interactive sandboxes, and skill assessments for
            </p>

            {/* Track Name */}
            <div className="inline-block mt-3 px-5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-300">
                {certificate.trackTitle} Programming & Architecture
              </span>
            </div>

            {/* Footer Metadata & Signature */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 mt-8 border-t border-slate-200 dark:border-slate-800 items-end">
              <div className="text-left">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Date Issued</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {certificate.issueDate}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Credential</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  ID: {certificate.certificateId}
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

