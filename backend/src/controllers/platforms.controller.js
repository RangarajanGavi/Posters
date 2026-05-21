const { Platform, Analytics } = require('../models');
const { Op } = require('sequelize');

const mockAccountNames = {
  facebook: ['@mybusiness', '@brandpage', '@socialpage', '@companyofficial'],
  instagram: ['@myinstagram', '@brandinsta', '@socialshots', '@visualbrand'],
  twitter: ['@mytwitterhandle', '@brandtweets', '@socialmedia', '@tweetmaster'],
  linkedin: ['My Company', 'Brand Professional', 'Social Enterprise', 'Business Corp']
};

const mockFollowerRanges = {
  facebook: { min: 1000, max: 50000 },
  instagram: { min: 500, max: 30000 },
  twitter: { min: 200, max: 20000 },
  linkedin: { min: 100, max: 10000 }
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']]
    });
    res.json(platforms);
  } catch (error) {
    console.error('Get platforms error:', error);
    res.status(500).json({ message: 'Server error fetching platforms' });
  }
};

const connectPlatform = async (req, res) => {
  try {
    const { name } = req.body;

    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin'];
    if (!name || !validPlatforms.includes(name)) {
      return res.status(400).json({ message: 'Invalid platform name' });
    }

    const accountNames = mockAccountNames[name];
    const accountName = accountNames[randomInt(0, accountNames.length - 1)];
    const range = mockFollowerRanges[name];
    const followers = randomInt(range.min, range.max);

    const [platform, created] = await Platform.findOrCreate({
      where: { userId: req.user.id, name },
      defaults: {
        accountName,
        accountId: `mock_${name}_${Date.now()}`,
        accessToken: `mock_token_${Math.random().toString(36).substr(2, 9)}`,
        isConnected: true,
        followers
      }
    });

    if (!created) {
      await platform.update({
        isConnected: true,
        accountName,
        accountId: `mock_${name}_${Date.now()}`,
        accessToken: `mock_token_${Math.random().toString(36).substr(2, 9)}`,
        followers
      });
    }

    res.json({
      message: `${name} connected successfully`,
      platform
    });
  } catch (error) {
    console.error('Connect platform error:', error);
    res.status(500).json({ message: 'Server error connecting platform' });
  }
};

const disconnectPlatform = async (req, res) => {
  try {
    const { platformId } = req.params;

    const platform = await Platform.findOne({
      where: { id: platformId, userId: req.user.id }
    });

    if (!platform) {
      return res.status(404).json({ message: 'Platform not found' });
    }

    await platform.update({ isConnected: false });

    res.json({ message: `${platform.name} disconnected successfully`, platform });
  } catch (error) {
    console.error('Disconnect platform error:', error);
    res.status(500).json({ message: 'Server error disconnecting platform' });
  }
};

const syncAnalytics = async (req, res) => {
  try {
    const { platformId } = req.params;

    const platform = await Platform.findOne({
      where: { id: platformId, userId: req.user.id, isConnected: true }
    });

    if (!platform) {
      return res.status(404).json({ message: 'Connected platform not found' });
    }

    const analyticsData = [];
    const today = new Date();
    let baseFollowers = platform.followers || randomInt(500, 10000);

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Check if analytics already exist for this date
      const existing = await Analytics.findOne({
        where: {
          userId: req.user.id,
          platform: platform.name,
          date: dateStr
        }
      });

      if (!existing) {
        const dailyGrowth = randomInt(-20, 150);
        baseFollowers = Math.max(0, baseFollowers + dailyGrowth);

        analyticsData.push({
          userId: req.user.id,
          platform: platform.name,
          date: dateStr,
          followers: baseFollowers,
          posts: randomInt(0, 5),
          likes: randomInt(10, 500),
          comments: randomInt(2, 80),
          shares: randomInt(1, 40),
          reach: randomInt(100, 5000),
          impressions: randomInt(150, 8000)
        });
      }
    }

    if (analyticsData.length > 0) {
      await Analytics.bulkCreate(analyticsData);
    }

    res.json({
      message: `Analytics synced for ${platform.name}`,
      recordsCreated: analyticsData.length
    });
  } catch (error) {
    console.error('Sync analytics error:', error);
    res.status(500).json({ message: 'Server error syncing analytics' });
  }
};

module.exports = { getPlatforms, connectPlatform, disconnectPlatform, syncAnalytics };
