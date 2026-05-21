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

const KPICard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
  </div>
)

const statusColors = {
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700'
}

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Tabs + Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
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
          className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white capitalize"
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
            <KPICard title="Total Followers" value={overview?.totalFollowers || 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
            <KPICard title="Total Reach" value={overview?.totalReach || 0} icon={Eye} color="text-purple-600" bg="bg-purple-50" />
            <KPICard title="Total Likes" value={overview?.totalLikes || 0} icon={ThumbsUp} color="text-pink-600" bg="bg-pink-50" />
            <KPICard title="Avg Engagement Rate" value={`${overview?.avgEngagementRate || 0}%`} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Reach Over Time (Last 30 Days)</h3>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    {filteredPlatforms.map(name => (
                      <linearGradient key={name} id={`gradient-${name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={platformColors[name] || '#6b7280'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={platformColors[name] || '#6b7280'} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
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
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p className="text-sm">No analytics data yet. Connect platforms and sync data.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Engagement Breakdown (Likes / Comments / Shares)
          </h3>
          {flatEngagement.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={flatEngagement} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {filteredPlatforms.flatMap(name => [
                  <Bar key={`${name}_likes`} dataKey={`${name}_likes`} name={`${name} Likes`} fill={platformColors[name] || '#6b7280'} radius={[2, 2, 0, 0]} />,
                  <Bar key={`${name}_comments`} dataKey={`${name}_comments`} name={`${name} Comments`} fill={`${platformColors[name] || '#6b7280'}99`} radius={[2, 2, 0, 0]} />,
                  <Bar key={`${name}_shares`} dataKey={`${name}_shares`} name={`${name} Shares`} fill={`${platformColors[name] || '#6b7280'}55`} radius={[2, 2, 0, 0]} />
                ])}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p className="text-sm">No engagement data yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Top Posts Tab */}
      {activeTab === 'top-posts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Top Performing Posts</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ranked by total engagement</p>
          </div>
          {topPosts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {topPosts.map((post, idx) => (
                <div key={post.id} className="p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[post.status] || statusColors.draft}`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {post.platforms?.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right space-y-1">
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-pink-500" />
                        {(post.engagement?.likes || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        {(post.engagement?.comments || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-green-500" />
                        {(post.engagement?.shares || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Total: {post.totalEngagement?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p className="text-sm">No published posts yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Analytics
