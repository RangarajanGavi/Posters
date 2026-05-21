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
    description: 'Share posts, stories and connect with your audience'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: '#E1306C',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    description: 'Share photos, reels and stories with your followers'
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    color: '#1DA1F2',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    description: 'Post tweets and engage with trending conversations'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    description: 'Share professional content and grow your network'
  }
]

const Toast = ({ type, message, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    {type === 'success'
      ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Connect your social media accounts to start scheduling posts and tracking analytics.
          </p>
          <span className="text-sm text-gray-500">
            {platforms.filter(p => p.isConnected).length} of {platformConfig.length} connected
          </span>
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
                className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${
                  isConnected ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl ${config.bg} flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-semibold text-gray-900">{config.label}</h3>
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>

                    {isConnected && platformData ? (
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-gray-600 font-medium">{platformData.accountName}</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Users className="w-3.5 h-3.5" />
                          <span>{(platformData.followers || 0).toLocaleString()} followers</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-3">{config.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleSync(config.id)}
                            disabled={isSyncing}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Data'}
                          </button>
                          <button
                            onClick={() => handleDisconnect(config.id)}
                            disabled={isDisconnecting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Link2Off className="w-3.5 h-3.5" />
                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(config.id)}
                          disabled={isConnecting}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: config.color }}
                        >
                          <Link2 className="w-4 h-4" />
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">OAuth Integration Note</p>
            <p className="text-sm text-blue-700 mt-0.5">
              This demo uses mock OAuth stubs. In production, clicking "Connect" would redirect
              you to the platform's authorization page. Mock data is generated automatically
              for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Platforms
