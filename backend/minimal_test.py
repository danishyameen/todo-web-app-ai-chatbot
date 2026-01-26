from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String

# Minimal test
class TestUser(SQLModel):
    email: str = Field(sa_column=Column(String, nullable=False))

print("Minimal test passed!")