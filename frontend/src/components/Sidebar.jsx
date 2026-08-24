import React, { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Cloud, HardDrive, Star, Users, Trash2, Upload, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

const navItems = [
  { to: '/drive', label: 'My Drive', icon: HardDrive },
  { to: '/starred', label: 'Starred', icon: Star },
  { to: '/shared', label: 'Shared with me', icon: Users },
  { to: '/trash', label: 'Trash', icon: Trash2 },
]

export default function Sidebar({ onUpload }) {
  const { user, logout } = useAuth()
  const fileInputRef = useRef(null)

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <Cloud className="text-brand-600" size={26} />
        <span className="text-lg font-semibold">CloudDrive</span>
      </div>

      <div className="px-4 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-full shadow-sm transition"
        >
          <Upload size={16} />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onUpload(Array.from(e.target.files))
            e.target.value = ''
          }}
        />
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Shield size={18} />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-medium">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
