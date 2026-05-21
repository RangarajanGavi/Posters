import React, { useState, useEffect } from 'react'
import axios from '../api/axios'
import { Check, X, CreditCard, Zap, Building2 } from 'lucide-react'

const PLAN_FEATURES = {
  free: {
    icon: CreditCard,
    color: 'gray',
    borderClass: 'border-gray-700',
    badgeClass: '',
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
    color: 'blue',
    borderClass: 'border-blue-500',
    badgeClass: 'bg-blue-500 text-white',
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
    color: 'purple',
    borderClass: 'border-purple-500',
    badgeClass: '',
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
    className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-3 transition-all ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-700 rounded w-64 mx-auto" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = currentSubscription?.plan || 'free'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h1>
        <p className="text-gray-400 text-lg">Scale your social media presence with the right tools</p>
        {currentSubscription && (
          <div className="mt-4 inline-flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
            <span className="text-gray-400 text-sm">Current plan:</span>
            <span className="text-white font-semibold text-sm capitalize">{currentPlan}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const config = PLAN_FEATURES[plan.key]
          const Icon = config.icon
          const isCurrentPlan = currentPlan === plan.key

          return (
            <div
              key={plan.key}
              className={`relative bg-gray-800 rounded-xl border-2 p-6 flex flex-col transition-all ${config.borderClass} ${
                plan.key === 'pro' ? 'shadow-lg shadow-blue-500/10' : ''
              }`}
            >
              {config.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${config.badgeClass}`}>
                  {config.badge}
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                  Current Plan
                </div>
              )}

              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  plan.key === 'free' ? 'bg-gray-700' :
                  plan.key === 'pro' ? 'bg-blue-600/20' : 'bg-purple-600/20'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    plan.key === 'free' ? 'text-gray-400' :
                    plan.key === 'pro' ? 'text-blue-400' : 'text-purple-400'
                  }`} />
                </div>
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 mb-1">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {config.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : plan.key === 'free' ? (
                <button
                  onClick={() => handleUpgrade('free')}
                  disabled={upgrading === 'free'}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  Downgrade to Free
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={upgrading === plan.key}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    plan.key === 'pro'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
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
        <p className="text-gray-500 text-sm">
          All plans include a 14-day free trial. No credit card required for Free plan.
          <br />
          Upgrade or downgrade at any time. Cancel anytime.
        </p>
      </div>
    </div>
  )
}

export default Subscription
