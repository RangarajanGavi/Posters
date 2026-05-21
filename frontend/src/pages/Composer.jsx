import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Facebook, Instagram, Twitter, Linkedin, Image, Calendar,
  Clock, CheckCircle2, AlertCircle, Send, FileEdit, X
} from 'lucide-react'
import api from '../api/axios.js'

const platformConfig = [
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2', activeBg: 'bg-blue-600', activeBorder: 'border-blue-600', activeText: 'text-white', idleBorder: 'border-slate-200', idleBg: 'bg-white', idleText: 'text-slate-600', checkBg: 'bg-blue-50' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C', activeBg: 'bg-pink-600', activeBorder: 'border-pink-600', activeText: 'text-white', idleBorder: 'border-slate-200', idleBg: 'bg-white', idleText: 'text-slate-600', checkBg: 'bg-pink-50' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: '#1DA1F2', activeBg: 'bg-sky-500', activeBorder: 'border-sky-500', activeText: 'text-white', idleBorder: 'border-slate-200', idleBg: 'bg-white', idleText: 'text-slate-600', checkBg: 'bg-sky-50' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2', activeBg: 'bg-indigo-600', activeBorder: 'border-indigo-600', activeText: 'text-white', idleBorder: 'border-slate-200', idleBg: 'bg-white', idleText: 'text-slate-600', checkBg: 'bg-indigo-50' }
]

const MAX_CHARS = 280

const Toast = ({ type, message, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
    type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    {type === 'success'
      ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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

      <div className="max-w-2xl mx-auto animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Content */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Post Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[120px] resize-none"
              placeholder="What would you like to share?"
              rows={5}
            />
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs font-medium ${isOverLimit ? 'text-red-600' : 'text-slate-400'}`}>
                {charCount} / {MAX_CHARS} characters
              </span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverLimit ? 'bg-red-500' : charPercent > 80 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${charPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-slate-400" />
                Image URL <span className="text-slate-400 font-normal">(optional)</span>
              </div>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-40 w-full object-cover"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Platforms */}
          <div className="card p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
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
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 ${
                      isSelected
                        ? `${platform.activeBg} ${platform.activeText} ${platform.activeBorder} shadow-sm`
                        : `${platform.idleBg} ${platform.idleText} ${platform.idleBorder} hover:border-slate-300 hover:bg-slate-50`
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-semibold">{platform.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto opacity-80" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scheduling */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Schedule
                </div>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${postNow ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${postNow ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  <input
                    type="checkbox"
                    checked={postNow}
                    onChange={(e) => setPostNow(e.target.checked)}
                    className="sr-only"
                  />
                </div>
                <span className="text-sm font-medium text-slate-600">Post Now</span>
              </label>
            </div>

            {!postNow && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
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
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            )}

            {postNow && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <Send className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-sm text-emerald-700 font-medium">This post will be published immediately</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isOverLimit}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
