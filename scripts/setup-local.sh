#!/bin/bash
# 🛠️ Local Development Setup Script
# This script sets up everything you need for local development

set -e  # Exit on any error

echo "🚀 Setting up MongoDB AI Hub for local development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check if npm is installed
print_status "Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

# Install dependencies
print_status "Installing project dependencies..."
npm install
print_success "Dependencies installed successfully"

# Check for .env file
print_status "Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your MongoDB connection details"
    
    # Generate JWT secrets
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    
    # Update .env file with generated secrets
    sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/" .env
    sed -i.bak "s/your-refresh-secret-key-here/$JWT_REFRESH_SECRET/" .env
    rm .env.bak
    
    print_success "JWT secrets generated and added to .env"
else
    print_success ".env file found"
fi

# Check MongoDB connection options
print_status "Checking MongoDB setup options..."

# Check if MongoDB is running locally
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ismaster')" --quiet &> /dev/null; then
        print_success "Local MongoDB detected and running"
        LOCAL_MONGO="mongodb://localhost:27017/mongodb-ai-hub"
        sed -i.bak "s|mongodb://localhost:27017/mongodb-ai-hub|$LOCAL_MONGO|" .env
        rm .env.bak 2>/dev/null || true
    else
        print_warning "MongoDB installed but not running"
        print_status "You can start it with: brew services start mongodb-community (Mac)"
    fi
elif command -v docker &> /dev/null; then
    print_warning "Local MongoDB not found, but Docker is available"
    print_status "You can use Docker MongoDB with: docker-compose up -d mongodb"
else
    print_warning "Neither MongoDB nor Docker found locally"
    print_status "Options:"
    echo "  1. Install MongoDB Community: https://docs.mongodb.com/manual/installation/"
    echo "  2. Install Docker: https://docs.docker.com/get-docker/"
    echo "  3. Use MongoDB Atlas (cloud): https://cloud.mongodb.com"
fi

# Create logs directory
print_status "Setting up logs directory..."
mkdir -p logs
touch logs/combined.log logs/error.log logs/debug.log
print_success "Logs directory created"

# Check if 1Password CLI is available
print_status "Checking for 1Password CLI..."
if command -v op &> /dev/null; then
    print_success "1Password CLI found - you can use secure secret management"
    print_status "Run: npm run setup-secrets to configure 1Password secrets"
else
    print_warning "1Password CLI not found - using local .env file for secrets"
    print_status "Install with: brew install 1password-cli (Mac)"
fi

# Run tests to verify setup
print_status "Running setup verification tests..."
if npm test; then
    print_success "All tests passed - setup verified!"
else
    print_warning "Some tests failed - check your MongoDB connection"
fi

# Display next steps
echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. 📝 Edit .env file if needed:"
echo "   nano .env"
echo ""
echo "2. 🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "3. 🔍 Check health status:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "4. 📚 Read the documentation:"
echo "   open docs/KIDS_GUIDE.md"
echo ""
echo "5. 🐳 Or use Docker for everything:"
echo "   docker-compose up"
echo ""

# Check if MongoDB Compass should be suggested
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "💡 Consider installing MongoDB Compass for a visual database interface:"
    echo "   brew install --cask mongodb-compass"
    echo ""
fi

print_success "MongoDB AI Hub is ready for development! 🚀"