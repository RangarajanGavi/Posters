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
    badge: 'Most Popular',
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
  <div
    className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-3 transition-all ${
      type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    }`}
  >
    {message}
    <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
      <X className="w-4 h-4" />
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
    { key: 'free', name: 'Free', price: 0, description: 'Perfect for getting started' },
    { key: 'pro', name: 'Pro', price: 29, description: 'For growing businesses' },
    { key: 'business', name: 'Business', price: 79, description: 'For teams and enterprises' }
  ]

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-white/[0.05] rounded-xl w-64 mx-auto" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-white/[0.04] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = currentSubscription?.plan || 'free'

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-100 mb-3">Choose Your Plan</h1>
        <p className="text-slate-500 text-lg">Scale your social media presence with the right tools</p>
        {currentSubscription && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/[0.05] px-4 py-2 rounded-full">
            <span className="text-slate-500 text-sm">Current plan:</span>
            <span className="text-slate-100 font-semibold text-sm capitalize">{currentPlan}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const config = PLAN_FEATURES[plan.key]
          const Icon = config.icon
          const isCurrentPlan = currentPlan === plan.key
          const isPro = plan.key === 'pro'
          const isBusiness = plan.key === 'business'

          return (
            <div
              key={plan.key}
              className={`card p-8 flex flex-col hover:shadow-card-hover transition-all duration-200 relative ${
                isPro ? 'ring-1 ring-indigo-500/50' : ''
              } ${isBusiness ? 'ring-1 ring-violet-500/50' : ''}`}
            >
              {config.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                  {config.badge}
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                  Current Plan
                </div>
              )}

              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  plan.key === 'free' ? 'bg-white/[0.05]' :
                  isPro ? 'bg-indigo-500/10' : 'bg-violet-500/10'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    plan.key === 'free' ? 'text-slate-500' :
                    isPro ? 'text-indigo-400' : 'text-violet-400'
                  }`} />
                </div>
                <h2 className="text-xl font-bold text-slate-100">{plan.name}</h2>
                <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  {plan.price === 0 ? (
                    <span className="text-5xl font-bold bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">Free</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">${plan.price}</span>
                      <span className="text-slate-500 mb-1.5">/mo</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {config.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : plan.key === 'free' ? (
                <button
                  onClick={() => handleUpgrade('free')}
                  disabled={upgrading === 'free'}
                  className="btn-secondary w-full justify-center"
                >
                  Downgrade to Free
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={upgrading === plan.key}
                  className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {upgrading === plan.key ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

      <div className="mt-10 text-center">
        <p className="text-slate-500 text-sm">
          All plans include a 14-day free trial. No credit card required for Free plan.
          <br />
          Upgrade or downgrade at any time. Cancel anytime.
        </p>
      </div>
    </div>
  )
}

export default Subscription
