import asyncio
from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid

# Use a simple local SQLite database for testing
DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, echo=True)

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(sa_column=Column(String, nullable=False, unique=True))
    first_name: str = Field(sa_column=Column(String, nullable=False))
    last_name: str = Field(sa_column=Column(String, nullable=False))
    hashed_password: str = Field(sa_column=Column(String, nullable=False))
    created_at: datetime = Field(sa_column=Column(DateTime, nullable=False, default=datetime.utcnow))

def test_db_connection():
    print("Testing database connection...")
    
    try:
        # Create tables
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully")
        
        # Test inserting a user
        from backend.src.utils.jwt_utils import hash_password
        
        with Session(engine) as session:
            # Check if user already exists
            existing_user = session.exec(select(User).where(User.email == "test@example.com")).first()
            if existing_user:
                print("User already exists, skipping creation")
                return True
                
            hashed_pw = hash_password("TestPass123!")
            user = User(
                email="test@example.com",
                first_name="Test",
                last_name="User", 
                hashed_password=hashed_pw
            )
            
            session.add(user)
            session.commit()
            session.refresh(user)
            
            print(f"User created successfully with ID: {user.id}")
            return True
            
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_db_connection()