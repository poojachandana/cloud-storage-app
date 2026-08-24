import React, { useEffect, useState, useCallback } from 'react'
import { Shield, Users, FileStack, Ban, CheckCircle2, Trash2 } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import { adminApi } from '../services/api.js'
import { formatBytes } from '../components/fileIcons.js'

export default function AdminPage() {
  const [tab, setTab] = useState('users') // 'users' | 'files'
  const [users, setUsers] = useState([])
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [usersRes, filesRes, statsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getFiles(),
        adminApi.getStats(),
      ])
      setUsers(usersRes.data)
      setFiles(filesRes.data)
      setStats(statsRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleActive(user) {
    try {
      await adminApi.setUserStatus(user.id, !user.active)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update user status')
    }
  }

  async function deleteFile(file) {
    if (window.confirm(`Permanently delete "${file.name}" (owned by ${file.ownerEmail})?`)) {
      await adminApi.deleteFile(file.id)
      load()
    }
  }

  return (
    <div className="flex">
      <Sidebar onUpload={() => {}} />

      <div className="flex-1 min-h-screen">
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-brand-600" size={22} />
            <h1 className="text-lg font-medium">Admin</h1>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total users" value={stats.totalUsers} />
              <StatCard label="Active users" value={stats.activeUsers} />
              <StatCard label="Total files" value={stats.totalFiles} />
              <StatCard label="Storage used" value={formatBytes(stats.totalStorageBytes)} />
            </div>
          )}

          <div className="flex gap-4 border-b border-gray-200 mb-5">
            <button
              onClick={() => setTab('users')}
              className={`pb-2 flex items-center gap-1.5 text-sm font-medium border-b-2 ${
                tab === 'users' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500'
              }`}
            >
              <Users size={15} />
              Users
            </button>
            <button
              onClick={() => setTab('files')}
              className={`pb-2 flex items-center gap-1.5 text-sm font-medium border-b-2 ${
                tab === 'files' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500'
              }`}
            >
              <FileStack size={15} />
              All files
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : tab === 'users' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Storage used</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium w-24"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-2.5">{u.name}</td>
                    <td className="py-2.5 text-gray-500">{u.email}</td>
                    <td className="py-2.5">
                      <span className="text-xs bg-gray-100 rounded px-2 py-0.5">{u.role}</span>
                    </td>
                    <td className="py-2.5 text-gray-500">{formatBytes(u.storageUsedBytes)}</td>
                    <td className="py-2.5">
                      {u.active ? (
                        <span className="text-xs text-green-700 bg-green-50 rounded px-2 py-0.5">Active</span>
                      ) : (
                        <span className="text-xs text-red-700 bg-red-50 rounded px-2 py-0.5">Deactivated</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => toggleActive(u)}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                      >
                        {u.active ? (
                          <>
                            <Ban size={13} /> Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Owner</th>
                  <th className="py-2 font-medium">Size</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-b border-gray-100">
                    <td className="py-2.5">{f.name}</td>
                    <td className="py-2.5 text-gray-500">{f.ownerEmail}</td>
                    <td className="py-2.5 text-gray-500">{formatBytes(f.size)}</td>
                    <td className="py-2.5">
                      {f.trashed ? (
                        <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">In trash</span>
                      ) : (
                        <span className="text-xs text-green-700 bg-green-50 rounded px-2 py-0.5">Active</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => deleteFile(f)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete permanently"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  )
}
