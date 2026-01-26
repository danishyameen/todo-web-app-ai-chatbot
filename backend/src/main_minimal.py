from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import only the basic routes without models initially
from .api import auth, tasks, categories  # Exclude chat for now
from .config.settings import settings, get_allowed_origins_list
from .db.monitoring import add_monitoring_middleware

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.APP_NAME,
    description="Todo Web Application API",
    version="1.0.0"
)

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

@app.get("/")
async def root():
    return {"message": "Todo Web Application API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}