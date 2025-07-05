# Ecommerce Fullstack Application

Full-stack ecommerce application consisting of API (Go Echo) and frontend (React + Vite) orchestrated with Docker Compose.

## Project Structure

```
ecommerce-fullstack/
├── api/                    # Backend API (Go Echo) - submodule
├── frontend/              # Frontend (React + Vite) - submodule  
├── docker-compose.yml     # Docker Compose configuration
├── docker-compose.dev.yml # Development environment configuration
├── start-app.sh          # Application launcher script
├── Makefile              # Alternative management commands
├── .env                  # Environment variables
├── .env.example          # Environment variables template
├── .dockerignore         # Docker build exclusions
└── README.md            # This file
```

## Requirements

- Docker
- Docker Compose
- Git (for submodules)

## Quick Start

### Method 1: Using the launcher script (recommended)

```bash
# Start the application
./start-app.sh

# Or explicitly:
./start-app.sh start
```

### Method 2: Using Makefile

```bash
# Start the application
make up

# Show all available commands
make help
```

### Method 3: Direct Docker Compose

```bash
# Start in background
docker-compose up --build -d

# Start with live logs
docker-compose up --build
```

## Available Commands

### Script Commands
```bash
./start-app.sh start     # Start the application (default)
./start-app.sh stop      # Stop the application
./start-app.sh restart   # Restart the application
./start-app.sh logs      # Show application logs
./start-app.sh status    # Show container status
./start-app.sh clean     # Clean and rebuild from scratch
./start-app.sh help      # Show help
```

### Makefile Commands
```bash
make up                  # Start application in production mode
make dev                 # Start application in development mode
make down                # Stop the application
make restart             # Restart the application
make logs                # Show application logs
make logs-api            # Show API logs only
make logs-frontend       # Show frontend logs only
make status              # Show container status
make clean               # Clean up containers and rebuild
make clean-all           # Remove everything including images
make db-reset            # Reset the database
make shell-api           # Open shell in API container
make shell-frontend      # Open shell in frontend container
make health              # Check application health
make help                # Show all available commands
```

## Application Access

After starting, the application will be available at:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080

## Monitoring

### Check container status
```bash
docker-compose ps
# or
make status
```

### View logs
```bash
# All services
docker-compose logs -f
# or
make logs

# API only
docker-compose logs -f api
# or
make logs-api

# Frontend only
docker-compose logs -f frontend
# or
make logs-frontend
```

### Health checks
The application has built-in health checks:
- API: http://localhost:8080/health
- Frontend: http://localhost:3000

## Stopping the Application

```bash
# Using script
./start-app.sh stop

# Using Makefile
make down

# Or directly
docker-compose down
```

## Cleanup

```bash
# Stop and remove containers with volumes
docker-compose down --volumes

# Clean everything (containers, images, networks)
docker-compose down --volumes --rmi all

# Using script
./start-app.sh clean

# Using Makefile
make clean           # Clean containers and volumes
make clean-all       # Remove everything including images
```

## Configuration

### Environment Variables (.env)

- `API_PORT`: API port (default: 8080)
- `FRONTEND_PORT`: Frontend port (default: 3000)
- `VITE_API_BASE_URL`: API URL for frontend
- `DB_PATH`: SQLite database path
- `COMPOSE_PROJECT_NAME`: Docker Compose project name

### Port Modification

To change ports, edit the `.env` file or directly modify `docker-compose.yml`.

### Development vs Production

- **Production**: `docker-compose.yml` - Optimized builds, nginx serving
- **Development**: `docker-compose.dev.yml` - Hot reload, development servers

```bash
# Start in development mode
make dev
# or
docker-compose -f docker-compose.dev.yml up --build
```

## Troubleshooting

### Port conflicts
If ports are occupied, change them in `.env` or `docker-compose.yml`.

### Database issues
SQLite database is mounted as a volume. If you encounter problems:
```bash
docker-compose down --volumes
./start-app.sh clean
# or
make db-reset
```

### Submodule issues
Make sure submodules are properly initialized:
```bash
git submodule update --init --recursive
```

### Container rebuild
```bash
docker-compose build --no-cache
docker-compose up -d
# or
./start-app.sh clean
# or
make clean
```

### Permission issues
```bash
# Make sure Docker has access to files
chmod 644 api/ecommerce.db
chmod -R 755 api/assets/
```

## Development

### Adding new features
1. Make changes in the appropriate submodule (api or frontend)
2. Rebuild containers: `./start-app.sh clean` or `make clean`
3. Commit changes in submodules first, then update main repository

### Debugging
- **Logs**: `./start-app.sh logs` or `make logs`
- **Status**: `./start-app.sh status` or `make status`
- **Container shell**: `docker exec -it ecommerce-api sh` or `make shell-api`
- **Health check**: `make health`

### Hot reload development
```bash
# Start in development mode with hot reload
make dev
```

## Git Workflow with Submodules

### 1. Commit changes in submodules first
```bash
# In api submodule
cd api
git add .
git commit -m "Your API changes"
git push origin main
cd ..

# In frontend submodule
cd frontend
git add .
git commit -m "Your frontend changes"
git push origin main
cd ..
```

### 2. Then commit in main repository
```bash
# Add all new files and updated submodule references
git add .
git commit -m "Update application configuration and submodules"
git push origin main
```

### 3. Clone with submodules
```bash
# Clone repository with all submodules
git clone --recursive https://github.com/your-username/ecommerce-fullstack.git

# Or if already cloned, initialize submodules
git submodule update --init --recursive
```

## Architecture

### Services
- **API**: Go Echo REST API with SQLite database
- **Frontend**: React + Vite SPA served by nginx
- **Network**: Docker bridge network for service communication
- **Volumes**: Persistent storage for database and assets

### Ports
- **3000**: Frontend (nginx)
- **8080**: API (Go Echo)

### Health Checks
- API: `/health` endpoint returning JSON status
- Frontend: HTTP 200 response from nginx

## API Endpoints

- `GET /health` - Health check
- `GET /categories` - List all categories
- `GET /products` - List all products
- `GET /products/:id` - Get specific product
- And more... (see API documentation in api submodule)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes in appropriate submodules
4. Commit your changes following the Git workflow above
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `make logs` or `./start-app.sh logs`
3. Check container status: `make status`
4. Verify health: `make health`
5. Open an issue in the repository
