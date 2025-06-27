#!/bin/bash

# MongoDB AI Hub - 1Password Secrets Management Setup
# Date: 2025-06-25
# Purpose: Setup and manage secrets using 1Password CLI

set -e

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

# Check if 1Password CLI is installed
check_op_cli() {
    if ! command -v op &> /dev/null; then
        print_error "1Password CLI (op) is not installed"
        print_status "Install it from: https://developer.1password.com/docs/cli/get-started/"
        exit 1
    fi
    print_success "1Password CLI is installed"
}

# Check if user is signed in to 1Password
check_op_signin() {
    if ! op account list &> /dev/null; then
        print_error "Not signed in to 1Password CLI"
        print_status "Sign in with: op account add"
        exit 1
    fi
    print_success "Signed in to 1Password CLI"
}

# Create vault for MongoDB AI Hub secrets
create_vault() {
    local vault_name="MongoDB-AI-Hub"
    
    if op vault list --format=json | jq -e ".[] | select(.name == \"$vault_name\")" > /dev/null 2>&1; then
        print_warning "Vault '$vault_name' already exists"
    else
        print_status "Creating vault '$vault_name'..."
        op vault create "$vault_name" --description "Secrets for MongoDB AI Hub application"
        print_success "Created vault '$vault_name'"
    fi
}

# Generate secure secrets and store in 1Password
generate_secrets() {
    local vault_name="MongoDB-AI-Hub"
    
    print_status "Generating and storing secrets..."
    
    # Generate JWT secrets
    local jwt_secret=$(openssl rand -hex 64)
    local jwt_refresh_secret=$(openssl rand -hex 64)
    
    # Store JWT secrets
    print_status "Storing JWT secrets..."
    
    # Create JWT secret item
    op item create --vault="$vault_name" \
        --category="Secure Note" \
        --title="JWT-Secrets" \
        --field label="JWT_SECRET" type="concealed" value="$jwt_secret" \
        --field label="JWT_REFRESH_SECRET" type="concealed" value="$jwt_refresh_secret" \
        --field label="Environment" type="text" value="production" \
        --field label="Generated" type="text" value="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --field label="Application" type="text" value="MongoDB AI Hub" || {
        
        # If item exists, update it
        print_warning "JWT-Secrets item already exists, updating..."
        op item edit "JWT-Secrets" --vault="$vault_name" \
            "JWT_SECRET[concealed]=$jwt_secret" \
            "JWT_REFRESH_SECRET[concealed]=$jwt_refresh_secret" \
            "Updated[text]=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
    
    # Generate database connection strings for different environments
    print_status "Creating database connection templates..."
    
    # Development database
    op item create --vault="$vault_name" \
        --category="Database" \
        --title="MongoDB-Development" \
        --field label="MONGODB_URI" type="concealed" value="mongodb://localhost:27017/mongodb-ai-hub-dev" \
        --field label="Environment" type="text" value="development" \
        --field label="Description" type="text" value="Local development database" || {
        
        print_warning "MongoDB-Development item already exists"
    }
    
    # Production database template
    op item create --vault="$vault_name" \
        --category="Database" \
        --title="MongoDB-Production" \
        --field label="MONGODB_URI" type="concealed" value="mongodb+srv://username:password@cluster.mongodb.net/mongodb-ai-hub" \
        --field label="Environment" type="text" value="production" \
        --field label="Description" type="text" value="Production MongoDB Atlas connection" \
        --field label="Note" type="text" value="Update with actual Atlas credentials" || {
        
        print_warning "MongoDB-Production item already exists"
    }
    
    # Application configuration
    op item create --vault="$vault_name" \
        --category="Secure Note" \
        --title="App-Config" \
        --field label="NODE_ENV" type="text" value="production" \
        --field label="PORT" type="text" value="3000" \
        --field label="CORS_ORIGIN" type="text" value="https://your-domain.com" \
        --field label="RATE_LIMIT_WINDOW_MS" type="text" value="900000" \
        --field label="RATE_LIMIT_MAX_REQUESTS" type="text" value="100" \
        --field label="BCRYPT_ROUNDS" type="text" value="12" || {
        
        print_warning "App-Config item already exists"
    }
    
    print_success "Secrets generated and stored in 1Password"
}

# Create environment file loading script
create_env_loader() {
    cat > "scripts/load-secrets.sh" << 'EOF'
#!/bin/bash

# MongoDB AI Hub - Load secrets from 1Password
# This script loads secrets from 1Password and sets environment variables

set -e

VAULT_NAME="MongoDB-AI-Hub"
ENV=${1:-development}

# Check if 1Password CLI is available and user is signed in
if ! command -v op &> /dev/null; then
    echo "Error: 1Password CLI is not installed"
    exit 1
fi

if ! op account list &> /dev/null; then
    echo "Error: Not signed in to 1Password CLI"
    exit 1
fi

# Load JWT secrets
echo "Loading JWT secrets..."
export JWT_SECRET=$(op item get "JWT-Secrets" --vault="$VAULT_NAME" --field="JWT_SECRET")
export JWT_REFRESH_SECRET=$(op item get "JWT-Secrets" --vault="$VAULT_NAME" --field="JWT_REFRESH_SECRET")

# Load database connection based on environment
if [ "$ENV" = "production" ]; then
    echo "Loading production database configuration..."
    export MONGODB_URI=$(op item get "MongoDB-Production" --vault="$VAULT_NAME" --field="MONGODB_URI")
else
    echo "Loading development database configuration..."
    export MONGODB_URI=$(op item get "MongoDB-Development" --vault="$VAULT_NAME" --field="MONGODB_URI")
fi

# Load application configuration
echo "Loading application configuration..."
export NODE_ENV=$(op item get "App-Config" --vault="$VAULT_NAME" --field="NODE_ENV")
export PORT=$(op item get "App-Config" --vault="$VAULT_NAME" --field="PORT")
export CORS_ORIGIN=$(op item get "App-Config" --vault="$VAULT_NAME" --field="CORS_ORIGIN")

echo "Environment variables loaded from 1Password"

# If running directly, start the application
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    echo "Starting MongoDB AI Hub with loaded secrets..."
    node src/server.js
fi
EOF

    chmod +x "scripts/load-secrets.sh"
    print_success "Created environment loader script"
}

# Create development script with secrets
create_dev_script() {
    cat > "scripts/dev-with-secrets.sh" << 'EOF'
#!/bin/bash

# MongoDB AI Hub - Development with 1Password secrets
# This script loads secrets and starts the development server

set -e

echo "🔐 Loading secrets from 1Password..."
source "$(dirname "$0")/load-secrets.sh" development

echo "🚀 Starting development server with secrets..."
npm run dev
EOF

    chmod +x "scripts/dev-with-secrets.sh"
    print_success "Created development script with secrets"
}

# Create production deployment script
create_prod_script() {
    cat > "scripts/prod-with-secrets.sh" << 'EOF'
#!/bin/bash

# MongoDB AI Hub - Production with 1Password secrets
# This script loads secrets and starts the production server

set -e

echo "🔐 Loading secrets from 1Password..."
source "$(dirname "$0")/load-secrets.sh" production

echo "🚀 Starting production server with secrets..."
npm start
EOF

    chmod +x "scripts/prod-with-secrets.sh"
    print_success "Created production script with secrets"
}

# Update package.json with new scripts
update_package_scripts() {
    print_status "Updating package.json with secret-aware scripts..."
    
    # Use Node.js to update package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.scripts['dev:secrets'] = 'bash scripts/dev-with-secrets.sh';
    pkg.scripts['start:secrets'] = 'bash scripts/prod-with-secrets.sh';
    pkg.scripts['load-secrets'] = 'bash scripts/load-secrets.sh';
    pkg.scripts['setup-secrets'] = 'bash scripts/setup-secrets.sh';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    
    print_success "Updated package.json with secret management scripts"
}

# Create .env.example file
create_env_example() {
    cat > ".env.example" << 'EOF'
# MongoDB AI Hub Environment Variables Example
# Copy this file to .env and update values for local development
# For production, use 1Password CLI with: npm run start:secrets

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mongodb-ai-hub

# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (Use 1Password for production)
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12

# Email Configuration (Optional)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
EOF

    print_success "Created .env.example file"
}

# Main setup function
main() {
    echo "🔐 MongoDB AI Hub - 1Password Secrets Setup"
    echo "==========================================="
    
    # Create scripts directory if it doesn't exist
    mkdir -p scripts
    
    # Run setup steps
    check_op_cli
    check_op_signin
    create_vault
    generate_secrets
    create_env_loader
    create_dev_script
    create_prod_script
    update_package_scripts
    create_env_example
    
    echo ""
    print_success "🎉 Secrets management setup complete!"
    echo ""
    print_status "Available commands:"
    echo "  npm run dev:secrets     - Start development with 1Password secrets"
    echo "  npm run start:secrets   - Start production with 1Password secrets"
    echo "  npm run load-secrets    - Load secrets into environment"
    echo ""
    print_status "Secrets stored in 1Password vault: MongoDB-AI-Hub"
    echo ""
    print_warning "⚠️  Remember to:"
    print_warning "   1. Update MongoDB-Production with real Atlas credentials"
    print_warning "   2. Update CORS_ORIGIN in App-Config for production"
    print_warning "   3. Add .env to .gitignore (if not already)"
    echo ""
}

# Run main function if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi