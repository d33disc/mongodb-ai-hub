// 🏗️ MongoDB Initialization Script
// This script runs when MongoDB container starts for the first time

// Switch to our application database
db = db.getSiblingDB('mongodb-ai-hub');

// Create application user with proper permissions
db.createUser({
  user: 'ai-hub-user',
  pwd: 'ai-hub-password',
  roles: [
    {
      role: 'readWrite',
      db: 'mongodb-ai-hub'
    }
  ]
});

// Create collections with indexes for better performance
db.createCollection('users');
db.createCollection('prompts');
db.createCollection('vectorstores');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "role": 1 });

// Create indexes for prompts collection
db.prompts.createIndex({ "title": "text", "content": "text", "tags": "text" });
db.prompts.createIndex({ "category": 1 });
db.prompts.createIndex({ "model": 1 });
db.prompts.createIndex({ "userId": 1 });
db.prompts.createIndex({ "createdAt": 1 });
db.prompts.createIndex({ "isPublic": 1 });

// Create indexes for vectorstores collection
db.vectorstores.createIndex({ "name": 1, "namespace": 1 });
db.vectorstores.createIndex({ "userId": 1 });
db.vectorstores.createIndex({ "vectorDimension": 1 });
db.vectorstores.createIndex({ "createdAt": 1 });

// Create indexes for embeddings within vectorstores
db.vectorstores.createIndex({ "embeddings.metadata": 1 });
db.vectorstores.createIndex({ "embeddings.timestamp": 1 });

print('✅ MongoDB AI Hub database initialized successfully!');
print('📊 Collections created: users, prompts, vectorstores');
print('🔍 Indexes created for optimal performance');
print('👤 Application user created: ai-hub-user');