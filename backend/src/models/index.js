const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Platform Model
const Platform = sequelize.define('Platform', {
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
  name: {
    type: DataTypes.ENUM('facebook', 'instagram', 'twitter', 'linkedin'),
    allowNull: false
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isConnected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'platforms',
  timestamps: true,
  updatedAt: false
});

// Post Model
const Post = sequelize.define('Post', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  platforms: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'published', 'failed'),
    defaultValue: 'draft'
  },
  engagement: {
    type: DataTypes.JSON,
    defaultValue: { likes: 0, comments: 0, shares: 0, reach: 0 }
  }
}, {
  tableName: 'posts',
  timestamps: true
});

// Analytics Model
const Analytics = sequelize.define('Analytics', {
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
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  followers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  posts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reach: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'analytics',
  timestamps: true,
  updatedAt: false
});

// Associations
User.hasMany(Platform, { foreignKey: 'userId', as: 'platforms', onDelete: 'CASCADE' });
Platform.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Post, { foreignKey: 'userId', as: 'posts', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Analytics, { foreignKey: 'userId', as: 'analytics', onDelete: 'CASCADE' });
Analytics.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync models
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database sync error:', error);
    throw error;
  }
};

module.exports = { User, Platform, Post, Analytics, sequelize, syncDatabase };
