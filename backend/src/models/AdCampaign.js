const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdCampaign = sequelize.define('AdCampaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  adAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ad_accounts',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  objective: {
    type: DataTypes.ENUM('awareness', 'traffic', 'engagement', 'leads', 'conversions', 'sales'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'completed'),
    defaultValue: 'draft',
    allowNull: false
  },
  dailyBudget: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  totalBudget: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  targeting: {
    type: DataTypes.JSON,
    defaultValue: { ageMin: 18, ageMax: 65, locations: [], interests: [], languages: [] }
  },
  creative: {
    type: DataTypes.JSON,
    defaultValue: { headline: '', body: '', imageUrl: '', videoUrl: '', callToAction: 'Learn More' }
  },
  platforms: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  aiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  spend: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'ad_campaigns',
  timestamps: true
});

module.exports = AdCampaign;
