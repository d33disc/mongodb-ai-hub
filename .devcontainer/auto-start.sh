#!/bin/bash

# MongoDB AI Hub Auto-Start Script
# This script automatically starts the AI Hub server in cloud environments

echo "🚀 MongoDB AI Hub Auto-Start Script"
echo "=================================="

# Function to check if server is running
check_server() {
    curl -s http://localhost:3000/api/health > /dev/null 2>&1
    return $?
}

# Function to start MongoDB if not running
start_mongodb() {
    if ! pgrep mongod > /dev/null; then
        echo "📦 Starting MongoDB..."
        sudo service mongodb start || mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db
        sleep 3
    else
        echo "✅ MongoDB already running"
    fi
}

# Function to start the AI Hub server
start_server() {
    echo "🤖 Starting MongoDB AI Hub server..."
    
    # Navigate to project directory
    cd /workspaces/mongodb-ai-hub 2>/dev/null || cd /workspace 2>/dev/null || cd /usr/src/app 2>/dev/null || cd .
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Start server in background
    nohup npm run dev > /tmp/ai-hub.log 2>&1 &
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if check_server; then
            echo "✅ MongoDB AI Hub is running on port 3000!"
            echo "🔗 Health check: http://localhost:3000/api/health"
            echo "📚 API docs: http://localhost:3000/api"
            return 0
        fi
        sleep 1
    done
    
    echo "❌ Failed to start server. Check logs:"
    tail -20 /tmp/ai-hub.log
    return 1
}

# Function to show server status
show_status() {
    echo ""
    echo "📊 Server Status:"
    echo "=================="
    if check_server; then
        echo "✅ Server: Running"
        echo "🔗 URL: http://localhost:3000"
        echo "📝 Health: $(curl -s http://localhost:3000/api/health)"
    else
        echo "❌ Server: Not running"
    fi
    
    echo ""
    echo "🔧 Quick Commands:"
    echo "==================="
    echo "Check status: curl http://localhost:3000/api/health"
    echo "View logs: tail -f /tmp/ai-hub.log"
    echo "Restart: pkill -f 'node src/server.js' && npm run dev"
    echo ""
}

# Main execution
main() {
    # Detect environment
    if [ -n "$CODESPACES" ]; then
        echo "🌟 GitHub Codespaces environment detected"
    elif [ -n "$GITPOD_WORKSPACE_URL" ]; then
        echo "🟠 GitPod environment detected"
    elif [ -n "$REPL_ID" ]; then
        echo "🔵 Replit environment detected"
    else
        echo "🖥️  Local/Generic cloud environment detected"
    fi
    
    # Start MongoDB
    start_mongodb
    
    # Check if server is already running
    if check_server; then
        echo "✅ MongoDB AI Hub is already running!"
        show_status
        return 0
    fi
    
    # Start the server
    start_server
    
    # Show final status
    show_status
}

# Run main function
main "$@"