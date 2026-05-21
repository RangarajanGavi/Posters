import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, PlusSquare, BarChart3,
  Share2, TrendingUp, LogOut, Wand2, Target, CreditCard, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
      { to: '/compose', icon: PlusSquare, label: 'New Post' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { to: '/ai-studio', icon: Wand2, label: 'AI Studio', badge: 'AI' },
      { to: '/ads', icon: Target, label: 'Ad Manager' },
      { to: '/platforms', icon: Share2, label: 'Platforms' },
    ]
  },
  {
    label: 'Account',
    items: [
      { to: '/subscription', icon: CreditCard, label: 'Subscription' },
    ]
  }
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ background: '#0f1117' }} className="w-64 flex flex-col h-full border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Metricool</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} style={{ width: '1.1rem', height: '1.1rem' }} />
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 text-white">
                          {badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-white/40 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full"
        >
          <LogOut style={{ width: '1rem', height: '1rem' }} />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
