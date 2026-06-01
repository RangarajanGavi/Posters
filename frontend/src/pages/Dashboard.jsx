import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, Eye, FileText, TrendingUp, ArrowUpRight, Facebook,
  Instagram, Twitter, Linkedin, Wand2, CalendarDays, Share2, Target
} from 'lucide-react'
import api from '../api/axios.js'

const platformColors = {
  facebook: '#e63000',
  instagram: '#ff3d00',
  twitter: '#333333',
  linkedin: '#555555'
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin
}

const StatCard = ({ label, sublabel, value, icon: Icon, suffix = '' }) => (
  <div className="card p-5">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <p className="metric-label">{label}</p>
      <Icon style={{ width: 16, height: 16, color: '#e63000' }} />
    </div>
    <p style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', marginTop: 10, lineHeight: 1 }}>
      {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
    </p>
    <p style={{ fontSize: 12, color: '#6b6b6b', marginTop: 6 }}>{sublabel}</p>
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

  const platformNames = [...new Set(growthData.flatMap(d => Object.keys(d).filter(k => k !== 'date')))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ width: 32, height: 32, border: '2px solid #2a2a2a', borderTopColor: '#e63000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const actions = [
    { label: 'Generate ad copy', icon: Wand2, to: '/ai-studio' },
    { label: 'Schedule a post', icon: CalendarDays, to: '/compose' },
    { label: 'Connect platform', icon: Share2, to: '/platforms' },
    { label: 'Launch campaign', icon: Target, to: '/ads' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Followers"
          sublabel="across all platforms"
          value={overview?.totalFollowers || 0}
          icon={Users}
        />
        <StatCard
          label="Reach (30D)"
          sublabel="across all platforms"
          value={overview?.totalReach || 0}
          icon={Eye}
        />
        <StatCard
          label="Total Posts"
          sublabel="published &amp; scheduled"
          value={overview?.totalPosts || 0}
          icon={FileText}
        />
        <StatCard
          label="Avg Engagement"
          sublabel="rate this period"
          value={overview?.avgEngagementRate || 0}
          icon={TrendingUp}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="mb-5">
            <p className="section-prefix">// PERFORMANCE TREND</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Follower Growth (Last 30 Days)</h2>
          </div>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b6b6b' }}
                  tickFormatter={(v) => v.slice(5)}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: '#2a2a2a' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b6b6b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 0, color: '#fff', fontSize: 11 }}
                  cursor={{ stroke: '#2a2a2a' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#6b6b6b' }} />
                {platformNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={i === 0 ? '#e63000' : '#333333'}
                    strokeWidth={i === 0 ? 2 : 1.5}
                    dot={false}
                    activeDot={{ r: 4, fill: i === 0 ? '#e63000' : '#333333' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64" style={{ color: '#6b6b6b' }}>
              <TrendingUp style={{ width: 48, height: 48, marginBottom: 8, opacity: 0.2 }} />
              <p style={{ fontSize: 13, textAlign: 'center' }}>No growth data yet. Connect platforms and sync data.</p>
              <button
                onClick={() => navigate('/platforms')}
                style={{ marginTop: 12, fontSize: 13, color: '#e63000', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Connect platforms
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <div className="mb-4">
            <p className="section-prefix">// QUICK ACTIONS</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Jump to</h2>
          </div>
          <div>
            {actions.map((action, i) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="flex items-center gap-3 w-full py-3.5 transition-colors hover:bg-[#1f1f1f]"
                  style={{
                    borderBottom: i < actions.length - 1 ? '1px solid #2a2a2a' : 'none',
                    background: 'none',
                    border: i < actions.length - 1 ? '0 0 1px 0' : 'none',
                    borderBottomWidth: i < actions.length - 1 ? 1 : 0,
                    borderBottomColor: '#2a2a2a',
                    borderBottomStyle: 'solid',
                    cursor: 'pointer',
                    paddingLeft: 0,
                    paddingRight: 0,
                  }}
                >
                  <div style={{ width: 32, height: 32, background: 'rgba(230,48,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color: '#e63000' }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#ffffff', textAlign: 'left' }}>{action.label}</span>
                  <ArrowUpRight style={{ width: 14, height: 14, color: '#3a3a3a' }} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-prefix">// RECENT POSTS</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Activity</h2>
          </div>
          <button
            onClick={() => navigate('/compose')}
            style={{ fontSize: 12, color: '#e63000', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            New post
          </button>
        </div>
        {posts.length > 0 ? (
          <div>
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="flex items-start gap-3 py-3 hover:bg-[#1f1f1f] cursor-pointer transition-colors"
                style={{ borderBottom: i < posts.length - 1 ? '1px solid #2a2a2a' : 'none', paddingLeft: 8, paddingRight: 8 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 500, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.content}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="platform-tag">{post.status}</span>
                    <span style={{ fontSize: 11, color: '#6b6b6b' }}>{post.platforms?.join(', ')}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: '#6b6b6b' }}>
                    {post.scheduledAt
                      ? new Date(post.scheduledAt).toLocaleDateString()
                      : new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32" style={{ color: '#6b6b6b' }}>
            <p style={{ fontSize: 13 }}>No posts yet</p>
            <button
              onClick={() => navigate('/compose')}
              style={{ marginTop: 8, fontSize: 13, color: '#e63000', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
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
