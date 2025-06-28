# 🧰 TOOLS AND DEPENDENCIES - MongoDB AI Hub

## 📦 **WHAT'S ALREADY INCLUDED**

### **Core Dependencies (Already in package.json)**
```json
{
  "dependencies": {
    "express": "^4.19.2",          // Web framework
    "mongoose": "^8.4.1",          // MongoDB ORM
    "jsonwebtoken": "^9.0.2",      // JWT authentication
    "bcryptjs": "^2.4.3",          // Password hashing
    "cors": "^2.8.5",              // Cross-origin support
    "dotenv": "^16.4.5",           // Environment variables
    "express-validator": "^7.1.0", // Input validation
    "express-rate-limit": "^7.3.0", // Rate limiting
    "helmet": "^7.1.0",            // Security headers
    "winston": "^3.13.0",          // Logging
    "mongodb-memory-server": "^9.2.0", // Testing
    "jest": "^29.7.0",             // Test framework
    "supertest": "^7.0.0"          // API testing
  }
}
```

---

## 🛠️ **REQUIRED EXTERNAL TOOLS**

### **1. MongoDB (Choose One)**

#### **Option A: MongoDB Local**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Windows
# Download installer: https://www.mongodb.com/try/download/community

# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### **Option B: MongoDB Atlas (Cloud)**
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (512MB)
3. Get connection string
4. Update `.env` file

#### **Option C: Docker MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb \
  -e MONGO_INITDB_DATABASE=mongodb-ai-hub \
  mongo:7.0
```

### **2. Node.js & npm**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Direct download
# https://nodejs.org/en/download/
```

---

## 🎯 **QUICK INSTALL SCRIPT**

Create and run this script to install everything:

```bash
#!/bin/bash
# save as: install-all.sh

echo "🚀 Installing MongoDB AI Hub Dependencies..."

# Check OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Detected macOS"
    
    # Install Homebrew if not installed
    if ! command -v brew &> /dev/null; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install MongoDB
    echo "📦 Installing MongoDB..."
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    brew services start mongodb-community@7.0
    
    # Install Node.js
    echo "📦 Installing Node.js..."
    brew install node@18
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux"
    
    # Install MongoDB
    echo "📦 Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Install Node.js
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your settings!"
fi

echo "✅ Installation complete!"
echo "🚀 Run 'npm run dev' to start the server"
```

Make it executable and run:
```bash
chmod +x install-all.sh
./install-all.sh
```

---

## 🐳 **DOCKER SETUP (All-in-One)**

### **docker-compose.yml** (Already included)
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: mongodb-ai-hub
    volumes:
      - mongodb_data:/data/db

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/mongodb-ai-hub
      JWT_SECRET: your-secret-key
      JWT_REFRESH_SECRET: your-refresh-secret
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

**Run Everything with Docker:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🔧 **OPTIONAL TOOLS**

### **1. MongoDB Compass (GUI)**
- **Download**: https://www.mongodb.com/products/compass
- **Purpose**: Visual database management
- **Usage**: Connect with your MongoDB URI

### **2. Postman**
- **Download**: https://www.postman.com/downloads/
- **Purpose**: API testing
- **Import**: Use our Postman collection in `/postman` folder

### **3. VS Code Extensions**
```bash
# Recommended extensions
code --install-extension mongodb.mongodb-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension christian-kohler.npm-intellisense
code --install-extension formulahendry.auto-rename-tag
```

### **4. MongoDB Shell (mongosh)**
```bash
# Install separately for better CLI experience
brew install mongosh  # macOS
# Or download: https://www.mongodb.com/try/download/shell
```

### **5. 1Password CLI**
```bash
# For secure secrets management
brew install --cask 1password-cli  # macOS

# Usage with project
op inject -i .env.template -o .env
```

---

## 📊 **SYSTEM REQUIREMENTS**

### **Minimum Requirements**
- **RAM**: 4GB (8GB recommended)
- **Storage**: 1GB free space
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v5.0 or higher
- **OS**: macOS, Linux, Windows 10+

### **Recommended Setup**
- **RAM**: 8GB or more
- **CPU**: 2+ cores
- **Storage**: SSD with 5GB free
- **Network**: Stable internet for Atlas

---

## 🚀 **QUICK VERIFICATION**

Run this script to verify everything is installed:

```bash
#!/bin/bash
# save as: verify-setup.sh

echo "🔍 Verifying MongoDB AI Hub Setup..."

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    node --version
else
    echo "❌ Not installed"
fi

# Check npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    npm --version
else
    echo "❌ Not installed"
fi

# Check MongoDB
echo -n "MongoDB: "
if command -v mongod &> /dev/null; then
    mongod --version | head -1
else
    echo "❌ Not installed locally (might be using Atlas)"
fi

# Check mongosh
echo -n "MongoDB Shell: "
if command -v mongosh &> /dev/null; then
    mongosh --version
else
    echo "⚠️  Optional - Not installed"
fi

# Check Docker
echo -n "Docker: "
if command -v docker &> /dev/null; then
    docker --version
else
    echo "⚠️  Optional - Not installed"
fi

# Check Git
echo -n "Git: "
if command -v git &> /dev/null; then
    git --version
else
    echo "❌ Not installed"
fi

# Check if MongoDB is running
echo -n "MongoDB Status: "
if pgrep -x "mongod" > /dev/null; then
    echo "✅ Running"
else
    echo "⚠️  Not running (or using Atlas/Docker)"
fi

# Check project
echo -n "Project Dependencies: "
if [ -d "node_modules" ]; then
    echo "✅ Installed"
else
    echo "❌ Run 'npm install'"
fi

# Check .env
echo -n "Environment Config: "
if [ -f ".env" ]; then
    echo "✅ .env exists"
else
    echo "❌ Create .env file"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Fix any ❌ items above"
echo "2. Run 'npm run dev' to start"
echo "3. Test with: curl http://localhost:3000/api/health"
```

---

## 🌐 **CLOUD ALTERNATIVES**

### **Free MongoDB Hosting**
1. **MongoDB Atlas**: 512MB free forever
2. **Railway**: MongoDB addon available
3. **Render**: MongoDB compatible databases

### **Free Node.js Hosting**
1. **Vercel**: Great for serverless
2. **Railway**: Full Node.js apps
3. **Render**: Web services free tier
4. **Cyclic.sh**: Serverless Node.js

### **All-in-One Platforms**
1. **Replit**: Everything included
2. **GitHub Codespaces**: Full dev environment
3. **GitPod**: Cloud development

---

## 📱 **MOBILE DEVELOPMENT**

### **MongoDB Realm (Mobile SDK)**
```bash
# For React Native
npm install realm

# For Flutter
flutter pub add realm

# Connect to your MongoDB Atlas
```

### **REST API Clients**
- **iOS**: Alamofire, URLSession
- **Android**: Retrofit, OkHttp
- **React Native**: Axios, Fetch API

---

## 🆘 **COMMON ISSUES**

### **"Cannot connect to MongoDB"**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
tail -f /var/log/mongodb/mongod.log          # Linux
```

### **"Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### **"Port 3000 already in use"**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

---

## ✅ **INSTALLATION COMPLETE CHECKLIST**

- [ ] MongoDB installed (local/Atlas/Docker)
- [ ] Node.js v18+ installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] npm install completed
- [ ] .env file configured
- [ ] MongoDB connection tested
- [ ] Server starts without errors
- [ ] Health endpoint responds

**🎉 All checked? Your MongoDB AI Hub is ready!**