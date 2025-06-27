#!/bin/bash
# MongoDB AI Hub - 1Password CLI Setup Script
# Date: 2025-06-25
# Purpose: Automate secrets management with 1Password CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 MongoDB AI Hub - 1Password Secrets Setup${NC}"
echo "============================================="

# Check if 1Password CLI is installed
if ! command -v op &> /dev/null; then
    echo -e "${RED}❌ 1Password CLI is not installed${NC}"
    echo "Please install it from: https://developer.1password.com/docs/cli/get-started"
    exit 1
fi

echo -e "${GREEN}✅ 1Password CLI detected${NC}"

# Check if user is signed in
if ! op account list &> /dev/null; then
    echo -e "${YELLOW}🔑 Please sign in to 1Password:${NC}"
    eval $(op signin)
fi

# Function to create or update item in 1Password
create_or_update_secret() {
    local item_name=$1
    local field_name=$2
    local field_value=$3
    local vault="Personal"
    
    echo -e "${BLUE}📝 Setting up: ${item_name}/${field_name}${NC}"
    
    # Check if item exists
    if op item get "$item_name" --vault="$vault" &> /dev/null; then
        # Update existing item
        op item edit "$item_name" "$field_name=$field_value" --vault="$vault" &> /dev/null
        echo -e "${GREEN}✅ Updated: ${item_name}/${field_name}${NC}"
    else
        # Create new item
        op item create \
            --category="API Credential" \
            --title="$item_name" \
            --vault="$vault" \
            "$field_name=$field_value" &> /dev/null
        echo -e "${GREEN}✅ Created: ${item_name}/${field_name}${NC}"
    fi
}

# Generate secure secrets
echo -e "${YELLOW}🔒 Generating secure secrets...${NC}"
JWT_SECRET=$(op generate-password --length=64 --include-symbols=false)
JWT_REFRESH_SECRET=$(op generate-password --length=64 --include-symbols=false)

# Create/Update 1Password items
echo -e "${BLUE}📦 Creating/Updating 1Password items...${NC}"

# Database configuration
create_or_update_secret "mongodb-ai-hub" "database/connection_string" "mongodb://localhost:27017/mongodb-ai-hub"

# Security secrets
create_or_update_secret "mongodb-ai-hub" "security/jwt_secret" "$JWT_SECRET"
create_or_update_secret "mongodb-ai-hub" "security/jwt_refresh_secret" "$JWT_REFRESH_SECRET"

# CORS configuration
create_or_update_secret "mongodb-ai-hub" "cors/allowed_origins" "http://localhost:3000,http://localhost:3001"

# Email configuration (placeholders)
create_or_update_secret "mongodb-ai-hub" "email/service" "gmail"
create_or_update_secret "mongodb-ai-hub" "email/user" "your-email@gmail.com"
create_or_update_secret "mongodb-ai-hub" "email/password" "your-app-password"

# Redis configuration (placeholder)
create_or_update_secret "mongodb-ai-hub" "redis/connection_string" "redis://localhost:6379"

# Monitoring (placeholders)
create_or_update_secret "mongodb-ai-hub" "monitoring/sentry_dsn" "https://your-sentry-dsn"
create_or_update_secret "mongodb-ai-hub" "analytics/key" "your-analytics-key"

# API Keys (placeholders)
create_or_update_secret "mongodb-ai-hub" "apis/openai_key" "sk-your-openai-key"
create_or_update_secret "mongodb-ai-hub" "apis/anthropic_key" "sk-your-anthropic-key"

# Generate .env file from template
if [ -f ".env.1password.template" ]; then
    echo -e "${BLUE}🔄 Generating .env file from 1Password...${NC}"
    op inject -i .env.1password.template -o .env
    echo -e "${GREEN}✅ .env file generated successfully${NC}"
else
    echo -e "${RED}❌ .env.1password.template not found${NC}"
    exit 1
fi

# Create backup of original .env if it exists
if [ -f ".env.backup" ]; then
    echo -e "${YELLOW}⚠️  .env.backup already exists, skipping backup${NC}"
else
    cp .env .env.backup
    echo -e "${GREEN}✅ Created .env.backup${NC}"
fi

# Display summary
echo ""
echo -e "${GREEN}🎉 1Password setup complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "✅ Secrets stored in 1Password vault: Personal"
echo "✅ Item name: mongodb-ai-hub"
echo "✅ .env file generated from 1Password"
echo ""
echo -e "${YELLOW}📌 To regenerate .env file anytime:${NC}"
echo "   op inject -i .env.1password.template -o .env"
echo ""
echo -e "${YELLOW}📌 To use in production:${NC}"
echo "   export OP_SERVICE_ACCOUNT_TOKEN=<your-token>"
echo "   op run --env-file=.env.1password.template -- npm start"
echo ""
echo -e "${BLUE}🔒 Remember: Never commit .env files to git!${NC}"