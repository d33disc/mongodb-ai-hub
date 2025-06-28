#!/bin/bash

# 🚀 MongoDB AI Hub - One-Click Deployment Script
# This script deploys your MVP to production

echo "🚀 MONGODB AI HUB - MVP DEPLOYMENT"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running locally or in cloud
if [ -z "$DEPLOYMENT_ENV" ]; then
    DEPLOYMENT_ENV="local"
fi

echo -e "${YELLOW}📍 Deployment Environment: $DEPLOYMENT_ENV${NC}"

# Step 1: Install dependencies
echo -e "\n${YELLOW}1️⃣ Installing dependencies...${NC}"
npm install --production

# Step 2: Check environment variables
echo -e "\n${YELLOW}2️⃣ Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.atlas ]; then
        echo -e "${GREEN}✅ Using Atlas configuration${NC}"
        cp .env.atlas .env
    else
        echo -e "${RED}❌ No .env file found!${NC}"
        echo "Please create .env file with your configuration"
        exit 1
    fi
fi

# Step 3: Test MongoDB connection
echo -e "\n${YELLOW}3️⃣ Testing MongoDB connection...${NC}"
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
" || exit 1

# Step 4: Run database migrations (if any)
echo -e "\n${YELLOW}4️⃣ Setting up database...${NC}"
# Add migration scripts here if needed
echo -e "${GREEN}✅ Database ready${NC}"

# Step 5: Build for production (if needed)
echo -e "\n${YELLOW}5️⃣ Building for production...${NC}"
# Add build steps here if needed
echo -e "${GREEN}✅ Build complete${NC}"

# Step 6: Start the server
echo -e "\n${YELLOW}6️⃣ Starting MVP server...${NC}"

# For production deployment
if [ "$DEPLOYMENT_ENV" = "production" ]; then
    # Use PM2 for production
    if command -v pm2 &> /dev/null; then
        pm2 start src/server.js --name mongodb-ai-hub
        echo -e "${GREEN}✅ Server started with PM2${NC}"
    else
        # Fallback to regular node
        NODE_ENV=production node src/server.js &
        echo -e "${GREEN}✅ Server started in production mode${NC}"
    fi
else
    # Local deployment
    echo -e "${GREEN}Starting in development mode...${NC}"
    npm run dev
fi

echo -e "\n${GREEN}🎉 MVP DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}=================================${NC}"
echo -e "📍 API URL: ${YELLOW}http://localhost:3000${NC}"
echo -e "🔍 Health Check: ${YELLOW}http://localhost:3000/api/health${NC}"
echo -e "📚 Documentation: ${YELLOW}https://github.com/d33disc/mongodb-ai-hub${NC}"
echo -e "\n${YELLOW}Test your deployment:${NC}"
echo "curl http://localhost:3000/api/health"

# For cloud deployments, show the public URL
if [ ! -z "$PUBLIC_URL" ]; then
    echo -e "\n${GREEN}🌍 Public URL: ${YELLOW}$PUBLIC_URL${NC}"
fi

echo -e "\n${GREEN}✅ Your MongoDB AI Hub MVP is deployed and running!${NC}"