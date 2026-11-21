import React from 'react';
import { BookMarked, Terminal } from 'lucide-react';

export interface DefinitionBoxProps {
  term: string;
  definition: string;
  example?: string;
}

export const DefinitionBox: React.FC<DefinitionBoxProps> = ({
  term,
  definition,
  example
}) => {
  return (
    <div className="cms-definition-box my-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <BookMarked size={18} className="text-indigo-400" />
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
          Definition
        </span>
      </div>

      <h4 className="text-lg font-bold text-slate-100 mb-2">
        {term}
      </h4>

      <p className="text-sm text-slate-300 leading-relaxed mb-3">
        {definition}
      </p>

      {example && (
        <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1 font-sans">
            <Terminal size={12} className="text-indigo-400" />
            <span>Syntax / Example</span>
          </div>
          <code>{example}</code>
        </div>
      )}
    </div>
  );
};
export default DefinitionBox;
