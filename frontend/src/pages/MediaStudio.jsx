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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-elevated w-full max-w-lg p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">Create Post with this Media</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        {media.imageUrl && (
          <img src={media.imageUrl} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
        )}
        <p className="label">Quick post to</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok'].map(p => (
            <button key={p} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.05] border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all text-slate-300">{p}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/compose', { state: { imageUrl: media.imageUrl } })}
            className="btn-primary flex-1 justify-center"
          >
            <Send className="w-4 h-4" /> Open Composer
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {mockItems.map(item => (
        <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
          {item.url ? (
            <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#1e2130' }}>
              <Film className="w-8 h-8 text-violet-400 mb-1" />
              <span className="text-xs text-slate-500 text-center px-2 leading-tight">{item.prompt}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
            <button
              onClick={() => onUseMedia({ imageUrl: item.url, prompt: item.prompt })}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Use in Post
            </button>
            {item.url && (
              <a
                href={item.url}
                download
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                Download
              </a>
            )}
          </div>
          {/* Date badge */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-white/70 truncate">{item.date}</p>
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
      <div className="card p-6 space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">AI Photo Generator</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Describe your perfect image and let AI create it</p>
        </div>

        {/* Prompt */}
        <div>
          <label className="label">Prompt</label>
          <textarea
            value={photoForm.prompt}
            onChange={e => setPhotoForm(p => ({ ...p, prompt: e.target.value }))}
            className="input min-h-[100px] resize-none"
            placeholder="Describe your image in detail..."
          />
        </div>

        {/* Style */}
        <div>
          <label className="label">Style</label>
          <select
            value={photoForm.style}
            onChange={e => setPhotoForm(p => ({ ...p, style: e.target.value }))}
            className="input"
            style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
          >
            {STYLES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="label">Aspect Ratio</label>
          <div className="flex gap-2 flex-wrap">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio.value}
                onClick={() => setPhotoForm(p => ({ ...p, aspectRatio: ratio.value }))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  photoForm.aspectRatio === ratio.value
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                    : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
                }`}
              >
                {ratio.label} ({ratio.value})
              </button>
            ))}
          </div>
        </div>

        {/* Lighting */}
        <div>
          <label className="label">Lighting</label>
          <div className="flex gap-2 flex-wrap">
            {LIGHTINGS.map(light => (
              <button
                key={light}
                onClick={() => setPhotoForm(p => ({ ...p, lighting: light }))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  photoForm.lighting === light
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                    : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
                }`}
              >
                {light}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div>
          <label className="label">Quick Prompts</label>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp}
                onClick={() => setPhotoForm(p => ({ ...p, prompt: qp }))}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePhoto}
          disabled={generatingPhoto || !photoForm.prompt.trim()}
          className="btn-media w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {generatingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {generatingPhoto ? 'Generating...' : 'Generate Photo'}
        </button>
        <p className="text-xs text-slate-500 text-center">Powered by DALL-E 3 · Results appear in 10–30 seconds</p>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        {generatingPhoto ? (
          <div className="card p-4">
            <p className="text-xs text-slate-500 mb-3 font-medium">Generating your photo...</p>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square rounded-xl shimmer-bg" />
              ))}
            </div>
          </div>
        ) : generatedPhoto ? (
          <div className="card p-4 space-y-4">
            <div className="rounded-2xl overflow-hidden">
              <img src={generatedPhoto.imageUrl} alt="Generated" className="w-full object-cover" />
            </div>
            {generatedPhoto.isMock && (
              <p className="text-xs text-amber-400 text-center">Demo mode — Picsum placeholder. Add OPENAI_API_KEY for real generation.</p>
            )}
            <div className="flex gap-2">
              <a
                href={generatedPhoto.imageUrl}
                download="ai-photo.png"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary flex-1 justify-center text-sm"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <button
                onClick={generatePhoto}
                className="btn-secondary flex-1 justify-center text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button
                onClick={() => onCreatePost(generatedPhoto)}
                className="btn-primary flex-1 justify-center text-sm"
              >
                <Send className="w-4 h-4" /> Create Post
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center italic truncate">{generatedPhoto.prompt}</p>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/[0.1]">
            <Image className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm font-medium">Your generated photo appears here</p>
            <p className="text-slate-600 text-xs mt-1">Fill in the form and click Generate</p>
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
    a.href = url
    a.download = 'video-script.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyScript = () => {
    if (!videoScript) return
    navigator.clipboard.writeText(videoScript.script || '')
  }

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">AI Video Creator</span>
            </h2>
            <p className="text-slate-500 text-sm">Generate scripts and storyboards for social media videos</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: '#1e2130' }}>
          <button
            onClick={() => setVideoSubTab('script')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${videoSubTab === 'script' ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Script &amp; Storyboard
          </button>
          <button
            onClick={() => setVideoSubTab('auto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${videoSubTab === 'auto' ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Auto-Generate
          </button>
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
                <select
                  value={videoForm.platform}
                  onChange={e => setVideoForm(p => ({ ...p, platform: e.target.value }))}
                  className="input"
                  style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
                >
                  <option value="instagram_reels">Instagram Reels</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube_shorts">YouTube Shorts</option>
                  <option value="facebook_reels">Facebook Reels</option>
                  <option value="youtube">YouTube (long)</option>
                </select>
              </div>
              <div>
                <label className="label">Duration</label>
                <select
                  value={videoForm.duration}
                  onChange={e => setVideoForm(p => ({ ...p, duration: e.target.value }))}
                  className="input"
                  style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
                >
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
                <select
                  value={videoForm.style}
                  onChange={e => setVideoForm(p => ({ ...p, style: e.target.value }))}
                  className="input"
                  style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
                >
                  {['educational', 'entertaining', 'promotional', 'storytelling', 'tutorial'].map(s => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Voiceover Style</label>
                <select
                  value={videoForm.voiceover}
                  onChange={e => setVideoForm(p => ({ ...p, voiceover: e.target.value }))}
                  className="input"
                  style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }}
                >
                  {['upbeat', 'professional', 'casual', 'dramatic'].map(v => (
                    <option key={v} value={v} className="capitalize">{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${videoForm.broll ? 'bg-violet-600' : 'bg-white/[0.1]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${videoForm.broll ? 'translate-x-5' : 'translate-x-0.5'}`} />
                <input
                  type="checkbox"
                  checked={videoForm.broll}
                  onChange={e => setVideoForm(p => ({ ...p, broll: e.target.checked }))}
                  className="sr-only"
                />
              </div>
              <span className="text-sm font-medium text-slate-400">Include B-roll suggestions</span>
            </label>

            <button
              onClick={generateScript}
              disabled={generatingScript || !videoForm.topic.trim()}
              className="btn-media w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {generatingScript ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {generatingScript ? 'Generating Script...' : 'Generate Script + Storyboard'}
            </button>

            {/* Script Result */}
            {videoScript && !generatingScript && (
              <div className="space-y-4 mt-2">
                {/* Script Header */}
                <div className="card-elevated p-5 border border-violet-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">Video Script</span>
                    </div>
                    <span className="badge bg-violet-500/10 text-violet-400">{videoForm.duration}s</span>
                  </div>
                  {videoScript.script && (
                    <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans mb-4">{videoScript.script}</pre>
                  )}

                  {/* Scenes */}
                  {videoScript.scenes && videoScript.scenes.length > 0 && (
                    <div className="space-y-3">
                      {videoScript.scenes.map((scene, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.03] border-l-2 border-violet-500 relative">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-200 mb-1">{scene.description}</p>
                              <p className="text-xs text-slate-400 italic">&quot;{scene.voiceover}&quot;</p>
                            </div>
                            <span className="badge bg-violet-500/10 text-violet-400 text-[10px] flex-shrink-0">{scene.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Script Actions */}
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleExportScript} className="btn-secondary flex-1 justify-center text-sm">
                      <Download className="w-4 h-4" /> Download Script
                    </button>
                    <button onClick={handleCopyScript} className="btn-secondary flex-1 justify-center text-sm">
                      Copy Script
                    </button>
                    <button
                      onClick={() => onCreatePost({ imageUrl: null, prompt: videoForm.topic })}
                      className="btn-primary flex-1 justify-center text-sm"
                    >
                      <Send className="w-4 h-4" /> Create Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Auto-Generate Coming Soon */
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                <Film className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">AI Video Generation</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
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
                <div key={feature} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                  <span className="badge bg-white/[0.05] text-slate-500 text-xs">
                    <Clock className="w-3 h-3" /> {eta}
                  </span>
                </div>
              ))}
            </div>

            <button className="btn-primary w-full justify-center">
              <Sparkles className="w-4 h-4" /> Join Waitlist
            </button>

            {/* Mock Timeline Editor */}
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#1e2130' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Timeline Preview</span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 transition-colors">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Timeline Clips */}
              <div className="relative h-10 rounded-lg overflow-hidden flex gap-1">
                <div className="h-full rounded-md flex-[3] bg-gradient-to-r from-violet-600 to-violet-500 flex items-center px-2">
                  <span className="text-[10px] text-white font-semibold truncate">Hook (0-3s)</span>
                </div>
                <div className="h-full rounded-md flex-[8] bg-gradient-to-r from-blue-600 to-blue-500 flex items-center px-2">
                  <span className="text-[10px] text-white font-semibold truncate">Main Content (3-25s)</span>
                </div>
                <div className="h-full rounded-md flex-[2] bg-gradient-to-r from-pink-600 to-pink-500 flex items-center px-2">
                  <span className="text-[10px] text-white font-semibold truncate">CTA</span>
                </div>
                <div className="h-full rounded-md flex-[2] bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center px-2">
                  <span className="text-[10px] text-white font-semibold truncate">End</span>
                </div>
                {/* Playhead */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/70 left-[15%]" />
              </div>
              {/* Scrubber */}
              <input
                type="range"
                min="0" max="100" defaultValue="15"
                className="w-full accent-violet-500 h-1"
              />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI Media Studio
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Generate AI photos and videos for your social media posts</p>
        </div>
        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#1e2130' }}>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Image className="w-4 h-4" /> Photos
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" /> Videos
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'photos' && <PhotoStudio onCreatePost={setCreatePostMedia} />}
      {activeTab === 'videos' && <VideoStudio onCreatePost={setCreatePostMedia} />}

      {/* Media Library */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-violet-400" /> Media Library
          </h2>
          <span className="badge bg-violet-500/10 text-violet-400">6 assets</span>
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
