const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPlans,
  getCurrentSubscription,
  createCheckoutSession,
  handleWebhook,
  upgradeSubscription,
  cancelSubscription
} = require('../controllers/subscription.controller');

// GET /api/subscriptions/plans — no auth required
router.get('/plans', getPlans);

// POST /api/subscriptions/webhook — no auth, raw body handled in server.js
router.post('/webhook', handleWebhook);

// All routes below require authentication
router.get('/current', auth, getCurrentSubscription);
router.post('/checkout', auth, createCheckoutSession);
router.post('/upgrade', auth, upgradeSubscription);
router.post('/cancel', auth, cancelSubscription);

module.exports = router;
