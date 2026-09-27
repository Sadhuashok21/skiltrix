import { useState, useMemo } from "react";
import { highlightCode, normalizeLanguage } from "../utils/highlighter";
import { TechIcon } from "./TechIcons";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

const LANGUAGE_LABELS: Record<string, { label: string; ext: string }> = {
  python: { label: "Python", ext: "py" },
  java: { label: "Java", ext: "java" },
  c: { label: "C", ext: "c" },
  cpp: { label: "C++", ext: "cpp" },
  javascript: { label: "JavaScript", ext: "js" },
  sql: { label: "SQL", ext: "sql" },
  markup: { label: "HTML", ext: "html" },
  css: { label: "CSS", ext: "css" },
  clike: { label: "Code", ext: "txt" },
};

export default function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
  className = "",
  maxHeight = "480px",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalized = normalizeLanguage(language);
  const langMeta = LANGUAGE_LABELS[normalized] || {
    label: language.toUpperCase(),
    ext: "txt",
  };

  const highlighted = useMemo(() => {
    return highlightCode(code.trim(), normalized);
  }, [code, normalized]);

  const lines = useMemo(() => code.trim().split("\n"), [code]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg text-slate-100 ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-2 font-medium">
            <TechIcon name={normalized} className="w-3.5 h-3.5 text-indigo-400" />
            <span>{filename || `example.${langMeta.ext}`}</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {langMeta.label}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="flex overflow-auto font-mono text-xs sm:text-sm leading-6" style={{ maxHeight }}>
        {showLineNumbers && (
          <div className="shrink-0 select-none py-4 px-3 bg-slate-900/60 border-r border-slate-800 text-right text-slate-600 font-mono text-xs leading-6">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <pre
          className="flex-1 p-4 overflow-x-auto m-0 whitespace-pre font-mono leading-6 code-block text-slate-100"
          style={{ color: "#f8fafc" }}
        >
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
}
