let Stripe;
try {
  Stripe = require('stripe');
} catch (e) {
  Stripe = null;
}

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: ['10 posts/month', '2 social accounts', 'Basic analytics']
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_mock',
    features: [
      'Unlimited posts',
      '5 social accounts',
      'AI story + image generation',
      '2 ad accounts',
      'Advanced analytics'
    ]
  },
  business: {
    name: 'Business',
    price: 79,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business_mock',
    features: [
      'Everything in Pro',
      'Unlimited accounts',
      'Video generation',
      'All ad platforms',
      'Team collaboration',
      'Priority support'
    ]
  }
};

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY || !Stripe) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const getPlans = () => PLANS;

const createCheckoutSession = async ({ userId, plan, email }) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return { mockMode: true, plan, url: null };
  }

  const planConfig = PLANS[plan];
  if (!planConfig || !planConfig.priceId) {
    return { mockMode: true, plan, url: null };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${frontendUrl}/subscription?success=true&plan=${plan}`,
    cancel_url: `${frontendUrl}/subscription?cancelled=true`,
    metadata: { userId, plan }
  });

  return { url: session.url, sessionId: session.id };
};

const handleWebhook = async ({ rawBody, signature }) => {
  const stripe = getStripeClient();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return null;
  }

  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  return event;
};

const cancelSubscription = async (stripeSubscriptionId) => {
  const stripe = getStripeClient();
  if (!stripe || !stripeSubscriptionId) {
    return { mockMode: true, cancelled: true };
  }
  const subscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
  return subscription;
};

module.exports = { getPlans, createCheckoutSession, handleWebhook, cancelSubscription, PLANS };
