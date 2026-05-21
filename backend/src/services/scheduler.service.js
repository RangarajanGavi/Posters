const cron = require('node-cron');
const { Post } = require('../models');
const { Op } = require('sequelize');

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const processScheduledPosts = async () => {
  try {
    const now = new Date();

    const scheduledPosts = await Post.findAll({
      where: {
        status: 'scheduled',
        scheduledAt: {
          [Op.lte]: now
        }
      }
    });

    if (scheduledPosts.length === 0) return;

    console.log(`Processing ${scheduledPosts.length} scheduled post(s)...`);

    for (const post of scheduledPosts) {
      try {
        const mockEngagement = {
          likes: randomInt(10, 500),
          comments: randomInt(2, 50),
          shares: randomInt(1, 30),
          reach: randomInt(100, 5000)
        };

        await post.update({
          status: 'published',
          publishedAt: now,
          engagement: mockEngagement
        });

        console.log(`Post ${post.id} published successfully with mock engagement`);
      } catch (postError) {
        console.error(`Error publishing post ${post.id}:`, postError);
        await post.update({ status: 'failed' }).catch(console.error);
      }
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }
};

const startScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', processScheduledPosts, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('Post scheduler started - running every minute');
};

module.exports = { startScheduler, processScheduledPosts };
