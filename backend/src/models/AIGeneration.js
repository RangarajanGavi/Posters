const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AIGeneration = sequelize.define('AIGeneration', {
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
  type: {
    type: DataTypes.ENUM('story', 'image', 'video_script', 'ad_copy'),
    allowNull: false
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  result: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  usedInPost: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'ai_generations',
  timestamps: true,
  updatedAt: false
});

module.exports = AIGeneration;
