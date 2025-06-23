# System Architecture

This document outlines the system architecture for MongoDB AI Data Hub, designed to be implementable by developers with minimal coding experience.

## Architecture Overview

![System Architecture](../assets/system-architecture.png)

### Core Components

1. **Data Layer: MongoDB Atlas**
   - Fully managed cloud database (zero infrastructure management)
   - Vector search capabilities for semantic retrieval
   - Automatic scaling and backups
   - Multi-region deployment options

2. **API Layer: Express.js**
   - RESTful API endpoints for all operations
   - JWT authentication and role-based access control
   - Rate limiting and request validation
   - GraphQL API (future enhancement)

3. **Frontend Layer: Low-Code Tools**
   - Admin dashboard built with Retool
   - Client portal built with Bubble.io
   - Embeddable widgets for website integration
   - Mobile-responsive design

4. **AI Enhancement Layer**
   - Vector embedding generation with OpenAI or Claude
   - Semantic search implementation
   - Content categorization and tagging
   - RAG (Retrieval-Augmented Generation) implementation

## Data Models

### 1. Prompt Collection
```javascript
{
  title: String,
  content: String,
  tags: [String],
  category: String,
  model: String,
  createdBy: String,
  isPublic: Boolean,
  metadata: Map
}
```

### 2. Vector Store Collection
```javascript
{
  name: String,
  description: String,
  namespace: String,
  vectorDimension: Number,
  embeddings: [{
    id: String,
    text: String,
    vector: [Number],
    metadata: Map
  }],
  model: String,
  createdBy: String
}
```

### 3. Chat History Collection
```javascript
{
  userId: String,
  title: String,
  model: String,
  messages: [{
    role: String,
    content: String,
    timestamp: Date,
    metadata: Map
  }],
  tags: [String],
  summarized: Boolean,
  summary: String,
  rating: Number,
  isFavorite: Boolean,
  isArchived: Boolean
}
```

### 4. RAG Collection
```javascript
{
  name: String,
  description: String,
  documentChunks: [{
    chunkId: String,
    content: String,
    embedding: [Number],
    metadata: Map,
    sourceId: String,
    sourceType: String
  }],
  queries: [{
    query: String,
    queryEmbedding: [Number],
    retrievedChunks: [{
      chunkId: String,
      similarity: Number,
      content: String
    }],
    generatedAnswer: String,
    feedback: {
      rating: Number,
      comments: String
    },
    userId: String,
    timestamp: Date
  }],
  embeddingModel: String,
  createdBy: String,
  isPublic: Boolean,
  tags: [String]
}
```

## Technical Stack

### Core Technologies
- **Database**: MongoDB Atlas (cloud hosted)
- **Backend**: Node.js with Express
- **Frontend**: Retool, Bubble.io
- **Authentication**: JWT with Auth0 integration
- **Hosting**: Render.com or similar PaaS

### Development Tools
- **Version Control**: Git/GitHub
- **CI/CD**: GitHub Actions (basic pipeline)
- **Documentation**: Markdown in GitHub
- **API Testing**: Postman/Insomnia

### Third-Party Services
- **Embedding Generation**: OpenAI API or Claude API
- **Authentication**: Auth0 (optional)
- **Analytics**: Simple Analytics or Plausible
- **Monitoring**: MongoDB Atlas monitoring

## Scaling Considerations

The architecture is designed to scale with minimal changes:

1. **Database Scaling**
   - MongoDB Atlas handles scaling automatically
   - Upgrade tiers as usage increases

2. **API Scaling**
   - Deploy on scalable platforms like Render.com
   - Use serverless functions for specific operations

3. **Frontend Scaling**
   - Retool and Bubble.io handle scaling internally
   - Use CDN for static assets

## Security Considerations

1. **Data Security**
   - Encryption at rest (MongoDB Atlas)
   - Encryption in transit (HTTPS)
   - Regular security audits

2. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - API keys for programmatic access

3. **Operational Security**
   - Regular backups
   - Audit logging
   - Monitoring and alerting

## Low-Code Implementation Notes

This architecture is specifically designed to be implementable with minimal custom code:

1. **Database**: Use MongoDB Atlas UI for setup and basic operations
2. **Backend**: Use Express Generator and pre-built middleware
3. **Frontend**: Build entirely in Retool and Bubble.io
4. **Deployment**: Use platform-as-service with 1-click deployments

By leveraging these managed services and low-code tools, the system can be built and maintained by developers with limited coding experience while still providing a robust, scalable solution.