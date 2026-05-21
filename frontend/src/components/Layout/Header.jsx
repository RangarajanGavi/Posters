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
  '/ads': { title: 'Ad Manager', sub: 'Run campaigns' },
  '/subscription': { title: 'Subscription', sub: 'Manage your plan' },
}

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const page = pageTitles[location.pathname] || { title: 'Metricool', sub: '' }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 px-6 py-3.5 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{page.title}</h1>
        <p className="text-xs text-slate-400 font-medium">{page.sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
          <Search className="w-4 h-4" />
        </button>
        <button className="relative p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
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
