import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FolderPlus } from 'lucide-react'

import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import FileExplorer from '../components/FileExplorer.jsx'
import NewFolderModal from '../components/NewFolderModal.jsx'
import RenameModal from '../components/RenameModal.jsx'
import ShareModal from '../components/ShareModal.jsx'
import PreviewModal from '../components/PreviewModal.jsx'

import { folderApi, fileApi, trashApi, shareApi } from '../services/api.js'

export default function Dashboard({ view }) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()

  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showNewFolder, setShowNewFolder] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null) // { item, type }
  const [shareTarget, setShareTarget] = useState(null) // file
  const [previewTarget, setPreviewTarget] = useState(null) // file

  const [filterType, setFilterType] = useState('all')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  // ---- Data loading per view ----
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (view === 'drive') {
        const folderId = params['*'] || null; // e.g. /drive/12
        setCurrentFolderId(folderId)
        const { data } = await folderApi.contents(folderId)
        setFolders(data.folders)
        setFiles(data.files)
        await buildBreadcrumbs(folderId)
      } else if (view === 'starred') {
        const { data } = await fileApi.starred()
        setFolders([])
        setFiles(data)
        setBreadcrumbs([])
      } else if (view === 'shared') {
        const { data } = await shareApi.sharedWithMe()
        setFolders([])
        setFiles(
          data.map((s) => ({
            id: s.fileId,
            name: s.fileName,
            starred: false,
            size: 0,
            contentType: '',
            createdAt: new Date().toISOString(),
            sharedRole: s.role,
          }))
        )
        setBreadcrumbs([])
      } else if (view === 'trash') {
        const { data } = await trashApi.get()
        setFolders(data.folders)
        setFiles(data.files)
        setBreadcrumbs([])
      } else if (view === 'search') {
        const q = searchParams.get('q') || ''
        const [foldersRes, filesRes] = await Promise.all([
          folderApi.search(q),
          fileApi.search(q, filterType, filterFrom, filterTo),
        ])
        setFolders(foldersRes.data)
        setFiles(filesRes.data)
        setBreadcrumbs([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [view, params['*'], searchParams, filterType, filterFrom, filterTo])

  async function buildBreadcrumbs(folderId) {
    if (!folderId) {
      setBreadcrumbs([{ label: 'My Drive', onClick: () => navigate('/drive') }])
      return
    }
    // Walk up the parent chain
    const chain = []
    let id = folderId
    let guard = 0
    while (id && guard < 25) {
      const { data } = await folderApi.get(id)
      chain.unshift(data)
      id = data.parentId
      guard++
    }
    setBreadcrumbs([
      { label: 'My Drive', onClick: () => navigate('/drive') },
      ...chain.map((f) => ({ label: f.name, onClick: () => navigate(`/drive/${f.id}`) })),
    ])
  }

  useEffect(() => {
    load()
  }, [load])

  // ---- Upload ----
  async function handleUpload(fileList) {
    for (const file of fileList) {
      try {
        await fileApi.upload(file, currentFolderId)
      } catch (err) {
        setError(err.response?.data?.message || `Failed to upload ${file.name}`)
      }
    }
    load()
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    noClick: true,
    disabled: view !== 'drive',
  })

  // ---- Actions ----
  function openFolder(folder) {
    navigate(`/drive/${folder.id}`)
  }

  function handleDownload(file) {
    const token = localStorage.getItem('token')
    fetch(fileApi.downloadUrl(file.id), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        window.URL.revokeObjectURL(url)
      })
  }

  async function handleTrash(item, type) {
    if (type === 'folder') await folderApi.trash(item.id)
    else await fileApi.trash(item.id)
    load()
  }

  async function handleRestore(item) {
    // files have `contentType` key, folders don't
    if ('contentType' in item) await fileApi.restore(item.id)
    else await folderApi.restore(item.id)
    load()
  }

  async function handleDeletePermanently(file) {
    if (window.confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) {
      await fileApi.deletePermanently(file.id)
      load()
    }
  }

  async function handleStar(file) {
    if (file.starred) await fileApi.unstar(file.id)
    else await fileApi.star(file.id)
    load()
  }

  async function handleRenameSubmit(newName) {
    const { item, type } = renameTarget
    if (type === 'folder') await folderApi.rename(item.id, newName)
    else await fileApi.rename(item.id, newName)
    load()
  }

  async function handleCreateFolder(name) {
    await folderApi.create({ name, parentId: currentFolderId })
    load()
  }

  const titles = {
    drive: 'My Drive',
    starred: 'Starred',
    shared: 'Shared with me',
    trash: 'Trash',
    search: `Search results for "${searchParams.get('q') || ''}"`,
  }

  return (
    <div className="flex">
      <Sidebar onUpload={handleUpload} />

      <div {...getRootProps()} className="flex-1 min-h-screen relative">
        <input {...getInputProps()} />

        <Topbar
          title={titles[view]}
          breadcrumbs={view === 'drive' ? breadcrumbs : null}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="px-8 py-6">
          {view === 'drive' && (
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setShowNewFolder(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50"
              >
                <FolderPlus size={16} />
                New folder
              </button>
              <span className="text-xs text-gray-400">or drag & drop files anywhere to upload</span>
            </div>
          )}

          {view === 'search' && (
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
              >
                <option value="all">All types</option>
                <option value="image">Images</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="spreadsheet">Spreadsheets</option>
                <option value="archive">Archives</option>
              </select>
              <label className="text-xs text-gray-500 flex items-center gap-1.5">
                From
                <input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                />
              </label>
              <label className="text-xs text-gray-500 flex items-center gap-1.5">
                To
                <input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                />
              </label>
              {(filterType !== 'all' || filterFrom || filterTo) && (
                <button
                  onClick={() => {
                    setFilterType('all')
                    setFilterFrom('')
                    setFilterTo('')
                  }}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <FileExplorer
              folders={folders}
              files={files}
              viewMode={viewMode}
              onOpenFolder={openFolder}
              onDownload={handleDownload}
              onRename={(item, type) => setRenameTarget({ item, type })}
              onTrash={handleTrash}
              onRestore={handleRestore}
              onDeletePermanently={handleDeletePermanently}
              onStar={handleStar}
              onShare={(file) => setShareTarget(file)}
              onOpenFile={(file) => setPreviewTarget(file)}
              showRestoreActions={view === 'trash'}
            />
          )}
        </div>

        {isDragActive && (
          <div className="fixed inset-0 bg-brand-600/10 border-4 border-dashed border-brand-500 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-2">
              <UploadCloud size={36} className="text-brand-600" />
              <p className="text-sm font-medium text-gray-700">Drop files to upload</p>
            </div>
          </div>
        )}
      </div>

      {showNewFolder && (
        <NewFolderModal onClose={() => setShowNewFolder(false)} onCreate={handleCreateFolder} />
      )}
      {renameTarget && (
        <RenameModal
          item={renameTarget.item}
          onClose={() => setRenameTarget(null)}
          onRename={handleRenameSubmit}
        />
      )}
      {shareTarget && <ShareModal file={shareTarget} onClose={() => setShareTarget(null)} />}
      {previewTarget && (
        <PreviewModal
          file={previewTarget}
          onClose={() => setPreviewTarget(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}
