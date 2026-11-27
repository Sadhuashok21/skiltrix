import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Layers,
  FileText,
  PlayCircle,
  Search,
  CheckCircle2,
  ChevronRight,
  FolderTree,
  Home
} from 'lucide-react';
import Layout from '../Layout';
import { getStImageUrl } from '../../utils/cdn';

// Vite dynamic glob import of all generated course pages
// E.g. /src/generated-courses/c-programming/variables/index.tsx
const pageModules = import.meta.glob('/src/generated-courses/**/index.tsx');

interface SyllabusNode {
  page_id: string;
  title: string;
  slug: string;
  url_path: string;
  status: string;
  order: number;
  children?: SyllabusNode[];
}

interface CourseOverviewData {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  image?: string;
  image_url?: string;
}

export const DynamicCoursePageResolver: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course overview / syllabus state if this is the root course landing page
  const [isCourseOverview, setIsCourseOverview] = useState(false);
  const [courseInfo, setCourseInfo] = useState<CourseOverviewData | null>(null);
  const [syllabusTree, setSyllabusTree] = useState<SyllabusNode[]>([]);
  const [syllabusSearch, setSyllabusSearch] = useState('');

  // Normalize current path, e.g. /courses/c-programming/variables/
  const normalizedPath = useMemo(() => {
    let p = location.pathname.toLowerCase().trim();
    if (!p.endsWith('/')) p += '/';
    return p;
  }, [location.pathname]);

  const courseSlug = params.courseSlug || params.id || '';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setIsCourseOverview(false);

    const prefix = '/courses/';
    if (!normalizedPath.startsWith(prefix)) {
      setError('Invalid course path');
      setLoading(false);
      return;
    }

    const subPath = normalizedPath.slice(prefix.length).replace(/\/$/, '');
    const isRootCourseRequest = !subPath.includes('/');

    // Check if an explicit generated TSX file exists
    const targetGlob1 = `/src/generated-courses/${subPath}/index.tsx`;
    const targetGlob2 = `/src/generated-courses/${subPath}/index.tsx`.replace(/\/+/g, '/');

    const matchedKey = Object.keys(pageModules).find(k => {
      const normalizedKey = k.toLowerCase().replace(/\/+/g, '/');
      return normalizedKey === targetGlob1 || normalizedKey === targetGlob2;
    });

    if (matchedKey) {
      const loader = pageModules[matchedKey];
      loader()
        .then((mod: any) => {
          if (!isMounted) return;
          const ResolvedComp = mod.default || mod.CoursePage || mod;
          setComponent(() => ResolvedComp);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load generated course component:', err);
          if (!isMounted) return;
          setError('Failed to load course page component.');
          setLoading(false);
        });
    } else if (isRootCourseRequest && courseSlug) {
      // It's the course root, e.g. /courses/c-programming/
      // Automatically load the full course syllabus!
      const apiBase = import.meta.env.VITE_API_URL || '';
      fetch(`${apiBase}/api/cms/navigation/${courseSlug}/`)
        .then(res => {
          if (!res.ok) throw new Error('Course not found');
          return res.json();
        })
        .then(data => {
          if (!isMounted) return;
          if (data.course) {
            setCourseInfo(data.course);
            setSyllabusTree(data.tree || []);
            setIsCourseOverview(true);
            setLoading(false);
          } else {
            setError('Course syllabus not found.');
            setLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (!isMounted) return;
          setError('Course not found or syllabus unpublished.');
          setLoading(false);
        });
    } else {
      // Missing subpage
      setComponent(null);
      setError('Page not found or currently in draft status.');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [normalizedPath, courseSlug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070b13] text-slate-600 dark:text-slate-300">
          <RefreshCw size={28} className="animate-spin text-indigo-600 dark:text-indigo-500 mb-3" />
          <span className="text-sm font-medium">Loading course syllabus...</span>
        </div>
      </Layout>
    );
  }

  // Render Root Course Syllabus Landing Page
  if (isCourseOverview && courseInfo) {
    const firstPageUrl = syllabusTree.length > 0 ? syllabusTree[0].url_path : null;

    // Filtered tree by search
    const filteredTree = syllabusTree.filter(node =>
      node.title.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
      (node.children && node.children.some(c => c.title.toLowerCase().includes(syllabusSearch.toLowerCase())))
    );

    let totalLessons = 0;
    syllabusTree.forEach(n => {
      totalLessons += 1;
      if (n.children) totalLessons += n.children.length;
    });

    return (
      <Layout>
        <div className="py-10 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
              <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1">
                <Home size={14} />
                <span>Home</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400 dark:text-slate-600" />
              <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Courses
              </Link>
              <ChevronRight size={13} className="text-slate-400 dark:text-slate-600" />
              <span className="text-slate-900 dark:text-slate-300 font-semibold">{courseInfo.title}</span>
            </nav>

            {/* Hero Banner */}
            <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl mb-10 flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                    {courseInfo.category || 'Programming'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Official Syllabus
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                  {courseInfo.title}
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mb-8">
                  {courseInfo.description || 'Master this course through interactive lectures, code examples, and structured variable references.'}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {firstPageUrl ? (
                    <Link
                      to={firstPageUrl}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 dark:shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      <PlayCircle size={18} />
                      Start Learning (Topic 1)
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-400">Content coming soon.</div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700/60 pl-4 py-1">
                    <Layers size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span><strong>{totalLessons}</strong> Chapters & Topics</span>
                  </div>
                </div>
              </div>

              {(courseInfo.image_url || courseInfo.image) && (
                <div className="w-full md:w-72 lg:w-80 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/70 bg-slate-100 dark:bg-slate-950 shadow-md dark:shadow-xl">
                  <img
                    src={courseInfo.image_url || getStImageUrl(courseInfo.image)}
                    alt={courseInfo.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Syllabus Section */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:backdrop-blur">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FolderTree size={20} className="text-indigo-600 dark:text-indigo-400" />
                    Course Syllabus & Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Click on any topic below to jump directly into the full lecture, code editor, and exercises.
                  </p>
                </div>

                {/* Search topics */}
                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter topics..."
                    value={syllabusSearch}
                    onChange={e => setSyllabusSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tree Nodes List */}
              {filteredTree.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No syllabus topics found matching your search.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTree.map((item, idx) => (
                    <div key={item.page_id} className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 overflow-hidden">
                      <Link
                        to={item.url_path}
                        className="p-4 flex items-center justify-between hover:bg-indigo-50/60 dark:hover:bg-slate-900/80 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                              {item.title}
                            </h3>
                            <span className="text-[11px] font-mono text-slate-500">
                              {item.url_path}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            View Lecture <ArrowRight size={13} />
                          </span>
                        </div>
                      </Link>

                      {/* Sub topics */}
                      {item.children && item.children.length > 0 && (
                        <div className="pl-12 pr-4 pb-3 pt-1 border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/40 space-y-2">
                          {item.children.map((sub, sIdx) => (
                            <Link
                              key={sub.page_id}
                              to={sub.url_path}
                              className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <FileText size={13} className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                <span>{sub.title}</span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500">
                                Lesson {idx + 1}.{sIdx + 1}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 404 Fallback
  if (error || !Component) {
    return (
      <Layout>
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg dark:shadow-2xl dark:backdrop-blur-md">
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Topic Page Not Found</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              The page <code className="font-mono text-indigo-600 dark:text-indigo-400 text-xs px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-slate-800">{normalizedPath}</code> has not been published yet or is being updated.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {courseSlug && (
                <Link
                  to={`/courses/${courseSlug}/`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Course Syllabus
                </Link>
              )}
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/30"
              >
                <BookOpen size={14} />
                All Courses
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return <Component />;
};
export default DynamicCoursePageResolver;
