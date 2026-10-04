import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Code2,
  Plus,
  FolderCode,
  Download,
  Trash2,
  Clock,
  FileCode,
  Globe,
  Database,
  Layers,
  Search,
  Sparkles,
  ArrowRight,
  Loader2,
  Terminal,
} from "lucide-react"

import {
  listProjects,
  createProject,
  deleteProject,
  exportProjectZipUrl,
  type ApiProject,
} from "../api/codelab"
import { TechIcon } from "../components/TechIcons"

const PROJECT_TEMPLATES = [
  {
    type: "single_file",
    language: "python",
    title: "Python Workspace",
    desc: "Single-file Python 3 script with instant runner and stdin support.",
    badge: "Python",
    badgeColor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: <TechIcon name="python" className="w-5 h-5 text-yellow-400" />,
  },
  {
    type: "django",
    language: "python",
    title: "Django Full-Stack App",
    desc: "Multi-file Django app with models, views, templates, and live server preview.",
    badge: "Django",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: <TechIcon name="django" className="w-5 h-5 text-emerald-400" />,
  },
  {
    type: "react",
    language: "javascript",
    title: "React Web App",
    desc: "Modern React application with Vite, JSX components, and responsive web preview.",
    badge: "React",
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    icon: <TechIcon name="react" className="w-5 h-5 text-sky-400" />,
  },
  {
    type: "php",
    language: "php",
    title: "PHP Application",
    desc: "PHP dynamic website with multi-file scripts, forms, and database connectivity.",
    badge: "PHP",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: <TechIcon name="php" className="w-5 h-5 text-purple-400" />,
  },
  {
    type: "sql",
    language: "sql",
    title: "SQL Database Playground",
    desc: "Interactive SQL workspace with table schemas, seed datasets, and query explorer.",
    badge: "SQL",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    icon: <TechIcon name="sql" className="w-5 h-5 text-teal-400" />,
  },
  {
    type: "single_file",
    language: "java",
    title: "Java Application",
    desc: "Java program with automatic javac compilation and runtime execution.",
    badge: "Java",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    icon: <TechIcon name="java" className="w-5 h-5" />,
  },
  {
    type: "single_file",
    language: "javascript",
    title: "Node.js Workspace",
    desc: "JavaScript execution environment with modern ES modules and Node APIs.",
    badge: "Node.js",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: <TechIcon name="javascript" className="w-5 h-5" />,
  },
  {
    type: "single_file",
    language: "cpp",
    title: "C++ Application",
    desc: "High-performance C++ workspace with standard library support.",
    badge: "C++",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: <TechIcon name="c++" className="w-5 h-5 text-blue-400" />,
  },
]

export default function CodeLabDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ApiProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // New project modal form state
  const [newTitle, setNewTitle] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(PROJECT_TEMPLATES[0])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await listProjects()
      setProjects(data)
    } catch (err: any) {
      console.error("Failed to load projects", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setIsCreating(true)
      const created = await createProject({
        title: newTitle.trim(),
        project_type: selectedTemplate.type,
        language: selectedTemplate.language,
        description: selectedTemplate.desc,
      })
      await loadProjects()
      setShowCreateModal(false)
      setNewTitle("")
      navigate(`/codelab/project/${created.project_id}`)
    } catch (err: any) {
      alert(`Could not create project: ${err.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (projectId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project '${title}'? This cannot be undone.`)) {
      return
    }
    try {
      await deleteProject(projectId)
      setProjects((prev) => prev.filter((p) => p.project_id !== projectId))
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_type.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterType === "web") {
      return matchesSearch && ["django", "react", "php"].includes(p.project_type)
    }
    if (filterType === "sql") {
      return matchesSearch && p.project_type === "sql"
    }
    if (filterType === "single_file") {
      return matchesSearch && p.project_type === "single_file"
    }
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" /> SkilTrix CodeLab
              </span>
              <span className="text-xs text-slate-500">Cloud IDE & Development Sandbox</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Projects & Workspaces
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Create, code, compile, and preview multi-file web applications, Django backends, SQL
              databases, and scripts directly inside your browser.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setNewTitle("My " + selectedTemplate.title)
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "all"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("web")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "web"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Web Apps (Django/React/PHP)
            </button>
            <button
              type="button"
              onClick={() => setFilterType("single_file")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "single_file"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Single-File
            </button>
            <button
              type="button"
              onClick={() => setFilterType("sql")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "sql"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              SQL
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-sm">Loading your workspaces...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
              <FolderCode className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                You haven't created any CodeLab projects in this category yet. Start with a Python script,
                Django project, or SQL sandbox.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewTitle("My " + selectedTemplate.title)
                  setShowCreateModal(true)
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.project_id}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                        {proj.language}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {proj.project_type.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {proj.description || "SkilTrix development workspace."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5" />
                        {proj.files_count || 1} file(s)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(proj.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/codelab/project/${proj.project_id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                      >
                        <span>Open IDE</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={exportProjectZipUrl(proj.project_id)}
                        download
                        title="Download ZIP"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(proj.project_id, proj.title)}
                        title="Delete Project"
                        className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#181825] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Create New CodeLab Project</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a runtime template to initialize your workspace with starter files and configuration.
                </p>
              </div>

              <form onSubmit={handleCreateProject}>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. My Django Web App"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Select Template Environment
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                      {PROJECT_TEMPLATES.map((tmpl, idx) => {
                        const isSelected = selectedTemplate.title === tmpl.title
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedTemplate(tmpl)
                              if (!newTitle || newTitle.startsWith("My ")) {
                                setNewTitle("My " + tmpl.title)
                              }
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-600/15 border-indigo-500 shadow-sm"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="shrink-0 flex items-center justify-center w-5 h-5">{tmpl.icon}</span>
                              <span className="text-xs font-bold text-white">{tmpl.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                              {tmpl.desc}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900/60 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newTitle.trim()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all"
                  >
                    {isCreating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isCreating ? "Initializing Workspace..." : "Create Project"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
