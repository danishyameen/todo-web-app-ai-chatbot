from sqlmodel import SQLModel, Field

# Test with basic field
class TestUser(SQLModel):
    email: str = Field(default="test@example.com")

print("Test with basic field passed!")