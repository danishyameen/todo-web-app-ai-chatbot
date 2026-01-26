# Todo AI Chatbot - Backend

## Overview

The backend is built with FastAPI and provides a RESTful API for the Todo AI Chatbot. It handles user authentication, task management, category organization, and AI-powered natural language processing for task management.

## Technologies Used

- **FastAPI**: Modern, fast web framework for building APIs with Python 3.7+
- **SQLModel**: Combines SQLAlchemy and Pydantic for database modeling
- **PostgreSQL**: Robust, open-source relational database
- **Alembic**: Database migration tool
- **PyJWT**: JSON Web Token implementation for authentication
- **PassLib**: Password hashing and verification
- **AI Agent Service**: Natural language processing for task management
- **MCP Tools**: Model Control Plane tools for task operations
- **Conversation Persistence**: Database models for chat history

## Installation

1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables (see `.env.example`)
4. Set up the database:
   ```bash
   # Create the database tables
   alembic upgrade head
   ```
5. Seed the database with sample data (optional):
   ```bash
   python seed_db.py
   ```

## Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
DB_ECHO=false
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET_KEY=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile

### Tasks (`/api/tasks`)

- `GET /api/tasks` - Get all tasks for the current user (with optional filters)
- `GET /api/tasks/{task_id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{task_id}` - Update an existing task
- `DELETE /api/tasks/{task_id}` - Delete a task
- `POST /api/tasks/bulk-update` - Bulk update tasks
- `POST /api/tasks/bulk-delete` - Bulk delete tasks

### Categories (`/api/categories`)

- `GET /api/categories` - Get all categories for the current user
- `GET /api/categories/{category_id}` - Get a specific category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/{category_id}` - Update an existing category
- `DELETE /api/categories/{category_id}` - Delete a category

### Chat (`/api/chat`)

- `POST /api/{user_id}/chat` - Send a message to the AI assistant
- `GET /api/{user_id}/chat/{conversation_id}` - Get conversation history

## Running the Application

```bash
python start_server.py
```

Or using uvicorn directly:

```bash
uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

Interactive API documentation is available at:
- `http://localhost:8000/docs` - Swagger UI
- `http://localhost:8000/redoc` - ReDoc

## Database Migrations

To create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

To apply migrations:
```bash
alembic upgrade head
```

## Seeding the Database

To populate the database with sample data:
```bash
python seed_db.py
```

## Testing

Run tests with pytest:
```bash
pytest
```

## Security Features

- JWT-based authentication with access and refresh tokens
- Passwords are hashed using BCrypt
- User isolation - users can only access their own data
- Input validation and sanitization
- Rate limiting (to be implemented)

## Database Schema

See [Database Schema Documentation](docs/database_schema.md) for detailed information about the database structure.

## Error Handling

The API returns structured error responses:

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

Common status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error