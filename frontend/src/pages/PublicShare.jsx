import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Cloud, Lock, Download } from 'lucide-react'
import { publicLinkApi } from '../services/api.js'

export default function PublicShare() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  async function handleDownload(e) {
    e.preventDefault()
    setError('')
    setDownloading(true)
    try {
      const url = publicLinkApi.downloadUrl(token, password)
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Could not download this file')
      }
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/)
      const filename = match ? decodeURIComponent(match[1]) : 'download'

      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError(err.message || 'This link may be invalid, expired, or password protected.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Cloud className="text-brand-600" size={28} />
          <span className="text-xl font-semibold">CloudDrive</span>
        </div>

        <Lock className="mx-auto text-gray-400 mb-3" size={28} />
        <h1 className="text-base font-medium mb-1">Someone shared a file with you</h1>
        <p className="text-sm text-gray-500 mb-6">Enter the password if required, then download.</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleDownload} className="space-y-3">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (if required)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition"
          >
            <Download size={16} />
            {downloading ? 'Downloading…' : 'Download file'}
          </button>
        </form>
      </div>
    </div>
  )
}
