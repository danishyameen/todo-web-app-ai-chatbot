#!/usr/bin/env python3
"""Minimal startup script to test that the Neon database connection works with the application."""

import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from src.config.settings import settings

# Create a minimal app to test database connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Test database connection on startup
    print("Testing database connection...")
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()
            print(f"SUCCESS: Connected to database: {version[0][:50]}...")
        print("SUCCESS: Database connection test passed!")
    except Exception as e:
        print(f"ERROR: Database connection failed: {e}")
        raise

    yield  # Application runs here

    print("Shutting down...")

app = FastAPI(title="Todo Web Application - Minimal Test", lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Todo Web Application is running with Neon database!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/health/database")
def database_health():
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1;"))
            return {"status": "connected", "test_query": "successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("Starting Todo Web Application with Neon database...")
    print(f"Database URL: {settings.DATABASE_URL}")
    print("Visit http://127.0.0.1:8000 for the API documentation")
    print("Press Ctrl+C to stop the server")

    uvicorn.run(
        "start_minimal:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=["."]
    )