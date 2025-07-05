#!/bin/bash

# Script to start the ecommerce fullstack application
# This script builds and runs both API and Frontend using Docker Compose

set -e

# Global variable for docker compose command
DOCKER_COMPOSE_CMD=""

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

# Check if docker and docker-compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check for docker-compose (legacy) or docker compose (new)
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All dependencies are installed. Using: $DOCKER_COMPOSE_CMD"
}

# Function to stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    $DOCKER_COMPOSE_CMD down --remove-orphans
    print_success "Existing containers stopped."
}

# Function to build and start containers
start_application() {
    print_status "Building and starting the ecommerce application..."
    
    # Build and start in detached mode
    $DOCKER_COMPOSE_CMD up --build -d
    
    if [ $? -eq 0 ]; then
        print_success "Application started successfully!"
        echo ""
        print_status "Application URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  API:      http://localhost:8080"
        echo ""
        print_status "To view logs, run: $DOCKER_COMPOSE_CMD logs -f"
        print_status "To stop the application, run: $DOCKER_COMPOSE_CMD down"
    else
        print_error "Failed to start the application."
        exit 1
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    $DOCKER_COMPOSE_CMD logs -f
}

# Function to show status
show_status() {
    print_status "Application status:"
    $DOCKER_COMPOSE_CMD ps
}

# Main script logic
main() {
    echo "================================================"
    echo "   Ecommerce Fullstack Application Launcher    "
    echo "================================================"
    echo ""
    
    case "${1:-start}" in
        "start")
            check_dependencies
            stop_containers
            start_application
            ;;
        "stop")
            print_status "Stopping the application..."
            $DOCKER_COMPOSE_CMD down
            print_success "Application stopped."
            ;;
        "restart")
            print_status "Restarting the application..."
            check_dependencies
            stop_containers
            start_application
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "clean")
            print_status "Cleaning up containers and images..."
            $DOCKER_COMPOSE_CMD down --remove-orphans --volumes
            $DOCKER_COMPOSE_CMD build --no-cache
            print_success "Cleanup completed."
            ;;
        "help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start    - Start the application (default)"
            echo "  stop     - Stop the application"
            echo "  restart  - Restart the application"
            echo "  logs     - Show application logs"
            echo "  status   - Show container status"
            echo "  clean    - Clean build and restart"
            echo "  help     - Show this help message"
            ;;
        *)
            print_error "Unknown command: $1"
            print_status "Use '$0 help' for available commands."
            exit 1
            ;;
    esac
}

# Run the main function
main "$@"
