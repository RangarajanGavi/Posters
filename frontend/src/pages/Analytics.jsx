import React, { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, Eye, Heart, MessageSquare, Share2, TrendingUp,
  ThumbsUp, BarChart3, Star
} from 'lucide-react'
import api from '../api/axios.js'

const PLATFORMS = ['all', 'facebook', 'instagram', 'twitter', 'linkedin']

const platformColors = {
  facebook: '#e63000',
  instagram: '#ff3d00',
  twitter: '#333333',
  linkedin: '#555555'
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'engagement', label: 'Engagement', icon: Heart },
  { id: 'top-posts', label: 'Top Posts', icon: Star }
]

const KPICard = ({ title, value, icon: Icon }) => (
  <div className="card p-5">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <p className="metric-label">{title}</p>
      <Icon style={{ width: 16, height: 16, color: '#e63000' }} />
    </div>
    <p style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', marginTop: 10, lineHeight: 1 }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
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
        <div style={{ width: 32, height: 32, border: '2px solid #2a2a2a', borderTopColor: '#e63000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const tooltipStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 0, color: '#fff', fontSize: 11 }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tabs + Filter */}
      <div className="flex items-center justify-between">
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a', gap: 0 }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px',
                  fontSize: 13, fontWeight: 600,
                  color: isActive ? '#ffffff' : '#6b6b6b',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #e63000' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'color 0.15s',
                }}
              >
                <Icon style={{ width: 14, height: 14 }} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="input"
          style={{ width: 'auto', padding: '8px 12px', fontSize: 12, colorScheme: 'dark' }}
        >
          {PLATFORMS.map(p => (
            <option key={p} value={p}>
              {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Followers" value={overview?.totalFollowers || 0} icon={Users} />
            <KPICard title="Total Reach" value={overview?.totalReach || 0} icon={Eye} />
            <KPICard title="Total Likes" value={overview?.totalLikes || 0} icon={ThumbsUp} />
            <KPICard title="Avg Engagement" value={`${overview?.avgEngagementRate || 0}%`} icon={TrendingUp} />
          </div>

          <div className="card p-6">
            <div className="mb-5">
              <p className="section-prefix">// REACH TREND</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Reach Over Time (Last 30 Days)</h3>
            </div>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    {filteredPlatforms.map((name, i) => (
                      <linearGradient key={name} id={`gradient-${name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={i === 0 ? '#e63000' : '#333333'} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={i === 0 ? '#e63000' : '#333333'} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6b6b' }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#2a2a2a' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#6b6b6b' }} />
                  {filteredPlatforms.map((name, i) => (
                    <Area
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={i === 0 ? '#e63000' : '#333333'}
                      fill={`url(#gradient-${name})`}
                      strokeWidth={i === 0 ? 2 : 1.5}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48" style={{ color: '#6b6b6b' }}>
                <p style={{ fontSize: 13 }}>No analytics data yet. Connect platforms and sync data.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="card p-6">
          <div className="mb-5">
            <p className="section-prefix">// ENGAGEMENT BREAKDOWN</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Likes / Comments / Shares</h3>
          </div>
          {flatEngagement.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={flatEngagement} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6b6b' }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#6b6b6b' }} />
                {filteredPlatforms.flatMap((name, i) => [
                  <Bar key={`${name}_likes`} dataKey={`${name}_likes`} name={`${name} Likes`} fill={i === 0 ? '#e63000' : '#333333'} radius={[0, 0, 0, 0]} />,
                  <Bar key={`${name}_comments`} dataKey={`${name}_comments`} name={`${name} Comments`} fill={i === 0 ? '#ff3d00' : '#444444'} radius={[0, 0, 0, 0]} />,
                  <Bar key={`${name}_shares`} dataKey={`${name}_shares`} name={`${name} Shares`} fill={i === 0 ? '#cc2900' : '#555555'} radius={[0, 0, 0, 0]} />
                ])}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48" style={{ color: '#6b6b6b' }}>
              <p style={{ fontSize: 13 }}>No engagement data yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Top Posts Tab */}
      {activeTab === 'top-posts' && (
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a' }}>
            <p className="section-prefix">// TOP POSTS</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Top Performing Posts</h3>
            <p style={{ fontSize: 11, color: '#6b6b6b', marginTop: 4 }}>Ranked by total engagement</p>
          </div>
          {topPosts.length > 0 ? (
            <div>
              {topPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="flex gap-4 hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                  style={{ padding: '16px 24px', borderBottom: idx < topPosts.length - 1 ? '1px solid #2a2a2a' : 'none' }}
                >
                  <div style={{ width: 28, height: 28, background: idx === 0 ? '#e63000' : '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{idx + 1}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 500, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 8 }}>{post.content}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="platform-tag">{post.status}</span>
                      <span style={{ fontSize: 11, color: '#6b6b6b' }}>{post.platforms?.join(', ')}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#6b6b6b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp style={{ width: 11, height: 11, color: '#e63000' }} />
                        {(post.engagement?.likes || 0).toLocaleString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare style={{ width: 11, height: 11 }} />
                        {(post.engagement?.comments || 0).toLocaleString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Share2 style={{ width: 11, height: 11 }} />
                        {(post.engagement?.shares || 0).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#3a3a3a', marginTop: 4 }}>
                      Total: {post.totalEngagement?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48" style={{ color: '#6b6b6b' }}>
              <p style={{ fontSize: 13 }}>No published posts yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Analytics
