import React, { useState, useEffect } from 'react'
import {
  Facebook, Instagram, Twitter, Linkedin, CheckCircle2,
  RefreshCw, Link2, Link2Off, Users, AlertCircle, X
} from 'lucide-react'
import api from '../api/axios.js'

const platformConfig = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    ringColor: 'ring-blue-200',
    description: 'Share posts, stories and connect with your audience'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: '#E1306C',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    ringColor: 'ring-pink-200',
    description: 'Share photos, reels and stories with your followers'
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    color: '#1DA1F2',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    ringColor: 'ring-sky-200',
    description: 'Post tweets and engage with trending conversations'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    ringColor: 'ring-indigo-200',
    description: 'Share professional content and grow your network'
  }
]

const Toast = ({ type, message, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
    type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    {type === 'success'
      ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
    }
    {message}
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
)

const Platforms = () => {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchPlatforms = async () => {
    try {
      const res = await api.get('/platforms')
      setPlatforms(res.data)
    } catch (err) {
      console.error('Fetch platforms error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const getPlatformData = (platformId) => {
    return platforms.find(p => p.name === platformId) || null
  }

  const setLoaderFor = (platformId, key, value) => {
    setActionLoading(prev => ({ ...prev, [`${platformId}_${key}`]: value }))
  }

  const handleConnect = async (platformId) => {
    setLoaderFor(platformId, 'connect', true)
    try {
      await api.post('/platforms/connect', { name: platformId })
      await fetchPlatforms()
      showToast('success', `${platformId.charAt(0).toUpperCase() + platformId.slice(1)} connected successfully!`)
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to connect platform')
    } finally {
      setLoaderFor(platformId, 'connect', false)
    }
  }

  const handleDisconnect = async (platformId) => {
    const platform = getPlatformData(platformId)
    if (!platform) return

    setLoaderFor(platformId, 'disconnect', true)
    try {
      await api.put(`/platforms/${platform.id}/disconnect`)
      await fetchPlatforms()
      showToast('success', `${platformId.charAt(0).toUpperCase() + platformId.slice(1)} disconnected`)
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to disconnect platform')
    } finally {
      setLoaderFor(platformId, 'disconnect', false)
    }
  }

  const handleSync = async (platformId) => {
    const platform = getPlatformData(platformId)
    if (!platform) return

    setLoaderFor(platformId, 'sync', true)
    try {
      const res = await api.post(`/platforms/${platform.id}/sync`)
      showToast('success', `Analytics synced! ${res.data.recordsCreated} new records created.`)
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to sync analytics')
    } finally {
      setLoaderFor(platformId, 'sync', false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const connectedCount = platforms.filter(p => p.isConnected).length

  return (
    <>
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="space-y-5 animate-fade-in">
        {/* Summary bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Connect your social media accounts to start scheduling posts and tracking analytics.
          </p>
          <div className="flex items-center gap-2">
            <span className={`badge ${connectedCount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
              {connectedCount} / {platformConfig.length} connected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformConfig.map(config => {
            const Icon = config.icon
            const platformData = getPlatformData(config.id)
            const isConnected = platformData?.isConnected || false
            const isConnecting = actionLoading[`${config.id}_connect`]
            const isDisconnecting = actionLoading[`${config.id}_disconnect`]
            const isSyncing = actionLoading[`${config.id}_sync`]

            return (
              <div
                key={config.id}
                className={`card p-6 hover:shadow-card-hover transition-all duration-200 ${
                  isConnected ? 'ring-1 ring-emerald-200' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Platform icon — large colored square */}
                  <div
                    className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-900">{config.label}</h3>
                      {isConnected && (
                        <span className="badge bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Connected
                        </span>
                      )}
                    </div>

                    {isConnected && platformData ? (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-slate-700 font-medium">{platformData.accountName}</p>
                        {/* Stats row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                            <Users className="w-3 h-3" />
                            {(platformData.followers || 0).toLocaleString()} followers
                          </span>
                          {platformData.engagement !== undefined && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-medium">
                              {platformData.engagement}% engagement
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 mb-4">{config.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleSync(config.id)}
                            disabled={isSyncing}
                            className="btn-secondary text-xs px-3 py-1.5 gap-1.5 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Data'}
                          </button>
                          <button
                            onClick={() => handleDisconnect(config.id)}
                            disabled={isDisconnecting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                          >
                            <Link2Off className="w-3.5 h-3.5" />
                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(config.id)}
                          disabled={isConnecting}
                          className="btn-primary text-xs px-4 py-2 gap-1.5 disabled:opacity-50 disabled:transform-none"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          {isConnecting ? 'Connecting...' : `Connect ${config.label}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Banner */}
        <div className="card p-4 bg-blue-50 border-blue-100 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">OAuth Integration Note</p>
            <p className="text-sm text-blue-700 mt-0.5">
              This demo uses mock OAuth stubs. In production, clicking &quot;Connect&quot; would redirect
              you to the platform&apos;s authorization page. Mock data is generated automatically
              for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Platforms
