from sqlmodel import SQLModel, Field

# Simple test to see what works with the current SQLModel version
class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    email: str

print("Simple User class defined successfully")