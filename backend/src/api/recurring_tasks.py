from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, select
from typing import List
import uuid

from ..db.session import get_session
from ..models.recurring_task import RecurringTask, RecurringTaskCreate, RecurringTaskUpdate, RecurringTaskRead
from ..models.user import User
from ..utils.jwt_better_auth import get_current_user_id
from ..utils.exceptions import handle_database_error
from ..services.recurring_task_service import RecurringTaskService


# Initialize rate limiter for this module
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


@router.get("/{user_id}/recurring-tasks", response_model=List[RecurringTaskRead])
@limiter.limit("30/minute")  # Limit to 30 requests per minute per IP
def get_recurring_tasks(user_id: str, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Get all recurring tasks for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's recurring tasks")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    recurring_task_service = RecurringTaskService(session)
    recurring_tasks = recurring_task_service.get_recurring_tasks_by_user(uuid.UUID(current_user_id))

    return recurring_tasks


@router.get("/{user_id}/recurring-tasks/{recurring_task_id}", response_model=RecurringTaskRead)
def get_recurring_task(user_id: str, recurring_task_id: uuid.UUID, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Get a specific recurring task by ID for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's recurring tasks")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    recurring_task_service = RecurringTaskService(session)
    recurring_task = recurring_task_service.get_recurring_task_by_id(recurring_task_id, uuid.UUID(current_user_id))

    if not recurring_task:
        raise HTTPException(status_code=404, detail="Recurring task not found")

    return recurring_task


@router.post("/{user_id}/recurring-tasks", response_model=RecurringTaskRead)
@limiter.limit("20/minute")  # Limit to 20 recurring task creations per minute per IP
def create_recurring_task(user_id: str, request: Request, recurring_task: RecurringTaskCreate, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Create a new recurring task for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create recurring tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Validate the recurring task data
    if not recurring_task.title or not recurring_task.title.strip():
        raise HTTPException(status_code=400, detail="Recurring task title is required")
    
    if len(recurring_task.title) > 200:
        raise HTTPException(status_code=400, detail="Recurring task title is too long (maximum 200 characters)")
    
    if recurring_task.description and len(recurring_task.description) > 2000:
        raise HTTPException(status_code=400, detail="Recurring task description is too long (maximum 2000 characters)")
    
    if recurring_task.status not in ["pending", "in-progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid recurring task status. Must be 'pending', 'in-progress', or 'completed'")
    
    if recurring_task.priority not in ["low", "medium", "high"]:
        raise HTTPException(status_code=400, detail="Invalid recurring task priority. Must be 'low', 'medium', or 'high'")
    
    if recurring_task.interval_days <= 0:
        raise HTTPException(status_code=400, detail="Interval days must be greater than 0")

    try:
        recurring_task_service = RecurringTaskService(session)
        db_recurring_task = recurring_task_service.create_recurring_task(recurring_task)
        return db_recurring_task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        session.rollback()
        handle_database_error(e, "recurring task creation")


@router.put("/{user_id}/recurring-tasks/{recurring_task_id}", response_model=RecurringTaskRead)
@limiter.limit("50/minute")  # Limit to 50 recurring task updates per minute per IP
def update_recurring_task(user_id: str, recurring_task_id: uuid.UUID, request: Request, recurring_task_update: RecurringTaskUpdate, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Update an existing recurring task for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update recurring tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate the update data
        if recurring_task_update.title and (not recurring_task_update.title.strip() or len(recurring_task_update.title) > 200):
            raise HTTPException(status_code=400, detail="Recurring task title must be 1-200 characters if provided")
        
        if recurring_task_update.description and len(recurring_task_update.description) > 2000:
            raise HTTPException(status_code=400, detail="Recurring task description is too long (maximum 2000 characters)")
        
        if recurring_task_update.status and recurring_task_update.status not in ["pending", "in-progress", "completed"]:
            raise HTTPException(status_code=400, detail="Invalid recurring task status. Must be 'pending', 'in-progress', or 'completed'")
        
        if recurring_task_update.priority and recurring_task_update.priority not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid recurring task priority. Must be 'low', 'medium', or 'high'")

        recurring_task_service = RecurringTaskService(session)
        db_recurring_task = recurring_task_service.update_recurring_task(recurring_task_id, recurring_task_update, uuid.UUID(current_user_id))

        if not db_recurring_task:
            raise HTTPException(status_code=404, detail="Recurring task not found or not authorized")

        return db_recurring_task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        session.rollback()
        handle_database_error(e, "recurring task update")


@router.delete("/{user_id}/recurring-tasks/{recurring_task_id}")
@limiter.limit("20/minute")  # Limit to 20 recurring task deletions per minute per IP
def delete_recurring_task(user_id: str, recurring_task_id: uuid.UUID, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Delete a recurring task for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete recurring tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        recurring_task_service = RecurringTaskService(session)
        success = recurring_task_service.delete_recurring_task(recurring_task_id, uuid.UUID(current_user_id))

        if not success:
            raise HTTPException(status_code=404, detail="Recurring task not found or not authorized")

        return {"message": "Recurring task deleted successfully"}
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        session.rollback()
        handle_database_error(e, "recurring task deletion")