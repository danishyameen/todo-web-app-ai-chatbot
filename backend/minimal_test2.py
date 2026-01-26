from sqlmodel import SQLModel, Field
from sqlalchemy import String

# Test with sa_type instead
class TestUser(SQLModel):
    email: str = Field(sa_type=String, nullable=False)

print("Test with sa_type passed!")