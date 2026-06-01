import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Facebook, Instagram, Twitter, Linkedin, Image, Calendar,
  Clock, CheckCircle2, AlertCircle, Send, FileEdit, X
} from 'lucide-react'
import api from '../api/axios.js'

const platformConfig = [
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: '#1DA1F2' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' }
]

const MAX_CHARS = 280

const Toast = ({ type, message, onClose }) => (
  <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#1a1a1a', border: `1px solid ${type === 'success' ? '#e63000' : '#cc0000'}`, color: type === 'success' ? '#e63000' : '#cc3333', fontSize: 13, fontWeight: 600 }}>
    {type === 'success'
      ? <CheckCircle2 style={{ width: 16, height: 16 }} />
      : <AlertCircle style={{ width: 16, height: 16 }} />
    }
    {message}
    <button onClick={onClose} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b' }}>
      <X style={{ width: 14, height: 14 }} />
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

      <div style={{ maxWidth: 640, margin: '0 auto' }} className="animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div className="card p-5">
            <label className="label">
              Post Content <span style={{ color: '#e63000' }}>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input"
              style={{ minHeight: 120, resize: 'none' }}
              placeholder="What would you like to share?"
              rows={5}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: isOverLimit ? '#e63000' : '#6b6b6b' }}>
                {charCount} / {MAX_CHARS} characters
              </span>
              <div style={{ width: 80, height: 3, background: '#2a2a2a' }}>
                <div
                  style={{
                    height: '100%',
                    background: isOverLimit ? '#e63000' : charPercent > 80 ? '#e6b400' : '#e63000',
                    width: `${charPercent}%`,
                    transition: 'width 0.15s',
                    opacity: isOverLimit ? 1 : 0.6,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="card p-5">
            <label className="label">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Image style={{ width: 14, height: 14 }} />
                Image URL <span style={{ color: '#6b6b6b', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
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
              <div style={{ marginTop: 12, border: '1px solid #2a2a2a', overflow: 'hidden' }}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ height: 160, width: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Platforms */}
          <div className="card p-5">
            <label className="label">
              Platforms <span style={{ color: '#e63000' }}>*</span>
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
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                      background: isSelected ? 'rgba(230,48,0,0.08)' : '#1f1f1f',
                      border: `1px solid ${isSelected ? '#e63000' : '#2a2a2a'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <Icon style={{ width: 16, height: 16, color: isSelected ? platform.color : '#6b6b6b', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#ffffff' : '#6b6b6b' }}>{platform.label}</span>
                    {isSelected && <CheckCircle2 style={{ width: 14, height: 14, marginLeft: 'auto', color: '#e63000' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scheduling */}
          <div className="card p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <label className="label" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar style={{ width: 14, height: 14 }} />
                  Schedule
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: 36, height: 20, background: postNow ? '#e63000' : '#2a2a2a', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 2, left: postNow ? 18 : 2, width: 16, height: 16, background: '#ffffff', transition: 'left 0.2s' }} />
                  <input
                    type="checkbox"
                    checked={postNow}
                    onChange={(e) => setPostNow(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#6b6b6b' }}>Post Now</span>
              </label>
            </div>

            {!postNow && (
              <div className="space-y-3">
                <div>
                  <label className="label">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock style={{ width: 12, height: 12 }} />
                      Date &amp; Time
                    </div>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="input"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            )}

            {postNow && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(230,48,0,0.08)', border: '1px solid rgba(230,48,0,0.2)' }}>
                <Send style={{ width: 14, height: 14, color: '#e63000', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#e63000', fontWeight: 500 }}>This post will be published immediately</span>
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
              className="btn-primary flex-1 justify-center py-3"
              style={{ opacity: loading || isOverLimit ? 0.5 : 1, cursor: loading || isOverLimit ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Creating...
                </>
              ) : (
                <>
                  {postNow ? <Send style={{ width: 16, height: 16 }} /> : <FileEdit style={{ width: 16, height: 16 }} />}
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
