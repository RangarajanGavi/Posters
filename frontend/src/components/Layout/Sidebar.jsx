import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, PlusSquare, BarChart3, Share2, TrendingUp, LogOut, Wand2, Target, CreditCard, Film, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const navGroups = [
  {
    label: 'WORKSPACE',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Console' },
      { to: '/platforms', icon: Share2, label: 'Connectors' },
      { to: '/calendar', icon: CalendarDays, label: 'Scheduler' },
      { to: '/compose', icon: PlusSquare, label: 'Library' },
    ]
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/ai-studio', icon: Wand2, label: 'AI Studio' },
      { to: '/media-studio', icon: Film, label: 'Media Studio' },
      { to: '/ads', icon: Target, label: 'Campaigns' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/subscription', icon: CreditCard, label: 'Billing' },
    ]
  }
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ width: 220, background: '#111111', borderRight: '1px solid #2a2a2a', flexShrink: 0 }} className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ width: 28, height: 28, background: '#e63000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrendingUp style={{ width: 16, height: 16, color: '#fff' }} />
        </div>
        <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em' }}>METRICOOL.</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label} className="mb-5">
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: '#3a3a3a', marginBottom: 6, paddingLeft: 8 }}>{group.label}</p>
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 transition-colors duration-100 ${isActive ? 'text-white' : 'text-[#6b6b6b] hover:text-white hover:bg-[#161616]'}`}
                style={({ isActive }) => isActive ? { background: '#1f1f1f', borderLeft: '2px solid #e63000' } : { borderLeft: '2px solid transparent' }}
              >
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid #2a2a2a', padding: '12px 16px' }}>
        <div className="flex items-center gap-3 mb-2">
          <div style={{ width: 28, height: 28, background: '#e63000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
            <p style={{ color: '#3a3a3a', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>PRO PLAN</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-2 text-[#6b6b6b] hover:text-white transition-colors w-full" style={{ fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
          <LogOut style={{ width: 13, height: 13 }} />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
