import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import {
  Wand2, Image, Video, Megaphone, Edit3, History,
  Copy, Check, Download, Loader2, X, Clock, Sparkles
} from 'lucide-react'

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-3 ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
    {message}
    <button onClick={onClose}><X className="w-4 h-4" /></button>
  </div>
)

const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(null)
  const copy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }
  return { copied, copy }
}

const CopyButton = ({ text, id }) => {
  const { copied, copy } = useCopyToClipboard()
  return (
    <button
      onClick={() => copy(text, id)}
      className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/[0.06]"
      title="Copy"
    >
      {copied === id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

const SectionLabel = ({ children }) => (
  <label className="block text-sm font-semibold text-slate-300 mb-1.5">{children}</label>
)

const FieldInput = ({ className = '', ...props }) => (
  <input className={`input ${className}`} {...props} />
)

const FieldSelect = ({ children, className = '', ...props }) => (
  <select className={`input ${className}`} style={{ backgroundColor: '#1e2130', colorScheme: 'dark' }} {...props}>{children}</select>
)

const FieldTextarea = ({ className = '', ...props }) => (
  <textarea className={`input resize-none ${className}`} {...props} />
)

// Story Generator Tab
const StoryGenerator = ({ showToast }) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    platform: 'instagram', topic: '', brand: '', tone: 'professional', length: 100
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = async () => {
    if (!form.topic) { showToast('Please enter a topic', 'error'); return }
    setLoading(true)
    try {
      const res = await axios.post('/ai/story', form)
      setResult(res.data)
    } catch (err) {
      showToast('Failed to generate story', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Story Generator</h2>
        <p className="text-slate-500 text-sm">Create engaging social media posts powered by AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Platform</SectionLabel>
          <FieldSelect
            value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
          >
            {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].map(p => (
              <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </FieldSelect>
        </div>
        <div>
          <SectionLabel>Tone</SectionLabel>
          <FieldSelect
            value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}
          >
            {['professional', 'casual', 'funny', 'inspirational', 'educational'].map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </FieldSelect>
        </div>
      </div>

      <div>
        <SectionLabel>Topic *</SectionLabel>
        <FieldInput
          type="text" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
          placeholder="New product launch, industry news, tips..."
        />
      </div>

      <div>
        <SectionLabel>Brand / Company Name</SectionLabel>
        <FieldInput
          type="text" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
          placeholder="Your brand name"
        />
      </div>

      <div>
        <SectionLabel>Length: {form.length} words</SectionLabel>
        <input
          type="range" min="50" max="200" step="50" value={form.length}
          onChange={e => setForm(p => ({ ...p, length: parseInt(e.target.value) }))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          {[50, 100, 150, 200].map(v => <span key={v}>{v}</span>)}
        </div>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:transform-none"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'Generating...' : 'Generate Story'}
      </button>

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/[0.05] rounded-xl w-3/4" />
          <div className="h-4 bg-white/[0.05] rounded-xl w-full" />
          <div className="h-4 bg-white/[0.05] rounded-xl w-5/6" />
        </div>
      )}

      {result && !loading && (
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-indigo-400">Generated Story</span>
            <CopyButton text={result.text} id="story" />
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{result.text}</p>
          {result.hashtags && result.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {result.hashtags.map((tag, i) => (
                <span key={i} className="badge bg-indigo-500/10 text-indigo-400">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate('/compose', { state: { prefillContent: result.text } })}
              className="btn-primary flex-1 justify-center"
            >
              Use in Post
            </button>
            <button
              onClick={handleGenerate}
              className="btn-secondary flex-1 justify-center"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Image Creator Tab
const ImageCreator = ({ showToast }) => {
  const [form, setForm] = useState({ prompt: '', style: 'vivid', size: '1024x1024' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const PRESETS = [
    { label: 'Instagram Square', size: '1024x1024' },
    { label: 'Instagram Story', size: '1024x1792' },
    { label: 'Facebook Cover', size: '1792x1024' },
    { label: 'LinkedIn Banner', size: '1792x1024' },
    { label: 'Twitter Header', size: '1792x1024' }
  ]

  const handleGenerate = async () => {
    if (!form.prompt) { showToast('Please enter a prompt', 'error'); return }
    setLoading(true)
    try {
      const res = await axios.post('/ai/image', form)
      setResult(res.data)
    } catch (err) {
      showToast('Failed to generate image', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Image Creator</h2>
        <p className="text-slate-500 text-sm">Generate stunning visuals with DALL-E 3</p>
      </div>

      <div>
        <SectionLabel>Image Description *</SectionLabel>
        <FieldTextarea
          value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))}
          rows={4} placeholder="Describe the image you want..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Style</SectionLabel>
          <FieldSelect
            value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}
          >
            <option value="vivid">Vivid</option>
            <option value="natural">Natural</option>
          </FieldSelect>
        </div>
        <div>
          <SectionLabel>Size</SectionLabel>
          <FieldSelect
            value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
          >
            <option value="1024x1024">1024x1024 (Square)</option>
            <option value="1792x1024">1792x1024 (Landscape)</option>
            <option value="1024x1792">1024x1792 (Portrait)</option>
          </FieldSelect>
        </div>
      </div>

      <div>
        <SectionLabel>Platform Presets</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setForm(prev => ({ ...prev, size: p.size }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                form.size === p.size
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:transform-none"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {loading && (
        <div className="aspect-square rounded-2xl animate-pulse flex items-center justify-center shimmer-bg">
          <Sparkles className="w-8 h-8 text-slate-600" />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden border border-white/[0.07]">
            <img
              src={result.imageUrl} alt="Generated"
              className="w-full object-cover"
            />
          </div>
          {result.isMock && (
            <p className="text-xs text-amber-400 text-center font-medium">
              Demo mode — using Picsum placeholder. Add OPENAI_API_KEY for real DALL-E 3 generation.
            </p>
          )}
          <div className="flex gap-3">
            <a
              href={result.imageUrl} download="ai-generated-image.png" target="_blank" rel="noreferrer"
              className="btn-secondary flex-1 justify-center"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">
        Powered by DALL-E 3. Add OPENAI_API_KEY for real generation; demo mode uses Picsum placeholders.
      </p>
    </div>
  )
}

// Video Creator Tab
const VideoCreator = ({ showToast }) => {
  const [form, setForm] = useState({ topic: '', platform: 'YouTube', duration: '30', style: 'educational' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = async () => {
    if (!form.topic) { showToast('Please enter a topic', 'error'); return }
    setLoading(true)
    try {
      const res = await axios.post('/ai/video-script', form)
      setResult(res.data)
    } catch (err) {
      showToast('Failed to generate video script', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!result) return
    const content = `VIDEO SCRIPT\n\n${result.script}\n\nSCENE BREAKDOWN\n${result.scenes?.map(s => `${s.time}: ${s.description}\nVoiceover: ${s.voiceover}`).join('\n\n')}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'video-script.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Video Creator</h2>
        <p className="text-slate-500 text-sm">Generate structured video scripts with AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Platform</SectionLabel>
          <FieldSelect
            value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
          >
            {['YouTube', 'Instagram Reels', 'TikTok', 'Facebook'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FieldSelect>
        </div>
        <div>
          <SectionLabel>Duration</SectionLabel>
          <FieldSelect
            value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
          >
            {[['15', '15 seconds'], ['30', '30 seconds'], ['60', '60 seconds'], ['180', '3 minutes']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </FieldSelect>
        </div>
      </div>

      <div>
        <SectionLabel>Topic *</SectionLabel>
        <FieldInput
          type="text" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
          placeholder="Product demo, tutorial, brand story..."
        />
      </div>

      <div>
        <SectionLabel>Style</SectionLabel>
        <FieldSelect
          value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}
        >
          {['educational', 'entertaining', 'promotional', 'storytelling'].map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </FieldSelect>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:transform-none"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
        {loading ? 'Generating...' : 'Generate Script'}
      </button>

      {result && !loading && (
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-violet-400">Video Script</span>
              <CopyButton text={result.script} id="script" />
            </div>
            <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.script}</pre>
          </div>

          {result.scenes && result.scenes.length > 0 && (
            <div className="card-elevated p-5">
              <h3 className="text-sm font-semibold text-violet-400 mb-3">Scene Breakdown</h3>
              <div className="space-y-3">
                {result.scenes.map((scene, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.04] border-l-2 border-violet-500">
                    <span className="text-xs font-bold text-violet-400 whitespace-nowrap flex-shrink-0 pt-0.5">{scene.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 font-medium">{scene.description}</p>
                      <p className="text-xs text-slate-500 mt-1 italic">&quot;{scene.voiceover}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mock Video Editor */}
          <div className="card overflow-hidden">
            <div className="p-3 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Video Editor (Preview)</span>
              <span className="text-xs text-slate-600">Mock UI — Requires RunwayML/Sora integration</span>
            </div>
            <div className="bg-dark-900 aspect-video flex items-center justify-center" style={{ backgroundColor: '#090b0f' }}>
              <div className="text-center">
                <Video className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-600 text-sm">Video preview area</p>
              </div>
            </div>
            <div className="p-3 border-t border-white/[0.07]" style={{ backgroundColor: '#1e2130' }}>
              <div className="h-8 bg-white/[0.08] rounded-lg mb-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-violet-500/30 border-r-2 border-violet-500" />
              </div>
              <div className="flex gap-2">
                {['Add Clip', 'Add Text', 'Add Music'].map(label => (
                  <button key={label} className="btn-secondary text-xs px-3 py-1.5">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Video generation requires RunwayML or Sora API. Script generation is live.
          </p>

          <button
            onClick={handleExport}
            className="btn-secondary w-full justify-center"
          >
            <Download className="w-4 h-4" /> Export Script
          </button>
        </div>
      )}
    </div>
  )
}

// Ad Copy Tab
const AdCopyTab = ({ showToast }) => {
  const [form, setForm] = useState({ product: '', audience: '', objective: 'awareness', platform: 'facebook', tone: 'professional' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { copied, copy } = useCopyToClipboard()

  const handleGenerate = async () => {
    if (!form.product) { showToast('Please enter a product/service', 'error'); return }
    setLoading(true)
    try {
      const res = await axios.post('/ads/ai-copy', form)
      setResult(res.data)
    } catch (err) {
      showToast('Failed to generate ad copy', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Ad Copy Generator</h2>
        <p className="text-slate-500 text-sm">Generate high-converting ad copy with AI</p>
      </div>

      <div className="space-y-4">
        <div>
          <SectionLabel>Product / Service *</SectionLabel>
          <FieldInput
            type="text" value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
            placeholder="SaaS tool, physical product, service..."
          />
        </div>
        <div>
          <SectionLabel>Target Audience</SectionLabel>
          <FieldInput
            type="text" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
            placeholder="Small business owners, fitness enthusiasts..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <SectionLabel>Objective</SectionLabel>
            <FieldSelect
              value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}
            >
              {['awareness', 'traffic', 'leads', 'conversions', 'sales'].map(o => (
                <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <SectionLabel>Platform</SectionLabel>
            <FieldSelect
              value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
            >
              {['facebook', 'google', 'linkedin', 'tiktok', 'twitter'].map(p => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <SectionLabel>Tone</SectionLabel>
            <FieldSelect
              value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}
            >
              {['professional', 'casual', 'urgent', 'friendly', 'bold'].map(t => (
                <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </FieldSelect>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:transform-none"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5" />}
        {loading ? 'Generating...' : 'Generate Ad Copy'}
      </button>

      {result && !loading && (
        <div className="space-y-3">
          {[
            { label: 'Headline', value: result.headline, id: 'headline' },
            { label: 'Body', value: result.body, id: 'body' },
            { label: 'Call to Action', value: result.callToAction, id: 'cta' }
          ].map(field => (
            <div key={field.id} className="card-elevated p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">{field.label}</span>
                <button onClick={() => copy(field.value, field.id)} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/[0.06]">
                  {copied === field.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-300 text-sm font-medium">{field.value}</p>
            </div>
          ))}
          <button
            onClick={() => showToast('Use the Ad Manager to create a campaign with this copy!', 'success')}
            className="btn-primary w-full justify-center"
          >
            Use in Campaign
          </button>
        </div>
      )}
    </div>
  )
}

// Edit Content Tab
const EditContentTab = ({ showToast }) => {
  const [content, setContent] = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [accepted, setAccepted] = useState(false)

  const QUICK_INSTRUCTIONS = [
    'Make it more engaging',
    'Shorten to 50 words',
    'Add hashtags',
    'Professional tone',
    'Casual tone',
    'Add emojis'
  ]

  const handleEdit = async () => {
    if (!content || !instruction) { showToast('Please provide content and instruction', 'error'); return }
    setLoading(true)
    setResult(null)
    setAccepted(false)
    try {
      const res = await axios.post('/ai/edit', { content, instruction })
      setResult(res.data.editedContent)
    } catch (err) {
      showToast('Failed to edit content', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Edit Content</h2>
        <p className="text-slate-500 text-sm">Polish and refine your content with AI assistance</p>
      </div>

      <div>
        <SectionLabel>Original Content</SectionLabel>
        <FieldTextarea
          value={content} onChange={e => setContent(e.target.value)}
          rows={5} placeholder="Paste your content here..."
        />
      </div>

      <div>
        <SectionLabel>Instruction</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {QUICK_INSTRUCTIONS.map(qi => (
            <button
              key={qi} onClick={() => setInstruction(qi)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                instruction === qi
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'
              }`}
            >
              {qi}
            </button>
          ))}
        </div>
        <FieldInput
          type="text" value={instruction} onChange={e => setInstruction(e.target.value)}
          placeholder="Custom instruction..."
        />
      </div>

      <button
        onClick={handleEdit} disabled={loading}
        className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:transform-none"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit3 className="w-5 h-5" />}
        {loading ? 'Editing...' : 'Edit with AI'}
      </button>

      {result && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card-elevated p-4 border-l-4 border-red-500/40">
              <p className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Before</p>
              <p className="text-slate-400 text-sm whitespace-pre-wrap">{content}</p>
            </div>
            <div className="card-elevated p-4 border-l-4 border-emerald-500/40">
              <p className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">After</p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{result}</p>
            </div>
          </div>
          {!accepted ? (
            <div className="flex gap-3">
              <button
                onClick={() => { setContent(result); setResult(null); setAccepted(true); showToast('Content updated!') }}
                className="btn-primary flex-1 justify-center"
              >
                Accept
              </button>
              <button
                onClick={() => setResult(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Reject
              </button>
            </div>
          ) : (
            <p className="text-center text-emerald-400 text-sm font-semibold">Content accepted and updated!</p>
          )}
        </div>
      )}
    </div>
  )
}

// History Tab
const HistoryTab = ({ showToast }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter ? { type: filter } : {}
      const res = await axios.get('/ai/history', { params })
      setHistory(res.data)
    } catch (err) {
      showToast('Failed to load history', 'error')
    } finally {
      setLoading(false)
    }
  }, [filter, showToast])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const typeStyles = {
    story: 'badge bg-violet-500/10 text-violet-400',
    image: 'badge bg-pink-500/10 text-pink-400',
    video_script: 'badge bg-blue-500/10 text-blue-400',
    ad_copy: 'badge bg-orange-500/10 text-orange-400'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">Generation History</h2>
          <p className="text-slate-500 text-sm">Your past AI generations</p>
        </div>
        <div className="flex gap-1.5 rounded-xl p-1" style={{ backgroundColor: '#1e2130' }}>
          {['', 'story', 'image', 'video_script', 'ad_copy'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === type
                  ? 'bg-white/[0.1] text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {type === '' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />)}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 card">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No generations yet. Start creating!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(item => (
            <div key={item.id} className="card p-4 flex items-start gap-4 hover:shadow-card-hover transition-all">
              <span className={typeStyles[item.type] || 'badge bg-white/[0.05] text-slate-400'}>
                {item.type.replace('_', ' ')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-sm truncate font-medium">{item.prompt}</p>
                {item.platform && <p className="text-slate-500 text-xs mt-0.5">Platform: {item.platform}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {item.usedInPost && (
                  <span className="badge bg-emerald-500/10 text-emerald-400">Used</span>
                )}
                <span className="text-slate-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main AIStudio Component
const AIStudio = () => {
  const [activeTab, setActiveTab] = useState('story')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const tabs = [
    { key: 'story', label: 'Story Generator', icon: Wand2 },
    { key: 'image', label: 'Image Creator', icon: Image },
    { key: 'video', label: 'Video Creator', icon: Video },
    { key: 'adcopy', label: 'Ad Copy', icon: Megaphone },
    { key: 'edit', label: 'Edit Content', icon: Edit3 },
    { key: 'history', label: 'History', icon: History }
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'story': return <StoryGenerator showToast={showToast} />
      case 'image': return <ImageCreator showToast={showToast} />
      case 'video': return <VideoCreator showToast={showToast} />
      case 'adcopy': return <AdCopyTab showToast={showToast} />
      case 'edit': return <EditContentTab showToast={showToast} />
      case 'history': return <HistoryTab showToast={showToast} />
      default: return null
    }
  }

  return (
    <div className="flex h-full gap-5 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Vertical tab nav */}
      <div className="w-52 flex-shrink-0 card p-3 space-y-1 self-start">
        <div className="px-3 py-3 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-100 font-bold text-sm">AI Studio</span>
          </div>
        </div>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === key
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl">
          {renderTab()}
        </div>
      </div>
    </div>
  )
}

export default AIStudio
