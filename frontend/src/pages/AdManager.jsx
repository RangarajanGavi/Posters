import React, { useState, useEffect, useCallback } from 'react'
import axios from '../api/axios'
import {
  Target, Plus, Trash2, Play, Pause,
  X, Loader2, TrendingUp, MousePointer, DollarSign, Eye
} from 'lucide-react'

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook Ads', color: '#1877F2', bg: 'bg-blue-600', lightBg: 'bg-blue-500/10', textColor: 'text-blue-400', icon: '📘' },
  { key: 'google', label: 'Google Ads', color: '#EA4335', bg: 'bg-red-600', lightBg: 'bg-red-500/10', textColor: 'text-red-400', icon: '🔴' },
  { key: 'linkedin', label: 'LinkedIn Ads', color: '#0A66C2', bg: 'bg-indigo-600', lightBg: 'bg-indigo-500/10', textColor: 'text-indigo-400', icon: '💼' },
  { key: 'tiktok', label: 'TikTok Ads', color: '#010101', bg: 'bg-slate-700', lightBg: 'bg-white/[0.05]', textColor: 'text-slate-300', icon: '🎵' },
  { key: 'twitter', label: 'Twitter/X Ads', color: '#1DA1F2', bg: 'bg-sky-500', lightBg: 'bg-sky-500/10', textColor: 'text-sky-400', icon: '🐦' }
]

const OBJECTIVES = ['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'sales']
const CTA_OPTIONS = ['Learn More', 'Shop Now', 'Sign Up', 'Get Quote', 'Download', 'Book Now', 'Contact Us']

const statusConfig = {
  draft: { label: 'Draft', className: 'badge bg-white/[0.05] text-slate-400' },
  active: { label: 'Active', className: 'badge bg-emerald-500/10 text-emerald-400' },
  paused: { label: 'Paused', className: 'badge bg-amber-500/10 text-amber-400' },
  completed: { label: 'Completed', className: 'badge bg-blue-500/10 text-blue-400' }
}

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-3 ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
    {message}
    <button onClick={onClose}><X className="w-4 h-4" /></button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100">New Campaign</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Campaign Name</label>
            <input
              type="text" required value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              className="input"
              placeholder="My Awesome Campaign"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Ad Account</label>
              <select
                required value={form.adAccountId}
                onChange={e => updateForm('adAccountId', e.target.value)}
                className="input"
                style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
              >
                <option value="">Select account...</option>
                {accounts.filter(a => a.isConnected).map(a => (
                  <option key={a.id} value={a.id}>{a.accountName} ({a.platform})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Objective</label>
              <select
                value={form.objective} onChange={e => updateForm('objective', e.target.value)}
                className="input capitalize"
                style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
              >
                {OBJECTIVES.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Daily Budget ($)</label>
              <input
                type="number" min="1" value={form.dailyBudget}
                onChange={e => updateForm('dailyBudget', e.target.value)}
                className="input"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Total Budget ($)</label>
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
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Start Date</label>
              <input
                type="date" required value={form.startDate}
                onChange={e => updateForm('startDate', e.target.value)}
                className="input"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">End Date <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                type="date" value={form.endDate}
                onChange={e => updateForm('endDate', e.target.value)}
                className="input"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="card-elevated p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Targeting</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Min Age: {form.targeting.ageMin}</label>
                <input
                  type="range" min="13" max="65" value={form.targeting.ageMin}
                  onChange={e => updateForm('targeting.ageMin', e.target.value)}
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Max Age: {form.targeting.ageMax}</label>
                <input
                  type="range" min="13" max="65" value={form.targeting.ageMax}
                  onChange={e => updateForm('targeting.ageMax', e.target.value)}
                  className="w-full accent-violet-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Locations (comma-separated)</label>
                <input
                  type="text" value={form.targeting.locations}
                  onChange={e => updateForm('targeting.locations', e.target.value)}
                  className="input text-xs py-2"
                  placeholder="US, UK, Canada"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Interests (comma-separated)</label>
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Creative</h3>
              <button
                type="button" onClick={handleGenerateCopy} disabled={generatingCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {generatingCopy ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨'}
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
                style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
              >
                {CTA_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Run on Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.key} type="button"
                  onClick={() => togglePlatform(p.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    form.platforms.includes(p.key)
                      ? `${p.bg} text-white shadow-sm`
                      : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
                  }`}
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
              className="btn-primary disabled:opacity-60 disabled:transform-none"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
      <div className="flex items-center gap-1.5 mb-6 rounded-xl p-1 w-fit" style={{ backgroundColor: '#1e2130' }}>
        {['accounts', 'campaigns'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'accounts' ? 'Ad Accounts' : 'Campaigns'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-40 bg-white/[0.04] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'accounts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map(platform => {
            const account = accounts.find(a => a.platform === platform.key)
            const stats = account ? accountStats[account.id] : null
            const isConnected = account?.isConnected

            return (
              <div key={platform.key} className="card p-5 hover:shadow-card-hover transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${platform.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="text-slate-100 font-semibold text-sm">{platform.label}</h3>
                      {isConnected && account && (
                        <p className="text-slate-500 text-xs">{account.accountName}</p>
                      )}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-white/[0.1]'}`} />
                </div>

                {isConnected && stats && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: 'Impressions', value: stats.impressions?.toLocaleString(), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                      { label: 'Clicks', value: stats.clicks?.toLocaleString(), icon: MousePointer, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                      { label: 'CTR', value: `${stats.ctr}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { label: 'Spend', value: `$${stats.spend?.toFixed(2)}`, icon: DollarSign, color: 'text-orange-400', bg: 'bg-orange-500/10' }
                    ].map(m => (
                      <div key={m.label} className={`${m.bg} rounded-xl p-2.5 flex items-center gap-2`}>
                        <m.icon className={`w-3.5 h-3.5 ${m.color} flex-shrink-0`} />
                        <div>
                          <p className="text-slate-500 text-[10px] font-medium">{m.label}</p>
                          <p className="text-slate-200 font-bold text-xs">{m.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isConnected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActiveTab('campaigns') }}
                      className="btn-secondary flex-1 justify-center text-xs py-1.5 px-2"
                    >
                      View Campaigns
                    </button>
                    <button
                      onClick={() => handleDisconnect(account.id, platform.label)}
                      className="flex-1 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.key)}
                    disabled={connecting === platform.key}
                    className="btn-primary w-full justify-center text-xs py-2 disabled:opacity-60 disabled:transform-none"
                  >
                    {connecting === platform.key ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...</>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-100">Campaigns <span className="text-slate-500 font-normal text-sm">({campaigns.length})</span></h2>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-16 card">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No campaigns yet. Create your first campaign!</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.07]" style={{ backgroundColor: '#1e2130' }}>
                    {['Name', 'Platform', 'Objective', 'Status', 'Budget', 'Impressions', 'Clicks', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {campaigns.map(c => {
                    const account = accounts.find(a => a.id === c.adAccountId)
                    const sConfig = statusConfig[c.status] || statusConfig.draft
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-slate-100 text-sm font-semibold">{c.name}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm capitalize">{account?.platform || '-'}</td>
                        <td className="px-4 py-3 text-slate-400 text-sm capitalize">{c.objective}</td>
                        <td className="px-4 py-3">
                          <span className={sConfig.className}>
                            {sConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">${c.dailyBudget}/day</td>
                        <td className="px-4 py-3 text-slate-300 text-sm font-medium">{(c.impressions || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-300 text-sm font-medium">{(c.clicks || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {c.status === 'draft' || c.status === 'paused' ? (
                              <button onClick={() => handleLaunch(c.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Launch">
                                <Play className="w-4 h-4" />
                              </button>
                            ) : c.status === 'active' ? (
                              <button onClick={() => handlePause(c.id)} className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Pause">
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : null}
                            <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdManager
