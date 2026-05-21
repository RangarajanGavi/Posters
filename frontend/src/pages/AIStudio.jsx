import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import {
  Wand2, Image, Video, Megaphone, Edit3, History,
  Copy, Check, Download, Loader2, X, Clock, Sparkles
} from 'lucide-react'

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-3 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
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
      className="p-1.5 text-gray-400 hover:text-white transition-colors"
      title="Copy"
    >
      {copied === id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

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
        <h2 className="text-xl font-bold text-white mb-1">Story Generator</h2>
        <p className="text-gray-400 text-sm">Create engaging social media posts powered by AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
          <select
            value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].map(p => (
              <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Tone</label>
          <select
            value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {['professional', 'casual', 'funny', 'inspirational', 'educational'].map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Topic *</label>
        <input
          type="text" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          placeholder="New product launch, industry news, tips..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Brand/Company Name</label>
        <input
          type="text" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          placeholder="Your brand name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Length: {form.length} words</label>
        <input
          type="range" min="50" max="200" step="50" value={form.length}
          onChange={e => setForm(p => ({ ...p, length: parseInt(e.target.value) }))}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {[50, 100, 150, 200].map(v => <span key={v}>{v}</span>)}
        </div>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'Generating...' : 'Generate Story'}
      </button>

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-5/6" />
        </div>
      )}

      {result && !loading && (
        <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-purple-400">Generated Story</span>
            <CopyButton text={result.text} id="story" />
          </div>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{result.text}</p>
          {result.hashtags && result.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {result.hashtags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate('/compose', { state: { prefillContent: result.text } })}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              Use in Post
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
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
        <h2 className="text-xl font-bold text-white mb-1">Image Creator</h2>
        <p className="text-gray-400 text-sm">Generate stunning visuals with DALL-E 3</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Image Description *</label>
        <textarea
          value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
          rows={4} placeholder="Describe the image you want..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Style</label>
          <select
            value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="vivid">Vivid</option>
            <option value="natural">Natural</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Size</label>
          <select
            value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="1024x1024">1024x1024 (Square)</option>
            <option value="1792x1024">1792x1024 (Landscape)</option>
            <option value="1024x1792">1024x1792 (Portrait)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Platform Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setForm(prev => ({ ...prev, size: p.size }))}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                form.size === p.size ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {loading && (
        <div className="aspect-square bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-gray-500" />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          <img
            src={result.imageUrl} alt="Generated"
            className="w-full rounded-xl border border-gray-600 object-cover"
          />
          {result.isMock && (
            <p className="text-xs text-amber-400 text-center">
              Demo mode — using Picsum placeholder. Add OPENAI_API_KEY for real DALL-E 3 generation.
            </p>
          )}
          <div className="flex gap-3">
            <a
              href={result.imageUrl} download="ai-generated-image.png" target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
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
        <h2 className="text-xl font-bold text-white mb-1">Video Creator</h2>
        <p className="text-gray-400 text-sm">Generate structured video scripts with AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
          <select
            value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {['YouTube', 'Instagram Reels', 'TikTok', 'Facebook'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
          <select
            value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {[['15', '15 seconds'], ['30', '30 seconds'], ['60', '60 seconds'], ['180', '3 minutes']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Topic *</label>
        <input
          type="text" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          placeholder="Product demo, tutorial, brand story..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Style</label>
        <select
          value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
        >
          {['educational', 'entertaining', 'promotional', 'storytelling'].map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
        {loading ? 'Generating...' : 'Generate Script'}
      </button>

      {result && !loading && (
        <div className="space-y-4">
          <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-purple-400">Video Script</span>
              <CopyButton text={result.script} id="script" />
            </div>
            <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.script}</pre>
          </div>

          {result.scenes && result.scenes.length > 0 && (
            <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-purple-400 mb-3">Scene Breakdown</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 text-xs text-gray-400 pr-4">Time</th>
                    <th className="text-left py-2 text-xs text-gray-400 pr-4">Scene</th>
                    <th className="text-left py-2 text-xs text-gray-400">Voiceover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {result.scenes.map((scene, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 text-gray-400 text-xs whitespace-nowrap">{scene.time}</td>
                      <td className="py-2 pr-4 text-gray-300 text-xs">{scene.description}</td>
                      <td className="py-2 text-gray-300 text-xs">{scene.voiceover}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mock Video Editor */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Video Editor (Preview)</span>
              <span className="text-xs text-gray-600">Mock UI — Requires RunwayML/Sora integration</span>
            </div>
            <div className="bg-black aspect-video flex items-center justify-center">
              <div className="text-center">
                <Video className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Video preview area</p>
              </div>
            </div>
            <div className="p-3 bg-gray-800 border-t border-gray-700">
              <div className="h-8 bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-purple-600/30 border-r-2 border-purple-500" />
              </div>
              <div className="flex gap-2">
                {['Add Clip', 'Add Text', 'Add Music'].map(label => (
                  <button key={label} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Video generation requires integration with RunwayML or Sora API. Script generation is live.
          </p>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
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
        <h2 className="text-xl font-bold text-white mb-1">Ad Copy Generator</h2>
        <p className="text-gray-400 text-sm">Generate high-converting ad copy with AI</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Product/Service *</label>
          <input
            type="text" value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            placeholder="SaaS tool, physical product, service..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
          <input
            type="text" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            placeholder="Small business owners, fitness enthusiasts..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Objective</label>
            <select
              value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {['awareness', 'traffic', 'leads', 'conversions', 'sales'].map(o => (
                <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
            <select
              value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {['facebook', 'google', 'linkedin', 'tiktok', 'twitter'].map(p => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tone</label>
            <select
              value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {['professional', 'casual', 'urgent', 'friendly', 'bold'].map(t => (
                <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
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
            <div key={field.id} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-400 uppercase">{field.label}</span>
                <button onClick={() => copy(field.value, field.id)} className="p-1 text-gray-400 hover:text-white">
                  {copied === field.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-gray-200 text-sm">{field.value}</p>
            </div>
          ))}
          <button
            onClick={() => showToast('Use the Ad Manager to create a campaign with this copy!', 'success')}
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
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
        <h2 className="text-xl font-bold text-white mb-1">Edit Content</h2>
        <p className="text-gray-400 text-sm">Polish and refine your content with AI assistance</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Original Content</label>
        <textarea
          value={content} onChange={e => setContent(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
          rows={5} placeholder="Paste your content here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Instruction</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {QUICK_INSTRUCTIONS.map(qi => (
            <button
              key={qi} onClick={() => setInstruction(qi)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                instruction === qi ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {qi}
            </button>
          ))}
        </div>
        <input
          type="text" value={instruction} onChange={e => setInstruction(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          placeholder="Custom instruction..."
        />
      </div>

      <button
        onClick={handleEdit} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit3 className="w-5 h-5" />}
        {loading ? 'Editing...' : 'Edit with AI'}
      </button>

      {result && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-400 mb-2">BEFORE</p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{content}</p>
            </div>
            <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-400 mb-2">AFTER</p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{result}</p>
            </div>
          </div>
          {!accepted ? (
            <div className="flex gap-3">
              <button
                onClick={() => { setContent(result); setResult(null); setAccepted(true); showToast('Content updated!') }}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          ) : (
            <p className="text-center text-green-400 text-sm">Content accepted and updated!</p>
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
    story: 'bg-purple-600/20 text-purple-400',
    image: 'bg-pink-600/20 text-pink-400',
    video_script: 'bg-blue-600/20 text-blue-400',
    ad_copy: 'bg-orange-600/20 text-orange-400'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Generation History</h2>
          <p className="text-gray-400 text-sm">Your past AI generations</p>
        </div>
        <div className="flex gap-2">
          {['', 'story', 'image', 'video_script', 'ad_copy'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === type ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {type === '' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-700 rounded-xl animate-pulse" />)}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No generations yet. Start creating!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(item => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start gap-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${typeStyles[item.type]}`}>
                {item.type.replace('_', ' ')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm truncate">{item.prompt}</p>
                {item.platform && <p className="text-gray-500 text-xs mt-0.5">Platform: {item.platform}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {item.usedInPost && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">Used</span>
                )}
                <span className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
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
    <div className="flex h-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Vertical tab nav */}
      <div className="w-52 flex-shrink-0 bg-gray-800 border-r border-gray-700 p-3 space-y-1">
        <div className="px-3 py-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AI Studio</span>
          </div>
        </div>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === key
                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border border-purple-600/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {renderTab()}
        </div>
      </div>
    </div>
  )
}

export default AIStudio
