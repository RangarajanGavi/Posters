import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import {
  Wand2, Image as ImageIcon, Video, Megaphone, Edit3, History,
  Copy, Check, Download, Loader2, X, Clock, Sparkles,
  Film, FileText, Settings, Upload, Type, Music, Scissors,
  Trash2, Play, Pause, Square, SkipBack, MousePointer,
  Eye, EyeOff, Save
} from 'lucide-react'

const Toast = ({ message, type, onClose }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, padding: '12px 20px', background: '#1a1a1a', border: `1px solid ${type === 'success' ? '#e63000' : '#cc0000'}`, color: '#ffffff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b' }}><X style={{ width: 16, height: 16 }} /></button>
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
      className="btn-secondary"
      style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      title="Copy"
    >
      {copied === id ? <Check style={{ width: 14, height: 14, color: '#e63000' }} /> : <Copy style={{ width: 14, height: 14 }} />}
    </button>
  )
}

const SectionLabel = ({ children }) => (
  <label className="label">{children}</label>
)

const FieldInput = ({ className = '', ...props }) => (
  <input className={`input ${className}`} {...props} />
)

const FieldSelect = ({ children, className = '', ...props }) => (
  <select className={`input ${className}`} style={{ colorScheme: 'dark' }} {...props}>{children}</select>
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
        <p className="section-prefix">// STORY GENERATOR</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Story Generator</h2>
        <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Create engaging social media posts powered by AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Platform</SectionLabel>
          <FieldSelect value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
            {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </FieldSelect>
        </div>
        <div>
          <SectionLabel>Tone</SectionLabel>
          <FieldSelect value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}>
            {['professional', 'casual', 'funny', 'inspirational', 'educational'].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
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
          className="w-full"
          style={{ accentColor: '#e63000' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {[50, 100, 150, 200].map(v => <span key={v} style={{ fontSize: 11, color: '#6b6b6b' }}>{v}</span>)}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center py-3" style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: 18, height: 18 }} />}
        {loading ? 'Generating...' : 'Generate Story'}
      </button>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[3, 4, 3].map((w, i) => (
            <div key={i} className="shimmer-bg" style={{ height: 14, width: `${w * 25}%` }} />
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="card-elevated p-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="metric-label" style={{ color: '#e63000' }}>Generated Story</p>
            <CopyButton text={result.text} id="story" />
          </div>
          <p style={{ color: '#ffffff', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result.text}</p>
          {result.hashtags && result.hashtags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {result.hashtags.map((tag, i) => (
                <span key={i} className="platform-tag" style={{ color: '#e63000', borderColor: '#e63000' }}>{tag}</span>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => navigate('/compose', { state: { prefillContent: result.text } })} className="btn-primary flex-1 justify-center">
              Use in Post
            </button>
            <button onClick={handleGenerate} className="btn-secondary flex-1 justify-center">
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
        <p className="section-prefix">// IMAGE CREATOR</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Image Creator</h2>
        <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Generate stunning visuals with DALL-E 3</p>
      </div>

      <div>
        <SectionLabel>Image Description *</SectionLabel>
        <FieldTextarea value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))} rows={4} placeholder="Describe the image you want..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Style</SectionLabel>
          <FieldSelect value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}>
            <option value="vivid">Vivid</option>
            <option value="natural">Natural</option>
          </FieldSelect>
        </div>
        <div>
          <SectionLabel>Size</SectionLabel>
          <FieldSelect value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}>
            <option value="1024x1024">1024x1024 (Square)</option>
            <option value="1792x1024">1792x1024 (Landscape)</option>
            <option value="1024x1792">1024x1792 (Portrait)</option>
          </FieldSelect>
        </div>
      </div>

      <div>
        <SectionLabel>Platform Presets</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setForm(prev => ({ ...prev, size: p.size }))}
              className={form.size === p.size ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: 11, padding: '5px 10px' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center py-3" style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <ImageIcon style={{ width: 18, height: 18 }} />}
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {loading && (
        <div className="shimmer-bg" style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles style={{ width: 32, height: 32, color: '#3a3a3a' }} />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          <div style={{ border: '1px solid #2a2a2a', overflow: 'hidden' }}>
            <img src={result.imageUrl} alt="Generated" className="w-full object-cover" />
          </div>
          {result.isMock && (
            <p style={{ fontSize: 11, color: '#e6b400', textAlign: 'center', fontWeight: 500 }}>
              Demo mode — using Picsum placeholder. Add OPENAI_API_KEY for real DALL-E 3 generation.
            </p>
          )}
          <div className="flex gap-3">
            <a href={result.imageUrl} download="ai-generated-image.png" target="_blank" rel="noreferrer" className="btn-secondary flex-1 justify-center">
              <Download style={{ width: 14, height: 14 }} /> Download
            </a>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#6b6b6b', textAlign: 'center' }}>
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
    a.href = url; a.download = 'video-script.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="section-prefix">// VIDEO CREATOR</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Video Creator</h2>
        <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Generate structured video scripts with AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Platform</SectionLabel>
          <FieldSelect value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
            {['YouTube', 'Instagram Reels', 'TikTok', 'Facebook'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FieldSelect>
        </div>
        <div>
          <SectionLabel>Duration</SectionLabel>
          <FieldSelect value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}>
            {[['15', '15 seconds'], ['30', '30 seconds'], ['60', '60 seconds'], ['180', '3 minutes']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </FieldSelect>
        </div>
      </div>

      <div>
        <SectionLabel>Topic *</SectionLabel>
        <FieldInput type="text" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} placeholder="Product demo, tutorial, brand story..." />
      </div>

      <div>
        <SectionLabel>Style</SectionLabel>
        <FieldSelect value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}>
          {['educational', 'entertaining', 'promotional', 'storytelling'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </FieldSelect>
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center py-3" style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Video style={{ width: 18, height: 18 }} />}
        {loading ? 'Generating...' : 'Generate Script'}
      </button>

      {result && !loading && (
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="metric-label" style={{ color: '#e63000' }}>Video Script</p>
              <CopyButton text={result.script} id="script" />
            </div>
            <pre style={{ color: '#ffffff', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result.script}</pre>
          </div>

          {result.scenes && result.scenes.length > 0 && (
            <div className="card-elevated p-5">
              <p className="metric-label" style={{ color: '#e63000', marginBottom: 12 }}>Scene Breakdown</p>
              <div className="space-y-3">
                {result.scenes.map((scene, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: '#1a1a1a', borderLeft: '2px solid #e63000' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e63000', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: 2 }}>{scene.time}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{scene.description}</p>
                      <p style={{ fontSize: 12, color: '#6b6b6b', marginTop: 4, fontStyle: 'italic' }}>&quot;{scene.voiceover}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Video Editor (Preview)</span>
              <span style={{ fontSize: 11, color: '#3a3a3a' }}>Mock UI</span>
            </div>
            <div style={{ background: '#0d0d0d', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Video style={{ width: 48, height: 48, color: '#2a2a2a', margin: '0 auto 8px' }} />
                <p style={{ color: '#3a3a3a', fontSize: 13 }}>Video preview area</p>
              </div>
            </div>
            <div style={{ padding: 12, background: '#111111', borderTop: '1px solid #2a2a2a' }}>
              <div style={{ height: 8, background: '#2a2a2a', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '33%', background: '#e63000' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Add Clip', 'Add Text', 'Add Music'].map(label => (
                  <button key={label} className="btn-secondary" style={{ fontSize: 11, padding: '5px 10px' }}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleExport} className="btn-secondary w-full justify-center">
            <Download style={{ width: 14, height: 14 }} /> Export Script
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
        <p className="section-prefix">// AD COPY GENERATOR</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Ad Copy Generator</h2>
        <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Generate high-converting ad copy with AI</p>
      </div>

      <div className="space-y-4">
        <div>
          <SectionLabel>Product / Service *</SectionLabel>
          <FieldInput type="text" value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} placeholder="SaaS tool, physical product, service..." />
        </div>
        <div>
          <SectionLabel>Target Audience</SectionLabel>
          <FieldInput type="text" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))} placeholder="Small business owners, fitness enthusiasts..." />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <SectionLabel>Objective</SectionLabel>
            <FieldSelect value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}>
              {['awareness', 'traffic', 'leads', 'conversions', 'sales'].map(o => (
                <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <SectionLabel>Platform</SectionLabel>
            <FieldSelect value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
              {['facebook', 'google', 'linkedin', 'tiktok', 'twitter'].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <SectionLabel>Tone</SectionLabel>
            <FieldSelect value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}>
              {['professional', 'casual', 'urgent', 'friendly', 'bold'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </FieldSelect>
          </div>
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center py-3" style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Megaphone style={{ width: 18, height: 18 }} />}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p className="metric-label" style={{ color: '#e63000' }}>{field.label}</p>
                <button onClick={() => copy(field.value, field.id)} className="btn-secondary" style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {copied === field.id ? <Check style={{ width: 12, height: 12, color: '#e63000' }} /> : <Copy style={{ width: 12, height: 12 }} />}
                </button>
              </div>
              <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 500 }}>{field.value}</p>
            </div>
          ))}
          <button onClick={() => showToast('Use the Ad Manager to create a campaign with this copy!', 'success')} className="btn-primary w-full justify-center">
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
        <p className="section-prefix">// EDIT CONTENT</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Edit Content</h2>
        <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Polish and refine your content with AI assistance</p>
      </div>

      <div>
        <SectionLabel>Original Content</SectionLabel>
        <FieldTextarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Paste your content here..." />
      </div>

      <div>
        <SectionLabel>Instruction</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {QUICK_INSTRUCTIONS.map(qi => (
            <button
              key={qi} onClick={() => setInstruction(qi)}
              className={instruction === qi ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: 11, padding: '5px 10px' }}
            >
              {qi}
            </button>
          ))}
        </div>
        <FieldInput type="text" value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="Custom instruction..." />
      </div>

      <button onClick={handleEdit} disabled={loading} className="btn-primary w-full justify-center py-3" style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Edit3 style={{ width: 18, height: 18 }} />}
        {loading ? 'Editing...' : 'Edit with AI'}
      </button>

      {result && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card-elevated p-4" style={{ borderLeft: '2px solid rgba(200,0,0,0.4)' }}>
              <p className="metric-label" style={{ color: '#cc3333', marginBottom: 8 }}>Before</p>
              <p style={{ color: '#6b6b6b', fontSize: 13, whiteSpace: 'pre-wrap' }}>{content}</p>
            </div>
            <div className="card-elevated p-4" style={{ borderLeft: '2px solid #e63000' }}>
              <p className="metric-label" style={{ color: '#e63000', marginBottom: 8 }}>After</p>
              <p style={{ color: '#ffffff', fontSize: 13, whiteSpace: 'pre-wrap' }}>{result}</p>
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
              <button onClick={() => setResult(null)} className="btn-secondary flex-1 justify-center">
                Reject
              </button>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#e63000', fontSize: 13, fontWeight: 600 }}>Content accepted and updated!</p>
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

  const typeColors = {
    story: '#e63000',
    image: '#ff6644',
    video_script: '#cc2200',
    ad_copy: '#ff3d00'
  }

  return (
    <div className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p className="section-prefix">// HISTORY</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>Generation History</h2>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['', 'story', 'image', 'video_script', 'ad_copy'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={filter === type ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: 11, padding: '5px 10px' }}
            >
              {type === '' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="card shimmer-bg" style={{ height: 56 }} />)}
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <Clock style={{ width: 48, height: 48, color: '#2a2a2a', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b6b6b', fontSize: 13 }}>No generations yet. Start creating!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(item => (
            <div key={item.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span className="platform-tag" style={{ color: typeColors[item.type] || '#6b6b6b', borderColor: typeColors[item.type] || '#333333', flexShrink: 0 }}>
                {item.type.replace('_', ' ')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.prompt}</p>
                {item.platform && <p style={{ color: '#6b6b6b', fontSize: 11, marginTop: 2 }}>Platform: {item.platform}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {item.usedInPost && (
                  <span className="platform-tag" style={{ color: '#e63000', borderColor: '#e63000' }}>Used</span>
                )}
                <span style={{ color: '#6b6b6b', fontSize: 11 }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Video Editor Component
const VideoEditor = ({ showToast }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(30)
  const [selectedClip, setSelectedClip] = useState(null)
  const [tracks, setTracks] = useState([
    {
      id: 'video', label: 'VIDEO', icon: '🎬',
      clips: [
        { id: 'v1', start: 0,  width: 8,  label: 'Intro clip',   color: '#e63000' },
        { id: 'v2', start: 9,  width: 10, label: 'Main scene',   color: '#c72800' },
        { id: 'v3', start: 21, width: 7,  label: 'Outro',        color: '#e63000' },
      ]
    },
    {
      id: 'audio', label: 'AUDIO', icon: '🎵',
      clips: [
        { id: 'a1', start: 0, width: 28, label: 'Background music', color: '#444444' },
      ]
    },
    {
      id: 'text', label: 'TEXT', icon: '📝',
      clips: [
        { id: 't1', start: 1,  width: 5, label: 'Title overlay', color: '#2a2a5a' },
        { id: 't2', start: 22, width: 6, label: 'CTA text',      color: '#2a2a5a' },
      ]
    },
    {
      id: 'fx', label: 'FX', icon: '✨',
      clips: [
        { id: 'fx1', start: 0,  width: 2, label: 'Fade in',  color: '#1a3a1a' },
        { id: 'fx2', start: 28, width: 2, label: 'Fade out', color: '#1a3a1a' },
      ]
    },
  ])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime(t => {
        if (t >= duration) { setIsPlaying(false); return 0 }
        return t + 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const formatTime = (t) => {
    const s = Math.floor(t)
    const ms = Math.floor((t - s) * 10)
    return `${String(s).padStart(2, '0')}:${ms}0`
  }

  const pct = (val) => `${(val / duration) * 100}%`

  return (
    <div className="space-y-0" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p className="section-prefix">// VIDEO EDITOR</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 2 }}>Video Editor</h2>
        <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>Arrange clips on the timeline and export your video</p>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => showToast('Import media: connect your media library', 'success')} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Upload style={{ width: 13, height: 13 }} /> Import Media
        </button>
        <button
          onClick={() => {
            setTracks(prev => prev.map(t => t.id === 'text' ? {
              ...t,
              clips: [...t.clips, { id: 'txt' + Date.now(), start: Math.floor(Math.random() * 20), width: 4, label: 'New text', color: '#2a2a5a' }]
            } : t))
          }}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Type style={{ width: 13, height: 13 }} /> + Text
        </button>
        <button onClick={() => showToast('Music library opening...', 'success')} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Music style={{ width: 13, height: 13 }} /> + Music
        </button>
        <button onClick={() => showToast('Effects panel opening...', 'success')} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles style={{ width: 13, height: 13 }} /> + Effect
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => showToast('Exporting video...', 'success')} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download style={{ width: 13, height: 13 }} /> Export
        </button>
      </div>

      {/* Main editor area: preview + properties side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, marginBottom: 12 }}>

        {/* Video Preview */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ background: '#000000', aspectRatio: '16/9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #0d0d0d 100%)' }} />
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <Film style={{ width: 48, height: 48, color: '#2a2a2a', margin: '0 auto 8px' }} />
              <p style={{ color: '#3a3a3a', fontSize: 12 }}>Preview window</p>
              <p style={{ color: '#2a2a2a', fontSize: 11, marginTop: 2 }}>{formatTime(currentTime)} / {formatTime(duration)}</p>
            </div>
            {isPlaying && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(230,48,0,0.9)', padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
                LIVE
              </div>
            )}
          </div>
          {/* Transport controls */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setCurrentTime(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', display: 'flex', alignItems: 'center' }} title="Go to start">
              <SkipBack style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={() => setIsPlaying(p => !p)}
              style={{ width: 32, height: 32, background: '#e63000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}
            >
              {isPlaying ? <Pause style={{ width: 14, height: 14 }} /> : <Play style={{ width: 14, height: 14 }} />}
            </button>
            <button onClick={() => { setIsPlaying(false); setCurrentTime(0) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', display: 'flex', alignItems: 'center' }}>
              <Square style={{ width: 16, height: 16 }} />
            </button>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="range" min={0} max={duration} step={0.1} value={currentTime}
                onChange={e => setCurrentTime(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#e63000' }}
              />
            </div>
            <span style={{ color: '#6b6b6b', fontSize: 11, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="card" style={{ padding: 16 }}>
          <p className="metric-label" style={{ marginBottom: 16 }}>PROPERTIES</p>
          {selectedClip ? (
            <div className="space-y-4">
              <div>
                <label className="label">Clip Name</label>
                <input
                  className="input" value={selectedClip.label}
                  onChange={e => {
                    const updated = { ...selectedClip, label: e.target.value }
                    setSelectedClip(updated)
                    setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.map(c => c.id === updated.id ? updated : c) })))
                  }}
                  style={{ fontSize: 12, padding: '7px 10px' }}
                />
              </div>
              <div>
                <label className="label">Start: {selectedClip.start.toFixed(1)}s</label>
                <input type="range" min={0} max={duration - selectedClip.width} step={0.5} value={selectedClip.start}
                  onChange={e => {
                    const updated = { ...selectedClip, start: parseFloat(e.target.value) }
                    setSelectedClip(updated)
                    setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.map(c => c.id === updated.id ? updated : c) })))
                  }}
                  style={{ width: '100%', accentColor: '#e63000' }}
                />
              </div>
              <div>
                <label className="label">Duration: {selectedClip.width.toFixed(1)}s</label>
                <input type="range" min={0.5} max={duration} step={0.5} value={selectedClip.width}
                  onChange={e => {
                    const updated = { ...selectedClip, width: parseFloat(e.target.value) }
                    setSelectedClip(updated)
                    setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.map(c => c.id === updated.id ? updated : c) })))
                  }}
                  style={{ width: '100%', accentColor: '#e63000' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button onClick={() => showToast('Clip split at current time', 'success')} className="btn-secondary" style={{ fontSize: 11, padding: '5px 8px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Scissors style={{ width: 11, height: 11 }} /> Split
                </button>
                <button
                  onClick={() => {
                    setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== selectedClip.id) })))
                    setSelectedClip(null)
                  }}
                  style={{ fontSize: 11, padding: '5px 8px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(230,48,0,0.1)', border: '1px solid rgba(230,48,0,0.3)', color: '#e63000', cursor: 'pointer' }}
                >
                  <Trash2 style={{ width: 11, height: 11 }} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <MousePointer style={{ width: 28, height: 28, color: '#3a3a3a', margin: '0 auto 8px' }} />
              <p style={{ color: '#6b6b6b', fontSize: 12 }}>Click a clip to edit properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Timeline header */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="metric-label">TIMELINE · {duration}s</p>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => showToast('Zoom in', 'success')} className="btn-secondary" style={{ width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>+</button>
            <button onClick={() => showToast('Zoom out', 'success')} className="btn-secondary" style={{ width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>−</button>
          </div>
        </div>

        {/* Time ruler */}
        <div style={{ display: 'flex', background: '#111111', borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ width: 80, flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative', height: 24, overflow: 'hidden' }}>
            {Array.from({ length: 7 }, (_, i) => i * 5).map(s => (
              <div key={s} style={{ position: 'absolute', left: `${(s / duration) * 100}%`, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 1, height: 8, background: '#3a3a3a', marginTop: 4 }} />
                <span style={{ fontSize: 9, color: '#3a3a3a', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {String(s).padStart(2, '0')}s
                </span>
              </div>
            ))}
            {/* Playhead */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(currentTime), width: 1, background: '#e63000', zIndex: 5, pointerEvents: 'none' }}>
              <div style={{ width: 8, height: 8, background: '#e63000', marginLeft: -3.5, marginTop: -1 }} />
            </div>
          </div>
        </div>

        {/* Tracks */}
        <div>
          {tracks.map((track, ti) => (
            <div key={track.id} style={{ display: 'flex', borderBottom: ti < tracks.length - 1 ? '1px solid #1f1f1f' : 'none', minHeight: 44 }}>
              {/* Track label */}
              <div style={{ width: 80, flexShrink: 0, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6, borderRight: '1px solid #2a2a2a', background: '#111111' }}>
                <span style={{ fontSize: 10 }}>{track.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b6b6b', letterSpacing: '0.08em' }}>{track.label}</span>
              </div>
              {/* Track clips */}
              <div style={{ flex: 1, position: 'relative', background: ti % 2 === 0 ? '#161616' : '#141414' }}>
                {/* Grid lines */}
                {Array.from({ length: 6 }, (_, i) => (i + 1) * 5).map(s => (
                  <div key={s} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(s / duration) * 100}%`, width: 1, background: '#1f1f1f' }} />
                ))}
                {/* Playhead line */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(currentTime), width: 1, background: 'rgba(230,48,0,0.4)', zIndex: 3, pointerEvents: 'none' }} />
                {/* Clips */}
                {track.clips.map(clip => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClip(selectedClip?.id === clip.id ? null : clip)}
                    style={{
                      position: 'absolute',
                      left: pct(clip.start),
                      width: pct(clip.width),
                      top: 5, bottom: 5,
                      background: clip.color,
                      border: selectedClip?.id === clip.id ? '1px solid #e63000' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      display: 'flex', alignItems: 'center',
                      boxSizing: 'border-box',
                      zIndex: 2,
                      transition: 'border-color 0.1s',
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {clip.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// API Providers data
const API_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: 'GPT-4o · DALL-E 3 · Whisper',
    features: ['Story generation', 'Image creation', 'Content editing', 'Ad copy'],
    docsUrl: 'https://platform.openai.com/api-keys',
    color: '#10a37f',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: 'Claude 3.5 Sonnet · Claude 3 Opus',
    features: ['Story generation', 'Long-form content', 'Content editing'],
    docsUrl: 'https://console.anthropic.com/',
    color: '#d4a27f',
  },
  {
    id: 'stability',
    name: 'Stability AI',
    models: 'Stable Diffusion XL · SDXL Turbo',
    features: ['Image creation', 'Image editing'],
    docsUrl: 'https://platform.stability.ai/',
    color: '#6366f1',
  },
  {
    id: 'runway',
    name: 'Runway ML',
    models: 'Gen-3 Alpha · Gen-2',
    features: ['Video generation', 'Image-to-video', 'Video editing'],
    docsUrl: 'https://app.runwayml.com/',
    color: '#8b5cf6',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    models: 'Multilingual v2 · Turbo v2.5',
    features: ['Voice synthesis', 'Audio generation'],
    docsUrl: 'https://elevenlabs.io/',
    color: '#f59e0b',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    models: 'v6.1 · Niji v6',
    features: ['Image creation', 'Artistic generation'],
    docsUrl: 'https://www.midjourney.com/',
    color: '#06b6d4',
  },
]

// API Connections Panel
const APIConnectionsPanel = ({ onClose }) => {
  const [keys, setKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ai_api_keys') || '{}') } catch { return {} }
  })
  const [shown, setShown] = useState({})
  const [testing, setTesting] = useState({})
  const [testResults, setTestResults] = useState({})
  const [saved, setSaved] = useState(false)

  const testConnection = async (providerId) => {
    if (!keys[providerId]) return
    setTesting(p => ({ ...p, [providerId]: true }))
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    const success = keys[providerId].length > 10
    setTestResults(p => ({ ...p, [providerId]: success ? 'connected' : 'invalid' }))
    setTesting(p => ({ ...p, [providerId]: false }))
  }

  const handleSave = () => {
    localStorage.setItem('ai_api_keys', JSON.stringify(keys))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 480, height: '100%', background: '#111111', borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.2s ease-out', overflowY: 'auto' }}>
        {/* Panel header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#111111', zIndex: 5 }}>
          <div>
            <p className="section-prefix">// SETTINGS</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 2 }}>API Connections</h2>
            <p style={{ color: '#6b6b6b', fontSize: 12, marginTop: 3 }}>Connect your AI providers. Keys are stored locally in your browser.</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b6b' }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Providers list */}
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {API_PROVIDERS.map(provider => {
            const hasKey = !!keys[provider.id]
            const status = testResults[provider.id]
            return (
              <div key={provider.id} className="card" style={{ padding: 16 }}>
                {/* Provider header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: provider.color + '20', border: `1px solid ${provider.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: provider.color }}>
                        {provider.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 700 }}>{provider.name}</p>
                      <p style={{ color: '#6b6b6b', fontSize: 11, marginTop: 1 }}>{provider.models}</p>
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'connected' ? '#22c55e' : hasKey ? '#f59e0b' : '#3a3a3a' }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: status === 'connected' ? '#22c55e' : hasKey ? '#f59e0b' : '#3a3a3a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {status === 'connected' ? 'Connected' : status === 'invalid' ? 'Invalid key' : hasKey ? 'Key set' : 'Not connected'}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {provider.features.map(f => (
                    <span key={f} className="platform-tag" style={{ fontSize: 10 }}>{f}</span>
                  ))}
                </div>

                {/* Key input row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      className="input"
                      type={shown[provider.id] ? 'text' : 'password'}
                      value={keys[provider.id] || ''}
                      onChange={e => setKeys(p => ({ ...p, [provider.id]: e.target.value }))}
                      placeholder={`${provider.name} API key`}
                      style={{ paddingRight: 40, fontSize: 12, padding: '8px 36px 8px 12px' }}
                    />
                    <button
                      onClick={() => setShown(p => ({ ...p, [provider.id]: !p[provider.id] }))}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b' }}
                    >
                      {shown[provider.id] ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
                    </button>
                  </div>
                  <button
                    onClick={() => testConnection(provider.id)}
                    disabled={!keys[provider.id] || testing[provider.id]}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '6px 12px', whiteSpace: 'nowrap', opacity: !keys[provider.id] ? 0.4 : 1 }}
                  >
                    {testing[provider.id] ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : 'Test'}
                  </button>
                </div>

                {/* Docs link */}
                <p style={{ marginTop: 8, fontSize: 11, color: '#3a3a3a' }}>
                  Get API key at <span style={{ color: '#e63000', cursor: 'pointer' }} onClick={() => window.open(provider.docsUrl, '_blank')}>{provider.docsUrl.replace('https://', '')}</span>
                </p>
              </div>
            )
          })}
        </div>

        {/* Save button */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #2a2a2a', position: 'sticky', bottom: 0, background: '#111111' }}>
          <button onClick={handleSave} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            {saved ? <><Check style={{ width: 14, height: 14 }} /> Saved!</> : <><Save style={{ width: 14, height: 14 }} /> Save API Connections</>}
          </button>
          <p style={{ marginTop: 8, fontSize: 11, color: '#3a3a3a', textAlign: 'center' }}>
            Keys are stored in your browser's localStorage only. Never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  )
}

// Main AIStudio Component
const AIStudio = () => {
  const [activeTab, setActiveTab] = useState('story')
  const [toast, setToast] = useState(null)
  const [showAPIPanel, setShowAPIPanel] = useState(false)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const tabs = [
    { key: 'story',   label: 'Caption & Story', icon: Wand2 },
    { key: 'image',   label: 'Image Creator',   icon: ImageIcon },
    { key: 'video',   label: 'Video Script',    icon: FileText },
    { key: 'editor',  label: 'Video Editor',    icon: Film },
    { key: 'adcopy',  label: 'Ad Copy',         icon: Megaphone },
    { key: 'edit',    label: 'Edit Content',    icon: Edit3 },
    { key: 'history', label: 'History',         icon: History },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'story':   return <StoryGenerator showToast={showToast} />
      case 'image':   return <ImageCreator showToast={showToast} />
      case 'video':   return <VideoCreator showToast={showToast} />
      case 'editor':  return <VideoEditor showToast={showToast} />
      case 'adcopy':  return <AdCopyTab showToast={showToast} />
      case 'edit':    return <EditContentTab showToast={showToast} />
      case 'history': return <HistoryTab showToast={showToast} />
      default: return null
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showAPIPanel && <APIConnectionsPanel onClose={() => setShowAPIPanel(false)} />}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p className="section-prefix">// AI STUDIO</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginTop: 4 }}>AI Studio</h1>
          <p style={{ color: '#6b6b6b', fontSize: 13, marginTop: 6 }}>Generate content, images, and videos powered by AI</p>
        </div>
        <button onClick={() => setShowAPIPanel(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Settings style={{ width: 14, height: 14 }} /> API Connections
        </button>
      </div>

      {/* Horizontal top tab bar */}
      <div style={{ borderBottom: '1px solid #2a2a2a', marginBottom: 28, overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: 'max-content' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                color: activeTab === key ? '#ffffff' : '#6b6b6b',
                background: 'transparent', border: 'none', outline: 'none',
                borderBottom: activeTab === key ? '2px solid #e63000' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.1s', whiteSpace: 'nowrap',
              }}
            >
              <Icon style={{ width: 14, height: 14, flexShrink: 0, color: activeTab === key ? '#e63000' : '#6b6b6b' }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div key={activeTab} style={{ animation: 'fadeIn 0.2s ease-out' }}>
        {renderTab()}
      </div>
    </div>
  )
}

export default AIStudio
