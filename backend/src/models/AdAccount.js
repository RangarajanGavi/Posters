const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdAccount = sequelize.define('AdAccount', {
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
  platform: {
    type: DataTypes.ENUM('facebook', 'google', 'linkedin', 'tiktok', 'twitter'),
    allowNull: false
  },
  accountId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  totalBudget: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  spentBudget: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  isConnected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'ad_accounts',
  timestamps: true
});

module.exports = AdAccount;
