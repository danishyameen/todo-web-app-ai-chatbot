from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, Boolean
from typing import Optional
import uuid

class TestUserBase(SQLModel):
    email: str = Field(sa_column=Column(String, nullable=False, unique=True))
    first_name: str = Field(sa_column=Column(String, nullable=False))
    last_name: str = Field(sa_column=Column(String, nullable=False))
    is_active: bool = Field(sa_column=Column(Boolean, nullable=False), default=True)
    is_verified: bool = Field(sa_column=Column(Boolean, nullable=False), default=False)

class TestUser(TestUserBase, table=True):
    __tablename__ = "test_users"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

if __name__ == "__main__":
    print("Test model loaded successfully!")
    user = TestUser(
        email="test@example.com",
        first_name="Test",
        last_name="User"
    )
    print(f"Created user: {user.email}")