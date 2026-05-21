import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Facebook, Instagram, Twitter, Linkedin, Image, Calendar,
  Clock, CheckCircle2, AlertCircle, Send, FileEdit, X
} from 'lucide-react'
import api from '../api/axios.js'

const platformConfig = [
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-600', activeText: 'text-white' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', activeBg: 'bg-pink-600', activeText: 'text-white' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', activeBg: 'bg-sky-600', activeText: 'text-white' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', activeBg: 'bg-indigo-600', activeText: 'text-white' }
]

const MAX_CHARS = 280

const Toast = ({ type, message, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    {type === 'success'
      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
      : <AlertCircle className="w-4 h-4 text-red-600" />
    }
    {message}
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
)

const Composer = () => {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [postNow, setPostNow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      showToast('error', 'Post content is required')
      return
    }

    if (selectedPlatforms.length === 0) {
      showToast('error', 'Please select at least one platform')
      return
    }

    if (!postNow && status === 'scheduled' && !scheduledAt) {
      showToast('error', 'Please set a scheduled date/time or choose "Post Now"')
      return
    }

    setLoading(true)

    try {
      const payload = {
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        platforms: selectedPlatforms,
        status: postNow ? 'published' : status
      }

      if (!postNow && scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString()
      }

      await api.post('/posts', payload)

      showToast('success', 'Post created successfully!')
      setContent('')
      setImageUrl('')
      setSelectedPlatforms([])
      setScheduledAt('')
      setStatus('scheduled')
      setPostNow(false)

      setTimeout(() => navigate('/calendar'), 1500)
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const charCount = content.length
  const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100)
  const isOverLimit = charCount > MAX_CHARS

  return (
    <>
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
              placeholder="What would you like to share?"
              rows={5}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${isOverLimit ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {charCount} / {MAX_CHARS} characters
              </span>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverLimit ? 'bg-red-500' : charPercent > 80 ? 'bg-yellow-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${charPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image URL (optional)
              </div>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-3">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-32 w-full object-cover rounded-lg border border-gray-200"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Platforms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Platforms <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {platformConfig.map(platform => {
                const Icon = platform.icon
                const isSelected = selectedPlatforms.includes(platform.id)
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${platform.activeBg} ${platform.activeText} border-transparent`
                        : `${platform.bg} ${platform.color} ${platform.border} hover:border-opacity-60`
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{platform.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postNow}
                  onChange={(e) => setPostNow(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm text-gray-600">Post Now</span>
              </label>
            </div>

            {!postNow && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Date &amp; Time
                    </div>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow bg-white"
                  >
                    <option value="draft">
                      Draft
                    </option>
                    <option value="scheduled">
                      Scheduled
                    </option>
                  </select>
                </div>
              </div>
            )}

            {postNow && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Send className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">This post will be published immediately</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isOverLimit}
              className="flex-1 py-2.5 px-4 bg-primary-600 text-white font-medium rounded-lg text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  {postNow ? <Send className="w-4 h-4" /> : <FileEdit className="w-4 h-4" />}
                  {postNow ? 'Publish Now' : status === 'draft' ? 'Save Draft' : 'Schedule Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Composer
