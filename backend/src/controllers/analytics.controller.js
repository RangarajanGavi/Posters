const { Analytics, Post } = require('../models');
const { Op, Sequelize } = require('sequelize');

const getOverview = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const analyticsData = await Analytics.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.gte]: dateStr }
      }
    });

    // Get latest followers per platform (most recent date)
    const platformFollowers = {};
    analyticsData.forEach(row => {
      if (!platformFollowers[row.platform] || row.date > platformFollowers[row.platform].date) {
        platformFollowers[row.platform] = row;
      }
    });

    const totalFollowers = Object.values(platformFollowers).reduce((sum, row) => sum + (row.followers || 0), 0);
    const totalReach = analyticsData.reduce((sum, row) => sum + (row.reach || 0), 0);
    const totalLikes = analyticsData.reduce((sum, row) => sum + (row.likes || 0), 0);
    const totalComments = analyticsData.reduce((sum, row) => sum + (row.comments || 0), 0);
    const totalShares = analyticsData.reduce((sum, row) => sum + (row.shares || 0), 0);
    const totalImpressions = analyticsData.reduce((sum, row) => sum + (row.impressions || 0), 0);

    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgEngagementRate = totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : 0;

    const totalPosts = await Post.count({
      where: { userId: req.user.id }
    });

    res.json({
      totalFollowers,
      totalReach,
      totalEngagement,
      avgEngagementRate: parseFloat(avgEngagementRate),
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      totalImpressions,
      platforms: Object.keys(platformFollowers).length
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ message: 'Server error fetching overview' });
  }
};

const getGrowth = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const analyticsData = await Analytics.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.gte]: dateStr }
      },
      attributes: ['platform', 'date', 'followers'],
      order: [['date', 'ASC']]
    });

    // Group by date and platform
    const grouped = {};
    analyticsData.forEach(row => {
      if (!grouped[row.date]) {
        grouped[row.date] = { date: row.date };
      }
      grouped[row.date][row.platform] = row.followers;
    });

    const result = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    console.error('Get growth error:', error);
    res.status(500).json({ message: 'Server error fetching growth data' });
  }
};

const getEngagement = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { platform } = req.query;
    const where = {
      userId: req.user.id,
      date: { [Op.gte]: dateStr }
    };
    if (platform) where.platform = platform;

    const analyticsData = await Analytics.findAll({
      where,
      attributes: ['platform', 'date', 'likes', 'comments', 'shares', 'reach'],
      order: [['date', 'ASC']]
    });

    // Group by date
    const grouped = {};
    analyticsData.forEach(row => {
      if (!grouped[row.date]) {
        grouped[row.date] = { date: row.date };
      }
      if (!grouped[row.date][row.platform]) {
        grouped[row.date][row.platform] = { likes: 0, comments: 0, shares: 0, reach: 0 };
      }
      grouped[row.date][row.platform].likes += row.likes || 0;
      grouped[row.date][row.platform].comments += row.comments || 0;
      grouped[row.date][row.platform].shares += row.shares || 0;
      grouped[row.date][row.platform].reach += row.reach || 0;
    });

    const result = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    console.error('Get engagement error:', error);
    res.status(500).json({ message: 'Server error fetching engagement data' });
  }
};

const getTopPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        userId: req.user.id,
        status: { [Op.in]: ['published', 'scheduled'] }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Sort by total engagement
    const sortedPosts = posts
      .map(post => {
        const eng = post.engagement || { likes: 0, comments: 0, shares: 0, reach: 0 };
        const totalEngagement = (eng.likes || 0) + (eng.comments || 0) + (eng.shares || 0);
        return { ...post.toJSON(), totalEngagement };
      })
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5);

    res.json(sortedPosts);
  } catch (error) {
    console.error('Get top posts error:', error);
    res.status(500).json({ message: 'Server error fetching top posts' });
  }
};

module.exports = { getOverview, getGrowth, getEngagement, getTopPosts };
