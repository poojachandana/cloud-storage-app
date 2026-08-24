import React, { useState } from 'react'
import Modal from './Modal.jsx'

export default function RenameModal({ item, onClose, onRename }) {
  const [name, setName] = useState(item.name)
  const [submitting, setSubmitting] = useState(false)

  async function handleRename() {
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onRename(name.trim())
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Rename"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={submitting || !name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Save
          </button>
        </>
      }
    >
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </Modal>
  )
}
