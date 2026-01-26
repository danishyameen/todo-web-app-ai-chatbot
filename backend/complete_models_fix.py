#!/usr/bin/env python3
"""
Complete script to fix all models for compatibility with older SQLModel version
"""

# Fix the User model
user_content = '''from sqlmodel import SQLModel, Field, Column, DateTime, Relationship
from sqlalchemy import String, Boolean
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .task import Task
    from .category import Category
    from .conversation import Conversation

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
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))
    updated_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user")
    categories: List["Category"] = Relationship(back_populates="user")
    conversations: List["Conversation"] = Relationship(back_populates="user")

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
'''

# Fix the Category model
category_content = '''from sqlmodel import SQLModel, Field, Column, DateTime, Relationship
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
'''

# Fix the Conversation model
conversation_content = '''from sqlmodel import SQLModel, Field, Column, DateTime, Relationship
from sqlalchemy import String
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .user import User
    from .message import Message

class ConversationBase(SQLModel):
    title: str = Field(sa_column=Column(String, nullable=False))
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)

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

# For Message, we'll create a separate model
message_content = '''from sqlmodel import SQLModel, Field, Column, DateTime, Relationship
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
'''

# Write all files
with open('src/models/user.py', 'w') as f:
    f.write(user_content)

with open('src/models/category.py', 'w') as f:
    f.write(category_content)

with open('src/models/conversation.py', 'w') as f:
    f.write(conversation_content)

with open('src/models/message.py', 'w') as f:
    f.write(message_content)

print("All models updated successfully!")
print("- User model updated")
print("- Category model updated")
print("- Conversation model updated")
print("- Message model updated")
print("- Task model was already updated")