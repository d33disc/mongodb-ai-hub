# 🚀 Complete Setup Guide - MongoDB AI Hub

## 📋 **What You Need to Install**

### **1. Essential Tools**
```bash
# Node.js & npm (Required)
node --version  # Should be 18+
npm --version

# Git (Required)
git --version

# Docker (Recommended)
docker --version
docker-compose --version
```

### **2. Database Options (Choose One)**

#### **Option A: MongoDB Atlas (☁️ Cloud - Recommended)**
- ✅ **No installation required**
- ✅ **Automatic backups & monitoring**
- ✅ **99.995% uptime SLA**
- ✅ **Global deployment**
- 🔗 Sign up: https://cloud.mongodb.com

#### **Option B: Docker MongoDB (🐳 Local - Easiest)**
- ✅ **One command setup**
- ✅ **Includes Redis & monitoring**
- ✅ **Production-ready config**
```bash
# Everything in containers
docker-compose up -d
```

#### **Option C: Local MongoDB (💻 Advanced)**
```bash
# Mac
brew install mongodb-community
brew services start mongodb-community

# Linux
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

## 🛠️ **Setup Methods**

### **Method 1: Automated Setup (Easiest)**
```bash
# Clone the repository
git clone https://github.com/d33disc/mongodb-ai-hub.git
cd mongodb-ai-hub

# Run the automated setup script
./scripts/setup-local.sh

# Start the application
npm run dev
```

### **Method 2: Docker Everything (Production-like)**
```bash
# Clone the repository
git clone https://github.com/d33disc/mongodb-ai-hub.git
cd mongodb-ai-hub

# Start everything with Docker
./scripts/docker-dev.sh start

# Access the application
open http://localhost:3000/api/health
```

### **Method 3: Manual Setup (Full Control)**
```bash
# Clone the repository
git clone https://github.com/d33disc/mongodb-ai-hub.git
cd mongodb-ai-hub

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit with your settings
nano .env

# Start the application
npm run dev
```

## ⚙️ **Configuration Files Created**

### **📁 Development Files**
```
📦 mongodb-ai-hub/
├── 🐳 docker-compose.yml         # Local development stack
├── 🐳 docker-compose.prod.yml    # Production deployment
├── 🐳 Dockerfile                 # Development container
├── 🐳 Dockerfile.prod            # Production-optimized container
├── 🛠️ scripts/setup-local.sh     # Automated local setup
├── 🛠️ scripts/docker-dev.sh      # Docker management helper
└── 🛠️ scripts/init-mongo.js      # Database initialization
```

### **📁 Configuration Files**
```
📦 config/
├── 🌐 nginx.conf                 # Load balancer configuration
├── 📊 prometheus.yml             # Monitoring configuration
├── 📈 grafana/                   # Dashboard configurations
├── 🔍 filebeat.yml               # Log aggregation
└── 🔒 ssl/                       # SSL certificates
```

### **📁 Documentation**
```
📦 docs/
├── 👶 KIDS_GUIDE.md              # 12-year-old friendly guide
├── 🤖 AI_AGENT_INTEGRATION.md    # AI system architecture
├── 🚀 FUTURE_ROADMAP.md          # Feature planning
├── 🏭 PRODUCTION_DEPLOYMENT.md   # Enterprise deployment
└── 🔒 SECURITY.md                # Security best practices
```

## 🔗 **How Files Connect Together**

### **Application Layer**
```mermaid
graph LR
    ENV[.env file] --> APP[Node.js App]
    APP --> DB[MongoDB]
    APP --> CACHE[Redis]
    APP --> LOGS[Log Files]
    
    JWT[JWT Utils] --> AUTH[Authentication]
    AUTH --> ROUTES[API Routes]
    ROUTES --> MODELS[Database Models]
```

### **Infrastructure Layer**
```mermaid
graph TB
    USER[User Request] --> NGINX[NGINX Load Balancer]
    NGINX --> APP1[App Instance 1]
    NGINX --> APP2[App Instance 2]
    
    APP1 --> MONGO[(MongoDB Atlas)]
    APP2 --> MONGO
    
    APP1 --> REDIS[(Redis Cache)]
    APP2 --> REDIS
    
    MONITOR[Prometheus] --> APP1
    MONITOR --> APP2
    MONITOR --> GRAFANA[Grafana Dashboard]
```

## 📊 **Management Tools**

### **MongoDB Management**
```bash
# MongoDB Compass (Visual GUI)
# Download from: https://www.mongodb.com/products/compass

# MongoDB CLI tools
mongosh  # MongoDB shell
mongoimport  # Import data
mongoexport  # Export data
mongodump    # Backup database
mongorestore # Restore database
```

### **Development Tools**
```bash
# API Testing
curl  # Command line HTTP client
# Or download Postman: https://www.postman.com

# Code Quality
npm run lint      # Check code style
npm run test      # Run test suite
npm run validate  # Full validation

# Docker Management
./scripts/docker-dev.sh status  # Check services
./scripts/docker-dev.sh logs    # View logs
./scripts/docker-dev.sh shell   # Access container
```

## 🚦 **Startup Sequence**

### **Development Mode**
1. **Start MongoDB** (if local) or ensure Atlas connection
2. **Start Redis** (if using caching)
3. **Start Application**: `npm run dev`
4. **Verify Health**: `curl http://localhost:3000/api/health`

### **Docker Mode**
1. **Start All Services**: `./scripts/docker-dev.sh start`
2. **Wait for Initialization** (about 30 seconds)
3. **Check Status**: `./scripts/docker-dev.sh status`
4. **View Dashboard**: `http://localhost:3000`

### **Production Mode**
1. **Deploy to Atlas**: Configure MongoDB Atlas cluster
2. **Setup Environment**: Production .env with real secrets
3. **Deploy Containers**: `docker-compose -f docker-compose.prod.yml up -d`
4. **Configure Monitoring**: Setup alerts and dashboards
5. **Test Failover**: Verify redundancy works

## 🔧 **Environment Variables Explained**

```bash
# Database Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-hub
# Atlas connection string with authentication

# Security Keys
JWT_SECRET=your-256-bit-secret-key-here
JWT_REFRESH_SECRET=different-256-bit-secret-for-refresh-tokens
# Generate with: openssl rand -base64 32

# Server Configuration
PORT=3000                    # Application port
NODE_ENV=development         # Environment mode
CORS_ORIGIN=http://localhost # Allowed origins

# Optional Services
REDIS_URL=redis://localhost:6379    # Cache server
LOG_LEVEL=info                       # Logging verbosity
```

## 🎯 **Quick Start Commands**

### **Immediate Testing**
```bash
# Health check
curl http://localhost:3000/api/health

# Create account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!", "firstName": "Test", "lastName": "User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
```

### **Development Workflow**
```bash
# Start development
npm run dev

# Run tests
npm test

# Check code quality
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

### **Docker Workflow**
```bash
# Start everything
./scripts/docker-dev.sh start

# View logs
./scripts/docker-dev.sh logs

# Open app shell
./scripts/docker-dev.sh shell

# Open database shell
./scripts/docker-dev.sh mongo

# Stop everything
./scripts/docker-dev.sh stop
```

## 🔍 **Monitoring & URLs**

### **Application Endpoints**
- 🏠 **Main App**: http://localhost:3000
- 💓 **Health Check**: http://localhost:3000/api/health
- 📋 **API Docs**: http://localhost:3000/api

### **Development Tools**
- 🗃️ **Database Admin**: http://localhost:8081 (admin/admin)
- 📊 **Metrics**: http://localhost:9090 (Prometheus)
- 📈 **Dashboards**: http://localhost:3001 (Grafana)
- 🔍 **Logs**: `./logs/` directory

### **Production Monitoring**
- 🌐 **Load Balancer**: http://localhost (NGINX)
- 📊 **Metrics**: http://monitoring.yourdomain.com
- 🚨 **Alerts**: Configured in Atlas & Grafana
- 💾 **Backups**: Automated in Atlas & S3

## ✅ **Success Indicators**

### **Application Started Successfully**
```bash
✅ Server running on port 3000
✅ MongoDB connected successfully
✅ JWT tokens configured
✅ Health check: http://localhost:3000/api/health returns {"status":"ok"}
```

### **Docker Stack Running**
```bash
✅ All containers healthy
✅ NGINX load balancer responding
✅ Redis cache connected
✅ Monitoring dashboards accessible
```

### **Production Ready**
```bash
✅ Atlas cluster operational
✅ Multi-region deployment active
✅ Automated backups configured
✅ Monitoring alerts active
✅ SSL certificates valid
```

## 🆘 **Troubleshooting**

### **Common Issues**
- **Port 3000 in use**: `lsof -i :3000` then kill process
- **MongoDB connection failed**: Check MONGODB_URI in .env
- **Docker not starting**: Ensure Docker Desktop is running
- **Tests failing**: Check MongoDB is accessible
- **401 errors**: Verify JWT_SECRET is set correctly

### **Getting Help**
- 📚 **Kids Guide**: `docs/KIDS_GUIDE.md`
- 🏭 **Production Guide**: `docs/PRODUCTION_DEPLOYMENT.md`
- 🔒 **Security Guide**: `docs/SECURITY.md`
- 🐛 **Issues**: https://github.com/d33disc/mongodb-ai-hub/issues

**You now have everything needed to run a production-ready MongoDB AI Hub! 🎉**