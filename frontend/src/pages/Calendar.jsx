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
  facebook: 'text-blue-700 bg-blue-100',
  instagram: 'text-pink-700 bg-pink-100',
  twitter: 'text-sky-700 bg-sky-100',
  linkedin: 'text-indigo-700 bg-indigo-100'
}

const statusColors = {
  published: 'text-green-700 bg-green-100',
  scheduled: 'text-blue-700 bg-blue-100',
  draft: 'text-gray-600 bg-gray-100',
  failed: 'text-red-700 bg-red-100'
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
    <div className="flex gap-6 h-full">
      {/* Calendar */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setCurrentDate(new Date()); setSelectedDay(null) }}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {days.map((day, idx) => {
            const dayPosts = getPostsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDay = isToday(day)
            const isSelected = selectedDay && isSameDay(day, selectedDay)

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`bg-white min-h-[90px] p-1.5 cursor-pointer transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isSelected ? 'ring-2 ring-inset ring-primary-500' : 'hover:bg-blue-50'}`}
              >
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${
                  isTodayDay
                    ? 'bg-primary-600 text-white'
                    : isCurrentMonth
                    ? 'text-gray-700'
                    : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 3).map((post, i) => (
                    <div key={i} className="flex gap-0.5 flex-wrap">
                      {post.platforms?.slice(0, 3).map(platform => (
                        <div
                          key={platform}
                          className={`w-2 h-2 rounded-full ${platformColors[platform] || 'bg-gray-400'}`}
                          title={platform}
                        />
                      ))}
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="text-xs text-gray-400">+{dayPosts.length - 3}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">Platforms:</span>
          {Object.entries(platformColors).map(([platform, color]) => (
            <div key={platform} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-xs text-gray-600 capitalize">{platform}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      {selectedDay && (
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {format(selectedDay, 'EEEE, MMMM d')}
              </h3>
              <p className="text-xs text-gray-500">{selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/compose')}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-primary-600"
                title="Add post"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {selectedDayPosts.length > 0 ? (
              selectedDayPosts.map(post => (
                <div key={post.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-1 flex-wrap">
                      {post.platforms?.map(platform => (
                        <span
                          key={platform}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${platformTextColors[platform] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize flex-shrink-0 ${statusColors[post.status] || statusColors.draft}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                  {post.scheduledAt && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {format(new Date(post.scheduledAt), 'h:mm a')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <p className="text-sm text-center">No posts scheduled for this day</p>
                <button
                  onClick={() => navigate('/compose')}
                  className="mt-2 text-sm text-primary-600 hover:underline"
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
