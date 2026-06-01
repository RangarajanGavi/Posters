import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Image, Video, Sparkles, Download, Send, RefreshCw,
  Loader2, Film, Wand2, Grid3x3,
  Zap, Clock, X, Play
} from 'lucide-react'
import api from '../api/axios.js'

// ─── Create Post Modal ───────────────────────────────────────────────────────

const CreatePostModal = ({ media, onClose }) => {
  const navigate = useNavigate()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: 480, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p className="section-prefix">// CREATE POST</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Create Post with this Media</h3>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#6b6b6b' }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
        {media.imageUrl && (
          <div style={{ border: '1px solid #2a2a2a', overflow: 'hidden', marginBottom: 16 }}>
            <img src={media.imageUrl} alt="" style={{ width: '100%', height: 192, objectFit: 'cover' }} />
          </div>
        )}
        <label className="label">Quick post to</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok'].map(p => (
            <button key={p} className="platform-tag" style={{ cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/compose', { state: { imageUrl: media.imageUrl } })}
            className="btn-primary flex-1 justify-center"
          >
            <Send style={{ width: 14, height: 14 }} /> Open Composer
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Media Library ────────────────────────────────────────────────────────────

const MediaLibrary = ({ onUseMedia }) => {
  const mockItems = [
    { id: 1, type: 'photo', url: 'https://picsum.photos/seed/social1/400/400', prompt: 'Social media lifestyle photo', date: '2 hours ago' },
    { id: 2, type: 'photo', url: 'https://picsum.photos/seed/product2/400/400', prompt: 'Product showcase minimal', date: 'Yesterday' },
    { id: 3, type: 'photo', url: 'https://picsum.photos/seed/brand3/400/400', prompt: 'Brand announcement poster', date: '2 days ago' },
    { id: 4, type: 'video', url: null, prompt: '30s promo video script', date: '3 days ago', isScript: true },
    { id: 5, type: 'photo', url: 'https://picsum.photos/seed/event5/400/400', prompt: 'Event promotional banner', date: '4 days ago' },
    { id: 6, type: 'photo', url: 'https://picsum.photos/seed/abstract6/400/400', prompt: 'Abstract colorful background', date: '5 days ago' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
      {mockItems.map(item => (
        <div key={item.id} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'pointer' }} className="group">
          {item.url ? (
            <img src={item.url} alt={item.prompt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1f1f1f', border: '1px solid #2a2a2a' }}>
              <Film style={{ width: 32, height: 32, color: '#e63000', marginBottom: 4 }} />
              <span style={{ fontSize: 10, color: '#6b6b6b', textAlign: 'center', padding: '0 8px' }}>{item.prompt}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
            <button
              onClick={() => onUseMedia({ imageUrl: item.url, prompt: item.prompt })}
              className="btn-primary"
              style={{ fontSize: 11, padding: '5px 10px' }}
            >
              Use in Post
            </button>
            {item.url && (
              <a
                href={item.url} download target="_blank" rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: 11, padding: '5px 10px', textDecoration: 'none' }}
                onClick={e => e.stopPropagation()}
              >
                Download
              </a>
            )}
          </div>
          {/* Date badge */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 6, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Photo Studio ─────────────────────────────────────────────────────────────

const ASPECT_RATIOS = [
  { label: 'Square', value: '1:1', size: '1024x1024' },
  { label: 'Portrait', value: '4:5', size: '1024x1024' },
  { label: 'Landscape', value: '16:9', size: '1792x1024' },
  { label: 'Story', value: '9:16', size: '1024x1792' },
]

const STYLES = ['Vivid', 'Natural', 'Cinematic', 'Anime', 'Oil Painting', 'Watercolor', '3D Render', 'Minimalist']
const LIGHTINGS = ['Natural', 'Studio', 'Golden Hour', 'Neon', 'Dramatic']
const QUICK_PROMPTS = [
  'Product showcase on white background',
  'Social media lifestyle photo',
  'Minimal brand announcement',
  'Team celebration photo',
  'Event promotional poster',
  'Abstract colorful background',
]

const PhotoStudio = ({ onCreatePost }) => {
  const [photoForm, setPhotoForm] = useState({
    prompt: '', style: 'vivid', aspectRatio: '1:1', lighting: 'Natural'
  })
  const [generatingPhoto, setGeneratingPhoto] = useState(false)
  const [generatedPhoto, setGeneratedPhoto] = useState(null)

  const generatePhoto = async () => {
    if (!photoForm.prompt.trim()) return
    setGeneratingPhoto(true)
    try {
      const selectedRatio = ASPECT_RATIOS.find(r => r.value === photoForm.aspectRatio)
      const res = await api.post('/ai/image', {
        prompt: `${photoForm.prompt}, style: ${photoForm.style}, lighting: ${photoForm.lighting}`,
        size: selectedRatio?.size || '1024x1024',
        style: photoForm.style.toLowerCase()
      })
      setGeneratedPhoto({ imageUrl: res.data.imageUrl, prompt: photoForm.prompt, isMock: res.data.isMock })
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingPhoto(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className="card p-5 space-y-5">
        <div>
          <p className="section-prefix">// AI PHOTO GENERATOR</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>AI Photo Generator</h2>
          <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Describe your perfect image and let AI create it</p>
        </div>

        <div>
          <label className="label">Prompt</label>
          <textarea
            value={photoForm.prompt}
            onChange={e => setPhotoForm(p => ({ ...p, prompt: e.target.value }))}
            className="input"
            style={{ minHeight: 100, resize: 'none' }}
            placeholder="Describe your image in detail..."
          />
        </div>

        <div>
          <label className="label">Style</label>
          <select
            value={photoForm.style}
            onChange={e => setPhotoForm(p => ({ ...p, style: e.target.value }))}
            className="input"
            style={{ colorScheme: 'dark' }}
          >
            {STYLES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Aspect Ratio</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio.value}
                onClick={() => setPhotoForm(p => ({ ...p, aspectRatio: ratio.value }))}
                className={photoForm.aspectRatio === ratio.value ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: 11, padding: '5px 10px' }}
              >
                {ratio.label} ({ratio.value})
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Lighting</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LIGHTINGS.map(light => (
              <button
                key={light}
                onClick={() => setPhotoForm(p => ({ ...p, lighting: light }))}
                className={photoForm.lighting === light ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: 11, padding: '5px 10px' }}
              >
                {light}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Quick Prompts</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp}
                onClick={() => setPhotoForm(p => ({ ...p, prompt: qp }))}
                className="platform-tag"
                style={{ cursor: 'pointer' }}
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generatePhoto}
          disabled={generatingPhoto || !photoForm.prompt.trim()}
          className="btn-media w-full justify-center py-3"
          style={{ opacity: generatingPhoto || !photoForm.prompt.trim() ? 0.5 : 1, cursor: generatingPhoto || !photoForm.prompt.trim() ? 'not-allowed' : 'pointer' }}
        >
          {generatingPhoto ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: 18, height: 18 }} />}
          {generatingPhoto ? 'Generating...' : 'Generate Photo'}
        </button>
        <p style={{ fontSize: 11, color: '#6b6b6b', textAlign: 'center' }}>Powered by DALL-E 3 · Results appear in 10–30 seconds</p>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        {generatingPhoto ? (
          <div className="card p-4">
            <p style={{ fontSize: 11, color: '#6b6b6b', marginBottom: 12, fontWeight: 500 }}>Generating your photo...</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="shimmer-bg" style={{ aspectRatio: '1' }} />
              ))}
            </div>
          </div>
        ) : generatedPhoto ? (
          <div className="card p-4 space-y-4">
            <div style={{ border: '1px solid #2a2a2a', overflow: 'hidden' }}>
              <img src={generatedPhoto.imageUrl} alt="Generated" style={{ width: '100%', objectFit: 'cover' }} />
            </div>
            {generatedPhoto.isMock && (
              <p style={{ fontSize: 11, color: '#e6b400', textAlign: 'center' }}>Demo mode — Picsum placeholder. Add OPENAI_API_KEY for real generation.</p>
            )}
            <div className="flex gap-2">
              <a href={generatedPhoto.imageUrl} download="ai-photo.png" target="_blank" rel="noreferrer" className="btn-secondary flex-1 justify-center text-sm">
                <Download style={{ width: 14, height: 14 }} /> Download
              </a>
              <button onClick={generatePhoto} className="btn-secondary flex-1 justify-center text-sm">
                <RefreshCw style={{ width: 14, height: 14 }} /> Regenerate
              </button>
              <button onClick={() => onCreatePost(generatedPhoto)} className="btn-primary flex-1 justify-center text-sm">
                <Send style={{ width: 14, height: 14 }} /> Create Post
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#6b6b6b', textAlign: 'center', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{generatedPhoto.prompt}</p>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, border: '1px dashed #2a2a2a' }}>
            <Image style={{ width: 64, height: 64, color: '#2a2a2a', marginBottom: 16 }} />
            <p style={{ color: '#6b6b6b', fontSize: 13, fontWeight: 500 }}>Your generated photo appears here</p>
            <p style={{ color: '#3a3a3a', fontSize: 12, marginTop: 4 }}>Fill in the form and click Generate</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Video Studio ─────────────────────────────────────────────────────────────

const VideoStudio = ({ onCreatePost }) => {
  const [videoSubTab, setVideoSubTab] = useState('script')
  const [videoForm, setVideoForm] = useState({
    topic: '', platform: 'instagram_reels', duration: '30',
    style: 'promotional', voiceover: 'professional', broll: true
  })
  const [generatingScript, setGeneratingScript] = useState(false)
  const [videoScript, setVideoScript] = useState(null)

  const generateScript = async () => {
    if (!videoForm.topic.trim()) return
    setGeneratingScript(true)
    try {
      const res = await api.post('/ai/video-script', {
        topic: videoForm.topic,
        duration: videoForm.duration + 's',
        style: videoForm.style,
        platform: videoForm.platform
      })
      setVideoScript(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingScript(false)
    }
  }

  const handleExportScript = () => {
    if (!videoScript) return
    const content = `VIDEO SCRIPT\n\n${videoScript.script || ''}\n\nSCENE BREAKDOWN\n${videoScript.scenes?.map(s => `${s.time}: ${s.description}\nVoiceover: ${s.voiceover}`).join('\n\n') || ''}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'video-script.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyScript = () => {
    if (!videoScript) return
    navigator.clipboard.writeText(videoScript.script || '')
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, background: '#e63000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Film style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <div>
            <p className="section-prefix">// AI VIDEO CREATOR</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>AI Video Creator</h2>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a', marginBottom: 20, gap: 0 }}>
          {[['script', 'Script & Storyboard'], ['auto', 'Auto-Generate']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setVideoSubTab(key)}
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600,
                color: videoSubTab === key ? '#ffffff' : '#6b6b6b',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: videoSubTab === key ? '2px solid #e63000' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {videoSubTab === 'script' ? (
          <div className="space-y-4">
            <div>
              <label className="label">Topic / Subject</label>
              <input
                value={videoForm.topic}
                onChange={e => setVideoForm(p => ({ ...p, topic: e.target.value }))}
                className="input"
                placeholder="Product launch, tutorial, brand story..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Platform</label>
                <select value={videoForm.platform} onChange={e => setVideoForm(p => ({ ...p, platform: e.target.value }))} className="input" style={{ colorScheme: 'dark' }}>
                  <option value="instagram_reels">Instagram Reels</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube_shorts">YouTube Shorts</option>
                  <option value="facebook_reels">Facebook Reels</option>
                  <option value="youtube">YouTube (long)</option>
                </select>
              </div>
              <div>
                <label className="label">Duration</label>
                <select value={videoForm.duration} onChange={e => setVideoForm(p => ({ ...p, duration: e.target.value }))} className="input" style={{ colorScheme: 'dark' }}>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="180">3 minutes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Style</label>
                <select value={videoForm.style} onChange={e => setVideoForm(p => ({ ...p, style: e.target.value }))} className="input" style={{ colorScheme: 'dark' }}>
                  {['educational', 'entertaining', 'promotional', 'storytelling', 'tutorial'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Voiceover Style</label>
                <select value={videoForm.voiceover} onChange={e => setVideoForm(p => ({ ...p, voiceover: e.target.value }))} className="input" style={{ colorScheme: 'dark' }}>
                  {['upbeat', 'professional', 'casual', 'dramatic'].map(v => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: 36, height: 20, background: videoForm.broll ? '#e63000' : '#2a2a2a', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: videoForm.broll ? 18 : 2, width: 16, height: 16, background: '#ffffff', transition: 'left 0.2s' }} />
                <input type="checkbox" checked={videoForm.broll} onChange={e => setVideoForm(p => ({ ...p, broll: e.target.checked }))} style={{ display: 'none' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6b6b6b' }}>Include B-roll suggestions</span>
            </label>

            <button
              onClick={generateScript}
              disabled={generatingScript || !videoForm.topic.trim()}
              className="btn-media w-full justify-center py-3"
              style={{ opacity: generatingScript || !videoForm.topic.trim() ? 0.5 : 1, cursor: generatingScript || !videoForm.topic.trim() ? 'not-allowed' : 'pointer' }}
            >
              {generatingScript ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Wand2 style={{ width: 18, height: 18 }} />}
              {generatingScript ? 'Generating Script...' : 'Generate Script + Storyboard'}
            </button>

            {videoScript && !generatingScript && (
              <div className="space-y-4 mt-2">
                <div className="card-elevated p-5" style={{ borderLeft: '2px solid #e63000' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Film style={{ width: 14, height: 14, color: '#e63000' }} />
                      <p className="metric-label" style={{ color: '#e63000' }}>Video Script</p>
                    </div>
                    <span className="platform-tag" style={{ color: '#e63000', borderColor: '#e63000' }}>{videoForm.duration}s</span>
                  </div>
                  {videoScript.script && (
                    <pre style={{ color: '#ffffff', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginBottom: 16 }}>{videoScript.script}</pre>
                  )}

                  {videoScript.scenes && videoScript.scenes.length > 0 && (
                    <div className="space-y-3">
                      {videoScript.scenes.map((scene, i) => (
                        <div key={i} style={{ padding: 12, background: '#1a1a1a', borderLeft: '2px solid #e63000' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>{scene.description}</p>
                              <p style={{ fontSize: 12, color: '#6b6b6b', fontStyle: 'italic' }}>&quot;{scene.voiceover}&quot;</p>
                            </div>
                            <span className="platform-tag" style={{ color: '#e63000', borderColor: '#e63000', flexShrink: 0, fontSize: 9 }}>{scene.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button onClick={handleExportScript} className="btn-secondary flex-1 justify-center text-sm">
                      <Download style={{ width: 14, height: 14 }} /> Download Script
                    </button>
                    <button onClick={handleCopyScript} className="btn-secondary flex-1 justify-center text-sm">
                      Copy Script
                    </button>
                    <button onClick={() => onCreatePost({ imageUrl: null, prompt: videoForm.topic })} className="btn-primary flex-1 justify-center text-sm">
                      <Send style={{ width: 14, height: 14 }} /> Create Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 80, height: 80, background: '#e63000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Film style={{ width: 40, height: 40, color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>AI Video Generation</h3>
              <p style={{ color: '#6b6b6b', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
                Automatically generate full videos from text prompts. Integration with Runway ML, Sora, and Kling AI coming soon.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { feature: 'Text-to-video generation', eta: 'Q2 2025' },
                { feature: 'Image-to-video animation', eta: 'Q2 2025' },
                { feature: 'Auto-edit & transitions', eta: 'Q3 2025' },
                { feature: 'Voice synthesis overlay', eta: 'Q3 2025' },
              ].map(({ feature, eta }) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#1f1f1f', border: '1px solid #2a2a2a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Zap style={{ width: 14, height: 14, color: '#e63000' }} />
                    <span style={{ fontSize: 13, color: '#ffffff' }}>{feature}</span>
                  </div>
                  <span className="platform-tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock style={{ width: 10, height: 10 }} /> {eta}
                  </span>
                </div>
              ))}
            </div>

            <button className="btn-primary w-full justify-center">
              <Sparkles style={{ width: 14, height: 14 }} /> Join Waitlist
            </button>

            {/* Mock Timeline Editor */}
            <div style={{ background: '#111111', border: '1px solid #2a2a2a', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timeline Preview</span>
                <button style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#6b6b6b' }}>
                  <Play style={{ width: 12, height: 12 }} />
                </button>
              </div>
              {/* Timeline Clips */}
              <div style={{ position: 'relative', height: 40, display: 'flex', gap: 4, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', flex: 3, background: '#e63000', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Hook (0-3s)</span>
                </div>
                <div style={{ height: '100%', flex: 8, background: '#2a2a2a', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Main Content (3-25s)</span>
                </div>
                <div style={{ height: '100%', flex: 2, background: '#1f1f1f', border: '1px solid #333333', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <span style={{ fontSize: 9, color: '#6b6b6b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>CTA</span>
                </div>
                <div style={{ height: '100%', flex: 2, background: '#1f1f1f', border: '1px solid #333333', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <span style={{ fontSize: 9, color: '#6b6b6b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>End</span>
                </div>
                <div style={{ position: 'absolute', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.5)', left: '15%' }} />
              </div>
              <input type="range" min="0" max="100" defaultValue="15" className="w-full" style={{ accentColor: '#e63000', height: 4 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main MediaStudio Component ───────────────────────────────────────────────

const MediaStudio = () => {
  const [activeTab, setActiveTab] = useState('photos')
  const [createPostMedia, setCreatePostMedia] = useState(null)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="section-prefix">// MEDIA STUDIO</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>AI Media Studio</h1>
          <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Generate AI photos and videos for your social media posts</p>
        </div>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveTab('photos')}
            className={activeTab === 'photos' ? 'btn-primary' : 'btn-secondary'}
            style={{ gap: 6 }}
          >
            <Image style={{ width: 14, height: 14 }} /> Photos
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'}
            style={{ gap: 6 }}
          >
            <Video style={{ width: 14, height: 14 }} /> Videos
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'photos' && <PhotoStudio onCreatePost={setCreatePostMedia} />}
      {activeTab === 'videos' && <VideoStudio onCreatePost={setCreatePostMedia} />}

      {/* Media Library */}
      <div className="card p-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p className="section-prefix">// MEDIA LIBRARY</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Grid3x3 style={{ width: 16, height: 16, color: '#e63000' }} /> Media Library
            </h2>
          </div>
          <span className="platform-tag" style={{ color: '#e63000', borderColor: '#e63000' }}>6 assets</span>
        </div>
        <MediaLibrary onUseMedia={setCreatePostMedia} />
      </div>

      {/* Create Post Modal */}
      {createPostMedia && (
        <CreatePostModal media={createPostMedia} onClose={() => setCreatePostMedia(null)} />
      )}
    </div>
  )
}

export default MediaStudio
