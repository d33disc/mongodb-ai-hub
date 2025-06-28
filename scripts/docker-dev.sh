#!/bin/bash
# 🐳 Docker Development Helper Script
# Simplifies Docker operations for MongoDB AI Hub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to check if Docker is running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker Desktop"
        echo "Download from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop"
        exit 1
    fi
    
    print_success "Docker is running"
}

# Function to show help
show_help() {
    echo "🐳 MongoDB AI Hub Docker Helper"
    echo ""
    echo "Usage: ./scripts/docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services (app, MongoDB, Redis)"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - Show application logs"
    echo "  db        - Show database logs"
    echo "  shell     - Open shell in app container"
    echo "  mongo     - Open MongoDB shell"
    echo "  clean     - Clean up containers and volumes"
    echo "  build     - Rebuild application container"
    echo "  status    - Show status of all services"
    echo "  help      - Show this help message"
    echo ""
    echo "Quick start: ./scripts/docker-dev.sh start"
}

# Function to start services
start_services() {
    print_status "Starting MongoDB AI Hub with Docker..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check if app is responding
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        print_success "MongoDB AI Hub is running!"
        echo ""
        echo "🌐 Application: http://localhost:3000"
        echo "📊 Health Check: http://localhost:3000/api/health"
        echo "🗃️  Database Admin: http://localhost:8081 (admin/admin)"
        echo "📋 API Documentation: http://localhost:3000/api"
    else
        print_warning "Services started but app may still be initializing..."
        print_status "Check logs with: ./scripts/docker-dev.sh logs"
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping MongoDB AI Hub services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting MongoDB AI Hub services..."
    docker-compose restart
    print_success "Services restarted"
}

# Function to show logs
show_logs() {
    print_status "Showing application logs (Ctrl+C to exit)..."
    docker-compose logs -f app
}

# Function to show database logs
show_db_logs() {
    print_status "Showing database logs (Ctrl+C to exit)..."
    docker-compose logs -f mongodb
}

# Function to open shell in app container
open_shell() {
    print_status "Opening shell in app container..."
    docker-compose exec app sh
}

# Function to open MongoDB shell
open_mongo_shell() {
    print_status "Opening MongoDB shell..."
    docker-compose exec mongodb mongosh -u admin -p password --authenticationDatabase admin mongodb-ai-hub
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers and data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up containers and volumes..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup complete"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to rebuild
rebuild() {
    print_status "Rebuilding application container..."
    docker-compose build --no-cache app
    print_success "Rebuild complete"
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose ps
    
    echo ""
    print_status "Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_services
        ;;
    stop)
        check_docker
        stop_services
        ;;
    restart)
        check_docker
        restart_services
        ;;
    logs)
        check_docker
        show_logs
        ;;
    db)
        check_docker
        show_db_logs
        ;;
    shell)
        check_docker
        open_shell
        ;;
    mongo)
        check_docker
        open_mongo_shell
        ;;
    clean)
        check_docker
        clean_up
        ;;
    build)
        check_docker
        rebuild
        ;;
    status)
        check_docker
        show_status
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac