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
    description: 'Share posts, stories and connect with your audience'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: '#E1306C',
    description: 'Share photos, reels and stories with your followers'
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    color: '#1DA1F2',
    description: 'Post tweets and engage with trending conversations'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    description: 'Share professional content and grow your network'
  }
]

const Toast = ({ type, message, onClose }) => (
  <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#1a1a1a', border: `1px solid ${type === 'success' ? '#e63000' : '#cc0000'}`, color: type === 'success' ? '#e63000' : '#cc3333', fontSize: 13, fontWeight: 600 }}>
    {type === 'success'
      ? <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
      : <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
    }
    {message}
    <button onClick={onClose} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', opacity: 0.8 }}>
      <X style={{ width: 14, height: 14 }} />
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
        <div style={{ width: 32, height: 32, border: '2px solid #2a2a2a', borderTopColor: '#e63000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
        {/* Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, color: '#6b6b6b' }}>
            Connect your social media accounts to start scheduling posts and tracking analytics.
          </p>
          <span className="platform-tag" style={{ color: connectedCount > 0 ? '#e63000' : '#6b6b6b', borderColor: connectedCount > 0 ? '#e63000' : '#333333' }}>
            {connectedCount} / {platformConfig.length} connected
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
                className="card"
                style={{
                  padding: 20,
                  borderLeftWidth: isConnected ? 2 : 1,
                  borderLeftColor: isConnected ? '#e63000' : '#2a2a2a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Platform icon */}
                  <div
                    style={{ width: 40, height: 40, background: '#1f1f1f', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <Icon style={{ width: 20, height: 20, color: config.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>{config.label}</h3>
                      {isConnected && (
                        <span className="platform-tag" style={{ color: '#e63000', borderColor: '#e63000' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e63000', display: 'inline-block' }} />
                          Connected
                        </span>
                      )}
                    </div>

                    {isConnected && platformData ? (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 500, marginBottom: 8 }}>{platformData.accountName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1f1f1f', border: '1px solid #2a2a2a', padding: '4px 10px' }}>
                            <Users style={{ width: 12, height: 12, color: '#6b6b6b' }} />
                            <span style={{ fontSize: 11, color: '#6b6b6b', fontWeight: 600 }}>{(platformData.followers || 0).toLocaleString()} followers</span>
                          </div>
                          {platformData.engagement !== undefined && (
                            <div style={{ background: '#1f1f1f', border: '1px solid #2a2a2a', padding: '4px 10px' }}>
                              <span style={{ fontSize: 11, color: '#6b6b6b', fontWeight: 600 }}>{platformData.engagement}% engagement</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: '#6b6b6b', marginBottom: 16 }}>{config.description}</p>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleSync(config.id)}
                            disabled={isSyncing}
                            className="btn-secondary"
                            style={{ fontSize: 12, padding: '6px 12px', gap: 6, opacity: isSyncing ? 0.5 : 1 }}
                          >
                            <RefreshCw style={{ width: 12, height: 12, animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                            {isSyncing ? 'Syncing...' : 'Sync Data'}
                          </button>
                          <button
                            onClick={() => handleDisconnect(config.id)}
                            disabled={isDisconnecting}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, fontWeight: 500, color: '#cc3333', background: 'rgba(200,0,0,0.08)', border: '1px solid rgba(200,0,0,0.2)', cursor: 'pointer', opacity: isDisconnecting ? 0.5 : 1 }}
                          >
                            <Link2Off style={{ width: 12, height: 12 }} />
                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(config.id)}
                          disabled={isConnecting}
                          className="btn-primary"
                          style={{ fontSize: 12, padding: '8px 16px', gap: 6, opacity: isConnecting ? 0.5 : 1 }}
                        >
                          <Link2 style={{ width: 12, height: 12 }} />
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
        <div className="card" style={{ padding: 16, borderColor: '#2a2a2a', display: 'flex', gap: 12 }}>
          <AlertCircle style={{ width: 16, height: 16, color: '#6b6b6b', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>OAuth Integration Note</p>
            <p style={{ fontSize: 12, color: '#6b6b6b' }}>
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
