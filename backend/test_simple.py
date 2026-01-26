from sqlmodel import SQLModel, Field

# Simple test
class SimpleUser(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    email: str = "test@example.com"

print("SimpleUser class defined successfully")