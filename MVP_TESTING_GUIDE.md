# 🚀 MVP TESTING GUIDE - MongoDB AI Hub

## 🎯 **QUICK START - 3 METHODS TO TEST YOUR MVP**

### **METHOD 1: AUTOMATED TESTING (EASIEST)**
```bash
# 1. Start your server
npm run dev

# 2. Run automated tests (in new terminal)
python3 test_mvp.py

# Expected output: ✅ ALL TESTS PASSED
```

### **METHOD 2: MANUAL API TESTING**
```bash
# 1. Start server
npm run dev

# 2. Test health
curl http://localhost:3000/api/health

# 3. Create user account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# 4. Copy the accessToken from response and test creating prompt
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Prompt","content":"Test content","category":"test"}'
```

### **METHOD 3: BUILT-IN VALIDATION TESTS**
```bash
npm test -- tests/final-validation.test.js
```

---

## 🔥 **COMPLETE MVP DEMONSTRATION**

### **Step 1: Start Your Server**
```bash
cd /Users/chrisdavis/Projects/mongodb-ai-hub
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 3000
✅ Connected to MongoDB
📡 MongoDB AI Data Hub API is ready!
```

### **Step 2: Run the Automated MVP Test**
Open a new terminal:
```bash
cd /Users/chrisdavis/Projects/mongodb-ai-hub
python3 test_mvp.py
```

**Expected Output:**
```
==================================================
🎯 MongoDB AI Hub MVP Testing
==================================================
🚀 Testing all core functionality...

1️⃣ Testing Server Health
----------------------------------------
✅ Server Status: ok
✅ Message: MongoDB AI Data Hub API is running

2️⃣ Registering New User
----------------------------------------
✅ User registered: mvp-demo@example.com
✅ User ID: 675f8360...
✅ Access Token: eyJhbGciOiJIUzI1NiIs...

3️⃣ Creating AI Prompts
----------------------------------------
✅ Created prompt 1: Code Review Assistant
✅ Created prompt 2: Data Analysis Helper
✅ Created prompt 3: Creative Writing Prompt

4️⃣ Listing All Prompts
----------------------------------------
✅ Found 3 prompts:
   • Code Review Assistant (coding)
   • Data Analysis Helper (analysis)
   • Creative Writing Prompt (creative)

5️⃣ Creating Vector Store
----------------------------------------
✅ Vector store created: MVP Knowledge Base
✅ Sample embedding added to vector store

6️⃣ Testing Authentication
----------------------------------------
✅ Profile access successful
✅ Token verification successful

==================================================
🎯 MVP TEST RESULTS
==================================================
✅ Server Health: PASSED
✅ User Authentication: PASSED
✅ AI Prompts Created: 3
✅ Total Prompts Available: 3
✅ Vector Store: CREATED
✅ Protected Routes: WORKING

🎉 MVP is fully functional and ready for use!
```

---

## 🧪 **MANUAL TESTING CHECKLIST**

### **✅ Core Features to Test**

#### **1. Authentication System**
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are generated
- [ ] Protected routes require authentication
- [ ] Profile management works

#### **2. AI Prompt Management**
- [ ] Can create AI prompts
- [ ] Can list all prompts
- [ ] Can update prompts (with authentication)
- [ ] Can delete prompts (with authentication)
- [ ] Search functionality works

#### **3. Vector Store Management**
- [ ] Can create vector stores
- [ ] Can add embeddings to stores
- [ ] Can list vector stores
- [ ] Can manage store permissions

#### **4. API Security**
- [ ] Rate limiting works on auth endpoints
- [ ] Input validation prevents malformed data
- [ ] Authorization prevents unauthorized access
- [ ] Error handling returns proper responses

---

## 🐍 **PYTHON INTEGRATION EXAMPLE**

Here's how to use your MVP in a Python application:

```python
import requests

# Your AI Hub configuration
API_BASE = "http://localhost:3000"

class AIHubClient:
    def __init__(self, email, password):
        self.base_url = API_BASE
        self.token = self.login(email, password)
    
    def login(self, email, password):
        """Login and get access token"""
        response = requests.post(f"{self.base_url}/api/auth/login", json={
            "email": email,
            "password": password
        })
        return response.json()['data']['tokens']['accessToken']
    
    def create_prompt(self, title, content, category="general"):
        """Create a new AI prompt"""
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.post(f"{self.base_url}/api/prompts", 
            json={
                "title": title,
                "content": content,
                "category": category
            },
            headers=headers
        )
        return response.json()['data']
    
    def get_prompts(self):
        """Get all available prompts"""
        response = requests.get(f"{self.base_url}/api/prompts")
        return response.json()['data']['prompts']
    
    def create_vector_store(self, name, dimension=1536):
        """Create a new vector store"""
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.post(f"{self.base_url}/api/vectorstores",
            json={
                "name": name,
                "vectorDimension": dimension,
                "namespace": name.lower().replace(" ", "-")
            },
            headers=headers
        )
        return response.json()['data']

# Usage example
if __name__ == "__main__":
    # Initialize client (register first if needed)
    client = AIHubClient("your-email@example.com", "your-password")
    
    # Create an AI prompt
    prompt = client.create_prompt(
        "Bug Finder",
        "Find bugs in this code: {code}",
        "debugging"
    )
    print(f"Created prompt: {prompt['title']}")
    
    # List all prompts
    prompts = client.get_prompts()
    print(f"Total prompts: {len(prompts)}")
    
    # Create vector store
    store = client.create_vector_store("My Knowledge Base")
    print(f"Created vector store: {store['name']}")
```

---

## 📱 **BROWSER TESTING**

### **1. Health Check in Browser**
Open browser and go to: `http://localhost:3000/api/health`

**Expected:** JSON response with status "ok"

### **2. Using Browser Developer Tools**
Open developer console and run:

```javascript
// Test registration
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'browser-test@example.com',
    password: 'BrowserTest123!',
    firstName: 'Browser',
    lastName: 'Test'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Registration:', data);
  
  // Store token for next requests
  const token = data.data.tokens.accessToken;
  
  // Test creating prompt
  return fetch('http://localhost:3000/api/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Browser Test Prompt',
      content: 'Test prompt from browser',
      category: 'test'
    })
  });
})
.then(res => res.json())
.then(data => console.log('Prompt created:', data));
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues and Solutions**

#### **"Server not responding"**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# If not running, start it
npm run dev

# Check if port 3000 is blocked
lsof -i :3000
```

#### **"MongoDB connection failed"**
```bash
# Check MongoDB status
brew services list | grep mongodb

# Start MongoDB if needed
brew services start mongodb-community@7.0

# Or use Docker MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

#### **"Authentication errors"**
- Check that JWT secrets are set in `.env`
- Ensure token is included in Authorization header
- Verify token format: `Bearer eyJhbGciOiJIUzI1NiIs...`

#### **"Python script errors"**
```bash
# Install requests library
pip3 install requests

# Check Python version
python3 --version  # Should be 3.6+
```

---

## 📊 **MVP FEATURES CHECKLIST**

### **✅ Implemented and Working**
- [x] **User Authentication**: Register, login, JWT tokens
- [x] **AI Prompt Management**: CRUD operations
- [x] **Vector Store Management**: Create, manage embeddings
- [x] **API Security**: Rate limiting, input validation
- [x] **Error Handling**: Comprehensive error responses
- [x] **Logging System**: Debug and error logging
- [x] **Testing Suite**: Automated tests
- [x] **Documentation**: Complete setup guides

### **🚀 Ready for Next Steps**
- [ ] **Frontend Interface**: React/Vue/Angular app
- [ ] **AI Service Integration**: OpenAI, Claude APIs
- [ ] **Advanced Vector Search**: Similarity search
- [ ] **User Roles**: Admin, user permissions
- [ ] **File Upload**: Document processing
- [ ] **Real-time Features**: WebSocket connections

---

## 🎯 **PRODUCTION READINESS**

Your MVP is production-ready with:

- ✅ **Security**: JWT authentication, input validation, rate limiting
- ✅ **Scalability**: MongoDB for data persistence
- ✅ **Monitoring**: Health checks and logging
- ✅ **Testing**: Comprehensive test suite
- ✅ **Documentation**: Complete setup and usage guides
- ✅ **Docker Support**: Containerization ready

**🎉 Your MongoDB AI Hub MVP is fully functional and ready for real-world use!**