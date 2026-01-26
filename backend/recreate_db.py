#!/usr/bin/env python3
"""Script to completely recreate the database with correct schema."""

import os
import sys
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text

# Add the src directory to the path so we can import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.user import User
from src.models.category import Category
from src.models.task import Task
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.recurring_task import RecurringTask
from src.config.settings import settings

def recreate_database():
    """Drop and recreate all tables."""
    print(f"Recreating database with correct schema...")
    print(f"Database URL: {settings.DATABASE_URL}")

    # Create engine
    engine = create_engine(settings.DATABASE_URL, echo=True)

    try:
        # Drop all tables first
        print("Dropping all existing tables...")
        SQLModel.metadata.drop_all(engine)
        print("All tables dropped.")

        # Create all tables
        print("Creating all tables with new schema...")
        SQLModel.metadata.create_all(engine)
        print("All tables created successfully!")

        # Verify the tasks table structure
        print("Verifying tasks table structure...")
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(tasks);"))
            columns = result.fetchall()
            print("Tasks table columns:")
            for col in columns:
                print(f"  - {col[1]} ({col[2]}, {col[5]})")

        return True
    except Exception as e:
        print(f"ERROR: Error recreating database: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("Completely recreating database for Todo AI Chatbot application...")

    success = recreate_database()

    if success:
        print("\nDatabase recreation completed successfully!")
        print("You can now start the application with: python start_server.py")
    else:
        print("\nDatabase recreation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()