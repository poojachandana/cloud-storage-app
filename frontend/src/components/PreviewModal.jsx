import React, { useEffect, useState } from 'react'
import { Download, X, Loader2 } from 'lucide-react'
import { fileApi } from '../services/api.js'

export default function PreviewModal({ file, onClose, onDownload }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isImage = (file.contentType || '').startsWith('image/')
  const isPdf = file.contentType === 'application/pdf'
  const previewable = isImage || isPdf

  useEffect(() => {
    let currentUrl = null
    let cancelled = false

    async function load() {
      if (!previewable) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(fileApi.downloadUrl(file.id), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Could not load preview')
        const blob = await res.blob()
        if (cancelled) return
        currentUrl = window.URL.createObjectURL(blob)
        setBlobUrl(currentUrl)
      } catch (err) {
        if (!cancelled) setError('Could not load a preview for this file.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      if (currentUrl) window.URL.revokeObjectURL(currentUrl)
    }
  }, [file.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium truncate">{file.name}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onDownload(file)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <Download size={16} />
              Download
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 min-h-[300px]">
          {!previewable ? (
            <div className="text-center py-16 px-6">
              <p className="text-sm text-gray-500 mb-4">
                No inline preview available for this file type. Download it to view.
              </p>
              <button
                onClick={() => onDownload(file)}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          ) : loading ? (
            <Loader2 className="animate-spin text-gray-400" size={28} />
          ) : error ? (
            <p className="text-sm text-red-600 px-6 text-center">{error}</p>
          ) : isImage ? (
            <img src={blobUrl} alt={file.name} className="max-w-full max-h-[70vh] object-contain" />
          ) : isPdf ? (
            <iframe src={blobUrl} title={file.name} className="w-full h-[70vh]" />
          ) : null}
        </div>
      </div>
    </div>
  )
}
