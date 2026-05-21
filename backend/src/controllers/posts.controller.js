const { Post } = require('../models');
const { Op } = require('sequelize');

const getPosts = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };

    if (status) {
      where.status = status;
    }

    const posts = await Post.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, imageUrl, platforms, scheduledAt, status } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content is required' });
    }

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ message: 'At least one platform must be selected' });
    }

    const postData = {
      userId: req.user.id,
      content: content.trim(),
      imageUrl: imageUrl || null,
      platforms: platforms || [],
      status: status || 'draft',
      engagement: { likes: 0, comments: 0, shares: 0, reach: 0 }
    };

    if (scheduledAt) {
      postData.scheduledAt = new Date(scheduledAt);
      if (postData.status !== 'draft') {
        postData.status = 'scheduled';
      }
    }

    const post = await Post.create(postData);

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, imageUrl, platforms, scheduledAt, status } = req.body;

    const post = await Post.findOne({
      where: { id, userId: req.user.id }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.status === 'published') {
      return res.status(400).json({ message: 'Cannot edit a published post' });
    }

    const updateData = {};
    if (content !== undefined) updateData.content = content.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (platforms !== undefined) updateData.platforms = platforms;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (status !== undefined) updateData.status = status;

    await post.update(updateData);

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error updating post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      where: { id, userId: req.user.id }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

const getCalendarPosts = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const posts = await Post.findAll({
      where: {
        userId: req.user.id,
        scheduledAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['id', 'content', 'scheduledAt', 'status', 'platforms', 'imageUrl'],
      order: [['scheduledAt', 'ASC']]
    });

    res.json(posts);
  } catch (error) {
    console.error('Get calendar posts error:', error);
    res.status(500).json({ message: 'Server error fetching calendar posts' });
  }
};

module.exports = { getPosts, createPost, updatePost, deletePost, getCalendarPosts };
