import React, { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, Eye, Heart, MessageSquare, Share2, TrendingUp,
  ThumbsUp, BarChart3, Star, ArrowUpRight
} from 'lucide-react'
import api from '../api/axios.js'

const PLATFORMS = ['all', 'facebook', 'instagram', 'twitter', 'linkedin']

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2'
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'engagement', label: 'Engagement', icon: Heart },
  { id: 'top-posts', label: 'Top Posts', icon: Star }
]

const statusColors = {
  published: 'bg-emerald-50 text-emerald-600',
  scheduled: 'bg-blue-50 text-blue-600',
  draft: 'bg-slate-100 text-slate-500',
  failed: 'bg-red-50 text-red-600'
}

const gradients = {
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-violet-500 to-purple-600',
  pink: 'from-pink-500 to-rose-500',
  green: 'from-emerald-500 to-teal-500',
}

const KPICard = ({ title, value, icon: Icon, gradient }) => (
  <div className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[gradient] || gradients.blue} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="badge bg-emerald-50 text-emerald-600">
        <ArrowUpRight className="w-3 h-3" /> +8.4%
      </span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-sm text-slate-500 font-medium mt-0.5">{title}</p>
  </div>
)

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [overview, setOverview] = useState(null)
  const [growthData, setGrowthData] = useState([])
  const [engagementData, setEngagementData] = useState([])
  const [topPosts, setTopPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [overviewRes, growthRes, engagementRes, topPostsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/growth'),
          api.get('/analytics/engagement'),
          api.get('/analytics/top-posts')
        ])
        setOverview(overviewRes.data)
        setGrowthData(growthRes.data)
        setEngagementData(engagementRes.data)
        setTopPosts(topPostsRes.data)
      } catch (err) {
        console.error('Analytics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Flatten engagement data for bar chart
  const flatEngagement = engagementData.map(row => {
    const result = { date: row.date }
    Object.entries(row).forEach(([key, val]) => {
      if (key !== 'date' && typeof val === 'object' && val !== null) {
        if (platformFilter === 'all' || key === platformFilter) {
          result[`${key}_likes`] = val.likes || 0
          result[`${key}_comments`] = val.comments || 0
          result[`${key}_shares`] = val.shares || 0
        }
      }
    })
    return result
  })

  const platformNames = [...new Set(growthData.flatMap(d => Object.keys(d).filter(k => k !== 'date')))]
  const filteredPlatforms = platformFilter === 'all' ? platformNames : platformNames.filter(p => p === platformFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tabs + Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700 capitalize transition-all"
        >
          {PLATFORMS.map(p => (
            <option key={p} value={p} className="capitalize">
              {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Followers" value={overview?.totalFollowers || 0} icon={Users} gradient="blue" />
            <KPICard title="Total Reach" value={overview?.totalReach || 0} icon={Eye} gradient="purple" />
            <KPICard title="Total Likes" value={overview?.totalLikes || 0} icon={ThumbsUp} gradient="pink" />
            <KPICard title="Avg Engagement Rate" value={`${overview?.avgEngagementRate || 0}%`} icon={TrendingUp} gradient="green" />
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Reach Over Time (Last 30 Days)</h3>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    {filteredPlatforms.map(name => (
                      <linearGradient key={name} id={`gradient-${name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={platformColors[name] || '#6b7280'} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={platformColors[name] || '#6b7280'} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {filteredPlatforms.map(name => (
                    <Area
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={platformColors[name] || '#6b7280'}
                      fill={`url(#gradient-${name})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <p className="text-sm">No analytics data yet. Connect platforms and sync data.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Engagement Breakdown (Likes / Comments / Shares)
          </h3>
          {flatEngagement.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={flatEngagement} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {filteredPlatforms.flatMap(name => [
                  <Bar key={`${name}_likes`} dataKey={`${name}_likes`} name={`${name} Likes`} fill={platformColors[name] || '#6b7280'} radius={[3, 3, 0, 0]} />,
                  <Bar key={`${name}_comments`} dataKey={`${name}_comments`} name={`${name} Comments`} fill={`${platformColors[name] || '#6b7280'}99`} radius={[3, 3, 0, 0]} />,
                  <Bar key={`${name}_shares`} dataKey={`${name}_shares`} name={`${name} Shares`} fill={`${platformColors[name] || '#6b7280'}55`} radius={[3, 3, 0, 0]} />
                ])}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <p className="text-sm">No engagement data yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Top Posts Tab */}
      {activeTab === 'top-posts' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Top Performing Posts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by total engagement</p>
          </div>
          {topPosts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {topPosts.map((post, idx) => {
                const rankColors = ['bg-amber-400', 'bg-slate-400', 'bg-orange-400']
                const rankColor = rankColors[idx] || 'bg-slate-200'
                return (
                  <div key={post.id} className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${rankColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-xs font-bold text-white">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 line-clamp-2 mb-2 font-medium">{post.content}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`badge ${statusColors[post.status] || statusColors.draft} capitalize`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          {post.platforms?.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1">
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-pink-500" />
                          {(post.engagement?.likes || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                          {(post.engagement?.comments || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-emerald-500" />
                          {(post.engagement?.shares || 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Total: {post.totalEngagement?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <p className="text-sm">No published posts yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Analytics
