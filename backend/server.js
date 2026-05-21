require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDatabase } = require('./src/models');
const { startScheduler } = require('./src/services/scheduler.service');

const authRoutes = require('./src/routes/auth.routes');
const platformRoutes = require('./src/routes/platforms.routes');
const postRoutes = require('./src/routes/posts.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const adsRoutes = require('./src/routes/ads.routes');
const aiRoutes = require('./src/routes/ai.routes');

const app = express();

// Stripe webhook needs raw body - must come before json middleware
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await syncDatabase();
    console.log('Database connected and synchronized');

    startScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
