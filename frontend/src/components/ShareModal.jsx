import React, { useState } from 'react'
import { Link2, Check, Copy } from 'lucide-react'
import Modal from './Modal.jsx'
import { shareApi, publicLinkApi } from '../services/api.js'

export default function ShareModal({ file, onClose }) {
  const [tab, setTab] = useState('people') // 'people' | 'link'

  // people share state
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('VIEWER')
  const [shareError, setShareError] = useState('')
  const [shareSuccess, setShareSuccess] = useState('')
  const [sharing, setSharing] = useState(false)

  // link share state
  const [expiryHours, setExpiryHours] = useState('')
  const [password, setPassword] = useState('')
  const [linkResult, setLinkResult] = useState(null)
  const [linkError, setLinkError] = useState('')
  const [creatingLink, setCreatingLink] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    setShareError('')
    setShareSuccess('')
    if (!email.trim()) return
    setSharing(true)
    try {
      await shareApi.share({ fileId: file.id, email: email.trim(), role })
      setShareSuccess(`Shared with ${email.trim()} as ${role.toLowerCase()}`)
      setEmail('')
    } catch (err) {
      setShareError(err.response?.data?.message || 'Could not share this file')
    } finally {
      setSharing(false)
    }
  }

  async function handleCreateLink() {
    setLinkError('')
    setCreatingLink(true)
    try {
      const { data } = await publicLinkApi.create({
        fileId: file.id,
        expiryHours: expiryHours ? Number(expiryHours) : null,
        password: password || null,
      })
      setLinkResult(data)
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Could not create link')
    } finally {
      setCreatingLink(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(linkResult.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Modal title={`Share "${file.name}"`} onClose={onClose}>
      <div className="flex gap-4 border-b border-gray-100 mb-4 -mt-1">
        <button
          onClick={() => setTab('people')}
          className={`pb-2 text-sm font-medium border-b-2 ${
            tab === 'people' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500'
          }`}
        >
          Share with people
        </button>
        <button
          onClick={() => setTab('link')}
          className={`pb-2 text-sm font-medium border-b-2 ${
            tab === 'link' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500'
          }`}
        >
          Public link
        </button>
      </div>

      {tab === 'people' ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
          </div>
          {shareError && <p className="text-sm text-red-600">{shareError}</p>}
          {shareSuccess && <p className="text-sm text-green-600">{shareSuccess}</p>}
          <button
            onClick={handleShare}
            disabled={sharing || !email.trim()}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg"
          >
            {sharing ? 'Sharing…' : 'Share'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {!linkResult ? (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Expires after (hours, optional)</label>
                <input
                  type="number"
                  min="1"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  placeholder="Never expires"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password (optional)</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="No password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {linkError && <p className="text-sm text-red-600">{linkError}</p>}
              <button
                onClick={handleCreateLink}
                disabled={creatingLink}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg"
              >
                <Link2 size={15} />
                {creatingLink ? 'Creating…' : 'Create link'}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Anyone with this link can download the file{linkResult.passwordProtected ? ' (password required)' : ''}.</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm truncate flex-1">{linkResult.url}</span>
                <button onClick={copyLink} className="text-gray-500 hover:text-gray-800">
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              {linkResult.expiresAt && (
                <p className="text-xs text-gray-400">Expires {new Date(linkResult.expiresAt).toLocaleString()}</p>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
