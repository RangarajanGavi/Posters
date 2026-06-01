import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d0d0d' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 min-h-screen" style={{ background: '#0d0d0d' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
