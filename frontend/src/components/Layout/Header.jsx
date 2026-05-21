import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PlusCircle, Bell } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Content Calendar',
  '/compose': 'Compose Post',
  '/analytics': 'Analytics',
  '/platforms': 'Connected Platforms'
}

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const title = pageTitles[location.pathname] || 'Metricool'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        {location.pathname !== '/compose' && (
          <button
            onClick={() => navigate('/compose')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Post
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
