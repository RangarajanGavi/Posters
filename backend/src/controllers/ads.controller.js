const { AdAccount, AdCampaign } = require('../models');
const openaiService = require('../services/openai.service');

// Ad Accounts

const getAdAccounts = async (req, res) => {
  try {
    const accounts = await AdAccount.findAll({ where: { userId: req.user.id } });
    res.json(accounts);
  } catch (error) {
    console.error('Get ad accounts error:', error);
    res.status(500).json({ message: 'Server error fetching ad accounts' });
  }
};

const connectAdAccount = async (req, res) => {
  try {
    const { platform, accountName } = req.body;
    if (!platform) {
      return res.status(400).json({ message: 'Platform is required' });
    }

    const mockAccountId = `${platform}_${Date.now()}`;
    const mockBudget = Math.floor(Math.random() * 5000) + 500;

    const [account, created] = await AdAccount.findOrCreate({
      where: { userId: req.user.id, platform },
      defaults: {
        accountId: mockAccountId,
        accountName: accountName || `My ${platform.charAt(0).toUpperCase() + platform.slice(1)} Ad Account`,
        isConnected: true,
        totalBudget: mockBudget,
        spentBudget: Math.floor(mockBudget * Math.random() * 0.5)
      }
    });

    if (!created) {
      await account.update({
        isConnected: true,
        accountName: accountName || account.accountName
      });
    }

    res.json(account);
  } catch (error) {
    console.error('Connect ad account error:', error);
    res.status(500).json({ message: 'Server error connecting ad account' });
  }
};

const disconnectAdAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await AdAccount.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    await account.update({ isConnected: false });
    res.json({ message: 'Ad account disconnected', account });
  } catch (error) {
    console.error('Disconnect ad account error:', error);
    res.status(500).json({ message: 'Server error disconnecting ad account' });
  }
};

const getAdAccountStats = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await AdAccount.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
      return res.status(404).json({ message: 'Ad account not found' });
    }
    const impressions = Math.floor(Math.random() * 100000) + 10000;
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01));
    const spend = parseFloat((Math.random() * account.totalBudget * 0.8).toFixed(2));
    const ctr = parseFloat(((clicks / impressions) * 100).toFixed(2));
    res.json({ impressions, clicks, spend, ctr, accountId: account.id, platform: account.platform });
  } catch (error) {
    console.error('Get ad account stats error:', error);
    res.status(500).json({ message: 'Server error fetching ad account stats' });
  }
};

// Ad Campaigns

const getCampaigns = async (req, res) => {
  try {
    const { adAccountId } = req.query;
    const where = { userId: req.user.id };
    if (adAccountId) where.adAccountId = adAccountId;
    const campaigns = await AdCampaign.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Server error fetching campaigns' });
  }
};

const createCampaign = async (req, res) => {
  try {
    const {
      name, adAccountId, objective, dailyBudget, totalBudget,
      startDate, endDate, targeting, creative, platforms
    } = req.body;

    if (!name || !adAccountId || !objective || !startDate) {
      return res.status(400).json({ message: 'Name, adAccountId, objective, and startDate are required' });
    }

    const account = await AdAccount.findOne({ where: { id: adAccountId, userId: req.user.id } });
    if (!account) {
      return res.status(404).json({ message: 'Ad account not found' });
    }

    const campaign = await AdCampaign.create({
      userId: req.user.id,
      adAccountId,
      name,
      objective,
      dailyBudget: dailyBudget || 0,
      totalBudget: totalBudget || 0,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      targeting: targeting || {},
      creative: creative || {},
      platforms: platforms || [],
      status: 'draft'
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Server error creating campaign' });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await AdCampaign.findOne({ where: { id, userId: req.user.id } });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    await campaign.update(req.body);
    res.json(campaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ message: 'Server error updating campaign' });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await AdCampaign.findOne({ where: { id, userId: req.user.id } });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    await campaign.destroy();
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ message: 'Server error deleting campaign' });
  }
};

const launchCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await AdCampaign.findOne({ where: { id, userId: req.user.id } });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    const impressions = Math.floor(Math.random() * 9000) + 1000;
    const clicks = Math.floor(Math.random() * 450) + 50;
    const spend = parseFloat((Math.random() * 490 + 10).toFixed(2));

    await campaign.update({
      status: 'active',
      startDate: new Date(),
      impressions,
      clicks,
      spend
    });

    res.json(campaign);
  } catch (error) {
    console.error('Launch campaign error:', error);
    res.status(500).json({ message: 'Server error launching campaign' });
  }
};

const pauseCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await AdCampaign.findOne({ where: { id, userId: req.user.id } });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    await campaign.update({ status: 'paused' });
    res.json(campaign);
  } catch (error) {
    console.error('Pause campaign error:', error);
    res.status(500).json({ message: 'Server error pausing campaign' });
  }
};

const getAIAdCopy = async (req, res) => {
  try {
    const { product, audience, objective, platform, tone } = req.body;
    const result = await openaiService.generateAdCopy({ product, audience, objective, platform, tone });
    res.json(result);
  } catch (error) {
    console.error('AI ad copy error:', error);
    res.status(500).json({ message: 'Server error generating ad copy' });
  }
};

module.exports = {
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
};
