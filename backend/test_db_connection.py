#!/usr/bin/env python3
"""Test script to verify Neon database connection."""

import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.config.settings import settings
from sqlmodel import create_engine
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import urllib.parse

print("Testing Neon database connection...")
print(f"Database URL: {settings.DATABASE_URL}")

try:
    # Create engine with Neon-specific settings
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DB_ECHO,
        pool_pre_ping=True,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        connect_args={
            "connect_timeout": 10,
            "sslmode": "require"
        }
    )

    # Test the connection
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()
        print(f"SUCCESS: Successfully connected to Neon database!")
        print(f"PostgreSQL version: {version[0][:100]}...")

except SQLAlchemyError as e:
    print(f"ERROR: Database connection failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: Unexpected error: {e}")
    sys.exit(1)

print("SUCCESS: Neon database connection test successful!")