import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, PlusCircle, Clock } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday
} from 'date-fns'
import api from '../api/axios.js'

const platformColors = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500',
  twitter: 'bg-sky-500',
  linkedin: 'bg-indigo-500'
}

const platformTextColors = {
  facebook: 'text-blue-400 bg-blue-500/10',
  instagram: 'text-pink-400 bg-pink-500/10',
  twitter: 'text-sky-400 bg-sky-500/10',
  linkedin: 'text-indigo-400 bg-indigo-500/10'
}

const platformDotColors = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500',
  twitter: 'bg-sky-400',
  linkedin: 'bg-indigo-500'
}

const statusColors = {
  published: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
  scheduled: 'text-blue-400 bg-blue-500/10 border border-blue-500/20',
  draft: 'text-slate-400 bg-white/[0.05]',
  failed: 'text-red-400 bg-red-500/10 border border-red-500/20'
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
    <div className="flex gap-5 h-full animate-fade-in">
      {/* Calendar */}
      <div className="flex-1 card p-5 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1.5">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-1"></div>
            )}
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCurrentDate(new Date()); setSelectedDay(null) }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 bg-white/[0.05] hover:bg-white/[0.08] rounded-xl transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.05]">
          {days.map((day, idx) => {
            const dayPosts = getPostsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDay = isToday(day)
            const isSelected = selectedDay && isSameDay(day, selectedDay)

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[90px] p-1.5 cursor-pointer transition-colors ${
                  !isCurrentMonth ? 'bg-dark-800/60' : 'bg-dark-700'
                } ${isTodayDay ? 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/40' : ''} ${
                  isSelected && !isTodayDay ? 'bg-white/[0.08] ring-2 ring-inset ring-indigo-500/30' : ''
                } ${!isSelected && !isTodayDay ? 'hover:bg-white/[0.04]' : ''}`}
                style={{ backgroundColor: !isCurrentMonth ? '#0f1118' : undefined }}
              >
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${
                  isTodayDay
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isCurrentMonth
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 2).map((post, i) => {
                    const platform = post.platforms?.[0]
                    const dotColor = platformDotColors[platform] || 'bg-slate-500'
                    return (
                      <div key={i} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${platform ? platformTextColors[platform] || 'bg-white/[0.05] text-slate-400' : 'bg-white/[0.05] text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                        <span className="text-[10px] font-medium truncate">
                          {platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Post'}
                        </span>
                      </div>
                    )
                  })}
                  {dayPosts.length > 2 && (
                    <p className="text-[10px] text-slate-500 font-medium px-1">+{dayPosts.length - 2} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.07]">
          <span className="text-xs text-slate-500 font-medium">Platforms:</span>
          {Object.entries(platformDotColors).map(([platform, color]) => (
            <div key={platform} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-slate-500 capitalize font-medium">{platform}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      {selectedDay && (
        <div className="w-80 card p-4 flex flex-col animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {format(selectedDay, 'EEEE, MMMM d')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? 's' : ''} scheduled</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/compose')}
                className="p-1.5 rounded-xl hover:bg-white/[0.06] text-indigo-400 transition-colors"
                title="Add post"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-xl hover:bg-white/[0.06] text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {selectedDayPosts.length > 0 ? (
              selectedDayPosts.map(post => (
                <div key={post.id} className="p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-1 flex-wrap">
                      {post.platforms?.map(platform => (
                        <span
                          key={platform}
                          className={`badge text-[10px] capitalize ${platformTextColors[platform] || 'bg-white/[0.05] text-slate-400'}`}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                    <span className={`badge text-[10px] capitalize flex-shrink-0 ${statusColors[post.status] || statusColors.draft}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3 font-medium">{post.content}</p>
                  {post.scheduledAt && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(post.scheduledAt), 'h:mm a')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                <p className="text-sm text-center">No posts scheduled for this day</p>
                <button
                  onClick={() => navigate('/compose')}
                  className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
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
