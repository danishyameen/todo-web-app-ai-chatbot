from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, Boolean, DateTime
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime, timezone
import uuid

if TYPE_CHECKING:
    from .task import Task
    from .category import Category
    from .conversation import Conversation
    from .recurring_task import RecurringTask

class UserBase(SQLModel):
    email: str = Field(sa_column=Column(String, nullable=False, unique=True))
    first_name: str = Field(sa_column=Column(String, nullable=False))
    last_name: str = Field(sa_column=Column(String, nullable=False))
    is_active: bool = Field(sa_column=Column(Boolean, nullable=False), default=True)
    is_verified: bool = Field(sa_column=Column(Boolean, nullable=False), default=False)

class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str = Field(sa_column=Column(String, nullable=False))
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)))
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)))

    # Relationships using string references to avoid circular import issues
    tasks: List["Task"] = Relationship(back_populates="user")
    categories: List["Category"] = Relationship(back_populates="user")
    conversations: List["Conversation"] = Relationship(back_populates="user")
    recurring_tasks: List["RecurringTask"] = Relationship(back_populates="user")

class UserRead(SQLModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

class UserCreate(SQLModel):
    email: str
    first_name: str
    last_name: str
    password: str
    is_active: bool = True

class UserUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

class UserLogin(SQLModel):
    email: str
    password: str