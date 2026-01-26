import asyncio
import uuid
from sqlmodel import Session, select
from datetime import datetime, timedelta
from faker import Faker

from src.db.session import engine
from src.models.user import User
from src.models.task import Task
from src.models.category import Category
from src.utils.jwt_utils import hash_password

fake = Faker()


def seed_database():
    """Seed the database with sample data for development."""
    print("Starting database seeding...")

    with Session(engine) as session:
        # Create a sample user if none exists
        existing_user = session.exec(select(User).where(User.email == "admin@example.com")).first()

        if not existing_user:
            admin_user = User(
                email="admin@example.com",
                first_name="Admin",
                last_name="User",
                hashed_password=hash_password("password123"),
                is_active=True,
                is_verified=True
            )
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)

            user_id = admin_user.id
            print(f"Created admin user with ID: {user_id}")
        else:
            user_id = existing_user.id
            print(f"Using existing user with ID: {user_id}")

        # Create sample categories
        categories = []
        category_names = ["Work", "Personal", "Shopping", "Health", "Finance"]

        for name in category_names:
            existing_category = session.exec(
                select(Category).where(Category.name == name, Category.user_id == user_id)
            ).first()

            if not existing_category:
                category = Category(
                    name=name,
                    description=fake.text(max_nb_chars=100),
                    user_id=user_id
                )
                session.add(category)
                categories.append(category)

        session.commit()

        # Refresh categories to get their IDs
        for category in categories:
            session.refresh(category)

        print(f"Created {len(categories)} categories")

        # Create sample tasks
        tasks = []
        priorities = ["low", "medium", "high"]
        statuses = ["pending", "in-progress", "completed"]

        for i in range(20):  # Create 20 sample tasks
            task = Task(
                title=fake.sentence(nb_words=6),
                description=fake.paragraph(nb_sentences=3),
                status=fake.random_element(elements=statuses),
                priority=fake.random_element(elements=priorities),
                due_date=fake.date_between(start_date="+1d", end_date="+30d") if fake.boolean(chance_of_getting_true=70) else None,
                completed_at=fake.date_time_between(start_date="-30d", end_date="now") if fake.random_element([True, False]) and fake.random_element(statuses) == "completed" else None,
                user_id=user_id,
                category_id=fake.random_element(elements=[cat.id for cat in categories]) if categories else None
            )
            session.add(task)
            tasks.append(task)

        session.commit()

        print(f"Created {len(tasks)} sample tasks")
        print("Database seeding completed!")


if __name__ == "__main__":
    seed_database()