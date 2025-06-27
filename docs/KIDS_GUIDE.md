# 🤖 MongoDB AI Hub - Kid's Guide
*How to Use This Super Cool AI Tool (Age 12+)*

## 🎯 What Is This Thing?

Think of MongoDB AI Hub like a **super smart backpack** for AI stuff! It helps you:
- 📝 Store cool AI prompts (like magic spells for computers)
- 🧠 Keep track of AI memories (called vectors)
- 🔐 Keep everything safe with passwords
- 🌐 Share it with friends online

It's like having your own AI assistant's brain that you can organize and control!

## 🚀 Getting Started (The Easy Way)

### Step 1: Start the Magic
Open your computer's command line (it's like texting with your computer) and type:
```bash
npm run dev
```

**What should happen:** You'll see messages like "Server started" - this means your AI Hub is awake! 🎉

**If something goes wrong:**
- ❌ "Command not found" → You need to install Node.js first (ask an adult!)
- ❌ "Permission denied" → Try `sudo npm run dev` (but ask permission first!)
- ❌ "Port already in use" → Something else is using port 3000, try closing other programs

### Step 2: Check If It's Working
Open a web browser and go to: `http://localhost:3000/api/health`

**You should see:** `{"status":"ok","message":"MongoDB AI Data Hub API is running"}`

**If you don't see this:**
- 🔍 Check the command line - are there error messages?
- 🔄 Try restarting: Press Ctrl+C, then run `npm run dev` again
- 💻 Make sure you're in the right folder (mongodb-ai-hub)

## 🏠 Your First Account

### Creating Your Account (Like Signing Up for a Game)

**What you need:**
- An email address (can be fake for testing, like test@example.com)
- A strong password (at least 8 characters with numbers and symbols)
- Your first and last name

**How to do it:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@example.com",
    "password": "SuperSecret123!",
    "firstName": "Your",
    "lastName": "Name"
  }'
```

**What should happen:** You get a big response with your user info and a special "token" (like a digital key)

**Common Problems:**
- ❌ "User already exists" → Try a different email
- ❌ "Password too weak" → Add numbers and symbols like !@#$
- ❌ "Invalid email" → Make sure it has @ and .com
- ❌ "Validation failed" → Check your spelling and format

### Logging In (Getting Your Digital Key)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@example.com",
    "password": "SuperSecret123!"
  }'
```

**Save your token!** Look for `"accessToken":"eyJ..."` - copy everything between the quotes after accessToken. You'll need this for everything else!

## 🎭 Creating AI Prompts (Your Magic Spells)

Think of prompts like instructions you give to AI. Like telling your friend "help me with homework" but more specific.

### Your First Prompt
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Homework Helper",
    "content": "Help me understand this topic by explaining it like I am 12 years old with simple examples:",
    "category": "education",
    "model": "gpt-4",
    "tags": ["homework", "learning", "simple"]
  }'
```

**Replace YOUR_TOKEN_HERE** with the long token you got when logging in!

### Cool Prompt Ideas for Kids:
1. **Story Creator**: "Write a fun adventure story about [topic] with talking animals"
2. **Science Explainer**: "Explain how [science thing] works using only words a 12-year-old knows"
3. **Homework Helper**: "Help me solve this step by step: [problem]"
4. **Creative Writer**: "Turn this boring topic into an exciting story: [topic]"

### Getting Your Prompts Back
```bash
curl http://localhost:3000/api/prompts
```
This shows all prompts everyone made!

**To see just yours:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/prompts
```

## 🧠 Vector Stores (AI Memory Banks)

Vectors are like giving AI a photographic memory. You can store information and the AI remembers it perfectly!

### Creating a Memory Bank
```bash
curl -X POST http://localhost:3000/api/vectorstores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My School Notes",
    "namespace": "education",
    "vectorDimension": 1536,
    "model": "text-embedding-ada-002",
    "description": "All my cool school facts and notes"
  }'
```

## 🆘 When Things Go Wrong (Troubleshooting for Kids)

### "I Can't Connect!" 
**Symptoms:** Nothing works, timeouts, can't reach server
**Solutions:**
1. 🔄 Restart everything: Close terminal, reopen, run `npm run dev`
2. 🌐 Check your internet connection
3. 💻 Make sure you're in the right folder
4. 🔍 Look for error messages and read them carefully

### "My Token Doesn't Work!"
**Symptoms:** "Unauthorized" or "Invalid token" errors
**Solutions:**
1. ⏰ Tokens expire after 15 minutes - log in again to get a new one
2. 📋 Make sure you copied the WHOLE token (they're very long!)
3. 🔤 Check for extra spaces or missing characters
4. 💾 Try logging in fresh and getting a new token

### "I Forgot My Password!"
**Symptoms:** Can't log in
**Solutions:**
1. 🤔 Try common passwords you use (but don't tell anyone!)
2. 🔁 Create a new account with a different email
3. 📝 Write down your password somewhere safe next time

### "The Server Won't Start!"
**Symptoms:** Errors when running `npm run dev`
**Solutions:**
1. 📦 Run `npm install` first to get all the parts
2. 🔧 Check if you have Node.js installed (`node --version`)
3. 📂 Make sure you're in the mongodb-ai-hub folder
4. 🗑️ Try `rm -rf node_modules` then `npm install` (this resets everything)

### "I'm Getting Weird Errors!"
**Symptoms:** Confusing technical messages
**Solutions:**
1. 📖 Read the error message carefully - it usually tells you what's wrong
2. 🔍 Google the error message - other people probably had the same problem
3. 🧹 Clear everything and start over - sometimes this fixes mysterious problems
4. 👨‍👩‍👧‍👦 Ask an adult who knows computers for help

## 🎮 Fun Things to Try

### 1. Build a Story Database
Create prompts for different story types:
- Adventure stories
- Mystery stories  
- Sci-fi stories
- Funny stories

### 2. Make a Homework Helper Collection
Store prompts for each school subject:
- Math problem solver
- Science explainer
- History storyteller
- English writing helper

### 3. Create Your AI Assistant
Build prompts that work together:
- Morning routine planner
- Study schedule maker
- Creative project ideas
- Fun fact generator

### 4. Share with Friends
- Export your best prompts
- Teach friends how to use it
- Build collaborative prompt collections
- Have prompt-writing contests

## 🛡️ Staying Safe

### Password Safety
- ✅ Use different passwords for different things
- ✅ Make passwords long and random-ish
- ✅ Don't share passwords with anyone
- ❌ Don't use your name, birthday, or pet's name

### Internet Safety
- ✅ Only use this on your own computer or with permission
- ✅ Don't put personal information in prompts
- ✅ Ask an adult before sharing anything online
- ❌ Don't give strangers access to your AI Hub

### Smart AI Use
- ✅ Always double-check AI answers for homework
- ✅ Use AI to help you learn, not to cheat
- ✅ Be creative and experiment!
- ❌ Don't trust AI 100% - it can make mistakes

## 🎯 Quick Reference Card

**Start the system:** `npm run dev`
**Check if working:** Go to `http://localhost:3000/api/health`
**Create account:** Use the register command above
**Log in:** Use the login command above
**Make prompt:** Use the prompt creation command above
**Get help:** Look at error messages and this guide!

## 🏆 You're Now an AI Hub Expert!

Congratulations! You now know how to:
- ✅ Start and stop the AI Hub
- ✅ Create your own account
- ✅ Make cool AI prompts
- ✅ Store AI memories
- ✅ Fix common problems
- ✅ Stay safe while having fun

**Remember:** The best way to learn is by trying things! Don't be afraid to experiment, make mistakes, and ask questions. Every expert was once a beginner! 🌟

---

*Made with ❤️ for young AI explorers everywhere*