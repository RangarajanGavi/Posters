const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getCalendarPosts
} = require('../controllers/posts.controller');
const auth = require('../middleware/auth');

// All post routes require authentication
router.use(auth);

// GET /api/posts/calendar
router.get('/calendar', getCalendarPosts);

// GET /api/posts
router.get('/', getPosts);

// POST /api/posts
router.post('/', createPost);

// PUT /api/posts/:id
router.put('/:id', updatePost);

// DELETE /api/posts/:id
router.delete('/:id', deletePost);

module.exports = router;
