/**
 * Date: 2025-06-25
 * File Purpose: Jest test setup configuration
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/tests/setup.js
 */

// Load test environment variables
require('dotenv').config({ path: './tests/test.env' });

const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Increase test timeout for slower CI environments
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  log: console.log // Keep log for debugging
};

// Mock external services if needed
jest.mock('../src/utils/vectorSearch', () => ({
  performVectorSearch: jest.fn().mockResolvedValue([]),
  addEmbedding: jest.fn().mockResolvedValue(true),
  deleteEmbedding: jest.fn().mockResolvedValue(true)
}));

// Global test utilities
global.testUtils = {
  generateRandomEmail: () => `test-${Date.now()}-${Math.random()}@example.com`,
  generateRandomPassword: () => `Test${Date.now()}!@#`,
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms))
};

/**
 * Future Improvements:
 * - Add database seeders for complex test scenarios
 * - Add test data factories
 * - Add performance monitoring for tests
 * - Add visual regression testing setup
 * - Add API documentation generation from tests
 */