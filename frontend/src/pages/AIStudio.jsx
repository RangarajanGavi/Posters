import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import {
  Wand2, Image, Video, Megaphone, Edit3, History,
  Copy, Check, Download, Loader2, X, Clock, Sparkles
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
        {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Image style={{ width: 18, height: 18 }} />}
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
    <div style={{ display: 'flex', height: '100%', gap: 20 }} className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Vertical tab nav */}
      <div className="card" style={{ width: 200, flexShrink: 0, padding: 12, alignSelf: 'flex-start' }}>
        <div style={{ padding: '12px 8px 16px', borderBottom: '1px solid #2a2a2a', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: '#e63000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wand2 style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>AI Studio</span>
          </div>
        </div>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', fontSize: 12, fontWeight: 500, textAlign: 'left',
              color: activeTab === key ? '#ffffff' : '#6b6b6b',
              background: activeTab === key ? '#1f1f1f' : 'transparent',
              border: 'none', cursor: 'pointer',
              borderLeft: `2px solid ${activeTab === key ? '#e63000' : 'transparent'}`,
              transition: 'all 0.1s',
            }}
          >
            <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 640 }}>
          {renderTab()}
        </div>
      </div>
    </div>
  )
}

export default AIStudio
