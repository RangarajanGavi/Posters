import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, Eye, FileText, TrendingUp, ArrowUpRight, Facebook,
  Instagram, Twitter, Linkedin, CheckCircle2, Clock, AlertCircle, FileEdit
} from 'lucide-react'
import api from '../api/axios.js'

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2'
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin
}

const statusConfig = {
  published: { label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileEdit },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle }
}

const StatCard = ({ title, value, icon: Icon, color, suffix = '' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
      </div>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center gap-1 mt-3 text-xs text-green-600">
      <ArrowUpRight className="w-3.5 h-3.5" />
      <span>Last 30 days</span>
    </div>
  </div>
)

const Dashboard = () => {
  const [overview, setOverview] = useState(null)
  const [growthData, setGrowthData] = useState([])
  const [posts, setPosts] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, growthRes, postsRes, platformsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/growth'),
          api.get('/posts'),
          api.get('/platforms')
        ])
        setOverview(overviewRes.data)
        setGrowthData(growthRes.data)
        setPosts(postsRes.data.slice(0, 5))
        setPlatforms(platformsRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const connectedPlatforms = platforms.filter(p => p.isConnected)
  const platformNames = [...new Set(growthData.flatMap(d => Object.keys(d).filter(k => k !== 'date')))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Followers"
          value={overview?.totalFollowers || 0}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Reach"
          value={overview?.totalReach || 0}
          icon={Eye}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Total Posts"
          value={overview?.totalPosts || 0}
          icon={FileText}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Avg Engagement Rate"
          value={overview?.avgEngagementRate || 0}
          icon={TrendingUp}
          color="bg-orange-50 text-orange-600"
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follower Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Follower Growth (Last 30 Days)</h2>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(v) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {platformNames.map(name => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={platformColors[name] || '#6b7280'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <TrendingUp className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">No growth data yet. Connect platforms and sync data.</p>
              <button
                onClick={() => navigate('/platforms')}
                className="mt-3 text-sm text-primary-600 hover:underline"
              >
                Connect platforms
              </button>
            </div>
          )}
        </div>

        {/* Connected Platforms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Connected Platforms</h2>
            <button
              onClick={() => navigate('/platforms')}
              className="text-xs text-primary-600 hover:underline"
            >
              Manage
            </button>
          </div>
          {connectedPlatforms.length > 0 ? (
            <div className="space-y-3">
              {connectedPlatforms.map(platform => {
                const Icon = platformIcons[platform.name] || Share2
                return (
                  <div key={platform.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${platformColors[platform.name]}20` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: platformColors[platform.name] }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">{platform.name}</p>
                      <p className="text-xs text-gray-500 truncate">{platform.accountName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {(platform.followers || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">followers</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-sm text-center">No platforms connected</p>
              <button
                onClick={() => navigate('/platforms')}
                className="mt-2 text-sm text-primary-600 hover:underline"
              >
                Connect now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Posts</h2>
          <button
            onClick={() => navigate('/compose')}
            className="text-xs text-primary-600 hover:underline"
          >
            New post
          </button>
        </div>
        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map(post => {
              const status = statusConfig[post.status] || statusConfig.draft
              const StatusIcon = status.icon
              return (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {post.platforms?.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {post.scheduledAt
                        ? new Date(post.scheduledAt).toLocaleDateString()
                        : new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">No posts yet</p>
            <button
              onClick={() => navigate('/compose')}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              Create your first post
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
