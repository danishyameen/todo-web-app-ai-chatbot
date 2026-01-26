from sqlmodel import SQLModel, Field, Column, DateTime, Relationship
from sqlalchemy import String
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .conversation import Conversation

class MessageBase(SQLModel):
    role: str = Field(sa_column=Column(String, nullable=False))  # 'user' or 'assistant'
    content: str = Field(sa_column=Column(String, nullable=False))
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", nullable=False)

class Message(MessageBase, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    timestamp: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")

class MessageRead(SQLModel):
    id: uuid.UUID
    role: str
    content: str
    conversation_id: uuid.UUID
    timestamp: datetime

class MessageCreate(SQLModel):
    role: str
    content: str
    conversation_id: uuid.UUID

class MessageUpdate(SQLModel):
    content: Optional[str] = None
    role: Optional[str] = None