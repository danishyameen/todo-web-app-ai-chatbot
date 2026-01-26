#!/usr/bin/env python3
"""
Temporary script to fix all models for compatibility
"""

# Fix the Task model
task_content = '''from sqlmodel import SQLModel, Field, Relationship, Column, DateTime
from sqlalchemy import String
from typing import Optional
from datetime import datetime
import uuid

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User

class TaskBase:
    pass

class Task(TaskBase, SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(sa_column=Column(String, nullable=False))
    description: Optional[str] = Field(sa_column=Column(String))
    status: str = Field(sa_column=Column(String, nullable=False), default="pending")
    priority: str = Field(sa_column=Column(String, nullable=False), default="medium")  # low, medium, high
    due_date: Optional[datetime] = Field(sa_column=Column(DateTime))
    completed_at: Optional[datetime] = Field(sa_column=Column(DateTime))
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    category_id: Optional[uuid.UUID] = Field(foreign_key="categories.id", default=None)
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow))

    # Relationships
    user: "User" = Relationship(back_populates="tasks")
    category: Optional["Category"] = Relationship(back_populates="tasks")

class TaskRead(SQLModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    user_id: uuid.UUID
    category_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

class TaskCreate(SQLModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    user_id: uuid.UUID

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class TaskFilters(SQLModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
'''

with open('src/models/task.py', 'w') as f:
    f.write(task_content)

print("Task model updated successfully!")