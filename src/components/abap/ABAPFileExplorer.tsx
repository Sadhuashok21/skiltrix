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
  Zap,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
  Check,
} from "lucide-react"
import type { ApiABAPSourceFile } from "../../api/abap"

export interface FileNode {
  id: string
  name: string
  path: string
  isDirectory: boolean
  objectType?: string
  sizeBytes?: number
  children: Record<string, FileNode>
}

export interface ABAPFileExplorerProps {
  files: ApiABAPSourceFile[]
  projectName?: string
  packageName?: string
  activeFilePath: string | null
  openFilePaths?: string[]
  dirtyFilePaths?: Set<string>
  onOpenFile: (path: string) => void
  onOpenToSide?: (path: string) => void
  onCreateFile: (path: string, objectType: string) => Promise<void>
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

// Builds nested tree hierarchy from list of files
function buildFileTree(files: ApiABAPSourceFile[], filter = ""): Record<string, FileNode> {
  const root: Record<string, FileNode> = {}
  const lowerFilter = filter.toLowerCase().trim()

  files.forEach((file) => {
    // If it's a hidden keep file, we want its folder to exist, but not the .keep file itself
    const isKeepFile = file.name.endsWith("/.keep") || file.name === ".keep"
    const displayPath = isKeepFile ? file.name.replace(/\/\.keep$/, "") : file.name
    if (!displayPath) return

    const parts = displayPath.split("/").filter(Boolean)
    let currentLevel = root

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1
      const nodePath = parts.slice(0, index + 1).join("/")
      const isDir = isKeepFile || !isLast || (file.object_type as string) === "folder"

      if (!currentLevel[part]) {
        currentLevel[part] = {
          id: isLast && !isKeepFile ? file.file_id : `folder_${nodePath}`,
          name: part,
          path: nodePath,
          isDirectory: isDir,
          objectType: isLast && !isKeepFile ? file.object_type : "folder",
          sizeBytes: isLast && !isKeepFile ? file.size_bytes : 0,
          children: {},
        }
      } else if (isDir && !currentLevel[part].isDirectory) {
        currentLevel[part].isDirectory = true
        currentLevel[part].objectType = "folder"
      }

      currentLevel = currentLevel[part].children
    })
  })

  // If a search query is active, filter the tree
  if (lowerFilter) {
    const filterTree = (nodes: Record<string, FileNode>): Record<string, FileNode> => {
      const filtered: Record<string, FileNode> = {}
      for (const [key, node] of Object.entries(nodes)) {
        if (node.isDirectory) {
          const matchingChildren = filterTree(node.children)
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
    return filterTree(root)
  }

  return root
}

// Returns appropriate SVG icon based on ABAP object type & extension
export function getABAPFileIcon(filename: string, objectType = "report") {
  const lower = filename.toLowerCase()

  if (lower.endsWith(".clas.abap") || objectType === "class") {
    return (
      <span className="flex items-center gap-0.5 text-purple-400 shrink-0" title="ABAP Class (CLAS)">
        <Layers className="w-3.5 h-3.5" />
      </span>
    )
  }
  if (lower.endsWith(".intf.abap") || objectType === "interface") {
    return (
      <span className="flex items-center gap-0.5 text-amber-400 shrink-0" title="ABAP Interface (INTF)">
        <Code2 className="w-3.5 h-3.5" />
      </span>
    )
  }
  if (lower.endsWith(".incl.abap") || objectType === "include") {
    return (
      <span className="flex items-center gap-0.5 text-emerald-400 shrink-0" title="ABAP Include (INCL)">
        <FileCode className="w-3.5 h-3.5" />
      </span>
    )
  }
  if (lower.endsWith(".tabl.abap") || lower.endsWith(".stru.abap") || objectType === "ddic_table" || objectType === "structure") {
    return (
      <span className="flex items-center gap-0.5 text-cyan-400 shrink-0" title="Dictionary Table / Structure">
        <Database className="w-3.5 h-3.5" />
      </span>
    )
  }
  if (lower.endsWith(".func.abap") || objectType === "function_module") {
    return (
      <span className="flex items-center gap-0.5 text-orange-400 shrink-0" title="Function Module (FUNC)">
        <Zap className="w-3.5 h-3.5" />
      </span>
    )
  }
  if (lower.endsWith(".json")) {
    return <span className="text-yellow-400 font-mono text-[10px] font-bold shrink-0">{"{}"}</span>
  }
  if (lower.endsWith(".md")) {
    return <FileText className="w-3.5 h-3.5 text-blue-300 shrink-0" />
  }

  // Default: Executable Report (.prog.abap or .abap)
  return (
    <span className="flex items-center gap-0.5 text-blue-400 shrink-0" title="Executable Report (PROG)">
      <FileCode className="w-3.5 h-3.5" />
    </span>
  )
}

export default function ABAPFileExplorer({
  files,
  projectName = "ABAP_PROJECT",
  packageName = "$TMP",
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
}: ABAPFileExplorerProps) {
  // Tree & State
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState<string | null>(activeFilePath)

  // Inline creation state: { parentPath: string; isFolder: boolean }
  const [inlineCreate, setInlineCreate] = useState<{ parentPath: string; isFolder: boolean } | null>(null)
  const [inlineCreateName, setInlineCreateName] = useState("")
  const [inlineCreateError, setInlineCreateError] = useState<string | null>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)
  const isSubmittingCreateRef = useRef(false)

  // Inline rename state: path of item being renamed
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [renamingName, setRenamingName] = useState("")
  const [renamingError, setRenamingError] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const isSubmittingRenameRef = useRef(false)

  // Clipboard for copy / cut / paste
  const [clipboard, setClipboard] = useState<{ path: string; isCut: boolean } | null>(null)

  // HTML5 Drag and Drop
  const [draggedPath, setDraggedPath] = useState<string | null>(null)
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null)

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ path: string; isFolder: boolean } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Build tree
  const tree = useMemo(() => buildFileTree(files, searchQuery), [files, searchQuery])

  // Sync selected path with active file path
  useEffect(() => {
    if (activeFilePath) {
      setSelectedPath(activeFilePath)
      // Automatically expand parent directories of active file
      const parts = activeFilePath.split("/")
      if (parts.length > 1) {
        setCollapsedDirs((prev) => {
          const next = { ...prev }
          let curr = ""
          for (let i = 0; i < parts.length - 1; i++) {
            curr = curr ? `${curr}/${parts[i]}` : parts[i]
            next[curr] = false // uncollapse
          }
          return next
        })
      }
    }
  }, [activeFilePath])

  // Focus inputs
  useEffect(() => {
    if (inlineCreate && inlineInputRef.current) {
      inlineInputRef.current.focus()
      inlineInputRef.current.select()
    }
  }, [inlineCreate])

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus()
      const val = renameInputRef.current.value
      // Select filename before first dot
      const dotIdx = val.indexOf(".")
      if (dotIdx > 0) {
        renameInputRef.current.setSelectionRange(0, dotIdx)
      } else {
        renameInputRef.current.select()
      }
    }
  }, [renamingPath])

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null)
        setInlineCreate(null)
        setRenamingPath(null)
      }
    }
    window.addEventListener("mousedown", handleOutsideClick)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Folder collapse toggle
  const toggleCollapse = (path: string) => {
    setCollapsedDirs((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  // Expand All / Collapse All
  const handleCollapseAll = () => {
    const newCollapsed: Record<string, boolean> = {}
    const markAll = (nodes: Record<string, FileNode>) => {
      for (const node of Object.values(nodes)) {
        if (node.isDirectory) {
          newCollapsed[node.path] = true
          markAll(node.children)
        }
      }
    }
    markAll(tree)
    setCollapsedDirs(newCollapsed)
  }

  const handleExpandAll = () => {
    setCollapsedDirs({})
  }

  // Start creation inside a target folder (or root if parentPath is "")
  const startCreation = (parentPath = "", isFolder = false) => {
    setContextMenu(null)
    if (parentPath) {
      setCollapsedDirs((prev) => ({ ...prev, [parentPath]: false }))
    }
    setInlineCreate({ parentPath, isFolder })
    setInlineCreateName("")
    setInlineCreateError(null)
  }

  // Commit Creation
  const commitCreation = async () => {
    if (isSubmittingCreateRef.current) return
    if (!inlineCreate) return
    const trimmed = inlineCreateName.trim()
    if (!trimmed) {
      setInlineCreate(null)
      return
    }

    // Validation
    const invalidChars = /[\\:*?"<>|]/
    if (invalidChars.test(trimmed)) {
      setInlineCreateError("A file name cannot contain \\ / : * ? \" < > |")
      return
    }

    const fullPath = inlineCreate.parentPath ? `${inlineCreate.parentPath}/${trimmed}` : trimmed
    const isFolder = inlineCreate.isFolder

    isSubmittingCreateRef.current = true
    setInlineCreate(null)
    setInlineCreateName("")
    setInlineCreateError(null)

    try {
      if (isFolder) {
        await onCreateFolder(fullPath)
      } else {
        // Detect ABAP object type
        let objType = "report"
        const lower = trimmed.toLowerCase()
        if (lower.includes(".clas.")) objType = "class"
        else if (lower.includes(".incl.")) objType = "include"
        else if (lower.includes(".intf.")) objType = "interface"
        await onCreateFile(fullPath, objType)
      }
    } catch (err: any) {
      alert(`Failed to create object: ${err.message || "Unknown error"}`)
    } finally {
      isSubmittingCreateRef.current = false
    }
  }

  // Start Rename (F2)
  const startRename = (path: string) => {
    setContextMenu(null)
    const baseName = path.split("/").pop() || ""
    setRenamingPath(path)
    setRenamingName(baseName)
    setRenamingError(null)
  }

  // Commit Rename
  const commitRename = async () => {
    if (isSubmittingRenameRef.current) return
    if (!renamingPath) return
    const trimmed = renamingName.trim()
    if (!trimmed || trimmed === renamingPath.split("/").pop()) {
      setRenamingPath(null)
      return
    }

    const invalidChars = /[\\:*?"<>|/]/
    if (invalidChars.test(trimmed)) {
      setRenamingError("Name cannot contain special characters.")
      return
    }

    const oldPath = renamingPath
    const parent = oldPath.split("/").slice(0, -1).join("/")
    const newPath = parent ? `${parent}/${trimmed}` : trimmed

    isSubmittingRenameRef.current = true
    setRenamingPath(null)
    setRenamingName("")
    setRenamingError(null)

    try {
      await onRenamePath(oldPath, newPath)
    } catch (err: any) {
      alert(`Failed to rename: ${err.message || "Unknown error"}`)
    } finally {
      isSubmittingRenameRef.current = false
    }
  }

  const handleCopy = (path: string) => {
    setClipboard({ path, isCut: false })
    setContextMenu(null)
  }

  const handleCut = (path: string) => {
    setClipboard({ path, isCut: true })
    setContextMenu(null)
  }

  const handlePaste = async (targetFolder = "") => {
    setContextMenu(null)
    if (!clipboard) return
    const sourcePath = clipboard.path
    const isCut = clipboard.isCut
    const baseName = sourcePath.split("/").pop() || ""
    const destPath = targetFolder ? `${targetFolder}/${baseName}` : baseName

    if (destPath === sourcePath) return

    try {
      if (isCut) {
        await onMovePath(sourcePath, targetFolder)
        setClipboard(null)
      } else {
        await onDuplicateFile(sourcePath)
      }
    } catch (err: any) {
      console.error("Paste failed:", err)
    }
  }

  // Move via Drag and Drop
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

    // Guard: Cannot move item into itself or child
    if (targetFolder === source || targetFolder.startsWith(source + "/")) {
      e.dataTransfer.dropEffect = "none"
      return
    }

    // Guard: Cannot move into same parent folder
    const sourceParent = source.includes("/") ? source.substring(0, source.lastIndexOf("/")) : ""
    if (sourceParent === targetFolder) {
      e.dataTransfer.dropEffect = "none"
      return
    }

    e.dataTransfer.dropEffect = "move"
    setDropTargetFolder(targetFolder)
  }

  const handleDrop = async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault()
    e.stopPropagation()
    const sourcePath = draggedPath || e.dataTransfer.getData("text/plain")
    setDraggedPath(null)
    setDropTargetFolder(null)

    if (!sourcePath) return
    if (targetFolder === sourcePath || targetFolder.startsWith(sourcePath + "/")) return

    const sourceParent = sourcePath.includes("/") ? sourcePath.substring(0, sourcePath.lastIndexOf("/")) : ""
    if (sourceParent === targetFolder) return

    try {
      await onMovePath(sourcePath, targetFolder)
    } catch (err: any) {
      console.error("Drag and drop move failed:", err)
      alert(`Move failed: ${err.message || "Unknown error"}`)
    }
  }

  // Open Context Menu
  const openContextMenu = (e: React.MouseEvent, targetPath: string, isFolder: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedPath(targetPath)

    const menuW = 200
    const menuH = 320
    const x = Math.min(e.clientX, window.innerWidth - menuW - 10)
    const y = Math.min(e.clientY, window.innerHeight - menuH - 10)

    setContextMenu({ x, y, targetPath, isFolder })
  }

  // Delete Prompt
  const promptDelete = (path: string, isFolder: boolean) => {
    setContextMenu(null)
    setDeleteConfirm({ path, isFolder })
  }

  const confirmDeleteAction = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await onDeletePath(deleteConfirm.path)
      setDeleteConfirm(null)
    } catch (err) {
      console.error("Delete failed:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Count items inside a folder for delete prompt
  const countFolderChildren = (folderPath: string) => {
    return files.filter((f) => f.name.startsWith(folderPath + "/")).length
  }

  // Keyboard navigation & shortcuts on the tree container
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "F2" && selectedPath) {
      e.preventDefault()
      startRename(selectedPath)
    } else if (e.key === "Delete" && selectedPath) {
      e.preventDefault()
      const isFolder = files.some((f) => f.name.startsWith(selectedPath + "/") && f.name !== selectedPath)
      promptDelete(selectedPath, isFolder)
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && selectedPath) {
      e.preventDefault()
      handleCopy(selectedPath)
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x" && selectedPath) {
      e.preventDefault()
      handleCut(selectedPath)
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      e.preventDefault()
      const target = selectedPath && files.some((f) => f.name.startsWith(selectedPath + "/")) ? selectedPath : ""
      handlePaste(target)
    }
  }

  // Recursive Node Renderer
  const renderNodes = (nodes: Record<string, FileNode>, depth = 0) => {
    const sortedKeys = Object.keys(nodes).sort((a, b) => {
      if (nodes[a].isDirectory && !nodes[b].isDirectory) return -1
      if (!nodes[a].isDirectory && nodes[b].isDirectory) return 1
      return a.localeCompare(b)
    })

    return sortedKeys.map((key) => {
      const node = nodes[key]
      const isCollapsed = collapsedDirs[node.path] ?? false
      const isSelected = selectedPath === node.path
      const isActive = activeFilePath === node.path
      const isOpenTab = openFilePaths.includes(node.path)
      const isDirty = dirtyFilePaths.has(node.path)
      const isCut = clipboard?.isCut && clipboard.path === node.path
      const isDropTarget = dropTargetFolder === node.path

      const indentPx = depth * 14 + 10

      if (node.isDirectory) {
        return (
          <div key={node.path} className="select-none">
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, node.path)}
              onDragOver={(e) => handleDragOver(e, node.path)}
              onDragLeave={() => setDropTargetFolder(null)}
              onDrop={(e) => handleDrop(e, node.path)}
              onClick={() => {
                setSelectedPath(node.path)
                toggleCollapse(node.path)
              }}
              onContextMenu={(e) => openContextMenu(e, node.path, true)}
              style={{ paddingLeft: `${indentPx}px` }}
              className={`group flex items-center justify-between py-1 pr-2 text-xs cursor-pointer transition-colors relative ${
                isDropTarget
                  ? "bg-blue-600/30 border border-blue-400 border-dashed rounded"
                  : isSelected
                  ? "bg-[#183152] text-blue-200"
                  : "text-slate-300 hover:bg-[#11243a] hover:text-white"
              } ${isCut ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                <span className="text-slate-500 hover:text-slate-300 shrink-0">
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
                {isCollapsed ? (
                  <Folder className="w-4 h-4 text-amber-400/90 shrink-0" />
                ) : (
                  <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                )}

                {renamingPath === node.path ? (
                  <div className="flex-1 mr-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renamingName}
                      onChange={(e) => setRenamingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename()
                        if (e.key === "Escape") setRenamingPath(null)
                      }}
                      onBlur={commitRename}
                      className="w-full bg-[#08111d] border border-blue-500 text-white text-xs px-1.5 py-0.5 rounded outline-none"
                    />
                    {renamingError && <div className="text-[10px] text-red-400 mt-0.5">{renamingError}</div>}
                  </div>
                ) : (
                  <span className="truncate font-medium text-slate-200" title={node.path}>
                    {node.name}
                  </span>
                )}
              </div>

              {/* Quick Hover Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1">
                <button
                  type="button"
                  title="New File inside this folder"
                  onClick={(e) => {
                    e.stopPropagation()
                    startCreation(node.path, false)
                  }}
                  className="p-0.5 text-slate-400 hover:text-white rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="New Folder inside this folder"
                  onClick={(e) => {
                    e.stopPropagation()
                    startCreation(node.path, true)
                  }}
                  className="p-0.5 text-slate-400 hover:text-white rounded"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Inline creation input directly under this folder */}
            {inlineCreate && inlineCreate.parentPath === node.path && !isCollapsed && (
              <div
                style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
                className="flex items-center gap-1.5 py-1 pr-2 bg-[#0d1c2d] border-l-2 border-blue-500"
              >
                {inlineCreate.isFolder ? (
                  <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                <div className="flex-1 mr-1">
                  <input
                    ref={inlineInputRef}
                    type="text"
                    value={inlineCreateName}
                    placeholder={inlineCreate.isFolder ? "Folder name..." : "file.prog.abap"}
                    onChange={(e) => setInlineCreateName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitCreation()
                      if (e.key === "Escape") setInlineCreate(null)
                    }}
                    onBlur={commitCreation}
                    className="w-full bg-[#08111d] border border-blue-500 text-white text-xs px-1.5 py-0.5 rounded outline-none"
                  />
                  {inlineCreateError && (
                    <div className="text-[10px] text-red-400 mt-0.5">{inlineCreateError}</div>
                  )}
                </div>
              </div>
            )}

            {/* Folder Children */}
            {!isCollapsed && (
              <div className="border-l border-[#16273c] ml-3.5">
                {renderNodes(node.children, depth + 1)}
              </div>
            )}
          </div>
        )
      }

      // Leaf File Node
      return (
        <div
          key={node.path}
          draggable
          onDragStart={(e) => handleDragStart(e, node.path)}
          onClick={() => {
            setSelectedPath(node.path)
            onOpenFile(node.path)
          }}
          onDoubleClick={() => onOpenFile(node.path)}
          onContextMenu={(e) => openContextMenu(e, node.path, false)}
          style={{ paddingLeft: `${indentPx}px` }}
          className={`group flex items-center justify-between py-1 pr-2 text-xs cursor-pointer select-none transition-colors ${
            isActive
              ? "bg-[#183556] text-blue-100 font-medium"
              : isSelected
              ? "bg-[#142942] text-slate-200"
              : "text-slate-300 hover:bg-[#11243a] hover:text-white"
          } ${isCut ? "opacity-50" : ""}`}
        >
          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
            {getABAPFileIcon(node.name, node.objectType)}

            {renamingPath === node.path ? (
              <div className="flex-1 mr-1" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renamingName}
                  onChange={(e) => setRenamingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename()
                    if (e.key === "Escape") setRenamingPath(null)
                  }}
                  onBlur={commitRename}
                  className="w-full bg-[#08111d] border border-blue-500 text-white text-xs px-1.5 py-0.5 rounded outline-none"
                />
                {renamingError && <div className="text-[10px] text-red-400 mt-0.5">{renamingError}</div>}
              </div>
            ) : (
              <span className="truncate" title={node.path}>
                {node.name}
              </span>
            )}
          </div>

          {/* Indicators & Actions */}
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {isDirty && (
              <span className="w-2 h-2 rounded-full bg-blue-400" title="Unsaved changes" />
            )}

            <button
              type="button"
              title="Delete File"
              onClick={(e) => {
                e.stopPropagation()
                promptDelete(node.path, false)
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )
    })
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => handleDragOver(e, "")}
      onDrop={(e) => handleDrop(e, "")}
      onContextMenu={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "DIV") {
          openContextMenu(e, "", true)
        }
      }}
      className="flex flex-col h-full bg-[#0a1523] text-slate-300 text-xs select-none outline-none overflow-hidden"
    >
      {/* 1. EXPLORER HEADER TOOLBAR */}
      <div className="h-9 px-3 border-b border-[#152538] flex items-center justify-between bg-[#08111d] shrink-0">
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <span>Explorer</span>
        </span>

        {/* VS Code-style action icons */}
        <div className="flex items-center gap-0.5 text-slate-400">
          <button
            type="button"
            onClick={() => startCreation("", false)}
            title="New ABAP File"
            className="p-1 rounded hover:bg-[#15273e] hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => startCreation("", true)}
            title="New Folder"
            className="p-1 rounded hover:bg-[#15273e] hover:text-white transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Explorer"
            className="p-1 rounded hover:bg-[#15273e] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            title="Collapse All Folders"
            className="p-1 rounded hover:bg-[#15273e] hover:text-white transition-colors"
          >
            <MinusSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Filter by filename"
            className={`p-1 rounded hover:bg-[#15273e] transition-colors ${
              isSearchOpen || searchQuery ? "text-blue-400" : "hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          {onCloseSidebar && (
            <button
              type="button"
              onClick={onCloseSidebar}
              title="Hide Explorer Panel"
              className="p-1 rounded hover:bg-[#15273e] hover:text-white transition-colors ml-1 border-l border-[#1a2f47] pl-1.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SEARCH / FILTER BAR (Optional Toggle) */}
      {isSearchOpen && (
        <div className="p-2 border-b border-[#152538] bg-[#091422] flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              placeholder="Search files by name..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060e18] border border-[#1a2d42] rounded pl-7 pr-6 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. WORKSPACE / PROJECT ROOT NODE */}
      <div
        onClick={() => setSelectedPath("")}
        onDragOver={(e) => handleDragOver(e, "")}
        onDrop={(e) => handleDrop(e, "")}
        className="px-3 py-1.5 bg-[#0e1c2e] border-b border-[#152538] flex items-center justify-between font-semibold text-slate-200 tracking-wide cursor-pointer hover:bg-[#13253b] transition-colors"
      >
        <div className="flex items-center gap-1.5 truncate">
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate uppercase font-bold text-[11px] text-blue-300">
            {projectName}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">[{packageName}]</span>
        </div>
        <span className="text-[10px] text-slate-500">
          {files.filter((f) => !f.name.endsWith("/.keep")).length} files
        </span>
      </div>

      {/* 4. TREE NODES CONTAINER */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Inline create input at ROOT level */}
        {inlineCreate && inlineCreate.parentPath === "" && (
          <div className="flex items-center gap-1.5 py-1 px-3 bg-[#0d1c2d] border-l-2 border-blue-500 mb-1">
            {inlineCreate.isFolder ? (
              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            )}
            <div className="flex-1">
              <input
                ref={inlineInputRef}
                type="text"
                value={inlineCreateName}
                placeholder={inlineCreate.isFolder ? "Folder name..." : "file.prog.abap"}
                onChange={(e) => setInlineCreateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitCreation()
                  if (e.key === "Escape") setInlineCreate(null)
                }}
                onBlur={commitCreation}
                className="w-full bg-[#08111d] border border-blue-500 text-white text-xs px-1.5 py-0.5 rounded outline-none"
              />
              {inlineCreateError && (
                <div className="text-[10px] text-red-400 mt-0.5">{inlineCreateError}</div>
              )}
            </div>
          </div>
        )}

        {/* Tree Rendering */}
        {Object.keys(tree).length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            <p className="text-xs">
              {searchQuery ? "No matching files found." : "Workspace is empty."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => startCreation("", false)}
                className="mt-2 text-xs text-blue-400 hover:underline"
              >
                + Create new ABAP file
              </button>
            )}
          </div>
        ) : (
          renderNodes(tree)
        )}
      </div>

      {/* 5. FLOATING CONTEXT MENU */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-52 bg-[#0c1827] border border-[#1f3755] rounded-lg shadow-2xl py-1 text-xs text-slate-200 animate-fade-in"
        >
          {/* File Context Items */}
          {!contextMenu.isFolder && contextMenu.targetPath && (
            <>
              <button
                type="button"
                onClick={() => {
                  onOpenFile(contextMenu.targetPath)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Open</span>
              </button>
              {onOpenToSide && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenToSide(contextMenu.targetPath)
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Open to the Side</span>
                </button>
              )}
              <div className="my-1 border-t border-[#182d46]" />
            </>
          )}

          {/* Create Options */}
          <button
            type="button"
            onClick={() =>
              startCreation(
                contextMenu.isFolder ? contextMenu.targetPath : contextMenu.targetPath.split("/").slice(0, -1).join("/"),
                false
              )
            }
            className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>New File</span>
          </button>
          <button
            type="button"
            onClick={() =>
              startCreation(
                contextMenu.isFolder ? contextMenu.targetPath : contextMenu.targetPath.split("/").slice(0, -1).join("/"),
                true
              )
            }
            className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center gap-2"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-400" />
            <span>New Folder</span>
          </button>

          <div className="my-1 border-t border-[#182d46]" />

          {/* Item Actions */}
          {contextMenu.targetPath && (
            <>
              <button
                type="button"
                onClick={() => startRename(contextMenu.targetPath)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rename</span>
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
                  className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center gap-2"
                >
                  <Files className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopy(contextMenu.targetPath)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </span>
                <span className="text-[10px] text-slate-500">Ctrl+C</span>
              </button>

              <button
                type="button"
                onClick={() => handleCut(contextMenu.targetPath)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cut</span>
                </span>
                <span className="text-[10px] text-slate-500">Ctrl+X</span>
              </button>
            </>
          )}

          {/* Paste */}
          {clipboard && (
            <button
              type="button"
              onClick={() => handlePaste(contextMenu.isFolder ? contextMenu.targetPath : "")}
              className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center justify-between text-blue-300"
            >
              <span className="flex items-center gap-2">
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste</span>
              </span>
              <span className="text-[10px] text-slate-500">Ctrl+V</span>
            </button>
          )}

          {contextMenu.targetPath && (
            <>
              <div className="my-1 border-t border-[#182d46]" />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.targetPath)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#162f4e] flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Path</span>
              </button>

              <button
                type="button"
                onClick={() => promptDelete(contextMenu.targetPath, contextMenu.isFolder)}
                className="w-full text-left px-3 py-1.5 hover:bg-red-500/20 text-red-400 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </span>
                <span className="text-[10px] text-red-400/80">Del</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* 6. DELETE CONFIRMATION DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0f1f33] border border-[#1e3857] rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Delete {deleteConfirm.isFolder ? "Folder" : "File"}?
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-mono bg-[#08121f] px-1 py-0.5 rounded">
                {deleteConfirm.path}
              </strong>
              ?
            </p>
            {deleteConfirm.isFolder && (
              <p className="text-xs text-amber-400/90 mb-4 bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                Deleting this folder will recursively delete all{" "}
                <strong>{countFolderChildren(deleteConfirm.path)}</strong> nested file(s) and folders inside it.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 mt-4">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteAction}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
