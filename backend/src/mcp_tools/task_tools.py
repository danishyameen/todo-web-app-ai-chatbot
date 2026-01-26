"""
MCP Task Tools for Todo AI Chatbot
Implements the core task management tools for the Model Control Plane
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from sqlmodel import Session, select
from pydantic import BaseModel

from ..models.task import Task, TaskCreate, TaskUpdate
from ..models.conversation import Conversation
from ..models.message import Message
from ..db.session import get_session


class TaskResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


class AddTaskParams(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None  # ISO format string
    priority: Optional[str] = "medium"  # low, medium, high
    user_id: str  # UUID string


class ListTasksParams(BaseModel):
    user_id: str  # UUID string
    status: Optional[str] = None  # all, pending, completed
    limit: Optional[int] = 100
    offset: Optional[int] = 0


class UpdateTaskParams(BaseModel):
    task_id: str  # UUID string
    user_id: str  # UUID string
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None  # ISO format string


class CompleteTaskParams(BaseModel):
    task_id: str  # UUID string
    user_id: str  # UUID string


class DeleteTaskParams(BaseModel):
    task_id: str  # UUID string
    user_id: str  # UUID string


def add_task(params: AddTaskParams, session: Session) -> TaskResponse:
    """
    MCP Tool: Add a new task

    Args:
        params: AddTaskParams containing task details and user_id
        session: Database session

    Returns:
        TaskResponse with success status and task data
    """
    try:
        # Convert user_id string to UUID
        user_uuid = uuid.UUID(params.user_id)

        # Create the task in the database with the user_id
        db_task = Task(
            title=params.title,
            description=params.description,
            status="pending",  # Default status
            priority=params.priority or "medium",  # Default priority
            due_date=datetime.fromisoformat(params.due_date) if params.due_date else None,
            user_id=user_uuid  # Set user_id separately
        )
        session.add(db_task)
        session.commit()
        session.refresh(db_task)

        return TaskResponse(
            success=True,
            message=f"Task '{params.title}' created successfully",
            data={
                "task_id": str(db_task.id),
                "title": db_task.title,
                "status": db_task.status,
                "priority": db_task.priority,
                "due_date": db_task.due_date.isoformat() if db_task.due_date else None
            }
        )
    except Exception as e:
        session.rollback()
        return TaskResponse(
            success=False,
            message=f"Error creating task: {str(e)}"
        )


def list_tasks(params: ListTasksParams, session: Session) -> TaskResponse:
    """
    MCP Tool: List tasks for a user

    Args:
        params: ListTasksParams containing user_id and filters
        session: Database session

    Returns:
        TaskResponse with success status and task list
    """
    try:
        # Convert user_id string to UUID
        user_uuid = uuid.UUID(params.user_id)

        # Build query
        query = select(Task).where(Task.user_id == user_uuid)

        if params.status and params.status.lower() != "all":
            query = query.where(Task.status == params.status.lower())

        query = query.offset(params.offset).limit(params.limit)

        # Execute query
        tasks = session.exec(query).all()

        task_list = []
        for task in tasks:
            task_list.append({
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "created_at": task.created_at.isoformat(),
                "completed_at": task.completed_at.isoformat() if task.completed_at else None
            })

        return TaskResponse(
            success=True,
            message=f"Found {len(task_list)} tasks",
            data={
                "tasks": task_list,
                "count": len(task_list)
            }
        )
    except Exception as e:
        return TaskResponse(
            success=False,
            message=f"Error listing tasks: {str(e)}"
        )


def update_task(params: UpdateTaskParams, session: Session) -> TaskResponse:
    """
    MCP Tool: Update a task

    Args:
        params: UpdateTaskParams containing task_id, user_id and updates
        session: Database session

    Returns:
        TaskResponse with success status and updated task data
    """
    try:
        # Convert UUID strings
        task_uuid = uuid.UUID(params.task_id)
        user_uuid = uuid.UUID(params.user_id)

        # Get the task
        db_task = session.get(Task, task_uuid)

        if not db_task:
            return TaskResponse(
                success=False,
                message="Task not found"
            )

        # Verify user owns the task
        if str(db_task.user_id) != str(user_uuid):
            return TaskResponse(
                success=False,
                message="Not authorized to update this task"
            )

        # Prepare update data
        update_data = {}
        if params.title is not None:
            update_data["title"] = params.title
        if params.description is not None:
            update_data["description"] = params.description
        if params.status is not None:
            update_data["status"] = params.status
        if params.priority is not None:
            update_data["priority"] = params.priority
        if params.due_date is not None:
            update_data["due_date"] = datetime.fromisoformat(params.due_date)

        # Update the task
        for key, value in update_data.items():
            setattr(db_task, key, value)

        db_task.updated_at = datetime.utcnow()
        session.add(db_task)
        session.commit()
        session.refresh(db_task)

        return TaskResponse(
            success=True,
            message=f"Task '{db_task.title}' updated successfully",
            data={
                "task_id": str(db_task.id),
                "title": db_task.title,
                "status": db_task.status,
                "priority": db_task.priority,
                "due_date": db_task.due_date.isoformat() if db_task.due_date else None
            }
        )
    except Exception as e:
        session.rollback()
        return TaskResponse(
            success=False,
            message=f"Error updating task: {str(e)}"
        )


def complete_task(params: CompleteTaskParams, session: Session) -> TaskResponse:
    """
    MCP Tool: Mark a task as completed

    Args:
        params: CompleteTaskParams containing task_id and user_id
        session: Database session

    Returns:
        TaskResponse with success status and updated task data
    """
    try:
        # Convert UUID strings
        task_uuid = uuid.UUID(params.task_id)
        user_uuid = uuid.UUID(params.user_id)

        # Get the task
        db_task = session.get(Task, task_uuid)

        if not db_task:
            return TaskResponse(
                success=False,
                message="Task not found"
            )

        # Verify user owns the task
        if str(db_task.user_id) != str(user_uuid):
            return TaskResponse(
                success=False,
                message="Not authorized to complete this task"
            )

        # Update task status and completion time
        db_task.status = "completed"
        db_task.completed_at = datetime.utcnow()
        db_task.updated_at = datetime.utcnow()

        session.add(db_task)
        session.commit()
        session.refresh(db_task)

        return TaskResponse(
            success=True,
            message=f"Task '{db_task.title}' marked as completed",
            data={
                "task_id": str(db_task.id),
                "title": db_task.title,
                "status": db_task.status,
                "completed_at": db_task.completed_at.isoformat() if db_task.completed_at else None
            }
        )
    except Exception as e:
        session.rollback()
        return TaskResponse(
            success=False,
            message=f"Error completing task: {str(e)}"
        )


def delete_task(params: DeleteTaskParams, session: Session) -> TaskResponse:
    """
    MCP Tool: Delete a task

    Args:
        params: DeleteTaskParams containing task_id and user_id
        session: Database session

    Returns:
        TaskResponse with success status and deletion result
    """
    try:
        # Convert UUID strings
        task_uuid = uuid.UUID(params.task_id)
        user_uuid = uuid.UUID(params.user_id)

        # Get the task
        db_task = session.get(Task, task_uuid)

        if not db_task:
            return TaskResponse(
                success=False,
                message="Task not found"
            )

        # Verify user owns the task
        if str(db_task.user_id) != str(user_uuid):
            return TaskResponse(
                success=False,
                message="Not authorized to delete this task"
            )

        # Delete the task
        session.delete(db_task)
        session.commit()

        return TaskResponse(
            success=True,
            message="Task deleted successfully",
            data={
                "task_id": str(task_uuid)
            }
        )
    except Exception as e:
        session.rollback()
        return TaskResponse(
            success=False,
            message=f"Error deleting task: {str(e)}"
        )