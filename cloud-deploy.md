# 🚀 MongoDB AI Hub - Cloud Auto-Launch Setup

## Overview
Your MongoDB AI Hub is now configured to **automatically start** in all major cloud development environments. No more forgetting to launch it!

## 🌟 Auto-Launch Environments

### ✅ **GitHub Codespaces** 
- **Auto-starts**: When codespace opens
- **Configuration**: `.devcontainer/devcontainer.json`
- **URL**: Auto-forwarded to your codespace URL
- **MongoDB**: Automatically configured and started

### ✅ **GitPod**
- **Auto-starts**: On workspace launch  
- **Configuration**: `.gitpod.yml`
- **URL**: `https://3000-[workspace-url].gitpod.io`
- **MongoDB**: Local instance auto-configured

### ✅ **Replit**
- **Auto-starts**: When repl opens
- **Configuration**: `.replit`
- **URL**: Your repl's web view
- **MongoDB**: Configured for Replit environment

### ✅ **VS Code (Local/Remote)**
- **Auto-starts**: On folder open (optional)
- **Configuration**: `.vscode/tasks.json`
- **URL**: `http://localhost:3000`
- **MongoDB**: Uses local/remote instance

## 🔧 Quick Commands

```bash
# Manual start (if needed)
npm run auto-start

# Check status
npm run health-check

# View server status
npm run status

# Restart if needed
npm run dev
```

## 📍 How to Know It's Running

### 🚦 Visual Indicators
1. **Terminal Output**: See "✅ MongoDB AI Hub is running on port 3000!"
2. **Browser**: Visit `http://localhost:3000/api/health`
3. **VS Code**: Port 3000 shows "🟢 Forwarded" in ports panel
4. **Response**: `{"status":"ok","message":"MongoDB AI Data Hub API is running"}`

### 🔗 Access URLs by Environment

**GitHub Codespaces:**
```
https://[codespace-name]-3000.preview.app.github.dev/api/health
```

**GitPod:**
```
https://3000-[workspace-id].ws-[region].gitpod.io/api/health
```

**Replit:**
```
https://[repl-name].[username].repl.co/api/health
```

**Local/VS Code:**
```
http://localhost:3000/api/health
```

## 🛠 Auto-Start Features

### 🔄 **Automatic MongoDB Setup**
- Detects and starts MongoDB automatically
- Creates development database
- Configures connection strings

### 🔍 **Health Monitoring**
- Checks if server is already running
- Prevents duplicate instances
- Shows clear status messages

### 🌐 **Environment Detection**
- Automatically detects cloud environment
- Configures appropriate settings
- Sets up environment variables

### 🔧 **VS Code Integration**
- Tasks for start/stop/restart
- Debug configurations
- Status checking commands

## ⚡ Manual Override

If auto-start fails or you want manual control:

```bash
# Stop auto-start
pkill -f "node src/server.js"

# Start manually
npm run dev

# Debug mode
npm run debug
```

## 🔐 Authentication Ready

The server auto-starts with full authentication:
- User registration: `POST /api/auth/register`
- User login: `POST /api/auth/login`  
- Protected routes: All write operations require auth
- JWT tokens: Secure session management

## 📊 Monitoring & Logs

```bash
# View live logs
tail -f /tmp/ai-hub.log

# Check process
ps aux | grep "node src/server.js"

# Check port
lsof -i :3000
```

## 🚨 Troubleshooting

**Server won't start?**
```bash
# Check MongoDB
sudo service mongodb status

# Check ports
netstat -tulpn | grep 3000

# Restart everything
npm run auto-start
```

**Can't connect?**
- Check firewall settings
- Verify port forwarding in cloud environment
- Check MongoDB connection string in `.env`

## 🎯 Success Indicators

When everything works, you'll see:
```
🚀 MongoDB AI Hub Auto-Start Script
==================================
🌟 GitHub Codespaces environment detected
✅ MongoDB already running
🤖 Starting MongoDB AI Hub server...
✅ MongoDB AI Hub is running on port 3000!
🔗 Health check: http://localhost:3000/api/health
📚 API docs: http://localhost:3000/api
```

**Your AI Hub now launches automatically in every cloud environment! 🎉**