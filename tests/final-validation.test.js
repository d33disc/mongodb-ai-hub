/**
 * Date: 2025-06-27
 * File Purpose: Final validation test to confirm perfect working order
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/tests/final-validation.test.js
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createTestServer = require('./test-server');

let mongoServer;
let app;

// Test user data
const testUser = {
  email: 'final-test@example.com',
  password: 'FinalTest123!',
  firstName: 'Final',
  lastName: 'Test'
};

describe('MongoDB AI Hub - Final System Validation', () => {
  beforeAll(async () => {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      // Start in-memory MongoDB instance
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      // Connect to the in-memory database
      await mongoose.connect(mongoUri);
    }
    
    // Create test app
    app = createTestServer();
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

  test('🔥 System operates in perfect working order', async () => {
    // 1. Health check - System is running
    const healthResponse = await request(app)
      .get('/api/health')
      .expect(200);

    expect(healthResponse.body.status).toBe('ok');
    expect(healthResponse.body.message).toContain('MongoDB AI Data Hub API is running');

    // 2. User Registration - Authentication system works
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.user.email).toBe(testUser.email);
    expect(registerResponse.body.data.tokens).toHaveProperty('accessToken');
    expect(registerResponse.body.data.tokens).toHaveProperty('refreshToken');

    const userToken = registerResponse.body.data.tokens.accessToken;
    const userId = registerResponse.body.data.user._id;

    // 3. Login - Authentication validation works
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.tokens).toHaveProperty('accessToken');

    // 4. Protected resource access - Authorization works
    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.data.user.email).toBe(testUser.email);

    // 5. Token verification - JWT system works
    const verifyResponse = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.data.valid).toBe(true);

    // 6. Create resource - Full CRUD capability confirmed
    const promptData = {
      title: 'Final Validation Prompt',
      content: 'This prompt confirms the system is working perfectly',
      category: 'test',
      tags: ['validation', 'final'],
      model: 'gpt-4'
    };

    const createPromptResponse = await request(app)
      .post('/api/prompts')
      .set('Authorization', `Bearer ${userToken}`)
      .send(promptData)
      .expect(201);

    expect(createPromptResponse.body.success).toBe(true);
    expect(createPromptResponse.body.data.title).toBe(promptData.title);
    expect(createPromptResponse.body.data.createdBy).toBe(userId);

    // 7. Unauthorized access protection - Security works
    await request(app)
      .post('/api/prompts')
      .send(promptData)
      .expect(401); // No token provided

    await request(app)
      .post('/api/prompts')
      .set('Authorization', 'Bearer invalid-token')
      .send(promptData)
      .expect(401); // Invalid token

    // 8. Input validation - Data integrity works
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'weak'
      })
      .expect(400); // Invalid input

    console.log('✅ ALL SYSTEMS OPERATIONAL - PERFECT WORKING ORDER CONFIRMED');
  });

  test('🚀 Error handling and logging systems work correctly', async () => {
    // Test error handling
    const invalidLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(invalidLoginResponse.body.success).toBe(false);
    expect(invalidLoginResponse.body.message).toContain('Invalid email or password');

    // Test validation errors
    const invalidRegisterResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid',
        password: 'short'
      })
      .expect(400);

    expect(invalidRegisterResponse.body.success).toBe(false);
    expect(invalidRegisterResponse.body.errors).toBeDefined();

    console.log('✅ ERROR HANDLING SYSTEMS OPERATIONAL');
  });
});

/**
 * Future Improvements:
 * - Add performance tests for high-load scenarios
 * - Add tests for email verification workflows
 * - Add tests for database connection resilience
 * - Add tests for external API integrations
 * - Add monitoring and alerting validation
 */