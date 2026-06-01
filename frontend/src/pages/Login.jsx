import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      login(token, user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'Schedule posts across all platforms',
    'AI-generated content & images',
    'Advanced analytics & reporting',
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d0d' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0d0d0d', borderRight: '1px solid #2a2a2a' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 28, height: 28, background: '#e63000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em' }}>METRICOOL.</span>
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#6b6b6b', textTransform: 'uppercase', marginBottom: 16 }}>// SOCIAL MEDIA PLATFORM</p>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>Schedule smarter.<br />Grow faster.</h2>
          <p style={{ marginTop: 16, color: '#6b6b6b', fontSize: 15 }}>The all-in-one platform for social media management, analytics, and AI-powered content creation.</p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, background: 'rgba(230,48,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle style={{ width: 12, height: 12, color: '#e63000' }} />
                </div>
                <span style={{ fontSize: 13, color: '#ffffff' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ color: '#3a3a3a', fontSize: 12 }}>Trusted by 50,000+ creators worldwide</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: '#111111' }}>
        <div className="w-full max-w-sm" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <p className="section-prefix">// SIGN IN</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>Welcome back</h2>
            <p style={{ marginTop: 8, color: '#6b6b6b', fontSize: 14 }}>Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'rgba(230,48,0,0.08)', border: '1px solid rgba(230,48,0,0.2)', color: '#e63000', fontSize: 13 }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                {error}
              </div>
            )}
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 11, color: '#e63000', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingRight: 40 }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b' }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b6b6b' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#e63000', fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
