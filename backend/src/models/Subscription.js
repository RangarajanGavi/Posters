const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
  plan: {
    type: DataTypes.ENUM('free', 'pro', 'business'),
    defaultValue: 'free',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'past_due'),
    defaultValue: 'active',
    allowNull: false
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'subscriptions',
  timestamps: true
});

module.exports = Subscription;
