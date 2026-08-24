import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, List } from 'lucide-react'

export default function Topbar({ title, viewMode, onViewModeChange, breadcrumbs }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur border-b border-gray-200 px-8 py-4">
      <div className="flex items-center gap-6">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in Drive"
            className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-1 text-lg font-medium text-gray-800">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gray-400 mx-1">/</span>}
                <button
                  onClick={crumb.onClick}
                  className={i === breadcrumbs.length - 1 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}
                  disabled={i === breadcrumbs.length - 1}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <h1 className="text-lg font-medium text-gray-800">{title}</h1>
        )}
      </div>
    </div>
  )
}
