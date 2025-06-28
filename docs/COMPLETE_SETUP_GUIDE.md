# 🛠️ COMPLETE SETUP GUIDE - MongoDB AI Hub

## 📋 **WHAT YOU NEED TO INSTALL**

### **Required Tools**
1. **Node.js** (v18 or higher)
2. **MongoDB** (Local or Atlas Cloud)
3. **Git** (for version control)
4. **npm** (comes with Node.js)

### **Optional but Recommended**
1. **MongoDB Compass** (GUI for MongoDB)
2. **Postman** (API testing)
3. **VS Code** (Code editor)
4. **Docker** (for containerization)
5. **1Password CLI** (for secrets management)

---

## 🚀 **OPTION 1: QUICK LOCAL SETUP**

### **Step 1: Install MongoDB Locally**

#### **macOS (using Homebrew)**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify it's running
mongosh --eval "db.version()"
```

#### **Windows**
1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" installation)
3. MongoDB will start automatically as a Windows service

#### **Linux (Ubuntu/Debian)**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### **Step 2: Install Node.js**

#### **All Platforms - Using Node Version Manager (Recommended)**
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then install Node.js
nvm install 18
nvm use 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### **Step 3: Clone and Setup the Project**
```bash
# Clone the repository
git clone https://github.com/d33disc/mongodb-ai-hub.git
cd mongodb-ai-hub

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

### **Step 4: Configure Environment Variables**
Edit `.env` file:
```env
# MongoDB Connection (Local)
MONGODB_URI=mongodb://localhost:27017/mongodb-ai-hub

# JWT Secrets (Generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional
CORS_ORIGIN=http://localhost:3000
```

### **Step 5: Start the Application**
```bash
# Run in development mode
npm run dev

# Or run in production mode
npm start
```

---

## ☁️ **OPTION 2: MONGODB ATLAS SETUP (Cloud)**

### **Why Use Atlas?**
- ✅ No local installation needed
- ✅ Automatic backups
- ✅ Built-in monitoring
- ✅ Global availability
- ✅ Free tier available (512MB)

### **Step 1: Create MongoDB Atlas Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Verify your email

### **Step 2: Create Your First Cluster**
1. **Choose a plan**: Select "Shared" (Free)
2. **Cloud Provider**: Choose AWS, Google Cloud, or Azure
3. **Region**: Select closest to you
4. **Cluster Name**: `mongodb-ai-hub-cluster`
5. Click "Create Cluster" (takes 3-5 minutes)

### **Step 3: Setup Database Access**
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. **Authentication Method**: Password
4. **Username**: `aiHubAdmin`
5. **Password**: Generate secure password (save it!)
6. **Database User Privileges**: Atlas Admin
7. Click "Add User"

### **Step 4: Setup Network Access**
1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production: Add only your specific IP addresses
4. Click "Confirm"

### **Step 5: Get Your Connection String**
1. Go to "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. **Driver**: Node.js, **Version**: 5.5 or later
5. Copy the connection string:
   ```
   mongodb+srv://aiHubAdmin:<password>@mongodb-ai-hub-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password

### **Step 6: Update Your .env File**
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://aiHubAdmin:YourPassword@mongodb-ai-hub-cluster.xxxxx.mongodb.net/mongodb-ai-hub?retryWrites=true&w=majority

# Rest of your environment variables...
```

---

## 🔧 **ADDITIONAL TOOLS SETUP**

### **MongoDB Compass (GUI)**
1. Download from: https://www.mongodb.com/products/compass
2. Install and open
3. Connect using your connection string
4. Visually explore your database

### **Postman (API Testing)**
1. Download from: https://www.postman.com/downloads/
2. Import our collection:
   ```bash
   # Generate Postman collection
   cd /Users/chrisdavis/Projects/mongodb-ai-hub
   npm run generate-postman-collection
   ```
3. Set environment variables in Postman:
   - `baseUrl`: http://localhost:3000
   - `token`: (will be set after login)

### **Docker (Container Setup)**
```bash
# Install Docker Desktop
# macOS/Windows: https://www.docker.com/products/docker-desktop
# Linux: Use your package manager

# Run MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0

# Run entire app with Docker Compose
docker-compose up -d
```

### **1Password CLI (Secrets Management)**
```bash
# Install 1Password CLI
# macOS
brew install --cask 1password-cli

# Sign in
op signin

# Use with the project
cp .env.1password.template .env
op inject -i .env.template -o .env
```

---

## 📱 **MONGODB ATLAS MOBILE APP**

### **Monitor Your Database on the Go**
1. Download "MongoDB Atlas" app
   - iOS: App Store
   - Android: Google Play
2. Sign in with your Atlas account
3. Monitor:
   - Cluster performance
   - Real-time metrics
   - Alerts and notifications

---

## 🔍 **VERIFY YOUR SETUP**

### **1. Check MongoDB Connection**
```bash
# Local MongoDB
mongosh --eval "db.adminCommand('ping')"

# Atlas MongoDB (replace with your connection string)
mongosh "mongodb+srv://cluster.xxxxx.mongodb.net/" --eval "db.adminCommand('ping')"
```

### **2. Test the Application**
```bash
# Start the server
npm run dev

# In another terminal, test health
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","message":"MongoDB AI Data Hub API is running"}
```

### **3. Run Database Tests**
```bash
# Test database connection
npm run test:db

# Run all tests
npm test
```

---

## 🚨 **TROUBLESHOOTING**

### **MongoDB Connection Issues**

#### **Local MongoDB Won't Start**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check MongoDB logs
# macOS: /usr/local/var/log/mongodb/mongo.log
# Linux: /var/log/mongodb/mongod.log

# Restart MongoDB
# macOS
brew services restart mongodb-community

# Linux
sudo systemctl restart mongod
```

#### **Atlas Connection Failed**
1. **Check IP Whitelist**: Ensure your IP is allowed in Network Access
2. **Verify Credentials**: Username and password are correct
3. **Check Connection String**: No missing characters
4. **Test with mongosh**:
   ```bash
   mongosh "your-connection-string" --username yourUsername
   ```

### **Node.js Issues**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Use correct Node version
nvm use 18
```

---

## 🎯 **QUICK START COMMANDS**

Save these aliases for quick access:

```bash
# Add to ~/.zshrc or ~/.bashrc

# MongoDB commands
alias mongo-start="brew services start mongodb-community"
alias mongo-stop="brew services stop mongodb-community"
alias mongo-status="brew services list | grep mongodb"

# AI Hub commands
alias ai-hub="cd /Users/chrisdavis/Projects/mongodb-ai-hub"
alias ai-hub-start="ai-hub && npm run dev"
alias ai-hub-test="ai-hub && npm test"
alias ai-hub-docker="ai-hub && docker-compose up -d"

# Quick health check
alias ai-health="curl -s http://localhost:3000/api/health | jq ."
```

---

## 📊 **PRODUCTION BEST PRACTICES**

### **MongoDB Atlas Production Setup**
1. **Enable Backup**: Daily automatic backups
2. **Set Alerts**: CPU, memory, connections
3. **Enable Encryption**: At rest and in transit
4. **Configure Replica Set**: For high availability
5. **Set Read/Write Concerns**: For data consistency

### **Security Checklist**
- [ ] Change default passwords
- [ ] Enable MongoDB authentication
- [ ] Restrict network access (specific IPs only)
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Regular security updates

### **Performance Optimization**
- [ ] Create database indexes
- [ ] Enable connection pooling
- [ ] Set appropriate MongoDB connection limits
- [ ] Monitor slow queries
- [ ] Use MongoDB Atlas Performance Advisor

---

## 🆘 **GET HELP**

### **Official Documentation**
- **MongoDB**: https://docs.mongodb.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Node.js**: https://nodejs.org/docs/
- **Our Docs**: `/docs` folder in the project

### **Community Support**
- **MongoDB Forums**: https://developer.mongodb.com/community/forums/
- **Stack Overflow**: Tag with `mongodb` and `node.js`
- **Our GitHub**: https://github.com/d33disc/mongodb-ai-hub/issues

### **Video Tutorials**
- MongoDB University: https://university.mongodb.com/
- YouTube: Search "MongoDB Atlas setup"

---

## ✅ **SETUP CHECKLIST**

### **Local Development**
- [ ] Node.js v18+ installed
- [ ] MongoDB installed and running
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Server starts successfully
- [ ] Health check passes

### **MongoDB Atlas**
- [ ] Atlas account created
- [ ] Cluster deployed
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] Connection tested

### **Optional Tools**
- [ ] MongoDB Compass installed
- [ ] Postman configured
- [ ] Docker installed
- [ ] 1Password CLI setup

**🎉 Once everything is checked, your MongoDB AI Hub is ready for production use!**