from sqlmodel import SQLModel, Field
from typing import Optional

# Proper syntax for newer SQLModel
class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field()
    secret_name: str = Field()
    age: Optional[int] = Field(default=None)

print("Hero class defined successfully with correct syntax")