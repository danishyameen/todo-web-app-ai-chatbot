#!/usr/bin/env python3
"""Initialize database with correct schema for the Todo AI Chatbot application."""

import os
import sys
from sqlmodel import SQLModel, create_engine

# Add the src directory to the path so we can import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.user import User
from src.models.category import Category
from src.models.task import Task
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.recurring_task import RecurringTask
from src.config.settings import settings

def create_database_tables():
    """Create all database tables using SQLModel's create_all."""
    print(f"Creating database tables...")
    print(f"Database URL: {settings.DATABASE_URL}")

    # Create engine
    engine = create_engine(settings.DATABASE_URL, echo=True)

    try:
        # Create all tables
        print("Creating tables...")
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully!")
        return True
    except Exception as e:
        print(f"ERROR: Error creating tables: {str(e)}")
        return False

def main():
    print("Initializing database for Todo AI Chatbot application...")

    # Try to create tables first
    success = create_database_tables()

    if success:
        print("\nDatabase initialization completed successfully!")
        print("You can now start the application with: python start_server.py")
    else:
        print("\nDatabase initialization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()