from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session
import logging

from .api import auth, tasks, categories, chat, password_reset, recurring_tasks
from .config.settings import settings, get_allowed_origins_list
from .db.session import get_session
from .models.user import User
from .db.monitoring import add_monitoring_middleware
from .middleware.rate_limiter import add_rate_limiting

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.APP_NAME,
    description="""
    Todo Web Application API

    ## Features

    * **Authentication**: JWT-based authentication with refresh tokens
    * **Task Management**: Full CRUD operations for tasks
    * **Categories**: Organize tasks into categories
    * **Recurring Tasks**: Schedule recurring tasks
    * **AI Chatbot**: Natural language task management
    * **Password Reset**: Secure password reset functionality

    ## Security

    * All operations require authentication except login and registration
    * JWT tokens are used for authentication
    * Rate limiting is implemented to prevent abuse
    """,
    version="1.0.0",
    contact={
        "name": "Todo Web App Support",
        "url": "https://todoapp.example.com/support",
        "email": "support@todoapp.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Add rate limiting middleware first
add_rate_limiting(app)

# Add monitoring middleware
add_monitoring_middleware(app)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(categories.router, prefix="/api", tags=["categories"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(password_reset.router, prefix="/api", tags=["password-reset"])
app.include_router(recurring_tasks.router, prefix="/api", tags=["recurring-tasks"])

@app.get("/")
async def root():
    return {"message": "Todo Web Application API"}

@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "todo-web-app-api", "version": "1.0.0"}


@app.get("/health/database")
async def database_health_check(session: Session = Depends(get_session)):
    """Database connectivity health check."""
    try:
        # Perform a simple query to check database connectivity
        result = session.exec(select(User).limit(1)).first()
        return {
            "status": "healthy",
            "database": "reachable",
            "message": "Database connection is working"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "not reachable",
            "error": str(e)
        }