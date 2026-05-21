const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateStory,
  generateImage,
  generateVideoScript,
  generateAdCopy,
  editContent,
  getHistory,
  useInPost
} = require('../controllers/ai.controller');

// All AI routes require authentication
router.use(auth);

router.post('/story', generateStory);
router.post('/image', generateImage);
router.post('/video-script', generateVideoScript);
router.post('/ad-copy', generateAdCopy);
router.post('/edit', editContent);
router.get('/history', getHistory);
router.post('/use-in-post', useInPost);

module.exports = router;
