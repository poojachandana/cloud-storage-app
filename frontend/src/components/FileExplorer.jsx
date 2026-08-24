import React, { useState } from 'react'
import {
  Folder as FolderIcon,
  Star,
  MoreVertical,
  Download,
  Share2,
  Pencil,
  Trash2,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { iconForFile, formatBytes } from './fileIcons.js'

function ActionMenu({ items }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setOpen(false)
                  item.onClick()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
              >
                <item.icon size={15} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function FileExplorer({
  folders = [],
  files = [],
  viewMode = 'grid',
  onOpenFolder,
  onDownload,
  onRename,
  onMove,
  onTrash,
  onRestore,
  onDeletePermanently,
  onStar,
  onShare,
  onOpenFile,
  showRestoreActions = false,
}) {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FolderIcon size={48} strokeWidth={1.2} />
        <p className="mt-3 text-sm">Nothing here yet</p>
      </div>
    )
  }

  const folderActions = (folder) =>
    showRestoreActions
      ? [
          { icon: RotateCcw, label: 'Restore', onClick: () => onRestore(folder) },
        ]
      : [
          { icon: Pencil, label: 'Rename', onClick: () => onRename(folder, 'folder') },
          { icon: Trash2, label: 'Move to Trash', onClick: () => onTrash(folder, 'folder') },
        ]

  const fileActions = (file) =>
    showRestoreActions
      ? [
          { icon: RotateCcw, label: 'Restore', onClick: () => onRestore(file) },
          { icon: XCircle, label: 'Delete forever', onClick: () => onDeletePermanently(file) },
        ]
      : [
          { icon: Download, label: 'Download', onClick: () => onDownload(file) },
          { icon: Share2, label: 'Share', onClick: () => onShare(file) },
          { icon: Star, label: file.starred ? 'Unstar' : 'Star', onClick: () => onStar(file) },
          { icon: Pencil, label: 'Rename', onClick: () => onRename(file, 'file') },
          { icon: Trash2, label: 'Move to Trash', onClick: () => onTrash(file, 'file') },
        ]

  if (viewMode === 'list') {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Size</th>
            <th className="py-2 font-medium">Created</th>
            <th className="py-2 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <tr
              key={`f-${folder.id}`}
              onClick={() => onOpenFolder(folder)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            >
              <td className="py-2.5 flex items-center gap-2">
                <FolderIcon size={18} className="text-brand-500 shrink-0" />
                {folder.name}
              </td>
              <td className="py-2.5 text-gray-500">—</td>
              <td className="py-2.5 text-gray-500">{new Date(folder.createdAt).toLocaleDateString()}</td>
              <td className="py-2.5"><ActionMenu items={folderActions(folder)} /></td>
            </tr>
          ))}
          {files.map((file) => {
            const Icon = iconForFile(file.contentType, file.name)
            return (
              <tr key={`file-${file.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td
                  className="py-2.5 flex items-center gap-2 cursor-pointer"
                  onClick={() => !showRestoreActions && onOpenFile?.(file)}
                >
                  <Icon size={18} className="text-gray-500 shrink-0" />
                  {file.name}
                  {file.starred && <Star size={13} className="text-yellow-500 fill-yellow-500" />}
                </td>
                <td className="py-2.5 text-gray-500">{formatBytes(file.size)}</td>
                <td className="py-2.5 text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                <td className="py-2.5"><ActionMenu items={fileActions(file)} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {folders.map((folder) => (
        <div
          key={`f-${folder.id}`}
          onClick={() => onOpenFolder(folder)}
          className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-brand-300 cursor-pointer transition"
        >
          <div className="flex items-start justify-between">
            <FolderIcon size={30} className="text-brand-500" />
            <ActionMenu items={folderActions(folder)} />
          </div>
          <p className="mt-3 text-sm font-medium truncate">{folder.name}</p>
        </div>
      ))}

      {files.map((file) => {
        const Icon = iconForFile(file.contentType, file.name)
        return (
          <div
            key={`file-${file.id}`}
            onClick={() => !showRestoreActions && onOpenFile?.(file)}
            className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md cursor-pointer transition"
          >
            <div className="flex items-start justify-between">
              <Icon size={30} className="text-gray-500" />
              <ActionMenu items={fileActions(file)} />
            </div>
            <p className="mt-3 text-sm font-medium truncate flex items-center gap-1">
              {file.name}
              {file.starred && <Star size={13} className="text-yellow-500 fill-yellow-500 shrink-0" />}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
          </div>
        )
      })}
    </div>
  )
}
