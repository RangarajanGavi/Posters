import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PlusCircle, Bell, Search } from 'lucide-react'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Welcome back' },
  '/calendar': { title: 'Content Calendar', sub: 'Plan your content' },
  '/compose': { title: 'Compose Post', sub: 'Create & schedule' },
  '/analytics': { title: 'Analytics', sub: 'Track performance' },
  '/platforms': { title: 'Platforms', sub: 'Manage connections' },
  '/ai-studio': { title: 'AI Studio', sub: 'Create with AI' },
  '/media-studio': { title: 'AI Media Studio', sub: 'Generate photos & videos' },
  '/ads': { title: 'Ad Manager', sub: 'Run campaigns' },
  '/subscription': { title: 'Subscription', sub: 'Manage your plan' },
}

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const page = pageTitles[location.pathname] || { title: 'Metricool', sub: '' }

  return (
    <header
      className="backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-10 px-6 py-3.5 flex items-center justify-between"
      style={{ background: 'rgba(13,15,20,0.85)' }}
    >
      <div>
        <h1 className="text-lg font-bold text-slate-100 leading-tight">{page.title}</h1>
        <p className="text-xs text-slate-500 font-medium">{page.sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 text-slate-500 hover:text-slate-300 rounded-xl hover:bg-white/[0.06] transition-all">
          <Search className="w-4 h-4" />
        </button>
        <button className="relative p-2.5 text-slate-500 hover:text-slate-300 rounded-xl hover:bg-white/[0.06] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        </button>
        {location.pathname !== '/compose' && (
          <button
            onClick={() => navigate('/compose')}
            className="btn-primary"
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
