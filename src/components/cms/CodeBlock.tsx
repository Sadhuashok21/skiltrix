import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
// Prism language supports
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  output?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'c',
  title,
  showLineNumbers = true,
  output
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');
  const normalizedLang = language.toLowerCase();

  return (
    <div className="cms-code-block-wrapper my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-xl text-slate-100">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <Code2 size={15} className="text-indigo-400" />
          <span className="font-semibold text-slate-200">
            {title || `${language.toUpperCase()} Code`}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700/80 cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="relative flex overflow-x-auto p-4 text-[13.5px] font-mono leading-relaxed bg-[#090d13]">
        {showLineNumbers && (
          <div className="select-none pr-4 mr-3 text-right text-slate-600 border-r border-slate-800 font-mono text-xs">
            {lines.map((_, idx) => (
              <div key={idx} className="leading-relaxed">
                {idx + 1}
              </div>
            ))}
          </div>
        )}
        <pre className="flex-1 !m-0 !p-0 !bg-transparent !overflow-visible">
          <code className={`language-${normalizedLang}`}>
            {code.trim()}
          </code>
        </pre>
      </div>

      {/* Optional Output Panel */}
      {output && (
        <div className="border-t border-slate-800 bg-[#070a0f] p-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono font-semibold mb-1.5">
            <Terminal size={13} className="text-emerald-400" />
            <span>Output</span>
          </div>
          <pre className="font-mono text-slate-300 whitespace-pre-wrap pl-2 border-l-2 border-emerald-500/50">
            {output.trim()}
          </pre>
        </div>
      )}
    </div>
  );
};
export default CodeBlock;
