import React from 'react';
import { ArrowRight, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface TopicCardItem {
  name: string;
  desc: string;
  slug?: string;
  link?: string;
  badge?: string;
}

export interface TopicGridProps {
  title?: string;
  topics?: TopicCardItem[];
}

export const TopicGrid: React.FC<TopicGridProps> = ({
  title = 'Course Topics & Variable Reference',
  topics = []
}) => {
  return (
    <div className="cms-topic-grid-wrapper my-8">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Code size={20} className="text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {topics.length} Topics
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {topics.map((t, idx) => {
          const destination = t.link || (t.slug ? `${t.slug}/` : '#');
          const isInternal = destination.startsWith('/') || destination.startsWith('./') || destination.startsWith('../');

          const CardContent = (
            <div className="h-full p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-md">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {t.badge || `#${idx + 1}`}
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors mb-1">
                  {t.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {t.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center text-[11px] font-medium text-indigo-400">
                Explore Topic &rarr;
              </div>
            </div>
          );

          if (isInternal) {
            return (
              <Link key={idx} to={destination} className="no-underline">
                {CardContent}
              </Link>
            );
          }

          return (
            <a key={idx} href={destination} className="no-underline">
              {CardContent}
            </a>
          );
        })}
      </div>
    </div>
  );
};
export default TopicGrid;
