import React, { useState } from "react"
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  FolderPlus,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { JavaIcon } from "../TechIcons"
import type { ApiProjectFile } from "../../api/codelab"

interface FileTreeProps {
  files: ApiProjectFile[]
  activeFilePath: string | null
  onSelectFile: (path: string) => void
  onCreateFile: (path: string, isDirectory: boolean) => Promise<void>
  onDeleteFile: (path: string) => Promise<void>
  onRefresh: () => void
}

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children: Record<string, FileNode>
}

function buildTree(files: ApiProjectFile[]): Record<string, FileNode> {
  const root: Record<string, FileNode> = {}

  files.forEach((file) => {
    const parts = file.path.split("/")
    let currentLevel = root

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1
      const isDir = !isLast || file.is_directory
      const nodePath = parts.slice(0, index + 1).join("/")

      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          path: nodePath,
          isDirectory: isDir,
          children: {},
        }
      } else if (!isLast && !currentLevel[part].isDirectory) {
        currentLevel[part].isDirectory = true
      }

      currentLevel = currentLevel[part].children
    })
  })

  return root
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "py":
      return <span className="text-yellow-400 font-bold text-xs">Py</span>
    case "js":
    case "jsx":
      return <span className="text-amber-400 font-bold text-xs">JS</span>
    case "ts":
    case "tsx":
      return <span className="text-blue-400 font-bold text-xs">TS</span>
    case "java":
      return <JavaIcon className="w-3.5 h-3.5 inline" />
    case "cpp":
    case "c":
      return <span className="text-blue-300 font-bold text-xs">C++</span>
    case "php":
      return <span className="text-purple-400 font-bold text-xs">PHP</span>
    case "sql":
      return <span className="text-emerald-400 font-bold text-xs">SQL</span>
    case "html":
      return <span className="text-orange-500 font-bold text-xs">&lt;&gt;</span>
    case "css":
      return <span className="text-sky-400 font-bold text-xs">#</span>
    case "json":
      return <span className="text-lime-400 font-bold text-xs">{}</span>
    default:
      return <FileText className="w-4 h-4 text-slate-400" />
  }
}

export default function FileTree({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRefresh,
}: FileTreeProps) {
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({})
  const [creatingType, setCreatingType] = useState<"file" | "folder" | null>(null)
  const [newItemName, setNewItemName] = useState("")

  const tree = buildTree(files)

  const toggleCollapse = (path: string) => {
    setCollapsedDirs((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || !creatingType) return
    await onCreateFile(newItemName.trim(), creatingType === "folder")
    setNewItemName("")
    setCreatingType(null)
  }

  const renderNodes = (nodes: Record<string, FileNode>, depth = 0) => {
    // Sort directories first, then alphabetically
    const sortedKeys = Object.keys(nodes).sort((a, b) => {
      if (nodes[a].isDirectory && !nodes[b].isDirectory) return -1
      if (!nodes[a].isDirectory && nodes[b].isDirectory) return 1
      return a.localeCompare(b)
    })

    return sortedKeys.map((key) => {
      const node = nodes[key]
      const isCollapsed = collapsedDirs[node.path]
      const isActive = activeFilePath === node.path

      if (node.isDirectory) {
        return (
          <div key={node.path} className="select-none">
            <div
              onClick={() => toggleCollapse(node.path)}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              className="flex items-center gap-1.5 py-1 px-2 text-xs text-slate-300 hover:bg-slate-800/60 rounded cursor-pointer transition-colors group"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
              {isCollapsed ? (
                <Folder className="w-4 h-4 text-amber-500/80" />
              ) : (
                <FolderOpen className="w-4 h-4 text-amber-400" />
              )}
              <span className="truncate flex-1 font-medium">{node.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete folder '${node.name}' and its contents?`)) {
                    onDeleteFile(node.path)
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {!isCollapsed && (
              <div>{renderNodes(node.children, depth + 1)}</div>
            )}
          </div>
        )
      }

      return (
        <div
          key={node.path}
          onClick={() => onSelectFile(node.path)}
          style={{ paddingLeft: `${depth * 12 + 22}px` }}
          className={`flex items-center gap-2 py-1 px-2 text-xs rounded cursor-pointer transition-colors group select-none ${
            isActive
              ? "bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-500"
              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <div className="w-4 flex items-center justify-center">
            {getFileIcon(node.name)}
          </div>
          <span className="truncate flex-1">{node.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete file '${node.name}'?`)) {
                onDeleteFile(node.path)
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#181824] text-slate-200 border-r border-slate-800 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        <span>Files</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCreatingType("file")}
            title="New File"
            className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCreatingType("folder")}
            title="New Folder"
            className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Files"
            className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline File / Folder Creator */}
      {creatingType && (
        <form onSubmit={handleCreateSubmit} className="p-2 bg-slate-900 border-b border-slate-800">
          <div className="text-[11px] text-indigo-400 mb-1 font-medium">
            Create new {creatingType} (e.g. <code>app/routes.py</code>):
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={creatingType === "file" ? "filename.ext" : "folder_name"}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-2 py-0.5 rounded font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatingType(null)
                setNewItemName("")
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2 py-0.5 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No files in workspace yet. Click '+' to add a file.
          </div>
        ) : (
          renderNodes(tree)
        )}
      </div>
    </div>
  )
}
