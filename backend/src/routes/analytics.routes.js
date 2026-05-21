const express = require('express');
const router = express.Router();
const {
  getOverview,
  getGrowth,
  getEngagement,
  getTopPosts
} = require('../controllers/analytics.controller');
const auth = require('../middleware/auth');

// All analytics routes require authentication
router.use(auth);

// GET /api/analytics/overview
router.get('/overview', getOverview);

// GET /api/analytics/growth
router.get('/growth', getGrowth);

// GET /api/analytics/engagement
router.get('/engagement', getEngagement);

// GET /api/analytics/top-posts
router.get('/top-posts', getTopPosts);

module.exports = router;
