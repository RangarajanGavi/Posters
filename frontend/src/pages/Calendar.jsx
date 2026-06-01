import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, PlusCircle, Clock } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday
} from 'date-fns'
import api from '../api/axios.js'

const platformTextColors = {
  facebook: { color: '#1877F2', bg: 'rgba(24,119,242,0.1)' },
  instagram: { color: '#E1306C', bg: 'rgba(225,48,108,0.1)' },
  twitter: { color: '#1DA1F2', bg: 'rgba(29,161,242,0.1)' },
  linkedin: { color: '#0A66C2', bg: 'rgba(10,102,194,0.1)' }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchPosts = useCallback(async (date) => {
    setLoading(true)
    try {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const res = await api.get(`/posts/calendar?year=${year}&month=${month}`)
      setPosts(res.data)
    } catch (err) {
      console.error('Calendar fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(currentDate)
  }, [currentDate, fetchPosts])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getPostsForDay = (day) => {
    return posts.filter(post =>
      post.scheduledAt && isSameDay(new Date(post.scheduledAt), day)
    )
  }

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : []

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%' }} className="animate-fade-in">
      {/* Calendar */}
      <div className="card" style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading && (
              <div style={{ width: 16, height: 16, border: '2px solid #2a2a2a', borderTopColor: '#e63000', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: 4 }} />
            )}
            <button
              onClick={prevMonth}
              className="btn-secondary"
              style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={() => { setCurrentDate(new Date()); setSelectedDay(null) }}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: 11 }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="btn-secondary"
              style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {WEEKDAYS.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#3a3a3a', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '8px 0' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #2a2a2a' }}>
          {days.map((day, idx) => {
            const dayPosts = getPostsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDay = isToday(day)
            const isSelected = selectedDay && isSameDay(day, selectedDay)

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  minHeight: 90, padding: 6, cursor: 'pointer',
                  background: !isCurrentMonth ? '#0d0d0d' : isTodayDay ? 'rgba(230,48,0,0.05)' : isSelected ? '#1f1f1f' : '#1a1a1a',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid #2a2a2a' : 'none',
                  borderBottom: idx < days.length - 7 ? '1px solid #2a2a2a' : 'none',
                  borderTop: isTodayDay ? '2px solid #e63000' : 'none',
                  transition: 'background 0.1s',
                }}
                className="hover:bg-[#1f1f1f]"
              >
                <div style={{
                  width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: isTodayDay ? 700 : 500, marginBottom: 4,
                  color: !isCurrentMonth ? '#3a3a3a' : isTodayDay ? '#e63000' : '#ffffff',
                }}>
                  {format(day, 'd')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayPosts.slice(0, 2).map((post, i) => {
                    const platform = post.platforms?.[0]
                    const pStyle = platformTextColors[platform] || { color: '#6b6b6b', bg: '#1f1f1f' }
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px', background: pStyle.bg }}>
                        <div style={{ width: 4, height: 4, background: pStyle.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 9, fontWeight: 600, color: pStyle.color, textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {platform || 'Post'}
                        </span>
                      </div>
                    )
                  })}
                  {dayPosts.length > 2 && (
                    <p style={{ fontSize: 9, color: '#6b6b6b', fontWeight: 600, paddingLeft: 4 }}>+{dayPosts.length - 2} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid #2a2a2a' }}>
          <span style={{ fontSize: 10, color: '#6b6b6b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Platforms:</span>
          {Object.entries(platformTextColors).map(([platform, style]) => (
            <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, background: style.color }} />
              <span style={{ fontSize: 10, color: '#6b6b6b', textTransform: 'capitalize', fontWeight: 600 }}>{platform}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      {selectedDay && (
        <div className="card animate-slide-up" style={{ width: 300, padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                {format(selectedDay, 'EEEE, MMMM d')}
              </h3>
              <p style={{ fontSize: 11, color: '#6b6b6b', marginTop: 2 }}>{selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? 's' : ''} scheduled</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => navigate('/compose')}
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#e63000' }}
                title="Add post"
              >
                <PlusCircle style={{ width: 14, height: 14 }} />
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#6b6b6b' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedDayPosts.length > 0 ? (
              selectedDayPosts.map(post => (
                <div
                  key={post.id}
                  style={{ padding: 12, border: '1px solid #2a2a2a', background: '#1f1f1f', cursor: 'pointer', transition: 'background 0.1s' }}
                  className="hover:bg-[#242424]"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {post.platforms?.map(platform => {
                        const pStyle = platformTextColors[platform] || { color: '#6b6b6b', bg: '#2a2a2a' }
                        return (
                          <span
                            key={platform}
                            style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 6px', color: pStyle.color, background: pStyle.bg }}
                          >
                            {platform}
                          </span>
                        )
                      })}
                    </div>
                    <span className="platform-tag" style={{ flexShrink: 0, fontSize: 9 }}>{post.status}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#ffffff', fontWeight: 500, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{post.content}</p>
                  {post.scheduledAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: '#6b6b6b' }}>
                      <Clock style={{ width: 11, height: 11 }} />
                      {format(new Date(post.scheduledAt), 'h:mm a')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, color: '#6b6b6b' }}>
                <p style={{ fontSize: 13, textAlign: 'center' }}>No posts scheduled for this day</p>
                <button
                  onClick={() => navigate('/compose')}
                  style={{ marginTop: 8, fontSize: 13, color: '#e63000', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Schedule a post
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
