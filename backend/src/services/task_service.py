from sqlmodel import Session, select, and_, func
from typing import List, Optional
from datetime import datetime
import uuid

from ..models.task import Task, TaskCreate, TaskUpdate, TaskFilters
from ..models.user import User


class TaskService:
    """Service class for handling business logic related to tasks."""

    def __init__(self, session: Session):
        """
        Initialize the TaskService with a database session.

        Args:
            session: SQLModel database session for performing operations
        """
        self.session = session

    def get_tasks_by_user(
        self,
        user_id: uuid.UUID,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        limit: Optional[int] = 100,
        offset: Optional[int] = 0
    ) -> List[Task]:
        """
        Get tasks for a user with optional filters and pagination.

        Args:
            user_id: UUID of the user whose tasks to retrieve
            status: Optional status filter (pending, in-progress, completed)
            priority: Optional priority filter (low, medium, high)
            limit: Maximum number of tasks to return (default 100, max 1000)
            offset: Number of tasks to skip for pagination (default 0)

        Returns:
            List of Task objects matching the criteria
        """
        query = select(Task).where(Task.user_id == user_id)

        if status:
            query = query.where(Task.status == status)

        if priority:
            query = query.where(Task.priority == priority)

        # Add ordering
        query = query.order_by(Task.created_at.desc())

        # Apply pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)

        tasks = self.session.exec(query).all()
        return tasks

    def get_task_count_by_user(
        self,
        user_id: uuid.UUID,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> int:
        """Get the count of tasks for a user with optional filters."""
        query = select(func.count(Task.id)).where(Task.user_id == user_id)

        if status:
            query = query.where(Task.status == status)

        if priority:
            query = query.where(Task.priority == priority)

        count = self.session.exec(query).one()
        return count

    def get_tasks_with_filters(
        self,
        user_id: uuid.UUID,
        filters: TaskFilters,
        limit: Optional[int] = 100,
        offset: Optional[int] = 0
    ) -> List[Task]:
        """Get tasks with complex filters."""
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if filters.status:
            query = query.where(Task.status == filters.status)

        if filters.priority:
            query = query.where(Task.priority == filters.priority)

        # Add ordering
        query = query.order_by(Task.created_at.desc())

        # Apply pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)

        tasks = self.session.exec(query).all()
        return tasks

    def create_task(self, task_create: TaskCreate, user_id: uuid.UUID) -> Task:
        """
        Create a new task for a user.

        Args:
            task_create: TaskCreate object containing task details
            user_id: UUID of the user creating the task

        Returns:
            The created Task object

        Raises:
            Exception: If there's an error during task creation
        """
        try:
            task_data = task_create.dict()
            task_data['user_id'] = user_id

            db_task = Task(**task_data)
            self.session.add(db_task)
            self.session.commit()
            self.session.refresh(db_task)

            return db_task
        except Exception as e:
            self.session.rollback()
            raise e

    def update_task(self, task_id: uuid.UUID, task_update: TaskUpdate, user_id: uuid.UUID) -> Optional[Task]:
        """
        Update a task if it belongs to the user.

        Args:
            task_id: UUID of the task to update
            task_update: TaskUpdate object containing fields to update
            user_id: UUID of the user attempting to update the task

        Returns:
            The updated Task object if successful, None if task doesn't exist or doesn't belong to user

        Raises:
            Exception: If there's an error during task update
        """
        try:
            db_task = self.session.get(Task, task_id)

            if not db_task or db_task.user_id != user_id:
                return None

            # Update the task with provided fields
            update_data = task_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_task, field, value)

            self.session.add(db_task)
            self.session.commit()
            self.session.refresh(db_task)

            return db_task
        except Exception as e:
            self.session.rollback()
            raise e

    def delete_task(self, task_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Delete a task if it belongs to the user.

        Args:
            task_id: UUID of the task to delete
            user_id: UUID of the user attempting to delete the task

        Returns:
            True if task was successfully deleted, False if task doesn't exist or doesn't belong to user

        Raises:
            Exception: If there's an error during task deletion
        """
        try:
            db_task = self.session.get(Task, task_id)

            if not db_task or db_task.user_id != user_id:
                return False

            self.session.delete(db_task)
            self.session.commit()

            return True
        except Exception as e:
            self.session.rollback()
            raise e

    def get_tasks_by_date_range(
        self,
        user_id: uuid.UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: Optional[int] = 100
    ) -> List[Task]:
        """Get tasks within a date range."""
        query = select(Task).where(Task.user_id == user_id)

        if start_date:
            query = query.where(Task.created_at >= start_date)

        if end_date:
            query = query.where(Task.created_at <= end_date)

        query = query.order_by(Task.created_at.desc())

        if limit:
            query = query.limit(limit)

        tasks = self.session.exec(query).all()
        return tasks

    def get_overdue_tasks(self, user_id: uuid.UUID) -> List[Task]:
        """Get overdue tasks for a user."""
        query = select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.due_date < datetime.utcnow(),
                Task.status != "completed"
            )
        ).order_by(Task.due_date.asc())

        tasks = self.session.exec(query).all()
        return tasks

    def bulk_update_tasks(self, task_ids: List[uuid.UUID], update_data: TaskUpdate, user_id: uuid.UUID) -> int:
        """Bulk update tasks for a user."""
        try:
            # Get all tasks that belong to the user
            query = select(Task).where(
                Task.id.in_(task_ids),
                Task.user_id == user_id
            )
            tasks = self.session.exec(query).all()

            # Check if all requested tasks were found and belong to the user
            found_task_ids = {task.id for task in tasks}
            requested_task_ids = set(task_ids)

            if len(found_task_ids) != len(requested_task_ids):
                missing_task_ids = requested_task_ids - found_task_ids
                raise ValueError(f"Some tasks not found or not owned by user: {list(missing_task_ids)}")

            # Update all tasks
            update_dict = update_data.dict(exclude_unset=True)
            for task in tasks:
                for field, value in update_dict.items():
                    setattr(task, field, value)

            self.session.add_all(tasks)
            self.session.commit()

            return len(tasks)
        except Exception as e:
            self.session.rollback()
            raise e

    def bulk_delete_tasks(self, task_ids: List[uuid.UUID], user_id: uuid.UUID) -> int:
        """Bulk delete tasks for a user."""
        try:
            # Get all tasks that belong to the user
            query = select(Task).where(
                Task.id.in_(task_ids),
                Task.user_id == user_id
            )
            tasks = self.session.exec(query).all()

            # Check if all requested tasks were found and belong to the user
            found_task_ids = {task.id for task in tasks}
            requested_task_ids = set(task_ids)

            if len(found_task_ids) != len(requested_task_ids):
                missing_task_ids = requested_task_ids - found_task_ids
                raise ValueError(f"Some tasks not found or not owned by user: {list(missing_task_ids)}")

            # Delete all tasks
            for task in tasks:
                self.session.delete(task)

            self.session.commit()

            return len(tasks)
        except Exception as e:
            self.session.rollback()
            raise e