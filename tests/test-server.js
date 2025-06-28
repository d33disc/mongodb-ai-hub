/**
 * Test Server Configuration
 * Separate server setup for testing without rate limiting
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes without rate limiting
const authRoutes = require('./test-auth-routes');
const promptRoutes = require('./test-prompt-routes');
const vectorStoreRoutes = require('./test-vectorstore-routes');

const createTestServer = () => {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'MongoDB AI Data Hub API is running',
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  // Test routes (no rate limiting)
  app.use('/api/auth', authRoutes);
  app.use('/api/prompts', promptRoutes);
  app.use('/api/vectorstores', vectorStoreRoutes);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Test server error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  });

  return app;
};

module.exports = createTestServer;