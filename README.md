# 🤖 MongoDB AI Hub

> **A specialized data management system for AI applications with secure authentication and auto-launch capabilities for cloud environments.**

[![Auto-Launch](https://img.shields.io/badge/Auto--Launch-Enabled-green)](./cloud-deploy.md)
[![Authentication](https://img.shields.io/badge/Auth-JWT-blue)](#authentication)
[![Cloud Ready](https://img.shields.io/badge/Cloud-Ready-orange)](#cloud-environments)

## 🚀 Auto-Launch in Cloud Environments

This repository is **pre-configured to automatically start** in all major cloud development environments:

- ✅ **GitHub Codespaces** - Auto-starts on workspace open
- ✅ **GitPod** - Launches when workspace loads  
- ✅ **Replit** - Starts when repl opens
- ✅ **VS Code** - Can auto-start on folder open

**No more forgetting to launch your AI Hub!** 🎉

### Quick Health Check
```bash
curl http://localhost:3000/api/health
# Response: {"status":"ok","message":"MongoDB AI Data Hub API is running"}
```

## 📋 Features

### 🔐 **Secure Authentication System**
- JWT-based user authentication
- Password hashing with bcrypt
- Role-based access control (user/admin)
- Rate limiting and input validation
- Session management

### 🤖 **AI Prompt Management**
- Store and organize AI prompts
- Categorize by use case (coding, analysis, etc.)
- Tag and search functionality  
- Model-specific prompts (GPT-4, Claude, etc.)
- Version control and metadata

### 🧠 **Vector Store Management**
- Store vector embeddings for semantic search
- Multiple vector stores with namespaces
- Support for different embedding dimensions
- Metadata and search capabilities
- Integration with AI/ML pipelines

### 🌐 **Cloud-Native Features**
- Auto-launch in cloud environments
- Environment detection and configuration
- Health monitoring and status checks
- Container and serverless ready

## 🔧 Quick Start

### Cloud Environments (Auto-Start)
1. **Open in any cloud environment** (Codespaces, GitPod, Replit)
2. **Server starts automatically** - no action needed!
3. **Access at**: Check port 3000 forwarding in your environment

### Local Development
```bash
# Clone and setup
git clone https://github.com/d33disc/mongodb-ai-hub.git
cd mongodb-ai-hub
npm install

# Start the server
npm run dev

# Or use auto-start script
npm run auto-start
```

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/register    # Create user account
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update profile
PUT  /api/auth/change-password  # Change password
GET  /api/auth/verify      # Verify token
```

### AI Prompts
```http
GET    /api/prompts        # List prompts (public)
POST   /api/prompts        # Create prompt (auth required)
GET    /api/prompts/:id    # Get specific prompt
PUT    /api/prompts/:id    # Update prompt (auth required)
DELETE /api/prompts/:id    # Delete prompt (auth required)
GET    /api/prompts/search/text?query=  # Search prompts
```

### Vector Stores
```http
GET    /api/vectorstores   # List vector stores
POST   /api/vectorstores   # Create store (auth required)
GET    /api/vectorstores/:id  # Get specific store
PUT    /api/vectorstores/:id  # Update store (auth required)
DELETE /api/vectorstores/:id  # Delete store (auth required)
POST   /api/vectorstores/:id/embeddings     # Add embeddings
DELETE /api/vectorstores/:id/embeddings/:embeddingId  # Remove embedding
```

## 🔑 Authentication Usage

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login & Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com", 
    "password": "SecurePass123!"
  }'
```

### Use Token for API Calls
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Code Review Prompt",
    "content": "Review this code for bugs and improvements:",
    "category": "coding",
    "model": "gpt-4"
  }'
```

## 🛠 Integration Examples

### Python Integration
```python
import requests

# Login and get token
response = requests.post('http://localhost:3000/api/auth/login', json={
    'email': 'user@example.com',
    'password': 'password'
})
token = response.json()['data']['tokens']['accessToken']

# Create a prompt
requests.post('http://localhost:3000/api/prompts', 
    headers={'Authorization': f'Bearer {token}'},
    json={
        'title': 'Data Analysis Prompt',
        'content': 'Analyze this dataset and provide insights:',
        'category': 'analysis'
    })
```

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Login
const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
    email: 'user@example.com',
    password: 'password'
});

const token = loginResponse.data.data.tokens.accessToken;

// Create vector store
await axios.post('http://localhost:3000/api/vectorstores', {
    name: 'Product Embeddings',
    namespace: 'ecommerce', 
    vectorDimension: 1536,
    model: 'text-embedding-ada-002'
}, {
    headers: { Authorization: `Bearer ${token}` }
});
```

## 🌍 Cloud Environments

### GitHub Codespaces
- **Auto-starts**: ✅ Enabled in `.devcontainer/devcontainer.json`
- **MongoDB**: Auto-configured
- **Access**: Port forwarding automatically configured

### GitPod  
- **Auto-starts**: ✅ Enabled in `.gitpod.yml`
- **MongoDB**: Local instance setup
- **Access**: `https://3000-[workspace].gitpod.io`

### Replit
- **Auto-starts**: ✅ Enabled in `.replit`
- **MongoDB**: Configured for Replit environment
- **Access**: Repl web view

### VS Code (Local/Remote)
- **Auto-starts**: ✅ Optional via tasks
- **MongoDB**: Local or remote connection
- **Access**: `http://localhost:3000`

## 📊 Monitoring & Status

### Check Server Status
```bash
# Health check
npm run health-check

# Full status
npm run status

# View logs  
tail -f /tmp/ai-hub.log
```

### Environment URLs
Each environment will show the appropriate URL for access. Look for port 3000 forwarding in your cloud environment.

## 🔧 Configuration

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/mongodb-ai-hub
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Optional  
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Auto-Start Configuration
The auto-start feature is configured in:
- `.devcontainer/devcontainer.json` - GitHub Codespaces
- `.gitpod.yml` - GitPod
- `.replit` - Replit  
- `.vscode/tasks.json` - VS Code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in a cloud environment
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [cloud-deploy.md](./cloud-deploy.md)
- **Issues**: [GitHub Issues](https://github.com/d33disc/mongodb-ai-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/d33disc/mongodb-ai-hub/discussions)

---

**Ready to use in any cloud environment with automatic startup! 🚀**