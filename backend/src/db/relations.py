"""
Module to handle SQLModel relationships to avoid circular import issues
"""
from sqlmodel import Relationship
from typing import TYPE_CHECKING, List
import uuid

if TYPE_CHECKING:
    from .models.user import User
    from .models.task import Task
    from .models.category import Category
    from .models.conversation import Conversation
    from .models.message import Message

# Define relationship helpers to avoid circular imports
def get_user_tasks_relationship():
    """Get the tasks relationship for User model."""
    return Relationship(back_populates="user")

def get_user_categories_relationship():
    """Get the categories relationship for User model."""
    return Relationship(back_populates="user")

def get_user_conversations_relationship():
    """Get the conversations relationship for User model."""
    return Relationship(back_populates="user")

def get_task_user_relationship():
    """Get the user relationship for Task model."""
    return Relationship(back_populates="tasks")

def get_task_category_relationship():
    """Get the category relationship for Task model."""
    return Relationship(back_populates="tasks")

def get_category_user_relationship():
    """Get the user relationship for Category model."""
    return Relationship(back_populates="categories")

def get_category_tasks_relationship():
    """Get the tasks relationship for Category model."""
    return Relationship(back_populates="category")

def get_conversation_user_relationship():
    """Get the user relationship for Conversation model."""
    return Relationship(back_populates="conversations")

def get_conversation_messages_relationship():
    """Get the messages relationship for Conversation model."""
    return Relationship(back_populates="conversation")