from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, DateTime, ForeignKey
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime, timezone
import uuid

if TYPE_CHECKING:
    from .user import User
    from .category import Category
    from .recurring_task import RecurringTask

class TaskBase(SQLModel):
    """Base model for task with common fields."""

    title: str = Field(sa_column=Column(String, nullable=False), description="Task title (required)")
    description: Optional[str] = Field(sa_column=Column(String), description="Optional task description")
    status: str = Field(sa_column=Column(String, nullable=False), description="Task status (pending, in-progress, completed)")
    priority: str = Field(sa_column=Column(String, nullable=False), description="Task priority (low, medium, high)")
    due_date: Optional[datetime] = Field(sa_column=Column(DateTime), description="Optional due date for the task")
    completed_at: Optional[datetime] = Field(sa_column=Column(DateTime), description="Timestamp when task was completed")
    user_id: uuid.UUID = Field(nullable=False, description="ID of the user who owns this task")
    category_id: Optional[uuid.UUID] = Field(default=None, description="Optional category ID for the task")


class Task(TaskBase, table=True):
    """Task model representing a user's task with database mapping."""

    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, description="Unique identifier for the task")
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)), description="Timestamp when the task was created")
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)), description="Timestamp when the task was last updated")

    # Foreign key fields with proper SQLAlchemy column definitions
    user_id: uuid.UUID = Field(sa_column=Column(ForeignKey("users.id"), nullable=False))
    category_id: Optional[uuid.UUID] = Field(sa_column=Column(ForeignKey("categories.id"), nullable=True))
    recurring_task_id: Optional[uuid.UUID] = Field(sa_column=Column(ForeignKey("recurring_tasks.id"), nullable=True))

    # Relationships
    user: "User" = Relationship(back_populates="tasks")
    category: "Category" = Relationship(back_populates="tasks")
    recurring_task: "RecurringTask" = Relationship(back_populates="tasks")

class TaskRead(SQLModel):
    """Response model for task with all fields that are safe to return to clients."""

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
    """Request model for creating a new task."""

    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[datetime] = None

class TaskUpdate(SQLModel):
    """Request model for updating an existing task."""

    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class TaskFilters(SQLModel):
    """Filter model for querying tasks with optional filters."""

    status: Optional[str]
    priority: Optional[str]
    user_id: Optional[uuid.UUID]
