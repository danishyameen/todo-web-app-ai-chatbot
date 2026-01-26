from sqlmodel import SQLModel, Field

# Test with Field for all fields
class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    email: str = Field()

print("User class defined successfully with Field for all")