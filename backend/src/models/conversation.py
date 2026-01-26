from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, DateTime, ForeignKey
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .user import User
    from .message import Message

class ConversationBase(SQLModel):
    title: str = Field(sa_column=Column(String, nullable=False))
    user_id: uuid.UUID = Field(sa_column=Column(ForeignKey("users.id"), nullable=False))

class Conversation(ConversationBase, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))

    # Relationships
    user: "User" = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")

class ConversationRead(SQLModel):
    id: uuid.UUID
    title: str
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

class ConversationCreate(SQLModel):
    title: str
    user_id: uuid.UUID

class ConversationUpdate(SQLModel):
    title: Optional[str] = None