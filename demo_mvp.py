#!/usr/bin/env python3
"""
Simple MVP Demo Script
"""
import requests
import json

BASE_URL = "http://localhost:3000"

def demo():
    print("🚀 MongoDB AI Hub MVP Demo")
    print("=" * 40)
    
    # 1. Health Check
    print("\n1️⃣ Health Check:")
    try:
        health = requests.get(f"{BASE_URL}/api/health").json()
        print(f"✅ {health['message']}")
    except:
        print("❌ Server not running. Start with: npm run dev")
        return
    
    # 2. Register User
    print("\n2️⃣ User Registration:")
    user_data = {
        "email": "demo@example.com",
        "password": "Demo123!",
        "firstName": "Demo",
        "lastName": "User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        if response.status_code == 201:
            data = response.json()
            token = data['data']['tokens']['accessToken']
            print(f"✅ User created: {data['data']['user']['email']}")
        elif response.status_code == 409:
            # User exists, try login
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": user_data["email"],
                "password": user_data["password"]
            })
            if login_response.status_code == 200:
                data = login_response.json()
                token = data['data']['tokens']['accessToken']
                print(f"✅ User logged in: {data['data']['user']['email']}")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # 3. Create Prompt
    print("\n3️⃣ Create AI Prompt:")
    headers = {'Authorization': f'Bearer {token}'}
    prompt_data = {
        "title": "Demo Code Helper",
        "content": "Help me with this code: {code}",
        "category": "demo",
        "tags": ["demo", "code"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/prompts", json=prompt_data, headers=headers)
        if response.status_code == 201:
            prompt = response.json()['data']
            print(f"✅ Prompt created: {prompt['title']}")
        else:
            print(f"❌ Prompt creation failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 4. List Prompts
    print("\n4️⃣ List Prompts:")
    try:
        response = requests.get(f"{BASE_URL}/api/prompts")
        if response.status_code == 200:
            data = response.json()
            prompts = data['data']['prompts']
            print(f"✅ Found {len(prompts)} prompts")
            for prompt in prompts[:3]:  # Show first 3
                print(f"   • {prompt['title']}")
        else:
            print(f"❌ Failed to list prompts: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 MVP Demo Complete!")
    print(f"📍 Your AI Hub: {BASE_URL}")
    print(f"🔑 Access Token: {token[:20]}...")

if __name__ == "__main__":
    demo()