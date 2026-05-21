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
  published: { label: 'Published', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
  scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-600', icon: Clock },
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-500', icon: FileEdit },
  failed: { label: 'Failed', color: 'bg-red-50 text-red-600', icon: AlertCircle }
}

const gradients = {
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-violet-500 to-purple-600',
  green: 'from-emerald-500 to-teal-500',
  orange: 'from-orange-400 to-amber-500',
}

const StatCard = ({ title, value, icon: Icon, gradient, suffix = '', change = '+12.5' }) => (
  <div className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[gradient]} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="badge bg-emerald-50 text-emerald-600">
        <ArrowUpRight className="w-3 h-3" /> {change}%
      </span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
    <p className="text-sm text-slate-500 font-medium mt-0.5">{title}</p>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Followers"
          value={overview?.totalFollowers || 0}
          icon={Users}
          gradient="blue"
          change="+12.5"
        />
        <StatCard
          title="Total Reach"
          value={overview?.totalReach || 0}
          icon={Eye}
          gradient="purple"
          change="+8.2"
        />
        <StatCard
          title="Total Posts"
          value={overview?.totalPosts || 0}
          icon={FileText}
          gradient="green"
          change="+5.1"
        />
        <StatCard
          title="Avg Engagement Rate"
          value={overview?.avgEngagementRate || 0}
          icon={TrendingUp}
          gradient="orange"
          suffix="%"
          change="+3.7"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follower Growth Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Follower Growth (Last 30 Days)</h2>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
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
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm text-center">No growth data yet. Connect platforms and sync data.</p>
              <button
                onClick={() => navigate('/platforms')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Connect platforms
              </button>
            </div>
          )}
        </div>

        {/* Connected Platforms */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Connected Platforms</h2>
            <button
              onClick={() => navigate('/platforms')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage
            </button>
          </div>
          {connectedPlatforms.length > 0 ? (
            <div className="space-y-2.5">
              {connectedPlatforms.map(platform => {
                const Icon = platformIcons[platform.name] || TrendingUp
                return (
                  <div key={platform.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${platformColors[platform.name]}15` }}
                    >
                      <Icon
                        className="w-4.5 h-4.5"
                        style={{ color: platformColors[platform.name], width: '1.1rem', height: '1.1rem' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 capitalize">{platform.name}</p>
                      <p className="text-xs text-slate-400 truncate">{platform.accountName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {(platform.followers || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">followers</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <p className="text-sm text-center">No platforms connected</p>
              <button
                onClick={() => navigate('/platforms')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Connect now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Recent Posts</h2>
          <button
            onClick={() => navigate('/compose')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            New post
          </button>
        </div>
        {posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map(post => {
              const status = statusConfig[post.status] || statusConfig.draft
              const StatusIcon = status.icon
              return (
                <div key={post.id} className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 line-clamp-2 font-medium">{post.content}</p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className={`badge ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {post.platforms?.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">
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
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <p className="text-sm">No posts yet</p>
            <button
              onClick={() => navigate('/compose')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
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
