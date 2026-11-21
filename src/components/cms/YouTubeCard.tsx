import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

export interface YouTubeCardProps {
  videoUrl: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  title?: string;
  target?: '_blank' | '_self';
  openInNewTab?: boolean;
}

export const YouTubeCard: React.FC<YouTubeCardProps> = ({
  videoUrl,
  thumbnailUrl,
  thumbnail,
  title,
  target,
  openInNewTab
}) => {
  const actualThumbnail = thumbnail || thumbnailUrl || '/yt_img.jpg';
  const resolvedTarget = target || (openInNewTab === false ? '_self' : '_blank');
  const isExternal = resolvedTarget === '_blank';

  return (
    <div className="cms-youtube-card my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10">
      <a
        href={videoUrl}
        target={target}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="block group relative overflow-hidden"
      >
        {/* Aspect Ratio 16:9 Thumbnail Container */}
        <div className="relative w-full pt-[56.25%] bg-slate-950">
          <img
            src={actualThumbnail}
            alt={title || 'Watch video lecture'}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Dark Overlay with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent group-hover:via-slate-950/20 transition-all" />

          {/* Centered Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
              <Play size={28} className="fill-white translate-x-0.5" />
            </div>
          </div>

          {/* Badge: Open in New Tab or Current Tab */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60 shadow">
            <span>Watch on YouTube</span>
            {isExternal && <ExternalLink size={12} />}
          </div>
        </div>

        {/* Optional Title Footer */}
        {title && (
          <div className="p-4 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between">
            <span className="font-medium text-sm sm:text-base text-slate-200 group-hover:text-indigo-300 transition-colors">
              {title}
            </span>
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              Play Video <Play size={11} className="fill-current" />
            </span>
          </div>
        )}
      </a>
    </div>
  );
};
export default YouTubeCard;
