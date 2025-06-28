# 🏗️ ARCHITECTURE AND TOOLS - MongoDB AI Hub

## 🎨 **System Architecture Overview**

```mermaid
graph TB
    subgraph "Frontend Clients"
        A[Web Browser]
        B[Postman/API Client]
        C[Mobile Apps]
        D[AI Applications]
    end
    
    subgraph "MongoDB AI Hub Server"
        E[Express.js Server<br/>Port 3000]
        F[Authentication<br/>JWT Tokens]
        G[API Routes]
        H[Mongoose ODM]
    end
    
    subgraph "Data Storage"
        I[(MongoDB Local<br/>Port 27017)]
        J[(MongoDB Atlas<br/>Cloud)]
        K[(Vector Store)]
    end
    
    subgraph "External Services"
        L[OpenAI/Claude API]
        M[1Password Secrets]
        N[GitHub Repository]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    F --> G
    G --> H
    
    H --> I
    H --> J
    H --> K
    
    G --> L
    F --> M
    E --> N
```

---

## 🔧 **Complete Tool Stack**

### **1️⃣ Core Runtime**
```mermaid
graph LR
    A[Node.js v18+] --> B[npm/yarn]
    B --> C[Express.js Server]
    C --> D[Your AI Hub App]
```

**Installation Priority: REQUIRED**
- **Node.js**: JavaScript runtime
- **npm**: Package manager
- **Express.js**: Web framework (auto-installed)

### **2️⃣ Database Options**
```mermaid
graph TB
    A[MongoDB Options] --> B[Local MongoDB]
    A --> C[MongoDB Atlas]
    A --> D[Docker MongoDB]
    
    B --> E[Direct Connection<br/>mongodb://localhost:27017]
    C --> F[Cloud Connection<br/>mongodb+srv://...]
    D --> G[Container Connection<br/>mongodb://mongodb:27017]
```

**Choose ONE:**
- **Local**: Best for development
- **Atlas**: Best for production
- **Docker**: Best for consistency

### **3️⃣ Development Tools**
```mermaid
graph LR
    A[VS Code] --> B[Extensions]
    B --> C[MongoDB]
    B --> D[ESLint]
    B --> E[Prettier]
    B --> F[GitLens]
    
    G[MongoDB Compass] --> H[Visual DB Management]
    I[Postman] --> J[API Testing]
```

**Recommended Setup:**
1. **VS Code** + Extensions
2. **MongoDB Compass** for database GUI
3. **Postman** for API testing

---

## 🚦 **Installation Flow**

```mermaid
flowchart TD
    A[Start] --> B{Have Node.js?}
    B -->|No| C[Install Node.js v18+]
    B -->|Yes| D{Have MongoDB?}
    C --> D
    
    D -->|No| E{Choose MongoDB Type}
    D -->|Yes| I[Clone Repository]
    
    E --> F[Local Install]
    E --> G[Atlas Cloud]
    E --> H[Docker]
    
    F --> I
    G --> I
    H --> I
    
    I --> J[npm install]
    J --> K[Configure .env]
    K --> L[npm run dev]
    L --> M[Success!]
```

---

## 📦 **Tool Categories and Purposes**

### **🔴 ESSENTIAL (Must Have)**

| Tool | Purpose | Install Command |
|------|---------|----------------|
| Node.js v18+ | JavaScript runtime | `nvm install 18` |
| npm | Package manager | Comes with Node.js |
| MongoDB | Database | See options below |
| Git | Version control | `brew install git` |

### **🟡 RECOMMENDED (Should Have)**

| Tool | Purpose | Install Command |
|------|---------|----------------|
| MongoDB Compass | Database GUI | [Download](https://www.mongodb.com/products/compass) |
| Postman | API testing | [Download](https://www.postman.com/downloads/) |
| VS Code | Code editor | [Download](https://code.visualstudio.com/) |
| mongosh | MongoDB CLI | `brew install mongosh` |

### **🟢 OPTIONAL (Nice to Have)**

| Tool | Purpose | Install Command |
|------|---------|----------------|
| Docker | Containerization | [Download](https://www.docker.com/products/docker-desktop) |
| 1Password CLI | Secrets management | `brew install --cask 1password-cli` |
| Thunder Client | VS Code API testing | VS Code extension |
| GitHub Desktop | Git GUI | [Download](https://desktop.github.com/) |

---

## 🌐 **MongoDB Options Detailed**

### **Option 1: Local MongoDB**
```bash
# macOS Installation
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Connection String
MONGODB_URI=mongodb://localhost:27017/mongodb-ai-hub
```

**Pros:**
- ✅ Fast local development
- ✅ No internet required
- ✅ Full control

**Cons:**
- ❌ Manual backup needed
- ❌ No built-in monitoring
- ❌ Local storage only

### **Option 2: MongoDB Atlas (Cloud)**
```bash
# Steps:
1. Create account: https://cloud.mongodb.com
2. Create free cluster (512MB)
3. Get connection string

# Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/mongodb-ai-hub
```

**Pros:**
- ✅ Automatic backups
- ✅ Built-in monitoring
- ✅ Global access
- ✅ Free tier available

**Cons:**
- ❌ Internet required
- ❌ 512MB limit (free)
- ❌ Slight latency

### **Option 3: Docker MongoDB**
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb \
  -v mongodb_data:/data/db \
  mongo:7.0

# Connection String
MONGODB_URI=mongodb://localhost:27017/mongodb-ai-hub
```

**Pros:**
- ✅ Consistent environment
- ✅ Easy cleanup
- ✅ Version control

**Cons:**
- ❌ Docker overhead
- ❌ More complex
- ❌ Resource usage

---

## 🛠️ **Quick Setup Scripts**

### **1. Check What's Installed**
```bash
#!/bin/bash
# save as: check-tools.sh

echo "🔍 Checking installed tools..."
echo ""
echo "Essential Tools:"
echo "==============="
node -v 2>/dev/null && echo "✅ Node.js: $(node -v)" || echo "❌ Node.js: Not installed"
npm -v 2>/dev/null && echo "✅ npm: $(npm -v)" || echo "❌ npm: Not installed"
git --version 2>/dev/null && echo "✅ Git: $(git --version)" || echo "❌ Git: Not installed"
mongod --version 2>/dev/null | head -1 && echo "✅ MongoDB: Installed" || echo "⚠️  MongoDB: Not installed locally"

echo ""
echo "Recommended Tools:"
echo "=================="
code -v 2>/dev/null | head -1 && echo "✅ VS Code: Installed" || echo "⚠️  VS Code: Not installed"
mongosh --version 2>/dev/null && echo "✅ MongoDB Shell: $(mongosh --version)" || echo "⚠️  MongoDB Shell: Not installed"
docker -v 2>/dev/null && echo "✅ Docker: $(docker -v)" || echo "⚠️  Docker: Not installed"

echo ""
echo "Project Status:"
echo "==============="
[ -d "node_modules" ] && echo "✅ Dependencies: Installed" || echo "❌ Dependencies: Run 'npm install'"
[ -f ".env" ] && echo "✅ Config: .env exists" || echo "❌ Config: Create .env file"
```

### **2. Install Essential Tools (macOS)**
```bash
#!/bin/bash
# save as: install-essentials-mac.sh

echo "🍎 Installing essential tools for macOS..."

# Install Homebrew if needed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Node.js
echo "📦 Installing Node.js..."
brew install node@18

# Install MongoDB
echo "📦 Installing MongoDB..."
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Install Git
echo "📦 Installing Git..."
brew install git

echo "✅ Essential tools installed!"
```

### **3. Install Everything (Ubuntu/Debian)**
```bash
#!/bin/bash
# save as: install-essentials-linux.sh

echo "🐧 Installing essential tools for Linux..."

# Update package list
sudo apt-get update

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Git
echo "📦 Installing Git..."
sudo apt-get install -y git

echo "✅ Essential tools installed!"
```

---

## 🎯 **Tool Decision Matrix**

| Scenario | MongoDB Choice | Additional Tools |
|----------|----------------|------------------|
| **Solo Developer** | Local MongoDB | VS Code, Compass |
| **Team Project** | MongoDB Atlas | Docker, Postman |
| **Production App** | MongoDB Atlas | All recommended |
| **Learning/Testing** | Docker MongoDB | Minimal tools |
| **Enterprise** | MongoDB Atlas | All + monitoring |

---

## 📱 **Platform-Specific Guides**

### **🍎 macOS Setup**
```bash
# One-line install everything
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/d33disc/mongodb-ai-hub/main/scripts/install-mac.sh)"
```

### **🐧 Linux Setup**
```bash
# One-line install everything
curl -fsSL https://raw.githubusercontent.com/d33disc/mongodb-ai-hub/main/scripts/install-linux.sh | bash
```

### **🪟 Windows Setup**
1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [MongoDB](https://www.mongodb.com/try/download/community)
3. Install [Git](https://git-scm.com/download/win)
4. Use PowerShell or WSL2

---

## 🚀 **5-Minute Quick Start**

```bash
# 1. Check prerequisites
node -v  # Should be v18+
git -v   # Should be installed

# 2. Clone and setup
git clone https://github.com/d33disc/mongodb-ai-hub.git
cd mongodb-ai-hub
npm install

# 3. Choose MongoDB (pick one)
# Option A: Use Atlas (easiest)
echo "Get free cluster at: https://cloud.mongodb.com"

# Option B: Use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Option C: Use local (if installed)
# It should already be running

# 4. Configure
cp .env.example .env
# Edit .env with your MongoDB URI

# 5. Start!
npm run dev

# 6. Test
curl http://localhost:3000/api/health
```

---

## ✅ **Final Checklist**

### **Minimum to Start**
- [ ] Node.js v18+ (`node -v`)
- [ ] npm (`npm -v`)
- [ ] MongoDB (any option)
- [ ] Git (`git -v`)

### **For Best Experience**
- [ ] VS Code editor
- [ ] MongoDB Compass
- [ ] Postman or similar
- [ ] mongosh CLI

### **For Production**
- [ ] MongoDB Atlas account
- [ ] Docker installed
- [ ] 1Password CLI
- [ ] Monitoring tools

**🎉 Ready? Run `npm run dev` and build amazing AI applications!**