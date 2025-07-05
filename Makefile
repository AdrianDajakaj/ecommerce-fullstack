# Makefile for Ecommerce Fullstack Application

.PHONY: help build up down restart logs status clean dev

# Default target
.DEFAULT_GOAL := help

# Check for docker compose command
DOCKER_COMPOSE := $(shell which docker-compose 2>/dev/null)
ifeq ($(DOCKER_COMPOSE),)
	DOCKER_COMPOSE := docker compose
endif

help: ## Show this help message
	@echo "Ecommerce Fullstack Application"
	@echo "================================"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

build: ## Build the application containers
	$(DOCKER_COMPOSE) build

up: ## Start the application in production mode
	$(DOCKER_COMPOSE) up --build -d
	@echo ""
	@echo "🚀 Application started successfully!"
	@echo "Frontend: http://localhost:3000"
	@echo "API:      http://localhost:8080"

dev: ## Start the application in development mode
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml up --build -d
	@echo ""
	@echo "🚀 Development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "API:      http://localhost:8080"

down: ## Stop the application
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml down 2>/dev/null || true

restart: down up ## Restart the application

##@ Monitoring

logs: ## Show application logs
	$(DOCKER_COMPOSE) logs -f

logs-api: ## Show API logs only
	$(DOCKER_COMPOSE) logs -f api

logs-frontend: ## Show frontend logs only
	$(DOCKER_COMPOSE) logs -f frontend

status: ## Show container status
	$(DOCKER_COMPOSE) ps

##@ Maintenance

clean: ## Clean up containers, volumes, and rebuild
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml down --volumes --remove-orphans 2>/dev/null || true
	$(DOCKER_COMPOSE) build --no-cache

clean-all: ## Remove everything including images
	$(DOCKER_COMPOSE) down --volumes --remove-orphans --rmi all
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml down --volumes --remove-orphans --rmi all 2>/dev/null || true
	docker system prune -f

##@ Database

db-reset: ## Reset the database
	docker volume rm ecommerce-fullstack_api-data 2>/dev/null || true
	@echo "Database reset. Run 'make up' to restart with fresh database."

##@ Utilities

shell-api: ## Open shell in API container
	docker exec -it ecommerce-api sh

shell-frontend: ## Open shell in frontend container
	docker exec -it ecommerce-frontend sh

health: ## Check application health
	@echo "Checking API health..."
	@curl -f http://localhost:8080/health || echo "API not responding"
	@echo ""
	@echo "Checking Frontend health..."
	@curl -f http://localhost:3000 || echo "Frontend not responding"
