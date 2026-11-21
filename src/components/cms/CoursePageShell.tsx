import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Share2,
  Bookmark,
  CheckCircle2,
  FileText,
  Home
} from 'lucide-react';

export interface NavTreeItem {
  page_id: string;
  title: string;
  slug: string;
  url_path: string;
  status: string;
  order: number;
  parent_id?: string | null;
  children?: NavTreeItem[];
}

export interface CoursePageShellProps {
  courseTitle?: string;
  courseSlug: string;
  pageTitle?: string;
  title?: string;
  breadcrumbs?: Array<{ label: string; url?: string; to?: string }>;
  prevPage?: { title: string; url?: string; path?: string } | null;
  nextPage?: { title: string; url?: string; path?: string } | null;
  seoDescription?: string;
  children: React.ReactNode;
}

export const CoursePageShell: React.FC<CoursePageShellProps> = ({
  courseTitle,
  courseSlug,
  pageTitle,
  title,
  breadcrumbs = [],
  prevPage,
  nextPage,
  seoDescription,
  children
}) => {
  const displayPageTitle = title || pageTitle || 'Course Topic';
  const displayCourseTitle = courseTitle || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navTree, setNavTree] = useState<NavTreeItem[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Fetch course navigation tree dynamically
  useEffect(() => {
    async function loadTree() {
      try {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiBase}/api/admin/cms/navigation/${courseSlug}/`);
        if (res.ok) {
          const data = await res.json();
          if (data.tree) {
            setNavTree(data.tree);
            // Default expand parents
            const expanded: Record<string, boolean> = {};
            data.tree.forEach((node: NavTreeItem) => {
              if (node.children && node.children.length > 0) {
                expanded[node.page_id] = true;
              }
            });
            setExpandedSections(expanded);
          }
        }
      } catch (err) {
        console.error('Error loading course navigation:', err);
      }
    }
    if (courseSlug) {
      loadTree();
    }
  }, [courseSlug]);

  // Set document title
  useEffect(() => {
    document.title = `${displayPageTitle} | ${displayCourseTitle} - SkilTrix`;
  }, [displayPageTitle, displayCourseTitle]);

  // Scroll to top immediately whenever path changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentPath = location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto whitespace-nowrap">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white mr-1"
              title="Toggle Syllabus Navigation"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <Link to="/" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
              <Home size={14} />
              <span>Home</span>
            </Link>
            <ChevronRight size={13} className="text-slate-600" />

            <Link to="/courses" className="hover:text-indigo-400 transition-colors">
              Courses
            </Link>
            <ChevronRight size={13} className="text-slate-600" />

            <Link to={`/courses/${courseSlug}/`} className="text-indigo-400 font-medium hover:underline">
              {displayCourseTitle}
            </Link>

            {breadcrumbs.map((b, idx) => {
              const linkTarget = b.to || b.url;
              return (
                <React.Fragment key={idx}>
                  <ChevronRight size={13} className="text-slate-600" />
                  {linkTarget ? (
                    <Link to={linkTarget} className="hover:text-indigo-400 transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-slate-300 font-medium">{b.label}</span>
                  )}
                </React.Fragment>
              );
            })}

            <ChevronRight size={13} className="text-slate-600" />
            <span className="text-slate-200 font-semibold truncate max-w-[200px]">
              {displayPageTitle}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              Official Syllabus
            </span>
          </div>
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Course Sidebar Navigation */}
        <aside
          className={`
            fixed lg:sticky top-[45px] left-0 h-[calc(100vh-45px)] w-72 sm:w-80 bg-slate-900/95 lg:bg-slate-950/40 border-r border-slate-800/80 z-40
            overflow-y-auto transition-transform duration-300 backdrop-blur-md lg:backdrop-blur-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
              <BookOpen size={18} className="text-indigo-400" />
              <span className="truncate">{displayCourseTitle}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tree */}
          <div className="p-3 space-y-1">
            {navTree.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center">
                Loading syllabus structure...
              </div>
            ) : (
              navTree.map((item) => {
                const isActive = item.url_path === currentPath;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = Boolean(expandedSections[item.page_id]);

                return (
                  <div key={item.page_id} className="space-y-1">
                    <div className="flex items-center">
                      <Link
                        to={item.url_path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                          ${isActive
                            ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                        `}
                      >
                        <FileText size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                        <span className="truncate">{item.title}</span>
                      </Link>

                      {hasChildren && (
                        <button
                          onClick={() => toggleSection(item.page_id)}
                          className="p-1.5 text-slate-400 hover:text-white"
                          title="Toggle subtopics"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                    </div>

                    {/* Sub topics */}
                    {hasChildren && isExpanded && (
                      <div className="pl-4 ml-2 border-l border-slate-800/80 space-y-1 mt-1">
                        {item.children!.map((child) => {
                          const isChildActive = child.url_path === currentPath;
                          return (
                            <Link
                              key={child.page_id}
                              to={child.url_path}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                                ${isChildActive
                                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-l-2 border-indigo-400'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                              `}
                            >
                              <span className="truncate">{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main key={currentPath} className="flex-1 p-4 sm:p-8 lg:p-10 max-w-4xl mx-auto overflow-hidden">
          {/* Page Title Header */}
          <div className="mb-8 pb-6 border-b border-slate-800/80">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight mb-3">
              {displayPageTitle}
            </h1>
            {seoDescription && (
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
                {seoDescription}
              </p>
            )}
          </div>

          {/* Rendered Page Content */}
          <div className="cms-page-body prose prose-invert max-w-none">
            {children}
          </div>

          {/* Bottom Next / Prev Navigation Footer */}
          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevPage ? (
              <Link
                to={prevPage.url || prevPage.path || "#"}
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  if (document.documentElement) document.documentElement.scrollTop = 0;
                  if (document.body) document.body.scrollTop = 0;
                }}
                className="w-full sm:w-auto flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group"
              >
                <ArrowLeft size={18} className="text-slate-500 group-hover:text-indigo-400 group-hover:-translate-x-1 transition-all" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Previous Topic
                  </div>
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300">
                    {prevPage.title}
                  </div>
                </div>
              </Link>
            ) : <div />}

            {nextPage ? (
              <Link
                to={nextPage.url || nextPage.path || "#"}
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  if (document.documentElement) document.documentElement.scrollTop = 0;
                  if (document.body) document.body.scrollTop = 0;
                }}
                className="w-full sm:w-auto flex items-center justify-end gap-3 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group"
              >
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Next Topic
                  </div>
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300">
                    {nextPage.title}
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ) : <div />}
          </div>
        </main>
      </div>
    </div>
  );
};
export default CoursePageShell;
