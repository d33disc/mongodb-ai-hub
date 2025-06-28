# 🔑 HOW TO USE YOUR TOKEN - Simple Guide

## 📋 **What Just Happened:**

1. **You logged in** with email: `demo@example.com`
2. **You received tokens:**
   - **Access Token**: Used for API requests (expires in 15 minutes)
   - **Refresh Token**: Used to get new access tokens (expires in 7 days)
3. **You created an AI prompt** successfully!

---

## 🎯 **YOUR TOKEN (Copy This):**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjAwNjY5ZWQ0ZDIzYWQ3NTYxNTU4ZSIsIl9pZCI6IjY4NjAwNjY5ZWQ0ZDIzYWQ3NTYxNTU4ZSIsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiZmlyc3ROYW1lIjoiRGVtbyIsImxhc3ROYW1lIjoiVXNlciIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTExMjQxNDQsImV4cCI6MTc1MTEyNTA0NCwiYXVkIjoibW9uZ29kYi1haS1odWItdXNlcnMiLCJpc3MiOiJtb25nb2RiLWFpLWh1YiJ9.E0KWA2H3ZhfOhNeeFTsGKXBftXOXVj6DH2pLOMgQAwM
```

---

## 🚀 **HOW TO USE YOUR TOKEN:**

### **Method 1: Save in Variable (Easiest)**
```bash
# Save your token
TOKEN="eyJhbGciOiJIUzI1NiIs...YOUR_FULL_TOKEN_HERE..."

# Use it in commands
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/profile
```

### **Method 2: Direct in Command**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs...YOUR_FULL_TOKEN_HERE..."
```

### **Method 3: In Postman**
1. Open Postman
2. Go to "Authorization" tab
3. Select "Bearer Token"
4. Paste your token (without the "Bearer" word)

---

## 📌 **EXAMPLES WITH YOUR TOKEN:**

### **1. Get Your Profile**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **2. Create Another AI Prompt**
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Code Helper",
    "content": "Help me debug this code: {code}",
    "category": "coding",
    "tags": ["debug", "help"]
  }'
```

### **3. List All Your Prompts**
```bash
curl -X GET http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **4. Create a Vector Store**
```bash
curl -X POST http://localhost:3000/api/vectorstores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My Knowledge Base",
    "namespace": "my-kb",
    "vectorDimension": 1536
  }'
```

---

## ⚠️ **IMPORTANT NOTES:**

1. **Token Format**: Always use `Bearer YOUR_TOKEN` (with the word "Bearer" before your token)
2. **Token Expiry**: Your token expires in 15 minutes. After that, you need to login again.
3. **Copy Exactly**: Make sure to copy the entire token (it's very long!)
4. **No Quotes**: When using in variables, don't add extra quotes

---

## 🔄 **WHEN TOKEN EXPIRES:**

If you get "Invalid token" or "Token expired", just login again:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo123!"}'
```

Then copy the new `accessToken` from the response.

---

## 💡 **PRO TIP: Create a Login Script**

Save this as `login.sh`:
```bash
#!/bin/bash
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo123!"}')

TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
echo "Your token is:"
echo $TOKEN
echo ""
echo "To use it, run:"
echo "export TOKEN=\"$TOKEN\""
```

Then you can just run `./login.sh` to get a fresh token!

---

## ✅ **YOU'RE ALL SET!**

You now know how to:
- Get your authentication token
- Use it in API requests
- Create AI prompts
- Access protected endpoints

Your API is working perfectly! 🎉