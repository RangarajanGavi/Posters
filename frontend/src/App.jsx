import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Calendar from './pages/Calendar.jsx'
import Composer from './pages/Composer.jsx'
import Analytics from './pages/Analytics.jsx'
import Platforms from './pages/Platforms.jsx'
import Subscription from './pages/Subscription.jsx'
import AdManager from './pages/AdManager.jsx'
import AIStudio from './pages/AIStudio.jsx'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="compose" element={<Composer />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="platforms" element={<Platforms />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="ads" element={<AdManager />} />
        <Route path="ai-studio" element={<AIStudio />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
