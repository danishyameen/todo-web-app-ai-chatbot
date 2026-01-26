from sqlmodel import SQLModel, Field, Column, DateTime, Relationship
from sqlalchemy import String
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .user import User
    from .task import Task

class CategoryBase(SQLModel):
    name: str = Field(sa_column=Column(String, nullable=False))
    description: Optional[str] = Field(sa_column=Column(String))

class Category(CategoryBase, table=True):
    __tablename__ = "categories"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))

    # Relationships
    user: "User" = Relationship(back_populates="categories")
    tasks: List["Task"] = Relationship(back_populates="category")

class CategoryRead(SQLModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

class CategoryCreate(SQLModel):
    name: str
    description: Optional[str] = None
    user_id: uuid.UUID

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None