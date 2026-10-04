import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export function PythonIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M11.914 2C6.441 2 6.777 4.379 6.777 4.379l.006 2.464h5.204v.74H4.512S2 7.29 2 12.798c0 5.509 2.19 5.305 2.19 5.305h1.307v-1.836s-.07-2.19 2.155-2.19h5.168v-.764H7.643s-2.083.12-2.083-2.084c0-2.204 1.837-2.124 1.837-2.124h7.794s2.002.04 2.002-2.043V4.38S17.388 2 11.914 2zm-2.01 1.545a.964.964 0 1 1 0 1.928.964.964 0 0 1 0-1.928zM12.086 22c5.473 0 5.137-2.379 5.137-2.379l-.006-2.464H12.01v-.74h7.478S22 16.71 22 11.202c0-5.509-2.19-5.305-2.19-5.305h-1.307v1.836s.07 2.19-2.155 2.19H11.19v.764h5.18s2.083-.12 2.083 2.084c0 2.204-1.837 2.124-1.837 2.124H8.822s-2.002-.04-2.002 2.043v2.677S6.612 22 12.086 22zm2.01-1.545a.964.964 0 1 1 0-1.928.964.964 0 0 1 0 1.928z" />
    </svg>
  );
}

export function JavaIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} {...props}>
      {/* Java Steam */}
      <path
        d="M10.5 2.5c.8 1.4-.4 2.8-1.2 3.9-.7 1-.9 2 .2 3.1"
        stroke="#E76F00"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 3.8c.6 1.1-.3 2.1-.9 3-.6.8-.7 1.8.2 2.7"
        stroke="#E76F00"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Java Cup */}
      <path
        d="M6 13.5h10.5c0 3-2.3 5-5.25 5S6 16.5 6 13.5z"
        fill="#5382A1"
      />
      {/* Cup handle */}
      <path
        d="M15.5 14.5c1.4 0 2.3.8 2.3 1.8s-.9 1.8-2.3 1.8"
        stroke="#5382A1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Saucer */}
      <path
        d="M3.5 20.5c2.5 1 5.5 1.5 8.5 1.5s6-.5 8.5-1.5"
        stroke="#5382A1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CppIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-5.5h-1v-5h1v1.65c.45-.55 1.12-.9 1.9-.9 1.66 0 3 1.34 3 3s-1.34 3-3 3c-.78 0-1.45-.35-1.9-.9v.15zm5 0h-1v-5h1v1.65c.45-.55 1.12-.9 1.9-.9 1.66 0 3 1.34 3 3s-1.34 3-3 3c-.78 0-1.45-.35-1.9-.9v.15zM7.5 12c0-1.1.9-2 2-2 .55 0 1.05.22 1.41.59.37.36.59.86.59 1.41s-.22 1.05-.59 1.41c-.36.37-.86.59-1.41.59-1.1 0-2-.9-2-2z" />
      <path d="M14.5 11.25h1.25V10h1v1.25H18v1h-1.25v1.25h-1V12.25H14.5zm4 0h1.25V10h1v1.25H22v1h-1.25v1.25h-1V12.25H18.5z" />
    </svg>
  );
}

export function CIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.45 0 4.65 1.12 6.14 2.88l-2.02 1.65C15.11 9.42 13.67 8.5 12 8.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c1.67 0 3.11-.92 4.12-2.03l2.02 1.65C16.65 16.88 14.45 18 12 18z" />
    </svg>
  );
}

export function JavaScriptIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#F7DF1E" />
      {/* J */}
      <path
        d="M6.5 16.5c.3.5.8.8 1.4.8 1 0 1.6-.6 1.6-1.8V9h1.8v6.5c0 2.1-1.3 3-3.2 3-1.4 0-2.3-.6-2.7-1.6l1.1-.9z"
        fill="#000000"
      />
      {/* S */}
      <path
        d="M14.2 18.5c-1.8 0-3-.9-3.2-2.3l1.7-.5c.2.8.8 1.3 1.6 1.3.8 0 1.3-.4 1.3-1 0-.6-.4-.9-1.4-1.2-1.6-.5-2.6-1.1-2.6-2.5 0-1.5 1.2-2.5 2.8-2.5 1.5 0 2.6.7 2.9 2l-1.6.5c-.2-.6-.6-1-1.3-1-.7 0-1.1.4-1.1.9 0 .5.3.8 1.2 1.1 1.8.6 2.7 1.2 2.7 2.6 0 1.6-1.2 2.6-3 2.6z"
        fill="#000000"
      />
    </svg>
  );
}

export function SqlIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

export function HtmlIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  );
}

export function PhpIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="7" />
      <path d="M7 10h2a1.5 1.5 0 0 1 0 3H7v3" />
      <path d="M12 10v6" />
      <path d="M12 13h1.5a1.5 1.5 0 0 0 0-3H12" />
      <path d="M17 10h2a1.5 1.5 0 0 1 0 3h-2v3" />
    </svg>
  );
}

export function ReactIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} className={className} {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function DsaIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="5" r="3" />
      <circle cx="5" cy="19" r="3" />
      <circle cx="19" cy="19" r="3" />
      <path d="M12 8v4" />
      <path d="M10 14L6.5 17" />
      <path d="M14 14l3.5 3" />
    </svg>
  );
}

export function GitIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="10" r="3" />
      <line x1="6" y1="9" x2="6" y2="15" />
      <path d="M6 9a9 9 0 0 1 9 9" />
      <path d="M18 13v2" />
    </svg>
  );
}

export function DjangoIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 8v8" />
      <path d="M8 12h4" />
      <path d="M16 8v8" />
    </svg>
  );
}

export function TypeScriptIcon({ className = "w-5 h-5", size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6" />
      <path d="M11 9H6v2h1.5v6H10v-6h1V9zm3 3.5c-.8 0-1.5.4-1.8 1l1.5.8c.1-.3.4-.5.7-.5.4 0 .6.2.6.5 0 .3-.2.5-.9.8-1.2.5-1.9 1-1.9 2 0 1.2 1 2 2.2 2 1.1 0 1.9-.5 2.2-1.3l-1.5-.7c-.2.4-.4.6-.7.6-.4 0-.6-.2-.6-.5 0-.4.3-.6 1-.9 1.3-.5 1.9-1.1 1.9-2 0-1.2-.9-2-2.4-2z" fill="#FFFFFF" />
    </svg>
  );
}

export function AmazonIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.9 14.4c-2.3 1.7-5.7 2.6-8.6 2.6-4.1 0-7.7-1.5-10.5-4.1-.2-.2-.2-.6 0-.8.2-.2.5-.2.7 0 2.6 2.4 6 3.8 9.8 3.8 2.6 0 5.6-.8 7.7-2.3.4-.3.9.1.9.4 0 .2-.2.3-.3.4zm1.2-1.2c-.3-.4-1.9-.2-2.7-.1-.2 0-.3-.2-.1-.3 1.1-.9 2.9-.6 3.2-.2.3.4-.1 2.2-1.1 3.1-.2.2-.3.1-.3 0 .2-.7.8-2.1 1-2.5z" />
    </svg>
  );
}

export function GoogleIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12.24 10.285V13.4h6.887C18.2 16.333 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.62 0 3.09.645 4.185 1.695l2.25-2.25C16.995 3.84 14.775 3 12.24 3 7.275 3 3.24 7.035 3.24 12s4.035 9 9 9c5.205 0 8.655-3.66 8.655-8.82 0-.6-.06-1.185-.165-1.895h-8.49z" />
    </svg>
  );
}

export function MicrosoftIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <rect x="2" y="2" width="9.5" height="9.5" rx="1" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" rx="1" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" rx="1" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" rx="1" fill="#FFB900" />
    </svg>
  );
}

export function MetaIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 13.6c-1.3-2-2.5-3.5-3.8-3.5-1.7 0-2.8 1.4-2.8 3.5 0 2.2 1.1 3.5 2.8 3.5 1.3 0 2.5-1.4 3.8-3.5zm5.4-3.5c-1.3 0-2.5 1.5-3.8 3.5 1.3 2 2.5 3.5 3.8 3.5 1.7 0 2.8-1.3 2.8-3.5s-1.1-3.5-2.8-3.5zm-5.4 5.3c-1.6 2.4-3.2 4-5 4C4.1 19.4 2 16.9 2 13.6c0-3.3 2.1-5.8 5-5.8 1.8 0 3.4 1.6 5 4 1.6-2.4 3.2-4 5-4 2.9 0 5 2.5 5 5.8 0 3.3-2.1 5.8-5 5.8-1.8 0-3.4-1.6-5-4z" />
    </svg>
  );
}

export function AppleIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.88-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-1.01 2.79 1.01.08 2.03-.51 2.65-1.26z" />
    </svg>
  );
}

export function AdobeIcon({ className = "w-5 h-5", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="#ED1C24" className={className} {...props}>
      <path d="M14.5 3H22v18L14.5 3zM9.5 3H2v18L9.5 3zM12 10.6L16.2 21h-3.2l-1.3-3.4H9.3L12 10.6z" />
    </svg>
  );
}

import {
  CheckCircle2,
  Flame,
  Target,
  MessageSquare,
  Trophy,
  Zap,
  BookOpen,
  Award,
  Code,
  GraduationCap,
  Sparkles,
} from "lucide-react";

// Master component to get any tech icon by key
export function TechIcon({
  name,
  className = "w-4 h-4",
}: {
  name: string;
  className?: string;
}) {
  const n = (name || "").toLowerCase().trim();
  switch (n) {
    case "python":
    case "py":
      return <PythonIcon className={className} />;
    case "java":
      return <JavaIcon className={className} />;
    case "c++":
    case "cpp":
      return <CppIcon className={className} />;
    case "c":
      return <CIcon className={className} />;
    case "javascript":
    case "js":
      return <JavaScriptIcon className={className} />;
    case "sql":
      return <SqlIcon className={className} />;
    case "html":
    case "html5":
    case "html & css":
    case "html/css":
    case "web dev":
    case "web":
      return <HtmlIcon className={className} />;
    case "react":
      return <ReactIcon className={className} />;
    case "php":
      return <PhpIcon className={className} />;
    case "dsa":
      return <DsaIcon className={className} />;
    case "git":
      return <GitIcon className={className} />;
    case "django":
      return <DjangoIcon className={className} />;
    case "typescript":
    case "ts":
      return <TypeScriptIcon className={className} />;
    case "amazon":
      return <AmazonIcon className={className} />;
    case "google":
      return <GoogleIcon className={className} />;
    case "microsoft":
      return <MicrosoftIcon className={className} />;
    case "meta":
      return <MetaIcon className={className} />;
    case "apple":
      return <AppleIcon className={className} />;
    case "adobe":
      return <AdobeIcon className={className} />;
    case "check":
    case "checkcircle":
      return <CheckCircle2 className={className} />;
    case "flame":
    case "streak":
      return <Flame className={className} />;
    case "target":
    case "interview":
      return <Target className={className} />;
    case "message":
    case "comment":
      return <MessageSquare className={className} />;
    case "trophy":
      return <Trophy className={className} />;
    case "hundred":
    case "award":
      return <Award className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "book":
    case "course":
      return <BookOpen className={className} />;
    case "education":
      return <GraduationCap className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    default:
      return <Code className={className} />;
  }
}
