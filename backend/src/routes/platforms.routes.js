const express = require('express');
const router = express.Router();
const {
  getPlatforms,
  connectPlatform,
  disconnectPlatform,
  syncAnalytics
} = require('../controllers/platforms.controller');
const auth = require('../middleware/auth');

// All platform routes require authentication
router.use(auth);

// GET /api/platforms
router.get('/', getPlatforms);

// POST /api/platforms/connect
router.post('/connect', connectPlatform);

// PUT /api/platforms/:platformId/disconnect
router.put('/:platformId/disconnect', disconnectPlatform);

// POST /api/platforms/:platformId/sync
router.post('/:platformId/sync', syncAnalytics);

module.exports = router;
