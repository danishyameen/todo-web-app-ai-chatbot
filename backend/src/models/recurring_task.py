from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .task import Task
    from .user import User

class RecurringTaskBase(SQLModel):
    title: str = Field(sa_column=Column(String, nullable=False))
    description: Optional[str] = Field(sa_column=Column(String))
    status: str = Field(sa_column=Column(String, nullable=False))
    priority: str = Field(sa_column=Column(String, nullable=False))
    interval_days: int = Field(sa_column=Column(Integer, nullable=False))  # How often to repeat
    next_occurrence: datetime = Field(sa_column=Column(DateTime, nullable=False))
    end_date: Optional[datetime] = Field(sa_column=Column(DateTime))
    max_occurrences: Optional[int] = Field(sa_column=Column(Integer))
    user_id: uuid.UUID = Field(sa_column=Column(ForeignKey("users.id"), nullable=False))

class RecurringTask(RecurringTaskBase, table=True):
    __tablename__ = "recurring_tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))

    # Relationships
    user: "User" = Relationship(back_populates="recurring_tasks")
    tasks: List["Task"] = Relationship(back_populates="recurring_task")

class RecurringTaskRead(SQLModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    priority: str
    interval_days: int
    next_occurrence: datetime
    end_date: Optional[datetime]
    max_occurrences: Optional[int]
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

class RecurringTaskCreate(SQLModel):
    title: str
    description: Optional[str]
    status: str
    priority: str
    interval_days: int
    next_occurrence: datetime
    end_date: Optional[datetime]
    max_occurrences: Optional[int]
    user_id: uuid.UUID

class RecurringTaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    interval_days: Optional[int] = None
    next_occurrence: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_occurrences: Optional[int] = None