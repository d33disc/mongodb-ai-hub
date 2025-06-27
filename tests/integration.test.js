/**
 * Date: 2025-06-25
 * File Purpose: Integration tests for MongoDB AI Hub complete workflows
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/tests/integration.test.js
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import all routes
const authRoutes = require('../src/api/routes/authRoutes');
const promptRoutes = require('../src/api/routes/promptRoutes');
const vectorStoreRoutes = require('../src/api/routes/vectorStoreRoutes');

let mongoServer;
let app;

// Test user data
const testUser = {
  email: 'integration@test.com',
  password: 'IntegrationTest123!',
  firstName: 'Integration',
  lastName: 'Test'
};

describe('MongoDB AI Hub - Full Integration Tests', () => {
  beforeAll(async () => {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      // Start in-memory MongoDB instance
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      // Connect to the in-memory database
      await mongoose.connect(mongoUri);
    }
    
    // Create complete test app with all routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/prompts', promptRoutes);
    app.use('/api/vectorstores', vectorStoreRoutes);
    
    // Add health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'MongoDB AI Data Hub API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  });

  afterAll(async () => {
    // Clean up
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Complete User Workflow', () => {
    let userToken;
    let userId;

    test('should complete full user registration and authentication flow', async () => {
      // 1. Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe(testUser.email);
      expect(registerResponse.body.data.tokens).toHaveProperty('accessToken');
      
      userToken = registerResponse.body.data.tokens.accessToken;
      userId = registerResponse.body.data.user._id;

      // 2. Login with credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.tokens).toHaveProperty('accessToken');

      // 3. Get user profile
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(profileResponse.body.data.user.email).toBe(testUser.email);
      expect(profileResponse.body.data.user.firstName).toBe(testUser.firstName);

      // 4. Update profile
      const updateResponse = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'UpdatedIntegration',
          lastName: 'UpdatedTest'
        })
        .expect(200);

      expect(updateResponse.body.data.user.firstName).toBe('UpdatedIntegration');
      expect(updateResponse.body.data.user.lastName).toBe('UpdatedTest');

      // 5. Verify token
      const verifyResponse = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(verifyResponse.body.data.valid).toBe(true);
      expect(verifyResponse.body.data.user.email).toBe(testUser.email);
    });
  });

  describe('Prompt Management Workflow', () => {
    let userToken;

    beforeEach(async () => {
      // Register user and get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      userToken = registerResponse.body.data.tokens.accessToken;
    });

    test('should complete full prompt CRUD workflow', async () => {
      // 1. Create a prompt
      const promptData = {
        title: 'Test AI Prompt',
        content: 'You are a helpful AI assistant. Please help with: {query}',
        category: 'general',
        tags: ['assistant', 'help'],
        model: 'gpt-4',
        isPublic: false,
        metadata: {
          version: '1.0',
          author: 'Integration Test'
        }
      };

      const createResponse = await request(app)
        .post('/api/prompts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(promptData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.title).toBe(promptData.title);
      expect(createResponse.body.data.content).toBe(promptData.content);
      expect(createResponse.body.data.createdBy).toBeDefined();

      const promptId = createResponse.body.data._id;

      // 2. Get all prompts
      const getAllResponse = await request(app)
        .get('/api/prompts')
        .expect(200);

      expect(getAllResponse.body.length).toBe(1);
      expect(getAllResponse.body[0].title).toBe(promptData.title);

      // 3. Get specific prompt
      const getOneResponse = await request(app)
        .get(`/api/prompts/${promptId}`)
        .expect(200);

      expect(getOneResponse.body.title).toBe(promptData.title);
      expect(getOneResponse.body.content).toBe(promptData.content);

      // 4. Update prompt
      const updateData = {
        title: 'Updated AI Prompt',
        content: 'Updated content for the AI assistant',
        tags: ['updated', 'assistant']
      };

      const updateResponse = await request(app)
        .put(`/api/prompts/${promptId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title).toBe(updateData.title);
      expect(updateResponse.body.data.content).toBe(updateData.content);

      // 5. Search prompts
      const searchResponse = await request(app)
        .get('/api/prompts/search/text?query=Updated')
        .expect(200);

      expect(searchResponse.body.length).toBe(1);
      expect(searchResponse.body[0].title).toContain('Updated');

      // 6. Delete prompt
      const deleteResponse = await request(app)
        .delete(`/api/prompts/${promptId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('deleted successfully');

      // 7. Verify deletion
      await request(app)
        .get(`/api/prompts/${promptId}`)
        .expect(404);
    });
  });

  describe('Vector Store Management Workflow', () => {
    let userToken;

    beforeEach(async () => {
      // Register user and get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      userToken = registerResponse.body.data.tokens.accessToken;
    });

    test('should complete full vector store CRUD workflow', async () => {
      // 1. Create a vector store
      const vectorStoreData = {
        name: 'Test Vector Store',
        description: 'A test vector store for integration testing',
        namespace: 'integration-test',
        vectorDimension: 1536,
        model: 'text-embedding-ada-002',
        embeddings: []
      };

      const createResponse = await request(app)
        .post('/api/vectorstores')
        .set('Authorization', `Bearer ${userToken}`)
        .send(vectorStoreData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.name).toBe(vectorStoreData.name);
      expect(createResponse.body.data.vectorDimension).toBe(vectorStoreData.vectorDimension);

      const vectorStoreId = createResponse.body.data._id;

      // 2. Get all vector stores
      const getAllResponse = await request(app)
        .get('/api/vectorstores')
        .expect(200);

      expect(getAllResponse.body.length).toBe(1);
      expect(getAllResponse.body[0].name).toBe(vectorStoreData.name);

      // 3. Get specific vector store
      const getOneResponse = await request(app)
        .get(`/api/vectorstores/${vectorStoreId}`)
        .expect(200);

      expect(getOneResponse.body.name).toBe(vectorStoreData.name);
      expect(getOneResponse.body.namespace).toBe(vectorStoreData.namespace);

      // 4. Add embedding to vector store
      const embeddingData = {
        text: 'Sample text for embedding',
        vector: new Array(1536).fill(0).map(() => Math.random()),
        metadata: {
          source: 'integration-test',
          type: 'sample'
        }
      };

      const addEmbeddingResponse = await request(app)
        .post(`/api/vectorstores/${vectorStoreId}/embeddings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(embeddingData)
        .expect(200);

      expect(addEmbeddingResponse.body.success).toBe(true);
      expect(addEmbeddingResponse.body.data.embeddings.length).toBe(1);

      const embeddingId = addEmbeddingResponse.body.data.embeddings[0]._id;

      // 5. Update vector store
      const updateData = {
        name: 'Updated Vector Store',
        description: 'Updated description for vector store'
      };

      const updateResponse = await request(app)
        .put(`/api/vectorstores/${vectorStoreId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updateData.name);
      expect(updateResponse.body.data.description).toBe(updateData.description);

      // 6. Remove embedding
      const removeEmbeddingResponse = await request(app)
        .delete(`/api/vectorstores/${vectorStoreId}/embeddings/${embeddingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(removeEmbeddingResponse.body.success).toBe(true);

      // 7. Delete vector store
      const deleteResponse = await request(app)
        .delete(`/api/vectorstores/${vectorStoreId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('deleted successfully');

      // 8. Verify deletion
      await request(app)
        .get(`/api/vectorstores/${vectorStoreId}`)
        .expect(404);
    });
  });

  describe('API Health and Status', () => {
    test('should return healthy status', async () => {
      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('ok');
      expect(healthResponse.body.message).toContain('MongoDB AI Data Hub API is running');
      expect(healthResponse.body.timestamp).toBeDefined();
      expect(healthResponse.body.uptime).toBeDefined();
    });
  });

  describe('Authentication & Authorization Flow', () => {
    test('should properly handle authentication requirements', async () => {
      // 1. Try to access protected endpoint without token
      await request(app)
        .post('/api/prompts')
        .send({ title: 'Test', content: 'Test content' })
        .expect(401);

      // 2. Try with invalid token
      await request(app)
        .post('/api/prompts')
        .set('Authorization', 'Bearer invalid-token')
        .send({ title: 'Test', content: 'Test content' })
        .expect(401);

      // 3. Register user and get valid token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const userToken = registerResponse.body.data.tokens.accessToken;

      // 4. Access protected endpoint with valid token
      const protectedResponse = await request(app)
        .post('/api/prompts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Prompt',
          content: 'Test content for authenticated user'
        })
        .expect(201);

      expect(protectedResponse.body.success).toBe(true);
      expect(protectedResponse.body.data.title).toBe('Test Prompt');
    });
  });
});

/**
 * Future Improvements:
 * - Add performance tests for high-load scenarios
 * - Add tests for concurrent user operations
 * - Add tests for error recovery scenarios
 * - Add tests for database connection failures
 * - Add tests for external API integrations
 * - Add tests for file upload/download workflows
 * - Add tests for real-time features (if added)
 * - Add tests for email verification workflows
 */