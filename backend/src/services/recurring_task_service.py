from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from ..models.recurring_task import RecurringTask, RecurringTaskCreate, RecurringTaskUpdate
from ..models.task import Task, TaskCreate


class RecurringTaskService:
    def __init__(self, session: Session):
        self.session = session

    def create_recurring_task(self, recurring_task_create: RecurringTaskCreate) -> RecurringTask:
        """Create a new recurring task."""
        try:
            db_recurring_task = RecurringTask(**recurring_task_create.dict())
            self.session.add(db_recurring_task)
            self.session.commit()
            self.session.refresh(db_recurring_task)

            return db_recurring_task
        except Exception as e:
            self.session.rollback()
            raise e

    def get_recurring_tasks_by_user(self, user_id: uuid.UUID) -> List[RecurringTask]:
        """Get all recurring tasks for a user."""
        recurring_tasks = self.session.exec(
            select(RecurringTask).where(RecurringTask.user_id == user_id)
        ).all()
        return recurring_tasks

    def get_recurring_task_by_id(self, recurring_task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[RecurringTask]:
        """Get a specific recurring task by ID for a user."""
        recurring_task = self.session.get(RecurringTask, recurring_task_id)
        
        if recurring_task and recurring_task.user_id == user_id:
            return recurring_task
        return None

    def update_recurring_task(self, recurring_task_id: uuid.UUID, recurring_task_update: RecurringTaskUpdate, user_id: uuid.UUID) -> Optional[RecurringTask]:
        """Update a recurring task if it belongs to the user."""
        db_recurring_task = self.session.get(RecurringTask, recurring_task_id)

        if not db_recurring_task or db_recurring_task.user_id != user_id:
            return None

        # Update the recurring task with provided fields
        update_data = recurring_task_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_recurring_task, field, value)

        self.session.add(db_recurring_task)
        self.session.commit()
        self.session.refresh(db_recurring_task)

        return db_recurring_task

    def delete_recurring_task(self, recurring_task_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Delete a recurring task if it belongs to the user."""
        db_recurring_task = self.session.get(RecurringTask, recurring_task_id)

        if not db_recurring_task or db_recurring_task.user_id != user_id:
            return False

        self.session.delete(db_recurring_task)
        self.session.commit()

        return True

    def generate_new_task_from_recurring(self, recurring_task: RecurringTask) -> Optional[Task]:
        """Generate a new task instance from a recurring task definition."""
        try:
            # Create a new task based on the recurring task definition
            new_task_data = {
                'title': recurring_task.title,
                'description': recurring_task.description,
                'status': recurring_task.status,
                'priority': recurring_task.priority,
                'user_id': recurring_task.user_id,
            }
            
            new_task = Task(**new_task_data)
            self.session.add(new_task)
            self.session.commit()
            self.session.refresh(new_task)

            # Update the next occurrence date
            recurring_task.next_occurrence = recurring_task.next_occurrence + timedelta(days=recurring_task.interval_days)
            self.session.add(recurring_task)
            self.session.commit()

            return new_task
        except Exception as e:
            self.session.rollback()
            raise e

    def process_scheduled_recurring_tasks(self) -> List[Task]:
        """Process all scheduled recurring tasks that are due."""
        current_time = datetime.utcnow()
        
        # Get all recurring tasks that are due
        due_recurring_tasks = self.session.exec(
            select(RecurringTask).where(
                RecurringTask.next_occurrence <= current_time
            )
        ).all()

        created_tasks = []
        for recurring_task in due_recurring_tasks:
            # Check if the recurring task has reached its end condition
            should_continue = True
            
            if recurring_task.end_date and current_time > recurring_task.end_date:
                should_continue = False
            elif recurring_task.max_occurrences:
                # Count how many tasks have been created from this recurring task
                # This would require a relationship to be set up between recurring tasks and tasks
                # For simplicity in this implementation, we'll skip this check
                pass

            if should_continue:
                try:
                    new_task = self.generate_new_task_from_recurring(recurring_task)
                    if new_task:
                        created_tasks.append(new_task)
                except Exception as e:
                    # Log the error but continue processing other recurring tasks
                    print(f"Error generating task from recurring task {recurring_task.id}: {str(e)}")
                    continue

        return created_tasks