# Todo Web Application - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup and Installation](#setup-and-installation)
4. [Development Workflow](#development-workflow)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Project Overview

### Technologies Used
- **Backend**: FastAPI, SQLModel, PostgreSQL
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: JWT with refresh tokens
- **Database**: PostgreSQL with Alembic migrations
- **AI Integration**: Natural language processing with MCP tools
- **Containerization**: Docker, Docker Compose

### Project Structure
```
todo_web_app/
├── backend/
│   ├── alembic/           # Database migrations
│   ├── src/
│   │   ├── api/          # API route definitions
│   │   ├── auth/         # Authentication logic
│   │   ├── config/       # Configuration files
│   │   ├── db/           # Database session and monitoring
│   │   ├── mcp_tools/    # Model Control Plane tools
│   │   ├── middleware/   # Middleware implementations
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic services
│   │   ├── utils/        # Utility functions
│   │   └── main.py       # Application entry point
│   ├── requirements.txt
│   ├── start_server.py
│   └── alembic.ini
├── frontend/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions and contexts
│   ├── public/           # Static assets
│   ├── package.json
│   └── next.config.js
├── docker-compose.yml
└── README.md
```

## Architecture

### Backend Architecture
- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLModel**: Combines SQLAlchemy and Pydantic for type-safe database models
- **JWT Authentication**: Secure token-based authentication system
- **MCP Tools**: Model Control Plane for AI integration
- **Dependency Injection**: FastAPI's built-in DI system
- **Middleware**: CORS, rate limiting, monitoring

### Frontend Architecture
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Context API**: State management
- **Axios**: HTTP client for API communication

### Data Flow
1. User interacts with the frontend
2. Frontend makes API calls to backend
3. Backend validates and processes requests
4. Backend interacts with database
5. Response is sent back to frontend
6. Frontend updates UI based on response

## Setup and Installation

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- PostgreSQL 12+ (or Docker for containerized setup)
- Docker and Docker Compose (recommended)

### Local Development Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the backend server
python start_server.py
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

### Docker Setup
```bash
# Clone the repository
git clone <repository-url>
cd todo_web_app

# Build and start all services
docker-compose up --build

# Access the application at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Development Workflow

### Backend Development

#### Creating New API Endpoints
1. Create the endpoint in the appropriate API module (e.g., `src/api/tasks.py`)
2. Define request/response models in `src/models/`
3. Implement business logic in `src/services/`
4. Add validation and error handling
5. Include rate limiting if needed
6. Add to the main application in `src/main.py`

Example:
```python
from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db.session import get_session
from ..models.task import TaskRead
from ..services.task_service import TaskService

router = APIRouter()

@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(task_id: int, session: Session = Depends(get_session)):
    task_service = TaskService(session)
    return task_service.get_task_by_id(task_id)
```

#### Creating New Models
1. Define the model in `src/models/`
2. Add proper type hints and validation
3. Include relationships if needed
4. Create corresponding database migration
5. Test the model with the database

#### Database Migrations
```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade migrations
alembic downgrade -1
```

### Frontend Development

#### Adding New Pages
1. Create a new file in the `app/` directory
2. Use the App Router structure
3. Implement proper error boundaries
4. Add loading states
5. Include proper TypeScript types

Example:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';

export default function NewPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch data
    }
  }, [isAuthenticated]);

  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

#### Creating New Components
1. Create component in `components/` directory
2. Use TypeScript interfaces for props
3. Implement proper accessibility
4. Add proper error handling
5. Include loading states if needed

### Code Standards

#### Python Standards
- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings for all classes and functions
- Use meaningful variable names
- Keep functions focused and small
- Follow dependency injection patterns

#### TypeScript Standards
- Use TypeScript for all new code
- Follow Airbnb JavaScript Style Guide
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript interfaces for props
- Follow React best practices

## API Documentation

### Authentication
All endpoints (except login and registration) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Available Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login and get access tokens
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `GET /me` - Get current user info
- `PUT /profile` - Update user profile
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

#### Tasks (`/api/{user_id}/tasks`)
- `GET /` - Get all tasks for the current user
- `GET /{task_id}` - Get a specific task
- `POST /` - Create a new task
- `PUT /{task_id}` - Update an existing task
- `DELETE /{task_id}` - Delete a task
- `PATCH /{task_id}/complete` - Toggle task completion
- `POST /bulk-update` - Bulk update tasks
- `POST /bulk-delete` - Bulk delete tasks

#### Categories (`/api/{user_id}/categories`)
- `GET /` - Get all categories for the current user
- `GET /{category_id}` - Get a specific category
- `POST /` - Create a new category
- `PUT /{category_id}` - Update an existing category
- `DELETE /{category_id}` - Delete a category

#### Chat (`/api/{user_id}/chat`)
- `POST /` - Send message to AI assistant
- `GET /{conversation_id}` - Get conversation history

#### Recurring Tasks (`/api/{user_id}/recurring-tasks`)
- `GET /` - Get all recurring tasks for the current user
- `GET /{recurring_task_id}` - Get a specific recurring task
- `POST /` - Create a new recurring task
- `PUT /{recurring_task_id}` - Update an existing recurring task
- `DELETE /{recurring_task_id}` - Delete a recurring task

### Health Checks
- `GET /health` - General health check
- `GET /health/database` - Database connectivity check

## Database Schema

### Tables

#### users
- id (UUID, PK)
- email (String, unique)
- first_name (String)
- last_name (String)
- password_hash (String)
- is_active (Boolean)
- is_verified (Boolean)
- created_at (DateTime)
- updated_at (DateTime)

#### tasks
- id (UUID, PK)
- title (String)
- description (String, nullable)
- status (String: pending/in-progress/completed)
- priority (String: low/medium/high)
- due_date (DateTime, nullable)
- completed_at (DateTime, nullable)
- user_id (UUID, FK to users)
- category_id (UUID, FK to categories, nullable)
- created_at (DateTime)
- updated_at (DateTime)

#### categories
- id (UUID, PK)
- name (String)
- description (String, nullable)
- user_id (UUID, FK to users)
- created_at (DateTime)
- updated_at (DateTime)

#### conversations
- id (UUID, PK)
- title (String)
- user_id (UUID, FK to users)
- created_at (DateTime)
- updated_at (DateTime)

#### messages
- id (UUID, PK)
- role (String: user/assistant)
- content (String)
- conversation_id (UUID, FK to conversations)
- timestamp (DateTime)

#### recurring_tasks
- id (UUID, PK)
- title (String)
- description (String, nullable)
- status (String: pending/in-progress/completed)
- priority (String: low/medium/high)
- interval_days (Integer)
- next_occurrence (DateTime)
- end_date (DateTime, nullable)
- max_occurrences (Integer, nullable)
- user_id (UUID, FK to users)
- created_at (DateTime)
- updated_at (DateTime)

### Indexes
- Primary keys are indexed by default
- Foreign key columns are indexed
- Common query patterns have composite indexes
- Text search indexes where appropriate

## Testing

### Backend Testing
```bash
# Run all backend tests
cd backend
python -m pytest

# Run tests with coverage
python -m pytest --cov=src

# Run specific test file
python -m pytest tests/test_specific_module.py
```

### Frontend Testing
```bash
# Run frontend tests
cd frontend
npm test

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
- Unit tests for individual functions and classes
- Integration tests for API endpoints
- Service layer tests for business logic
- Component tests for UI components

## Deployment

### Production Deployment

#### Environment Setup
1. Set up production environment variables
2. Configure database connection
3. Set up SSL certificates
4. Configure domain and DNS

#### Docker Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production compose file
docker-compose -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose -f docker-compose.prod.yml logs -f
```

#### Manual Deployment
1. Build frontend: `npm run build`
2. Deploy backend code to server
3. Install Python dependencies
4. Run database migrations
5. Start the application

### Environment Variables

#### Backend Production Variables
```env
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET_KEY=production-secret-key
JWT_REFRESH_SECRET_KEY=production-refresh-secret-key
CORS_ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=WARNING
```

#### Frontend Production Variables
```env
NEXT_PUBLIC_BACKEND_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify database URL is correct
- Check if database server is running
- Ensure firewall allows connections
- Verify database credentials

#### Authentication Issues
- Check JWT secret keys match between services
- Verify token expiration settings
- Ensure proper CORS configuration
- Check if tokens are being stored correctly

#### Frontend Build Issues
- Verify Node.js version compatibility
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check environment variables are set correctly

#### Docker Issues
- Check Docker daemon is running
- Verify Docker Compose file syntax
- Check available disk space
- Review container logs: `docker-compose logs <service-name>`

### Debugging Tips

#### Backend Debugging
- Enable debug logging in development
- Use FastAPI's automatic docs at `/docs`
- Check application logs
- Use breakpoints in your IDE

#### Frontend Debugging
- Use browser developer tools
- Check console for errors
- Verify API calls in Network tab
- Use React Developer Tools

### Performance Optimization

#### Backend
- Implement proper database indexing
- Use connection pooling
- Cache frequently accessed data
- Optimize database queries
- Implement pagination for large datasets

#### Frontend
- Implement code splitting
- Optimize images and assets
- Use lazy loading for components
- Implement proper state management
- Minimize bundle size

## Security Considerations

### Authentication Security
- Use strong password requirements
- Implement rate limiting for login attempts
- Use secure JWT token handling
- Implement proper session management
- Regular security audits

### Input Validation
- Validate all user inputs
- Sanitize user-provided data
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without exposing sensitive information

### Data Protection
- Encrypt sensitive data in transit and at rest
- Implement proper access controls
- Regular security updates
- Monitor for suspicious activities

## Contributing

### Code Review Process
1. Create a feature branch from develop
2. Make your changes following coding standards
3. Write tests for new functionality
4. Submit a pull request to develop branch
5. Address review comments
6. Merge after approval

### Branch Strategy
- `main`: Production-ready code
- `develop`: Latest development code
- `feature/*`: Feature branches
- `hotfix/*`: Urgent fixes for production
- `release/*`: Release preparation

Thank you for contributing to the Todo Web Application! This guide should help you get started with development and provide resources for troubleshooting common issues.