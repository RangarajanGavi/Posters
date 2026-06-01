import React, { useState, useEffect, useCallback } from 'react'
import axios from '../api/axios'
import {
  Target, Plus, Trash2, Play, Pause,
  X, Loader2, TrendingUp, MousePointer, DollarSign, Eye
} from 'lucide-react'

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook Ads', color: '#1877F2', icon: '📘' },
  { key: 'google', label: 'Google Ads', color: '#EA4335', icon: '🔴' },
  { key: 'linkedin', label: 'LinkedIn Ads', color: '#0A66C2', icon: '💼' },
  { key: 'tiktok', label: 'TikTok Ads', color: '#010101', icon: '🎵' },
  { key: 'twitter', label: 'Twitter/X Ads', color: '#1DA1F2', icon: '🐦' }
]

const OBJECTIVES = ['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'sales']
const CTA_OPTIONS = ['Learn More', 'Shop Now', 'Sign Up', 'Get Quote', 'Download', 'Book Now', 'Contact Us']

const statusConfig = {
  draft: { label: 'DRAFT', style: { background: 'transparent', border: '1px solid #333333', color: '#6b6b6b' } },
  active: { label: 'ACTIVE', style: { background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.2)', color: '#00c864' } },
  paused: { label: 'PAUSED', style: { background: 'rgba(230,180,0,0.08)', border: '1px solid rgba(230,180,0,0.2)', color: '#e6b400' } },
  completed: { label: 'COMPLETED', style: { background: 'rgba(100,100,255,0.08)', border: '1px solid rgba(100,100,255,0.2)', color: '#6464ff' } }
}

const Toast = ({ message, type, onClose }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, padding: '12px 20px', background: type === 'success' ? '#1a1a1a' : '#1a1a1a', border: `1px solid ${type === 'success' ? '#e63000' : '#cc0000'}`, color: '#ffffff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b' }}><X style={{ width: 16, height: 16 }} /></button>
  </div>
)

const defaultCampaignForm = {
  name: '',
  adAccountId: '',
  objective: 'awareness',
  dailyBudget: '',
  totalBudget: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  targeting: { ageMin: 18, ageMax: 65, locations: '', interests: '' },
  creative: { headline: '', body: '', imageUrl: '', callToAction: 'Learn More' },
  platforms: []
}

const CampaignModal = ({ accounts, onClose, onSave }) => {
  const [form, setForm] = useState(defaultCampaignForm)
  const [saving, setSaving] = useState(false)
  const [generatingCopy, setGeneratingCopy] = useState(false)

  const updateForm = (path, value) => {
    setForm(prev => {
      const parts = path.split('.')
      if (parts.length === 1) return { ...prev, [path]: value }
      return { ...prev, [parts[0]]: { ...prev[parts[0]], [parts[1]]: value } }
    })
  }

  const handleGenerateCopy = async () => {
    setGeneratingCopy(true)
    try {
      const res = await axios.post('/ads/ai-copy', {
        product: form.name || 'Product',
        audience: `Age ${form.targeting.ageMin}-${form.targeting.ageMax}`,
        objective: form.objective,
        platform: form.adAccountId ? accounts.find(a => a.id === form.adAccountId)?.platform : 'social',
        tone: 'professional'
      })
      setForm(prev => ({
        ...prev,
        creative: {
          ...prev.creative,
          headline: res.data.headline || '',
          body: res.data.body || '',
          callToAction: res.data.callToAction || 'Learn More'
        }
      }))
    } catch (err) {
      console.error('Generate copy error:', err)
    } finally {
      setGeneratingCopy(false)
    }
  }

  const togglePlatform = (platform) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        targeting: {
          ageMin: parseInt(form.targeting.ageMin),
          ageMax: parseInt(form.targeting.ageMax),
          locations: form.targeting.locations.split(',').map(s => s.trim()).filter(Boolean),
          interests: form.targeting.interests.split(',').map(s => s.trim()).filter(Boolean),
          languages: []
        }
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
      <div className="card w-full mx-4" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p className="section-prefix">// NEW CAMPAIGN</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Campaign Setup</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#6b6b6b' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Campaign Name</label>
            <input
              type="text" required value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              className="input"
              placeholder="My Awesome Campaign"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ad Account</label>
              <select
                required value={form.adAccountId}
                onChange={e => updateForm('adAccountId', e.target.value)}
                className="input"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">Select account...</option>
                {accounts.filter(a => a.isConnected).map(a => (
                  <option key={a.id} value={a.id}>{a.accountName} ({a.platform})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Objective</label>
              <select
                value={form.objective} onChange={e => updateForm('objective', e.target.value)}
                className="input capitalize"
                style={{ colorScheme: 'dark' }}
              >
                {OBJECTIVES.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Daily Budget ($)</label>
              <input
                type="number" min="1" value={form.dailyBudget}
                onChange={e => updateForm('dailyBudget', e.target.value)}
                className="input"
                placeholder="50"
              />
            </div>
            <div>
              <label className="label">Total Budget ($)</label>
              <input
                type="number" min="1" value={form.totalBudget}
                onChange={e => updateForm('totalBudget', e.target.value)}
                className="input"
                placeholder="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date" required value={form.startDate}
                onChange={e => updateForm('startDate', e.target.value)}
                className="input"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="label">End Date <span style={{ color: '#6b6b6b', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="date" value={form.endDate}
                onChange={e => updateForm('endDate', e.target.value)}
                className="input"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="card-elevated p-4">
            <p className="section-prefix" style={{ marginBottom: 12 }}>// TARGETING</p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="label">Min Age: {form.targeting.ageMin}</label>
                <input
                  type="range" min="13" max="65" value={form.targeting.ageMin}
                  onChange={e => updateForm('targeting.ageMin', e.target.value)}
                  className="w-full"
                  style={{ accentColor: '#e63000' }}
                />
              </div>
              <div>
                <label className="label">Max Age: {form.targeting.ageMax}</label>
                <input
                  type="range" min="13" max="65" value={form.targeting.ageMax}
                  onChange={e => updateForm('targeting.ageMax', e.target.value)}
                  className="w-full"
                  style={{ accentColor: '#e63000' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Locations (comma-separated)</label>
                <input
                  type="text" value={form.targeting.locations}
                  onChange={e => updateForm('targeting.locations', e.target.value)}
                  className="input text-xs py-2"
                  placeholder="US, UK, Canada"
                />
              </div>
              <div>
                <label className="label">Interests (comma-separated)</label>
                <input
                  type="text" value={form.targeting.interests}
                  onChange={e => updateForm('targeting.interests', e.target.value)}
                  className="input text-xs py-2"
                  placeholder="technology, fitness"
                />
              </div>
            </div>
          </div>

          <div className="card-elevated p-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="section-prefix" style={{ marginBottom: 0 }}>// CREATIVE</p>
              <button
                type="button" onClick={handleGenerateCopy} disabled={generatingCopy}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '6px 12px', opacity: generatingCopy ? 0.6 : 1 }}
              >
                {generatingCopy ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : '✨'}
                Generate with AI
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text" value={form.creative.headline}
                onChange={e => updateForm('creative.headline', e.target.value)}
                className="input"
                placeholder="Headline"
              />
              <textarea
                value={form.creative.body}
                onChange={e => updateForm('creative.body', e.target.value)}
                className="input resize-none"
                rows={3} placeholder="Ad copy body..."
              />
              <input
                type="text" value={form.creative.imageUrl}
                onChange={e => updateForm('creative.imageUrl', e.target.value)}
                className="input"
                placeholder="Image URL (optional)"
              />
              <select
                value={form.creative.callToAction}
                onChange={e => updateForm('creative.callToAction', e.target.value)}
                className="input"
                style={{ colorScheme: 'dark' }}
              >
                {CTA_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Run on Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.key} type="button"
                  onClick={() => togglePlatform(p.key)}
                  className={form.platforms.includes(p.key) ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: 11, padding: '6px 12px' }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="btn-primary"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving && <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />}
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AdManager = () => {
  const [activeTab, setActiveTab] = useState('accounts')
  const [accounts, setAccounts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [accountStats, setAccountStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(null)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await axios.get('/ads/accounts')
      setAccounts(res.data)
      res.data.filter(a => a.isConnected).forEach(async (account) => {
        try {
          const statsRes = await axios.get(`/ads/accounts/${account.id}/stats`)
          setAccountStats(prev => ({ ...prev, [account.id]: statsRes.data }))
        } catch (e) {}
      })
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await axios.get('/ads/campaigns')
      setCampaigns(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchAccounts(), fetchCampaigns()])
      setLoading(false)
    }
    init()
  }, [fetchAccounts, fetchCampaigns])

  const handleConnect = async (platform) => {
    setConnecting(platform)
    try {
      await axios.post('/ads/accounts/connect', {
        platform,
        accountName: `My ${platform.charAt(0).toUpperCase() + platform.slice(1)} Ad Account`
      })
      await fetchAccounts()
      showToast(`${platform} Ads connected successfully!`)
    } catch (err) {
      showToast('Failed to connect account', 'error')
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (accountId, platform) => {
    try {
      await axios.post(`/ads/accounts/${accountId}/disconnect`)
      await fetchAccounts()
      showToast(`${platform} Ads disconnected`)
    } catch (err) {
      showToast('Failed to disconnect account', 'error')
    }
  }

  const handleCreateCampaign = async (formData) => {
    try {
      await axios.post('/ads/campaigns', formData)
      await fetchCampaigns()
      setShowCampaignModal(false)
      showToast('Campaign created successfully!')
    } catch (err) {
      showToast('Failed to create campaign', 'error')
    }
  }

  const handleLaunch = async (id) => {
    try {
      await axios.post(`/ads/campaigns/${id}/launch`)
      await fetchCampaigns()
      showToast('Campaign launched!')
    } catch (err) {
      showToast('Failed to launch campaign', 'error')
    }
  }

  const handlePause = async (id) => {
    try {
      await axios.post(`/ads/campaigns/${id}/pause`)
      await fetchCampaigns()
      showToast('Campaign paused')
    } catch (err) {
      showToast('Failed to pause campaign', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return
    try {
      await axios.delete(`/ads/campaigns/${id}`)
      await fetchCampaigns()
      showToast('Campaign deleted')
    } catch (err) {
      showToast('Failed to delete campaign', 'error')
    }
  }

  const metricItems = [
    { label: 'IMPRESSIONS', key: 'impressions', icon: Eye },
    { label: 'CLICKS', key: 'clicks', icon: MousePointer },
    { label: 'CTR', key: 'ctr', icon: TrendingUp, suffix: '%' },
    { label: 'SPENT', key: 'spend', icon: DollarSign, prefix: '$' },
  ]

  return (
    <div className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showCampaignModal && (
        <CampaignModal
          accounts={accounts}
          onClose={() => setShowCampaignModal(false)}
          onSave={handleCreateCampaign}
        />
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a', marginBottom: 24, gap: 0 }}>
        {['accounts', 'campaigns'].map(tab => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 600,
                color: isActive ? '#ffffff' : '#6b6b6b',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: isActive ? '2px solid #e63000' : '2px solid transparent',
                marginBottom: -1, textTransform: 'capitalize',
                transition: 'color 0.15s',
              }}
            >
              {tab === 'accounts' ? 'Ad Accounts' : 'Campaigns'}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card" style={{ height: 160, animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      ) : activeTab === 'accounts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map(platform => {
            const account = accounts.find(a => a.platform === platform.key)
            const stats = account ? accountStats[account.id] : null
            const isConnected = account?.isConnected

            return (
              <div key={platform.key} className="card p-5">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 style={{ color: '#ffffff', fontWeight: 600, fontSize: 14 }}>{platform.label}</h3>
                      {isConnected && account && (
                        <p style={{ color: '#6b6b6b', fontSize: 11 }}>{account.accountName}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#00c864' : '#2a2a2a' }} />
                </div>

                {isConnected && stats && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {metricItems.map(m => {
                      const Icon = m.icon
                      const val = stats[m.key]
                      return (
                        <div key={m.label} style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', padding: '8px 10px' }}>
                          <p className="metric-label" style={{ marginBottom: 4 }}>{m.label}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon style={{ width: 12, height: 12, color: '#e63000', flexShrink: 0 }} />
                            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>
                              {m.prefix}{typeof val === 'number' ? val.toLocaleString() : val}{m.suffix}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {isConnected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className="btn-secondary flex-1 justify-center"
                      style={{ fontSize: 12, padding: '6px 8px' }}
                    >
                      View Campaigns
                    </button>
                    <button
                      onClick={() => handleDisconnect(account.id, platform.label)}
                      style={{ flex: 1, padding: '6px 8px', fontSize: 12, fontWeight: 600, color: '#cc3333', background: 'rgba(200,0,0,0.08)', border: '1px solid rgba(200,0,0,0.2)', cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.key)}
                    disabled={connecting === platform.key}
                    className="btn-primary w-full justify-center"
                    style={{ fontSize: 12, padding: '8px', opacity: connecting === platform.key ? 0.6 : 1 }}
                  >
                    {connecting === platform.key ? (
                      <><Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> Connecting...</>
                    ) : (
                      <>Connect {platform.label}</>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p className="section-prefix">// CAMPAIGNS</p>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                All Campaigns <span style={{ color: '#6b6b6b', fontWeight: 400, fontSize: 14 }}>({campaigns.length})</span>
              </h2>
            </div>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="btn-primary"
            >
              <Plus style={{ width: 16, height: 16 }} /> New Campaign
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="card" style={{ padding: 64, textAlign: 'center' }}>
              <Target style={{ width: 48, height: 48, color: '#2a2a2a', margin: '0 auto 12px' }} />
              <p style={{ color: '#6b6b6b', fontWeight: 500, fontSize: 14 }}>No campaigns yet. Create your first campaign!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {campaigns.map(c => {
                const account = accounts.find(a => a.id === c.adAccountId)
                const sConfig = statusConfig[c.status] || statusConfig.draft
                return (
                  <div key={c.id} className="card" style={{ padding: '20px 24px' }}>
                    {/* Campaign header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: 15 }}>{c.name}</h3>
                        {account?.platform && (
                          <span className="platform-tag">{account.platform}</span>
                        )}
                        <span className="platform-tag" style={{ textTransform: 'capitalize' }}>{c.objective}</span>
                        <span style={{ ...sConfig.style, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', display: 'inline-flex', alignItems: 'center' }}>
                          {sConfig.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {(c.status === 'draft' || c.status === 'paused') && (
                          <button onClick={() => handleLaunch(c.id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.2)', cursor: 'pointer', color: '#00c864' }} title="Launch">
                            <Play style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                        {c.status === 'active' && (
                          <button onClick={() => handlePause(c.id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(230,180,0,0.1)', border: '1px solid rgba(230,180,0,0.2)', cursor: 'pointer', color: '#e6b400' }} title="Pause">
                            <Pause style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(c.id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(200,0,0,0.1)', border: '1px solid rgba(200,0,0,0.2)', cursor: 'pointer', color: '#cc3333' }} title="Delete">
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                    {/* Metrics row */}
                    <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                      {[
                        { label: 'IMPRESSIONS', value: (c.impressions || 0).toLocaleString() },
                        { label: 'CLICKS', value: (c.clicks || 0).toLocaleString() },
                        { label: 'CTR', value: `${c.ctr || 0}%` },
                        { label: 'BUDGET', value: `$${c.dailyBudget}/day` },
                      ].map(m => (
                        <div key={m.label}>
                          <p className="metric-label" style={{ marginBottom: 4 }}>{m.label}</p>
                          <p style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdManager
