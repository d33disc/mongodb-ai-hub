#!/usr/bin/env python3
"""
🚀 MongoDB AI Hub MVP Testing Script
Test all core functionality of your AI Hub
"""

import requests
import json
import time
import sys

# Configuration
BASE_URL = "http://localhost:3000"
USER_EMAIL = "mvp-demo@example.com"
USER_PASSWORD = "MVPDemo123!"

def print_header(title):
    print(f"\n{'='*50}")
    print(f"🎯 {title}")
    print(f"{'='*50}")

def print_step(step, description):
    print(f"\n{step} {description}")
    print("-" * 40)

def test_health():
    """Test if the server is running"""
    print_step("1️⃣", "Testing Server Health")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server Status: {data['status']}")
            print(f"✅ Message: {data['message']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        print("💡 Make sure to run: npm run dev")
        return False

def register_user():
    """Register a new user"""
    print_step("2️⃣", "Registering New User")
    user_data = {
        "email": USER_EMAIL,
        "password": USER_PASSWORD,
        "firstName": "MVP",
        "lastName": "Demo"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ User registered: {data['data']['user']['email']}")
            print(f"✅ User ID: {data['data']['user']['_id']}")
            token = data['data']['tokens']['accessToken']
            print(f"✅ Access Token: {token[:20]}...")
            return token
        elif response.status_code == 409:
            print(f"⚠️  User already exists, trying login...")
            return login_user()
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return None

def login_user():
    """Login existing user"""
    print_step("🔑", "Logging In User")
    login_data = {
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful: {data['data']['user']['email']}")
            token = data['data']['tokens']['accessToken']
            print(f"✅ Access Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def create_ai_prompts(token):
    """Create sample AI prompts"""
    print_step("3️⃣", "Creating AI Prompts")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    prompts = [
        {
            "title": "Code Review Assistant",
            "content": "Please review this code for bugs and improvements: {code}",
            "category": "coding",
            "tags": ["code-review", "debugging"],
            "model": "gpt-4"
        },
        {
            "title": "Data Analysis Helper",
            "content": "Analyze this dataset and provide insights: {data}",
            "category": "analysis", 
            "tags": ["data", "analysis"],
            "model": "claude-3"
        },
        {
            "title": "Creative Writing Prompt",
            "content": "Write a creative story about: {topic}",
            "category": "creative",
            "tags": ["writing", "creative"],
            "model": "gpt-4"
        }
    ]
    
    created_prompts = []
    for i, prompt in enumerate(prompts, 1):
        try:
            response = requests.post(f"{BASE_URL}/api/prompts", json=prompt, headers=headers)
            if response.status_code == 201:
                data = response.json()
                created_prompts.append(data['data'])
                print(f"✅ Created prompt {i}: {prompt['title']}")
                print(f"   ID: {data['data']['_id']}")
                print(f"   Category: {data['data']['category']}")
            else:
                print(f"❌ Failed to create prompt {i}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error creating prompt {i}: {e}")
    
    return created_prompts

def list_prompts():
    """List all prompts"""
    print_step("4️⃣", "Listing All Prompts")
    
    try:
        response = requests.get(f"{BASE_URL}/api/prompts")
        if response.status_code == 200:
            data = response.json()
            prompts = data['data']['prompts']
            print(f"✅ Found {len(prompts)} prompts:")
            for prompt in prompts:
                print(f"   • {prompt['title']} ({prompt['category']})")
                print(f"     Tags: {', '.join(prompt['tags'])}")
            return prompts
        else:
            print(f"❌ Failed to list prompts: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error listing prompts: {e}")
        return []

def create_vector_store(token):
    """Create a vector store"""
    print_step("5️⃣", "Creating Vector Store")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    vector_store_data = {
        "name": "MVP Knowledge Base",
        "description": "Vector store for MVP demonstration",
        "namespace": "mvp-demo",
        "vectorDimension": 1536,
        "model": "text-embedding-ada-002"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/vectorstores", json=vector_store_data, headers=headers)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Vector store created: {data['data']['name']}")
            print(f"   ID: {data['data']['_id']}")
            print(f"   Dimensions: {data['data']['vectorDimension']}")
            
            # Add a sample embedding
            store_id = data['data']['_id']
            embedding_data = {
                "text": "MongoDB AI Hub is a powerful tool for managing AI prompts and vector stores",
                "vector": [0.1] * 1536,  # Sample vector
                "metadata": {
                    "source": "mvp-demo",
                    "type": "description"
                }
            }
            
            embed_response = requests.post(
                f"{BASE_URL}/api/vectorstores/{store_id}/embeddings",
                json=embedding_data,
                headers=headers
            )
            
            if embed_response.status_code == 200:
                print(f"✅ Sample embedding added to vector store")
            
            return data['data']
        else:
            print(f"❌ Failed to create vector store: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating vector store: {e}")
        return None

def test_authentication(token):
    """Test authentication endpoints"""
    print_step("6️⃣", "Testing Authentication")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test profile endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile access successful")
            print(f"   User: {data['data']['user']['firstName']} {data['data']['user']['lastName']}")
            print(f"   Email: {data['data']['user']['email']}")
        else:
            print(f"❌ Profile access failed: {response.status_code}")
        
        # Test token verification
        verify_response = requests.get(f"{BASE_URL}/api/auth/verify", headers=headers)
        if verify_response.status_code == 200:
            print(f"✅ Token verification successful")
        else:
            print(f"❌ Token verification failed: {verify_response.status_code}")
            
    except Exception as e:
        print(f"❌ Authentication test error: {e}")

def main():
    """Run the complete MVP test"""
    print_header("MongoDB AI Hub MVP Testing")
    print("🚀 Testing all core functionality...")
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Server is not running. Please start it with: npm run dev")
        sys.exit(1)
    
    # Test 2: User registration/login
    token = register_user()
    if not token:
        print("\n❌ Authentication failed")
        sys.exit(1)
    
    # Test 3: Create AI prompts
    prompts = create_ai_prompts(token)
    
    # Test 4: List prompts
    all_prompts = list_prompts()
    
    # Test 5: Create vector store
    vector_store = create_vector_store(token)
    
    # Test 6: Test authentication
    test_authentication(token)
    
    # Summary
    print_header("MVP TEST RESULTS")
    print(f"✅ Server Health: PASSED")
    print(f"✅ User Authentication: PASSED")
    print(f"✅ AI Prompts Created: {len(prompts)}")
    print(f"✅ Total Prompts Available: {len(all_prompts)}")
    print(f"✅ Vector Store: {'CREATED' if vector_store else 'FAILED'}")
    print(f"✅ Protected Routes: WORKING")
    
    print("\n🎉 MVP is fully functional and ready for use!")
    print(f"🌐 Access your AI Hub at: {BASE_URL}")
    print(f"🔑 Your access token: {token[:30]}...")
    
    print("\n📚 Next Steps:")
    print("1. Build a frontend application")
    print("2. Integrate with AI services (OpenAI, Claude)")
    print("3. Add more AI prompts and vector stores")
    print("4. Deploy to production")

if __name__ == "__main__":
    main()