# 🎬 LIVE DEMO - See Your MongoDB AI Hub in Action!

## 🎯 **YOUR AI HUB IS HERE**

**📍 Location**: `/Users/chrisdavis/Projects/mongodb-ai-hub`  
**🌐 GitHub**: https://github.com/d33disc/mongodb-ai-hub  
**✅ Status**: FULLY OPERATIONAL  

---

## 🚀 **START IT NOW - FOLLOW THESE EXACT STEPS**

### **Step 1: Open Terminal and Navigate**
```bash
cd /Users/chrisdavis/Projects/mongodb-ai-hub
```

### **Step 2: Start Your AI Hub**
```bash
npm run dev
```
**You'll see**: `🚀 Server running on port 3000`

### **Step 3: Test It's Working**
Open new terminal tab and run:
```bash
curl http://localhost:3000/api/health
```
**You should see**: `{"status":"ok","message":"MongoDB AI Data Hub API is running"}`

---

## 🎮 **LIVE INTERACTIVE DEMO**

### **Demo 1: Create Your First User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123!",
    "firstName": "Demo",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "675abc123...",
      "email": "demo@example.com",
      "firstName": "Demo",
      "lastName": "User"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### **Demo 2: Create AI Prompt (Copy token from above)**
```bash
# Replace YOUR_TOKEN with the accessToken from step 1
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Code Debug Helper",
    "content": "Please analyze this code and find any bugs: {code}",
    "category": "debugging",
    "tags": ["debugging", "code-review"],
    "model": "gpt-4"
  }'
```

### **Demo 3: View Your Prompts**
```bash
curl http://localhost:3000/api/prompts
```

---

## 🌐 **USE IN BROWSER**

### **Option 1: Manual Browser Testing**
1. **Start server**: `npm run dev`
2. **Open browser**: Go to `http://localhost:3000/api/health`
3. **Should see**: JSON response with status "ok"

### **Option 2: Use Postman/Thunder Client**
1. **Base URL**: `http://localhost:3000`
2. **Create requests** for each endpoint
3. **Add Bearer token** in Authorization header

---

## 🐍 **PYTHON INTEGRATION EXAMPLE**

Create this file and run it:

```python
# test_ai_hub.py
import requests
import json

# Configuration
BASE_URL = "http://localhost:3000"
EMAIL = "python-test@example.com"
PASSWORD = "PythonTest123!"

def test_ai_hub():
    print("🚀 Testing MongoDB AI Hub...")
    
    # 1. Health Check
    print("\n1. Health Check...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"✅ Health: {response.json()}")
    
    # 2. Register User
    print("\n2. Creating user...")
    user_data = {
        "email": EMAIL,
        "password": PASSWORD,
        "firstName": "Python",
        "lastName": "Tester"
    }
    
    register_response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    if register_response.status_code == 201:
        token = register_response.json()['data']['tokens']['accessToken']
        print(f"✅ User created! Token: {token[:20]}...")
    else:
        # Try login if user exists
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EMAIL, "password": PASSWORD
        })
        token = login_response.json()['data']['tokens']['accessToken']
        print(f"✅ Logged in! Token: {token[:20]}...")
    
    # 3. Create AI Prompts
    print("\n3. Creating AI prompts...")
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    prompts = [
        {
            "title": "Python Code Reviewer",
            "content": "Review this Python code for bugs and improvements: {code}",
            "category": "coding",
            "tags": ["python", "code-review"]
        },
        {
            "title": "Data Analysis Helper", 
            "content": "Analyze this dataset and provide insights: {data}",
            "category": "analysis",
            "tags": ["data", "analysis"]
        }
    ]
    
    created_prompts = []
    for prompt in prompts:
        response = requests.post(f"{BASE_URL}/api/prompts", json=prompt, headers=headers)
        if response.status_code == 201:
            created_prompts.append(response.json()['data'])
            print(f"✅ Created: {prompt['title']}")
    
    # 4. List All Prompts
    print("\n4. Listing all prompts...")
    response = requests.get(f"{BASE_URL}/api/prompts")
    all_prompts = response.json()['data']['prompts']
    print(f"✅ Found {len(all_prompts)} prompts:")
    for prompt in all_prompts:
        print(f"   - {prompt['title']} ({prompt['category']})")
    
    # 5. Create Vector Store
    print("\n5. Creating vector store...")
    vector_store_data = {
        "name": "Python Knowledge Base",
        "namespace": "python-kb",
        "vectorDimension": 1536,
        "description": "Knowledge base for Python development"
    }
    
    response = requests.post(f"{BASE_URL}/api/vectorstores", json=vector_store_data, headers=headers)
    if response.status_code == 201:
        store_id = response.json()['data']['_id']
        print(f"✅ Vector store created! ID: {store_id}")
        
        # Add an embedding
        embedding_data = {
            "text": "How to handle exceptions in Python",
            "vector": [0.1] * 1536,  # Example vector
            "metadata": {"topic": "error-handling", "language": "python"}
        }
        
        response = requests.post(f"{BASE_URL}/api/vectorstores/{store_id}/embeddings", 
                               json=embedding_data, headers=headers)
        if response.status_code == 200:
            print("✅ Added embedding to vector store!")
    
    print("\n🎉 AI Hub is working perfectly!")
    print(f"📍 Access at: {BASE_URL}")
    print(f"🔑 Your token: {token[:30]}...")

if __name__ == "__main__":
    test_ai_hub()
```

**Run it:**
```bash
python test_ai_hub.py
```

---

## 🔥 **REAL-WORLD USE CASES**

### **Use Case 1: Code Assistant**
```bash
# Create prompts for different coding tasks
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug Finder",
    "content": "Find and explain bugs in this code: {code}",
    "category": "debugging"
  }'
```

### **Use Case 2: Knowledge Management**
```bash
# Create vector store for documentation
curl -X POST http://localhost:3000/api/vectorstores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Company Docs",
    "namespace": "docs",
    "vectorDimension": 1536
  }'
```

---

## 🌍 **CLOUD ACCESS**

### **GitHub Codespaces (Instant Cloud Access)**
1. Go to: https://github.com/d33disc/mongodb-ai-hub
2. Click "Code" → "Create codespace on main"
3. **Server starts automatically!**
4. Look for port forwarding notification

### **GitPod (Alternative Cloud)**
1. Go to: https://gitpod.io/#https://github.com/d33disc/mongodb-ai-hub
2. **Server starts automatically!**
3. Use the preview window

---

## 📱 **QUICK ACCESS COMMANDS**

Save these in your terminal for quick access:

```bash
# Quick start
alias ai-hub-start="cd /Users/chrisdavis/Projects/mongodb-ai-hub && npm run dev"

# Quick test
alias ai-hub-test="curl http://localhost:3000/api/health"

# Quick health check
alias ai-hub-health="curl -s http://localhost:3000/api/health | jq ."
```

Add to your `~/.zshrc` or `~/.bashrc` file.

---

## 🎯 **WHAT TO DO NEXT**

### **Immediate Actions:**
1. ✅ Start the server: `npm run dev`
2. ✅ Test health: `curl http://localhost:3000/api/health`
3. ✅ Create your first user
4. ✅ Create your first AI prompt
5. ✅ Explore the API endpoints

### **Build Something Cool:**
- **Personal AI Assistant**: Store your custom prompts
- **Code Review System**: Automated code analysis
- **Knowledge Base**: Vector search for documents
- **API for AI Apps**: Use as backend for AI tools

---

## 🆘 **NEED HELP?**

### **Common Issues:**
- **Port 3000 busy**: `lsof -i :3000` then `kill -9 PID`
- **MongoDB not connected**: Check if MongoDB is running
- **Token errors**: Make sure to include `Bearer ` before token

### **Debug Commands:**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check logs
tail -f logs/combined.log

# Run tests
npm test
```

**🎉 Your MongoDB AI Hub is ready to power your AI applications!**