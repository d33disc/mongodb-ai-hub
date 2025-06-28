# 🚀 QUICK START GUIDE - MongoDB AI Hub

## 🎯 **3 WAYS TO ACCESS YOUR AI HUB**

### **METHOD 1: Local Computer (You're Here!)**
```bash
# 1. Navigate to your project
cd /Users/chrisdavis/Projects/mongodb-ai-hub

# 2. Start the server
npm run dev

# 3. Open in browser: http://localhost:3000/api/health
```

### **METHOD 2: GitHub Codespaces (Cloud)**
1. Go to: https://github.com/d33disc/mongodb-ai-hub
2. Click green "Code" button
3. Click "Create codespace on main"
4. **Server starts automatically!**
5. Look for "Port 3000" notification → click to open

### **METHOD 3: GitPod (Cloud)**
1. Go to: https://gitpod.io/#https://github.com/d33disc/mongodb-ai-hub
2. **Server starts automatically!**
3. Look for port 3000 preview window

---

## 🔥 **USING THE API - COMPLETE WALKTHROUGH**

### **Step 1: Check If It's Running**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","message":"MongoDB AI Data Hub API is running"}
```

### **Step 2: Create Your User Account**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "YourSecurePassword123!",
    "firstName": "Your",
    "lastName": "Name"
  }'
```

**Response Example:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "USER_ID_HERE",
      "email": "your-email@example.com",
      "firstName": "Your",
      "lastName": "Name"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### **Step 3: Save Your Access Token**
Copy the `accessToken` from the response above. You'll need it for all future API calls.

### **Step 4: Create Your First AI Prompt**
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "title": "Code Review Assistant",
    "content": "Please review this code for bugs, performance issues, and best practices: {code}",
    "category": "coding",
    "tags": ["code-review", "debugging"],
    "model": "gpt-4"
  }'
```

### **Step 5: Get All Your Prompts**
```bash
curl http://localhost:3000/api/prompts
```

### **Step 6: Create a Vector Store for AI Embeddings**
```bash
curl -X POST http://localhost:3000/api/vectorstores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "name": "My Knowledge Base",
    "description": "Vector store for my AI knowledge",
    "namespace": "my-knowledge",
    "vectorDimension": 1536,
    "model": "text-embedding-ada-002"
  }'
```

---

## 🛠 **PRACTICAL EXAMPLES**

### **Example 1: Building a Code Assistant**
```python
# Python script to use your AI Hub
import requests
import json

# 1. Login to get token
login_response = requests.post('http://localhost:3000/api/auth/login', json={
    'email': 'your-email@example.com',
    'password': 'YourSecurePassword123!'
})

token = login_response.json()['data']['tokens']['accessToken']
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# 2. Create coding prompts
prompts = [
    {
        "title": "Bug Finder",
        "content": "Find bugs in this code: {code}",
        "category": "debugging",
        "tags": ["bugs", "debugging"]
    },
    {
        "title": "Code Optimizer", 
        "content": "Optimize this code for performance: {code}",
        "category": "optimization",
        "tags": ["performance", "optimization"]
    }
]

for prompt in prompts:
    response = requests.post('http://localhost:3000/api/prompts', 
                           json=prompt, headers=headers)
    print(f"Created: {response.json()['data']['title']}")
```

### **Example 2: Managing AI Knowledge with Vector Stores**
```javascript
// JavaScript/Node.js example
const axios = require('axios');

async function setupAIKnowledge() {
    // Login
    const login = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'your-email@example.com',
        password: 'YourSecurePassword123!'
    });
    
    const token = login.data.data.tokens.accessToken;
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    
    // Create vector store for documentation
    const vectorStore = await axios.post('http://localhost:3000/api/vectorstores', {
        name: 'Documentation Embeddings',
        namespace: 'docs',
        vectorDimension: 1536,
        description: 'Embeddings for documentation search'
    }, config);
    
    console.log('Vector store created:', vectorStore.data.data.name);
    
    // Add some example embeddings
    const storeId = vectorStore.data.data._id;
    await axios.post(`http://localhost:3000/api/vectorstores/${storeId}/embeddings`, {
        text: 'How to use authentication in the API',
        vector: new Array(1536).fill(0).map(() => Math.random()), // Example vector
        metadata: {
            source: 'documentation',
            topic: 'authentication'
        }
    }, config);
    
    console.log('Added embedding to vector store');
}

setupAIKnowledge();
```

---

## 🔐 **AUTHENTICATION FLOW**

### **Complete User Management**
```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Get Profile (use token from login)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/profile

# 4. Update Profile
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"firstName":"Updated"}' http://localhost:3000/api/auth/profile

# 5. Verify Token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/verify
```

---

## 🎮 **INTERACTIVE TESTING**

### **Using Postman or Thunder Client**
1. **Import Collection**: Create requests for each endpoint
2. **Set Environment**: 
   - `baseUrl`: http://localhost:3000
   - `token`: (paste your access token here)
3. **Use Variables**: `{{baseUrl}}/api/auth/login`

### **Using curl with Variables**
```bash
# Set your token as a variable
export TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Now use it in commands
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/prompts
```

---

## 🚨 **TROUBLESHOOTING**

### **Server Won't Start**
```bash
# Check if port 3000 is busy
lsof -i :3000

# Kill any process using port 3000
kill -9 $(lsof -ti:3000)

# Try starting again
npm run dev
```

### **Database Connection Issues**
```bash
# Start MongoDB locally
brew services start mongodb/brew/mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### **Token Errors**
- **"Invalid token"**: Your token expired, login again
- **"No token provided"**: Add `Authorization: Bearer YOUR_TOKEN` header
- **"jwt malformed"**: Check token format, should start with `eyJ`

---

## 📱 **INTEGRATION EXAMPLES**

### **React Frontend**
```jsx
// React component to use your AI Hub
import React, { useState, useEffect } from 'react';

function AIPrompts() {
    const [prompts, setPrompts] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('aiHubToken'));
    
    useEffect(() => {
        if (token) {
            fetch('http://localhost:3000/api/prompts', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setPrompts(data.data.prompts));
        }
    }, [token]);
    
    return (
        <div>
            <h2>My AI Prompts</h2>
            {prompts.map(prompt => (
                <div key={prompt._id}>
                    <h3>{prompt.title}</h3>
                    <p>{prompt.content}</p>
                    <span>Category: {prompt.category}</span>
                </div>
            ))}
        </div>
    );
}
```

### **Python AI Integration**
```python
# Use with OpenAI or other AI services
import openai
import requests

class AIHubManager:
    def __init__(self, hub_url, email, password):
        self.hub_url = hub_url
        self.token = self.login(email, password)
    
    def login(self, email, password):
        response = requests.post(f'{self.hub_url}/api/auth/login', json={
            'email': email, 'password': password
        })
        return response.json()['data']['tokens']['accessToken']
    
    def get_prompt(self, title):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.hub_url}/api/prompts', headers=headers)
        prompts = response.json()['data']['prompts']
        return next((p for p in prompts if p['title'] == title), None)
    
    def use_with_openai(self, prompt_title, user_input):
        prompt_template = self.get_prompt(prompt_title)
        if prompt_template:
            full_prompt = prompt_template['content'].replace('{input}', user_input)
            return openai.ChatCompletion.create(
                model=prompt_template['model'],
                messages=[{"role": "user", "content": full_prompt}]
            )

# Usage
hub = AIHubManager('http://localhost:3000', 'your-email@example.com', 'password')
result = hub.use_with_openai('Code Review Assistant', 'def hello(): print("world")')
```

---

## 🎯 **WHAT'S NEXT?**

### **Advanced Features to Explore**
1. **Vector Search**: Add embeddings and search by similarity
2. **Prompt Templates**: Use `{variables}` in prompts for dynamic content
3. **Categories & Tags**: Organize prompts by project or use case
4. **Batch Operations**: Create multiple prompts or stores at once

### **Production Deployment**
```bash
# Deploy with Docker
docker-compose up -d

# Or deploy to cloud
# See docs/PRODUCTION_DEPLOYMENT.md for full guide
```

---

## 📞 **GETTING HELP**

- **Test the API**: Use `npm test` to run all tests
- **Check Logs**: Look in `/logs/` folder for debug info
- **Health Check**: Always start with `curl http://localhost:3000/api/health`
- **Documentation**: Check the `/docs/` folder for detailed guides

**🎉 You're ready to build AI applications with your MongoDB AI Hub!**