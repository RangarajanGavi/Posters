const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAdAccounts,
  connectAdAccount,
  disconnectAdAccount,
  getAdAccountStats,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  launchCampaign,
  pauseCampaign,
  getAIAdCopy
} = require('../controllers/ads.controller');

// All ads routes require authentication
router.use(auth);

// Ad Account routes
router.get('/accounts', getAdAccounts);
router.post('/accounts/connect', connectAdAccount);
router.post('/accounts/:id/disconnect', disconnectAdAccount);
router.get('/accounts/:id/stats', getAdAccountStats);

// Campaign routes
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.put('/campaigns/:id', updateCampaign);
router.delete('/campaigns/:id', deleteCampaign);
router.post('/campaigns/:id/launch', launchCampaign);
router.post('/campaigns/:id/pause', pauseCampaign);

// AI ad copy
router.post('/ai-copy', getAIAdCopy);

module.exports = router;
