import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Plus,
  FolderPlus,
  RefreshCw,
  MinusSquare,
  PlusSquare,
  Search,
  X,
  Trash2,
  Edit2,
  Copy,
  Scissors,
  ClipboardPaste,
  Files,
  Code2,
  Layers,
  Database,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
  Check,
  FileJson,
  FileSpreadsheet,
  Globe,
  Settings,
  Sparkles,
} from "lucide-react"
import type { ApiProjectFile } from "../../api/codelab"

export interface FileNode {
  id: string
  name: string
  path: string
  isDirectory: boolean
  sizeBytes?: number
  children: Record<string, FileNode>
}

export interface ProjectFileExplorerProps {
  files: ApiProjectFile[]
  projectName?: string
  projectType?: string
  activeFilePath: string | null
  openFilePaths?: string[]
  dirtyFilePaths?: Set<string>
  onOpenFile: (path: string) => void
  onOpenToSide?: (path: string) => void
  onCreateFile: (path: string, isDirectory: boolean) => Promise<void>
  onCreateFolder: (folderPath: string) => Promise<void>
  onRenamePath: (oldPath: string, newPath: string) => Promise<void>
  onMovePath: (sourcePath: string, targetFolder: string) => Promise<void>
  onDuplicateFile: (sourcePath: string) => Promise<void>
  onDeletePath: (path: string) => Promise<void>
  onRefresh: () => void
  onCloseSidebar?: () => void
}

interface ContextMenuState {
  x: number
  y: number
  targetPath: string
  isFolder: boolean
}

// Build hierarchical tree from flat file list
function buildFileTree(files: ApiProjectFile[], filter = ""): Record<string, FileNode> {
  const root: Record<string, FileNode> = {}
  const lowerFilter = filter.toLowerCase().trim()

  files.forEach((file) => {
    const isKeepFile = file.path.endsWith("/.keep") || file.path === ".keep"
    const displayPath = isKeepFile ? file.path.replace(/\/\.keep$/, "") : file.path
    if (!displayPath) return

    const parts = displayPath.split("/").filter(Boolean)
    let currentLevel = root

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1
      const nodePath = parts.slice(0, index + 1).join("/")
      const isDir = isKeepFile || !isLast || file.is_directory

      if (!currentLevel[part]) {
        currentLevel[part] = {
          id: isLast && !isKeepFile ? file.file_id : `folder_${nodePath}`,
          name: part,
          path: nodePath,
          isDirectory: isDir,
          sizeBytes: isLast && !isKeepFile ? file.size_bytes : 0,
          children: {},
        }
      } else if (isDir && !currentLevel[part].isDirectory) {
        currentLevel[part].isDirectory = true
      }

      currentLevel = currentLevel[part].children
    })
  })

  // Filter helper if search query is provided
  if (lowerFilter) {
    const filterSubtree = (nodeRecord: Record<string, FileNode>): Record<string, FileNode> => {
      const filtered: Record<string, FileNode> = {}
      for (const [key, node] of Object.entries(nodeRecord)) {
        if (node.isDirectory) {
          const matchingChildren = filterSubtree(node.children)
          if (Object.keys(matchingChildren).length > 0 || node.name.toLowerCase().includes(lowerFilter)) {
            filtered[key] = {
              ...node,
              children: matchingChildren,
            }
          }
        } else if (node.name.toLowerCase().includes(lowerFilter) || node.path.toLowerCase().includes(lowerFilter)) {
          filtered[key] = node
        }
      }
      return filtered
    }
    return filterSubtree(root)
  }

  return root
}

function getFileIcon(filename: string, isFolder: boolean, isOpen: boolean) {
  if (isFolder) {
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
    ) : (
      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
    )
  }

  const lower = filename.toLowerCase()
  const ext = lower.split(".").pop() || ""

  // Special files
  if (lower === "manage.py") {
    return (
      <span className="w-4 h-4 rounded bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-bold text-[9px] flex items-center justify-center shrink-0">
        dj
      </span>
    )
  }
  if (lower === "settings.py") {
    return <Settings className="w-4 h-4 text-yellow-400 shrink-0" />
  }
  if (lower === "urls.py") {
    return <Globe className="w-4 h-4 text-teal-400 shrink-0" />
  }
  if (lower === "models.py") {
    return <Database className="w-4 h-4 text-sky-400 shrink-0" />
  }
  if (lower === "views.py") {
    return <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
  }
  if (lower === "requirements.txt" || lower === "pyproject.toml") {
    return <Layers className="w-4 h-4 text-rose-400 shrink-0" />
  }
  if (lower.startsWith(".env") || lower === ".gitignore") {
    return <Settings className="w-4 h-4 text-slate-400 shrink-0" />
  }

  switch (ext) {
    case "py":
      return (
        <span className="w-4 h-4 rounded bg-blue-900/60 border border-blue-400/40 text-blue-300 font-bold text-[9px] flex items-center justify-center shrink-0">
          py
        </span>
      )
    case "html":
    case "htm":
      return <span className="text-orange-500 font-bold text-xs shrink-0">&lt;&gt;</span>
    case "css":
    case "scss":
      return <span className="text-sky-400 font-bold text-xs shrink-0">#</span>
    case "js":
    case "jsx":
      return <span className="text-yellow-400 font-bold text-xs shrink-0">JS</span>
    case "ts":
    case "tsx":
      return <span className="text-blue-400 font-bold text-xs shrink-0">TS</span>
    case "json":
      return <FileJson className="w-4 h-4 text-lime-400 shrink-0" />
    case "yaml":
    case "yml":
    case "toml":
    case "ini":
      return <Settings className="w-4 h-4 text-amber-300 shrink-0" />
    case "sql":
      return <Database className="w-4 h-4 text-teal-400 shrink-0" />
    case "md":
      return <FileText className="w-4 h-4 text-cyan-300 shrink-0" />
    case "csv":
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
    default:
      return <FileText className="w-4 h-4 text-slate-400 shrink-0" />
  }
}

export default function ProjectFileExplorer({
  files,
  projectName = "WORKSPACE",
  projectType = "django",
  activeFilePath,
  openFilePaths = [],
  dirtyFilePaths = new Set(),
  onOpenFile,
  onOpenToSide,
  onCreateFile,
  onCreateFolder,
  onRenamePath,
  onMovePath,
  onDuplicateFile,
  onDeletePath,
  onRefresh,
  onCloseSidebar,
}: ProjectFileExplorerProps) {
  // Tree expansion state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "": true,
    config: true,
    myapp: true,
    templates: true,
    static: true,
    app: true,
  })

  // Search filter
  const [filterQuery, setFilterQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  // Inline Creation State
  const [inlineCreate, setInlineCreate] = useState<{
    targetFolder: string
    type: "file" | "folder"
  } | null>(null)
  const [inlineCreateName, setInlineCreateName] = useState("")

  // Inline Rename State
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // Drag and Drop
  const [draggedPath, setDraggedPath] = useState<string | null>(null)
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null)

  // Clipboard (Copy/Cut)
  const [clipboard, setClipboard] = useState<{
    path: string
    action: "copy" | "cut"
  } | null>(null)

  // Delete Confirmation Modal
  const [deleteConfirmPath, setDeleteConfirmPath] = useState<{
    path: string
    isFolder: boolean
  } | null>(null)

  // Context Menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const treeRoot = useMemo(() => buildFileTree(files, filterQuery), [files, filterQuery])

  const inlineInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isSubmittingCreateRef = useRef(false)
  const isSubmittingRenameRef = useRef(false)

  // Focus inline create or rename inputs
  useEffect(() => {
    if (inlineCreate) {
      inlineInputRef.current?.focus()
      inlineInputRef.current?.select()
    }
  }, [inlineCreate])

  useEffect(() => {
    if (renamingPath) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [renamingPath])

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus()
    }
  }, [showSearch])

  // Close context menu on external click
  useEffect(() => {
    const handleWindowClick = () => {
      if (contextMenu) setContextMenu(null)
    }
    window.addEventListener("click", handleWindowClick)
    return () => window.removeEventListener("click", handleWindowClick)
  }, [contextMenu])

  // Keyboard Shortcuts: F2 for Rename, Delete for Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2" && activeFilePath && !renamingPath && !inlineCreate) {
        e.preventDefault()
        handleStartRename(activeFilePath)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeFilePath, renamingPath, inlineCreate])

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const current =
        prev[folderPath] !== undefined
          ? prev[folderPath]
          : folderPath === "" || !folderPath.includes("/")
      return {
        ...prev,
        [folderPath]: !current,
      }
    })
  }

  const expandAll = () => {
    const allDirs: Record<string, boolean> = { "": true }
    const collect = (nodes: Record<string, FileNode>) => {
      for (const node of Object.values(nodes)) {
        if (node.isDirectory) {
          allDirs[node.path] = true
          collect(node.children)
        }
      }
    }
    collect(treeRoot)
    setExpandedFolders(allDirs)
  }

  const collapseAll = () => {
    const allDirs: Record<string, boolean> = { "": true }
    const collect = (nodes: Record<string, FileNode>) => {
      for (const node of Object.values(nodes)) {
        if (node.isDirectory) {
          allDirs[node.path] = false
          collect(node.children)
        }
      }
    }
    collect(treeRoot)
    setExpandedFolders(allDirs)
  }

  // --- Inline Creation Handlers ---
  const handleStartCreate = (targetFolder: string, type: "file" | "folder") => {
    setExpandedFolders((prev) => ({ ...prev, [targetFolder]: true }))
    setInlineCreate({ targetFolder, type })
    setInlineCreateName("")
  }

  const handleConfirmCreate = async () => {
    if (isSubmittingCreateRef.current) return
    if (!inlineCreate) return
    const rawName = inlineCreateName.trim()
    if (!rawName) {
      setInlineCreate(null)
      return
    }

    if (/[\\:*?"<>|]/.test(rawName)) {
      alert("File or folder names cannot contain invalid characters (\\ / : * ? \" < > |)")
      return
    }

    const parent = inlineCreate.targetFolder ? `${inlineCreate.targetFolder}/` : ""
    const targetPath = `${parent}${rawName}`
    const targetType = inlineCreate.type

    isSubmittingCreateRef.current = true
    setInlineCreate(null)
    setInlineCreateName("")

    try {
      if (targetType === "folder") {
        await onCreateFolder(targetPath)
      } else {
        await onCreateFile(targetPath, false)
      }
    } catch (err: any) {
      console.error("Create failed:", err)
      alert(`Failed to create: ${err?.response?.data?.detail || err.message || "Unknown error"}`)
    } finally {
      isSubmittingCreateRef.current = false
    }
  }

  // --- Rename Handlers ---
  const handleStartRename = (path: string) => {
    setRenamingPath(path)
    setRenameValue(path.split("/").pop() || "")
  }

  const handleConfirmRename = async () => {
    if (isSubmittingRenameRef.current) return
    if (!renamingPath) return
    const cleanName = renameValue.trim()
    if (!cleanName) {
      setRenamingPath(null)
      return
    }

    if (/[\\:*?"<>|]/.test(cleanName)) {
      alert("Name cannot contain invalid characters (\\ / : * ? \" < > |)")
      return
    }

    const parts = renamingPath.split("/")
    parts[parts.length - 1] = cleanName
    const newPath = parts.join("/")

    if (newPath === renamingPath) {
      setRenamingPath(null)
      return
    }

    const oldPath = renamingPath
    isSubmittingRenameRef.current = true
    setRenamingPath(null)
    setRenameValue("")

    try {
      await onRenamePath(oldPath, newPath)
    } catch (err: any) {
      console.error("Rename failed:", err)
      alert(`Failed to rename: ${err?.response?.data?.detail || err.message || "Unknown error"}`)
    } finally {
      isSubmittingRenameRef.current = false
    }
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, path: string) => {
    e.stopPropagation()
    setDraggedPath(path)
    e.dataTransfer.setData("text/plain", path)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault()
    e.stopPropagation()
    const source = draggedPath || e.dataTransfer.getData("text/plain")
    if (!source) return

    // Cannot move item into itself or child
    if (targetFolder === source || targetFolder.startsWith(`${source}/`)) {
      e.dataTransfer.dropEffect = "none"
      return
    }

    // Cannot move into the same folder where it already resides
    const sourceParent = source.includes("/")
      ? source.substring(0, source.lastIndexOf("/"))
      : ""
    if (sourceParent === targetFolder) {
      e.dataTransfer.dropEffect = "none"
      return
    }

    setDropTargetFolder(targetFolder)
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTargetFolder(null)
  }

  const handleDrop = async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault()
    e.stopPropagation()
    const source = draggedPath || e.dataTransfer.getData("text/plain")
    setDraggedPath(null)
    setDropTargetFolder(null)

    if (!source) return
    if (targetFolder === source || targetFolder.startsWith(`${source}/`)) return

    const sourceParent = source.includes("/")
      ? source.substring(0, source.lastIndexOf("/"))
      : ""
    if (sourceParent === targetFolder) return

    try {
      await onMovePath(source, targetFolder)
    } catch (err: any) {
      console.error("Move failed:", err)
      alert(`Failed to move: ${err?.response?.data?.detail || err.message || "Unknown error"}`)
    }
  }

  // --- Clipboard (Copy / Paste) ---
  const handleCopy = (path: string) => {
    setClipboard({ path, action: "copy" })
  }

  const handleCut = (path: string) => {
    setClipboard({ path, action: "cut" })
  }

  const handlePaste = async (targetFolder: string) => {
    if (!clipboard) return
    if (clipboard.action === "cut") {
      await onMovePath(clipboard.path, targetFolder)
      setClipboard(null)
    } else {
      await onDuplicateFile(clipboard.path)
    }
  }

  // --- Context Menu ---
  const handleContextMenu = (e: React.MouseEvent, path: string, isFolder: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 280),
      targetPath: path,
      isFolder,
    })
  }

  // --- Recursive Tree Item Renderer ---
  const renderTreeNodes = (nodes: Record<string, FileNode>, depth = 0) => {
    const sortedEntries = Object.entries(nodes).sort(([, a], [, b]) => {
      // Folders first, then alphabetical
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    return sortedEntries.map(([key, node]) => {
      const isExpanded =
        expandedFolders[node.path] !== undefined
          ? expandedFolders[node.path]
          : depth === 0
      const isActive = activeFilePath === node.path
      const isDirty = dirtyFilePaths.has(node.path)
      const isRenaming = renamingPath === node.path
      const isDropTarget = dropTargetFolder === node.path
      const isCutTarget = clipboard?.action === "cut" && clipboard.path === node.path

      return (
        <div key={node.path} className="select-none text-xs">
          {/* Node Row */}
          <div
            draggable={!isRenaming}
            onDragStart={(e) => handleDragStart(e, node.path)}
            onDragOver={(e) => {
              const target = node.isDirectory
                ? node.path
                : node.path.includes("/")
                ? node.path.substring(0, node.path.lastIndexOf("/"))
                : ""
              handleDragOver(e, target)
            }}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              const target = node.isDirectory
                ? node.path
                : node.path.includes("/")
                ? node.path.substring(0, node.path.lastIndexOf("/"))
                : ""
              handleDrop(e, target)
            }}
            onClick={() => {
              if (node.isDirectory) {
                toggleFolder(node.path)
              } else {
                onOpenFile(node.path)
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, node.path, node.isDirectory)}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`group relative flex items-center justify-between h-7 pr-2 cursor-pointer transition-colors ${
              isActive
                ? "bg-[#18283f] text-cyan-200 border-l-2 border-cyan-400 font-medium"
                : "text-slate-300 hover:bg-[#132032] hover:text-white"
            } ${isDropTarget ? "bg-cyan-950/70 border-2 border-dashed border-cyan-400" : ""} ${
              isCutTarget ? "opacity-40 italic" : ""
            }`}
          >
            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
              {/* Folder chevron */}
              {node.isDirectory ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(node.path)
                  }}
                  className="w-3.5 h-3.5 flex items-center justify-center text-slate-500 hover:text-slate-200 shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-3.5 shrink-0" />
              )}

              {/* Icon */}
              {getFileIcon(node.name, node.isDirectory, isExpanded)}

              {/* Name or Inline Rename */}
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleConfirmRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmRename()
                    if (e.key === "Escape") setRenamingPath(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0b1725] text-white border border-cyan-500 rounded px-1 text-xs outline-none py-0 h-5 flex-1 min-w-0"
                />
              ) : (
                <span className="truncate font-mono">{node.name}</span>
              )}
            </div>

            {/* Badges, Dirty Indicator, and Hover Actions */}
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {isDirty && (
                <span
                  title="Unsaved changes"
                  className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mr-1"
                />
              )}

              {/* Hover quick action buttons */}
              <div className="hidden group-hover:flex items-center gap-0.5 text-slate-400">
                {node.isDirectory && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartCreate(node.path, "file")
                      }}
                      title="New File in Folder"
                      className="p-1 hover:text-cyan-300 hover:bg-[#1a334f] rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartCreate(node.path, "folder")
                      }}
                      title="New Subfolder"
                      className="p-1 hover:text-amber-300 hover:bg-[#1a334f] rounded"
                    >
                      <FolderPlus className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartRename(node.path)
                  }}
                  title="Rename (F2)"
                  className="p-1 hover:text-white hover:bg-[#1a334f] rounded"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirmPath({ path: node.path, isFolder: node.isDirectory })
                  }}
                  title="Delete"
                  className="p-1 hover:text-red-400 hover:bg-[#1a334f] rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Children and Inline Creation Sub-tree */}
          {node.isDirectory && isExpanded && (
            <div>
              {/* Inline Creation Input inside this folder */}
              {inlineCreate && inlineCreate.targetFolder === node.path && (
                <div
                  style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
                  className="flex items-center gap-1.5 h-7 pr-2 bg-[#0d1c2d] border-l-2 border-cyan-500"
                >
                  <span className="w-3.5 shrink-0" />
                  {inlineCreate.type === "folder" ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <input
                    ref={inlineInputRef}
                    type="text"
                    value={inlineCreateName}
                    placeholder={inlineCreate.type === "folder" ? "folder_name" : "file_name.py"}
                    onChange={(e) => setInlineCreateName(e.target.value)}
                    onBlur={handleConfirmCreate}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmCreate()
                      if (e.key === "Escape") setInlineCreate(null)
                    }}
                    className="bg-[#070e17] text-white border border-cyan-500 rounded px-1.5 text-xs outline-none py-0.5 h-5 flex-1 min-w-0"
                  />
                </div>
              )}

              {/* Child Nodes */}
              {renderTreeNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div
      onContextMenu={(e) => handleContextMenu(e, "", true)}
      className="flex flex-col h-full bg-[#0a1420] text-slate-200 select-none overflow-hidden relative"
    >
      {/* Explorer Header Toolbar */}
      <div className="flex items-center justify-between px-3 h-9 bg-[#0d1c2d] border-b border-[#182f47] text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="truncate flex items-center gap-1.5 text-cyan-400">
          <Files className="w-3.5 h-3.5" />
          <span>Explorer</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleStartCreate("", "file")}
            title="New File (Root)"
            className="p-1 rounded hover:bg-[#1a334f] text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStartCreate("", "folder")}
            title="New Folder (Root)"
            className="p-1 rounded hover:bg-[#1a334f] text-slate-400 hover:text-white transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Explorer"
            className="p-1 rounded hover:bg-[#1a334f] text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            title="Search Files (Filter)"
            className={`p-1 rounded hover:bg-[#1a334f] transition-colors ${
              showSearch ? "text-cyan-400 bg-[#1a334f]" : "text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={collapseAll}
            title="Collapse All"
            className="p-1 rounded hover:bg-[#1a334f] text-slate-400 hover:text-white transition-colors"
          >
            <MinusSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {showSearch && (
        <div className="p-2 border-b border-[#182f47] bg-[#070e17]">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search files by name..."
              className="w-full bg-[#0b1725] border border-[#1b3450] rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Project Root Banner */}
      <div
        onDragOver={(e) => handleDragOver(e, "")}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, "")}
        className={`px-3 py-1.5 bg-[#0b1929] border-b border-[#14263b] flex items-center justify-between text-xs cursor-pointer ${
          dropTargetFolder === "" ? "bg-cyan-950/70 border-cyan-400" : ""
        }`}
        onClick={() => toggleFolder("")}
      >
        <div className="flex items-center gap-1.5 truncate font-bold text-slate-300 text-[11px]">
          {expandedFolders[""] !== false ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="uppercase text-cyan-400 tracking-wider font-mono">
            {projectName}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {files.filter((f) => !f.is_directory && !f.path.endsWith("/.keep")).length} files
        </span>
      </div>

      {/* Tree Content */}
      <div
        className="flex-1 overflow-y-auto py-1"
        onDragOver={(e) => handleDragOver(e, "")}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, "")}
      >
        {/* Inline Create at Root */}
        {inlineCreate && inlineCreate.targetFolder === "" && (
          <div className="flex items-center gap-1.5 h-7 px-3 bg-[#0d1c2d] border-l-2 border-cyan-500">
            <span className="w-3.5 shrink-0" />
            {inlineCreate.type === "folder" ? (
              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <input
              ref={inlineInputRef}
              type="text"
              value={inlineCreateName}
              placeholder={inlineCreate.type === "folder" ? "folder_name" : "file_name.py"}
              onChange={(e) => setInlineCreateName(e.target.value)}
              onBlur={handleConfirmCreate}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreate()
                if (e.key === "Escape") setInlineCreate(null)
              }}
              className="bg-[#070e17] text-white border border-cyan-500 rounded px-1.5 text-xs outline-none py-0.5 h-5 flex-1 min-w-0"
            />
          </div>
        )}

        {files.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 space-y-2">
            <p>No files in workspace.</p>
            <button
              type="button"
              onClick={() => handleStartCreate("", "file")}
              className="text-cyan-400 hover:underline text-[11px]"
            >
              + Create first file
            </button>
          </div>
        ) : expandedFolders[""] !== false ? (
          renderTreeNodes(treeRoot)
        ) : null}
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 bg-[#0f1d2e] border border-[#1e3857] shadow-2xl rounded-md py-1 min-w-[190px] text-xs font-sans text-slate-200"
        >
          {/* File specific options */}
          {!contextMenu.isFolder && (
            <>
              <button
                type="button"
                onClick={() => {
                  onOpenFile(contextMenu.targetPath)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open</span>
              </button>
              {onOpenToSide && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenToSide(contextMenu.targetPath)
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open to the Side</span>
                </button>
              )}
              <div className="h-px bg-[#182f47] my-1" />
            </>
          )}

          {/* New Item */}
          <button
            type="button"
            onClick={() => {
              const folder = contextMenu.isFolder
                ? contextMenu.targetPath
                : contextMenu.targetPath.includes("/")
                ? contextMenu.targetPath.substring(0, contextMenu.targetPath.lastIndexOf("/"))
                : ""
              handleStartCreate(folder, "file")
              setContextMenu(null)
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New File</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const folder = contextMenu.isFolder
                ? contextMenu.targetPath
                : contextMenu.targetPath.includes("/")
                ? contextMenu.targetPath.substring(0, contextMenu.targetPath.lastIndexOf("/"))
                : ""
              handleStartCreate(folder, "folder")
              setContextMenu(null)
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Folder</span>
          </button>

          {contextMenu.targetPath && (
            <>
              <div className="h-px bg-[#182f47] my-1" />
              <button
                type="button"
                onClick={() => {
                  handleStartRename(contextMenu.targetPath)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Rename
                </span>
                <span className="text-[10px] text-slate-500">F2</span>
              </button>

              {!contextMenu.isFolder && (
                <button
                  type="button"
                  onClick={() => {
                    onDuplicateFile(contextMenu.targetPath)
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
                >
                  <Files className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleCopy(contextMenu.targetPath)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCut(contextMenu.targetPath)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
              >
                <Scissors className="w-3.5 h-3.5 text-slate-400" />
                <span>Cut</span>
              </button>

              {clipboard && contextMenu.isFolder && (
                <button
                  type="button"
                  onClick={() => {
                    handlePaste(contextMenu.targetPath)
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paste into Folder</span>
                </button>
              )}

              <div className="h-px bg-[#182f47] my-1" />

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.targetPath)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Relative Path</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmPath({
                    path: contextMenu.targetPath,
                    isFolder: contextMenu.isFolder,
                  })
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center gap-2 text-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          {!contextMenu.targetPath && (
            <>
              <div className="h-px bg-[#182f47] my-1" />
              <button
                type="button"
                onClick={() => {
                  onRefresh()
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Refresh Explorer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  expandAll()
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
              >
                <PlusSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Expand All</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  collapseAll()
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2"
              >
                <MinusSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Collapse All</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPath && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b192c] border border-red-900/60 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-400 font-bold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Delete</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-mono">{deleteConfirmPath.path}</strong>?
              {deleteConfirmPath.isFolder && (
                <span className="block mt-1 text-red-300 font-semibold">
                  Warning: Deleting this folder will permanently delete all files and nested subfolders inside it!
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#19324e]">
              <button
                type="button"
                onClick={() => setDeleteConfirmPath(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#0e1d2f] hover:bg-[#182f4b] rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = deleteConfirmPath.path
                  setDeleteConfirmPath(null)
                  await onDeletePath(target)
                }}
                className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-500 font-medium rounded shadow transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
