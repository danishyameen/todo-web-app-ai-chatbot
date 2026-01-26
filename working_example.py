from sqlmodel import SQLModel, Field
from typing import Optional

# Try the most basic example from documentation
class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: Optional[int] = None

print("Hero class defined successfully")