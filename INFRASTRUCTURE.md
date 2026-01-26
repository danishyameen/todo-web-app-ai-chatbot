# Todo Web Application - Infrastructure Guide

## Table of Contents
1. [Overview](#overview)
2. [Docker Containerization](#docker-containerization)
3. [Environment Configuration](#environment-configuration)
4. [Health Checks](#health-checks)
5. [Documentation](#documentation)
6. [Deployment](#deployment)

## Overview
This document describes the infrastructure setup for the Todo Web Application, including containerization, environment configuration, health checks, and deployment procedures.

## Docker Containerization

### Prerequisites
- Docker version 20.10 or higher
- Docker Compose version 2.0 or higher

### Building and Running with Docker

#### Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd todo_web_app

# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

#### Building Individual Services
```bash
# Build backend service
cd backend
docker build -t todo-backend .

# Build frontend service
cd frontend
docker build -t todo-frontend .
```

### Docker Compose Services
The application consists of the following services:

1. **Database (PostgreSQL)**:
   - Image: postgres:15
   - Port: 5432 (internal)
   - Health check: pg_isready command
   - Volume: postgres_data for persistent storage

2. **Backend (FastAPI)**:
   - Built from backend/Dockerfile
   - Port: 8000
   - Health check: /health endpoint
   - Dependencies: Database service

3. **Frontend (Next.js)**:
   - Built from frontend/Dockerfile
   - Port: 3000
   - Dependencies: Backend service

## Environment Configuration

### Environment Variables

#### Backend (.env file)
```env
# Application settings
ENVIRONMENT=development  # development, staging, production
DEBUG=true  # Set to false in production

# Database settings
DATABASE_URL=postgresql://postgres:postgres@db:5432/todo_db
DB_ECHO=false  # Enable SQL query logging
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30
DB_POOL_RECYCLE=3600
DB_POOL_TIMEOUT=30

# JWT settings
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET_KEY=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Rate limiting
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_AUTHENTICATED=200/minute

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Email settings (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SENDER=noreply@todoapp.com

# Security settings
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_TIME=300  # seconds

# Logging settings
LOG_LEVEL=INFO
LOG_FILE=/var/log/todo_app.log
```

#### Frontend (.env.local file)
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000/api
NODE_ENV=development
```

### Environment-Specific Configurations

#### Development
- Debug mode enabled
- Detailed error messages
- Hot reloading enabled
- Less restrictive rate limits

#### Staging
- Debug mode disabled
- Standard error messages
- Pre-production testing environment
- Moderate rate limits

#### Production
- Debug mode disabled
- Minimal error information exposed
- Optimized performance settings
- Strict rate limits
- Secure headers enabled

## Health Checks

### Available Health Check Endpoints

1. **General Health Check**:
   - Endpoint: `GET /health`
   - Response: Basic service status
   - Example: `{"status": "healthy", "service": "todo-web-app-api", "version": "1.0.0"}`

2. **Database Health Check**:
   - Endpoint: `GET /health/database`
   - Response: Database connectivity status
   - Example: `{"status": "healthy", "database": "reachable", "message": "Database connection is working"}`

### Health Check Implementation

The health check endpoints are implemented with:
- Database connectivity verification
- Proper HTTP status codes (200 for healthy, 503 for unhealthy)
- Descriptive response messages
- Error handling for edge cases

### Docker Health Checks

Docker health checks are configured in docker-compose.yml:
- Database: Uses pg_isready command
- Backend: Checks /health endpoint
- Frontend: Basic service availability

## Documentation

### API Documentation
The API is documented using FastAPI's built-in documentation:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative API docs: `http://localhost:8000/redoc`
- OpenAPI schema: `http://localhost:8000/openapi.json`

### Features Documented
- Authentication endpoints
- Task management endpoints
- Category management endpoints
- Chatbot endpoints
- Password reset endpoints
- Recurring tasks endpoints

### Code Documentation
- Type hints for all functions and methods
- Docstrings for all classes, functions, and methods
- Inline comments for complex logic
- Model field descriptions

## Deployment

### Production Deployment Steps

1. **Prepare Environment Files**:
   ```bash
   # Create production .env file
   cp backend/.env.example backend/.env.production
   # Update with production values
   ```

2. **Build Production Images**:
   ```bash
   # Build production-ready images
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Deploy with Docker Compose**:
   ```bash
   # Deploy in production mode
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Production Docker Compose (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: todo_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/todo_db
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - ENVIRONMENT=production
      - DEBUG=false
      - LOG_LEVEL=WARNING
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:3000"
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data_prod:
```

### Monitoring and Logging

#### Application Logs
- Backend logs: Access via `docker-compose logs backend`
- Frontend logs: Access via `docker-compose logs frontend`
- Database logs: Access via `docker-compose logs db`

#### Health Monitoring
- Regular health check endpoints
- Docker health check status: `docker-compose ps`
- Automated alerts for unhealthy services

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U postgres todo_db > backup.sql

# Restore from backup
docker-compose exec -T db psql -U postgres todo_db < backup.sql
```

### Automated Backups
For production environments, implement automated backups using:
- Cron jobs for periodic backups
- Cloud storage for backup retention
- Backup verification processes
- Disaster recovery procedures

## Security Considerations

### Secrets Management
- Never commit sensitive environment variables to version control
- Use environment variables for secrets in production
- Rotate secrets regularly
- Use strong, randomly generated secrets

### Network Security
- Use HTTPS in production
- Implement proper CORS policies
- Use secure headers
- Regular security updates

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Check if database service is running: `docker-compose ps`
   - Verify database connection string
   - Check database health: `docker-compose logs db`

2. **Application Startup Issues**:
   - Check application logs: `docker-compose logs backend`
   - Verify environment variables are set correctly
   - Ensure all dependencies are available

3. **Health Check Failures**:
   - Check if dependent services are running
   - Verify network connectivity between services
   - Review application logs for errors

### Useful Commands

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend

# Restart a specific service
docker-compose restart backend

# Scale services
docker-compose up --scale backend=2

# Check service health
docker-compose ps
```

This infrastructure guide provides a comprehensive overview of the containerized Todo Web Application setup, including deployment, configuration, and operational procedures.