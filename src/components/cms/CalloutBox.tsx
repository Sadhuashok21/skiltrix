import React from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export type CalloutType = 'info' | 'warning' | 'success' | 'danger';

export interface CalloutBoxProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const config = {
  info: {
    bg: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
    titleColor: 'text-blue-400',
    icon: Info,
    defaultTitle: 'Information'
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    titleColor: 'text-amber-400',
    icon: AlertTriangle,
    defaultTitle: 'Important Note'
  },
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    titleColor: 'text-emerald-400',
    icon: CheckCircle2,
    defaultTitle: 'Success Tip'
  },
  danger: {
    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
    titleColor: 'text-rose-400',
    icon: XCircle,
    defaultTitle: 'Caution'
  }
};

export const CalloutBox: React.FC<CalloutBoxProps> = ({
  type = 'info',
  title,
  children
}) => {
  const current = config[type] || config.info;
  const IconComponent = current.icon;

  return (
    <div className={`cms-callout-box my-6 p-4.5 rounded-xl border ${current.bg} shadow-md backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <IconComponent size={20} className={current.titleColor} />
        </div>
        <div className="flex-1 text-sm leading-relaxed">
          <div className={`font-semibold mb-1 ${current.titleColor}`}>
            {title || current.defaultTitle}
          </div>
          <div className="text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CalloutBox;
