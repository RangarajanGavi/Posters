import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PlusCircle, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const pages = {
  '/dashboard':    { prefix: '// CONSOLE',       title: 'Welcome back' },
  '/calendar':     { prefix: '// SCHEDULER',     title: 'Content calendar' },
  '/compose':      { prefix: '// LIBRARY',       title: 'New post' },
  '/analytics':    { prefix: '// ANALYTICS',     title: 'Performance' },
  '/platforms':    { prefix: '// CONNECTORS',    title: 'Platforms' },
  '/ai-studio':    { prefix: '// AI STUDIO',     title: 'AI Studio' },
  '/media-studio': { prefix: '// MEDIA STUDIO',  title: 'Media Studio' },
  '/ads':          { prefix: '// AD CAMPAIGNS',  title: 'Campaign manager' },
  '/subscription': { prefix: '// BILLING',       title: 'Subscription' },
}

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const page = pages[location.pathname] || { prefix: '// METRICOOL', title: 'Dashboard' }

  const title = location.pathname === '/dashboard' ? `Welcome, ${user?.name?.split(' ')[0] || 'User'}` : page.title

  return (
    <header style={{ background: '#0d0d0d', borderBottom: '1px solid #2a2a2a', padding: '16px 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
      <div>
        <p className="section-prefix">{page.prefix}</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: 2 }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', position: 'relative' }}
          className="text-[#6b6b6b] hover:text-white hover:border-[#3a3a3a] transition-colors">
          <Bell style={{ width: 15, height: 15 }} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 5, height: 5, background: '#e63000', borderRadius: '50%' }}></span>
        </button>
        {location.pathname !== '/compose' && (
          <button onClick={() => navigate('/compose')} className="btn-primary" style={{ gap: 6 }}>
            <PlusCircle style={{ width: 14, height: 14 }} />
            New post
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
