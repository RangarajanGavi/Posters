import React, { useState, useEffect } from 'react'
import axios from '../api/axios'
import { Check, X, CreditCard, Zap, Building2 } from 'lucide-react'

const PLAN_FEATURES = {
  free: {
    icon: CreditCard,
    features: [
      { label: '10 posts/month', included: true },
      { label: '2 social accounts', included: true },
      { label: 'Basic analytics', included: true },
      { label: 'AI story generation', included: false },
      { label: 'AI image generation', included: false },
      { label: 'Video script generation', included: false },
      { label: 'Ad accounts', included: false },
      { label: 'Team collaboration', included: false }
    ]
  },
  pro: {
    icon: Zap,
    badge: 'MOST POPULAR',
    features: [
      { label: 'Unlimited posts', included: true },
      { label: '5 social accounts', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'AI story generation', included: true },
      { label: 'AI image generation', included: true },
      { label: 'Video script generation', included: false },
      { label: '2 ad accounts', included: true },
      { label: 'Team collaboration', included: false }
    ]
  },
  business: {
    icon: Building2,
    features: [
      { label: 'Unlimited posts', included: true },
      { label: 'Unlimited social accounts', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'AI story generation', included: true },
      { label: 'AI image generation', included: true },
      { label: 'Video script generation', included: true },
      { label: 'Unlimited ad accounts', included: true },
      { label: 'Team collaboration', included: true }
    ]
  }
}

const Toast = ({ message, type, onClose }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, padding: '12px 20px', background: '#1a1a1a', border: `1px solid ${type === 'success' ? '#e63000' : '#cc0000'}`, color: '#ffffff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b' }}>
      <X style={{ width: 16, height: 16 }} />
    </button>
  </div>
)

const Subscription = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchCurrentSubscription()
  }, [])

  const fetchCurrentSubscription = async () => {
    try {
      const res = await axios.get('/subscriptions/current')
      setCurrentSubscription(res.data)
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan) => {
    setUpgrading(plan)
    try {
      const res = await axios.post('/subscriptions/upgrade', { plan })
      if (res.data.mockMode) {
        showToast('Plan upgraded! (Demo mode — Stripe not configured)', 'success')
      } else {
        showToast(`Successfully upgraded to ${plan}!`, 'success')
      }
      await fetchCurrentSubscription()
    } catch (err) {
      showToast('Failed to upgrade plan. Please try again.', 'error')
    } finally {
      setUpgrading(null)
    }
  }

  const plans = [
    { key: 'free', name: 'FREE', price: 0, description: 'Perfect for getting started' },
    { key: 'pro', name: 'PRO', price: 29, description: 'For growing businesses' },
    { key: 'business', name: 'BUSINESS', price: 79, description: 'For teams and enterprises' }
  ]

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 32 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: 380, animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  const currentPlan = currentSubscription?.plan || 'free'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 32 }}>
        <p className="section-prefix">// CHOOSE YOUR PLAN</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>Pricing</h1>
        <p style={{ color: '#6b6b6b', fontSize: 14, marginTop: 8 }}>Scale your social media presence with the right tools</p>
        {currentSubscription && (
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '6px 14px' }}>
            <span style={{ color: '#6b6b6b', fontSize: 12 }}>Current plan:</span>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{currentPlan}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16 }} className="md:grid-cols-3">
        {plans.map((plan) => {
          const config = PLAN_FEATURES[plan.key]
          const Icon = config.icon
          const isCurrentPlan = currentPlan === plan.key
          const isPro = plan.key === 'pro'

          return (
            <div
              key={plan.key}
              className="card"
              style={{
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderTopWidth: isCurrentPlan ? 2 : 1,
                borderTopColor: isCurrentPlan ? '#e63000' : '#2a2a2a',
              }}
            >
              {config.badge && (
                <div style={{ position: 'absolute', top: -1, right: 20, background: '#e63000', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '4px 10px' }}>
                  {config.badge}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, background: isCurrentPlan ? 'rgba(230,48,0,0.1)' : '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon style={{ width: 20, height: 20, color: isCurrentPlan ? '#e63000' : '#6b6b6b' }} />
                </div>
                <p className="metric-label" style={{ marginBottom: 4 }}>{plan.name} PLAN</p>
                <p style={{ color: '#6b6b6b', fontSize: 12, marginBottom: 16 }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  {plan.price === 0 ? (
                    <span style={{ fontSize: 40, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>Free</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 40, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>${plan.price}</span>
                      <span style={{ color: '#6b6b6b', fontSize: 13, paddingBottom: 4 }}>/mo</span>
                    </>
                  )}
                </div>
              </div>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                {config.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    {feature.included ? (
                      <Check style={{ width: 14, height: 14, color: '#e63000', flexShrink: 0 }} />
                    ) : (
                      <X style={{ width: 14, height: 14, color: '#3a3a3a', flexShrink: 0 }} />
                    )}
                    <span style={{ color: feature.included ? '#ffffff' : '#3a3a3a' }}>
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  style={{ width: '100%', padding: '10px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(230,48,0,0.1)', border: '1px solid rgba(230,48,0,0.3)', color: '#e63000', cursor: 'not-allowed' }}
                >
                  Current Plan
                </button>
              ) : plan.key === 'free' ? (
                <button
                  onClick={() => handleUpgrade('free')}
                  disabled={upgrading === 'free'}
                  className="btn-secondary w-full justify-center"
                  style={{ opacity: upgrading === 'free' ? 0.6 : 1 }}
                >
                  Downgrade to Free
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={upgrading === plan.key}
                  className="btn-primary w-full justify-center"
                  style={{ opacity: upgrading === plan.key ? 0.6 : 1 }}
                >
                  {upgrading === plan.key ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Upgrading...
                    </>
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <p style={{ color: '#3a3a3a', fontSize: 12 }}>
          All plans include a 14-day free trial. No credit card required for Free plan.
          <br />
          Upgrade or downgrade at any time. Cancel anytime.
        </p>
      </div>
    </div>
  )
}

export default Subscription
