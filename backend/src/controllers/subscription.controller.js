const { Subscription } = require('../models');
const stripeService = require('../services/stripe.service');

const getPlans = async (req, res) => {
  try {
    const plans = stripeService.getPlans();
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error fetching plans' });
  }
};

const getCurrentSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      subscription = await Subscription.create({
        userId: req.user.id,
        plan: 'free',
        status: 'active'
      });
    }

    const plans = stripeService.getPlans();
    const planDetails = plans[subscription.plan];

    res.json({ ...subscription.toJSON(), planDetails });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error fetching subscription' });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['pro', 'business'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const result = await stripeService.createCheckoutSession({
      userId: req.user.id,
      plan,
      email: req.user.email
    });

    if (result.mockMode) {
      await Subscription.upsert({
        userId: req.user.id,
        plan,
        status: 'active'
      });
      return res.json({ mockMode: true, plan, message: 'Plan upgraded (mock mode)' });
    }

    res.json({ url: result.url, sessionId: result.sessionId });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Server error creating checkout session' });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = await stripeService.handleWebhook({
      rawBody: req.body,
      signature
    });

    if (!event) {
      return res.json({ received: true });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, plan } = session.metadata;
      await Subscription.upsert({
        userId,
        plan,
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription
      });
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      await Subscription.update(
        { status: 'cancelled', plan: 'free' },
        { where: { stripeSubscriptionId: subscription.id } }
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

const upgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'business'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const [subscription] = await Subscription.upsert({
      userId: req.user.id,
      plan,
      status: 'active'
    });

    const updated = await Subscription.findOne({ where: { userId: req.user.id } });
    const plans = stripeService.getPlans();
    const planDetails = plans[updated.plan];

    res.json({ ...updated.toJSON(), planDetails, mockMode: true });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ message: 'Server error upgrading subscription' });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ where: { userId: req.user.id } });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    await subscription.update({ status: 'cancelled', plan: 'free' });

    res.json({ message: 'Subscription cancelled', subscription });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error cancelling subscription' });
  }
};

module.exports = {
  getPlans,
  getCurrentSubscription,
  createCheckoutSession,
  handleWebhook,
  upgradeSubscription,
  cancelSubscription
};
