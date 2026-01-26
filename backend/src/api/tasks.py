from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import SQLModel, Session, select
from typing import List, Optional
import uuid

from ..db.session import get_session
from ..models.task import Task, TaskCreate, TaskUpdate, TaskRead, TaskFilters
from ..models.user import User
from ..utils.jwt_better_auth import get_current_user_id
from ..utils.exceptions import handle_database_error
from ..services.task_service import TaskService


# Initialize rate limiter for this module
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


@router.get("/{user_id}/tasks",
            response_model=List[TaskRead],
            summary="Get all tasks for the specified user",
            description="Retrieve all tasks belonging to the specified user, with optional filtering by status and priority.")
@limiter.limit("30/minute")  # Limit to 30 requests per minute per IP
def get_tasks(
    user_id: str,
    request: Request,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    limit: int = Query(100, ge=1, le=1000, description="Number of tasks to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """Get all tasks for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's tasks")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate filters
        if status_filter and status_filter not in ["pending", "in-progress", "completed", "all"]:
            raise HTTPException(status_code=400, detail="Invalid status filter. Must be 'pending', 'in-progress', 'completed', or 'all'")

        if priority_filter and priority_filter not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid priority filter. Must be 'low', 'medium', or 'high'")

        # Convert string user_id to UUID for database operations
        user_uuid = uuid.UUID(current_user_id)
        task_service = TaskService(session)

        tasks = task_service.get_tasks_by_user(
            user_id=user_uuid,
            status=status_filter,
            priority=priority_filter,
            limit=limit,
            offset=offset
        )
        return tasks
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "getting tasks")


@router.get("/{user_id}/tasks/{task_id}",
            response_model=TaskRead,
            summary="Get a specific task by ID for the specified user",
            description="Retrieve a specific task by its ID, if it belongs to the specified user.")
def get_task(user_id: str, task_id: uuid.UUID, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Get a specific task by ID for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's tasks")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check if the task belongs to the current user
    if str(task.user_id) != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")

    return task


@router.post("/{user_id}/tasks",
             response_model=TaskRead,
             summary="Create a new task for the specified user",
             description="Create a new task for the specified user.")
@limiter.limit("20/minute")  # Limit to 20 task creations per minute per IP
def create_task(user_id: str, request: Request, task: TaskCreate, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Create a new task for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate the task data
        if not task.title or not task.title.strip():
            raise HTTPException(status_code=400, detail="Task title is required")

        if len(task.title) > 200:
            raise HTTPException(status_code=400, detail="Task title is too long (maximum 200 characters)")

        if task.description and len(task.description) > 2000:
            raise HTTPException(status_code=400, detail="Task description is too long (maximum 2000 characters)")

        if task.status not in ["pending", "in-progress", "completed"]:
            raise HTTPException(status_code=400, detail="Invalid task status. Must be 'pending', 'in-progress', or 'completed'")

        if task.priority not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid task priority. Must be 'low', 'medium', or 'high'")

        # Convert string user_id to UUID for database operations
        user_uuid = uuid.UUID(current_user_id)
        task_service = TaskService(session)
        db_task = task_service.create_task(task, user_uuid)
        return db_task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "task creation")


@router.put("/{user_id}/tasks/{task_id}",
            response_model=TaskRead,
            summary="Update an existing task for the specified user",
            description="Update an existing task if it belongs to the specified user.")
@limiter.limit("50/minute")  # Limit to 50 task updates per minute per IP
def update_task(user_id: str, task_id: uuid.UUID, request: Request, task_update: TaskUpdate, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Update an existing task for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate the update data
        if task_update.title and (not task_update.title.strip() or len(task_update.title) > 200):
            raise HTTPException(status_code=400, detail="Task title must be 1-200 characters if provided")

        if task_update.description and len(task_update.description) > 2000:
            raise HTTPException(status_code=400, detail="Task description is too long (maximum 2000 characters)")

        if task_update.status and task_update.status not in ["pending", "in-progress", "completed"]:
            raise HTTPException(status_code=400, detail="Invalid task status. Must be 'pending', 'in-progress', or 'completed'")

        if task_update.priority and task_update.priority not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid task priority. Must be 'low', 'medium', or 'high'")

        # Convert string user_id to UUID for database operations
        user_uuid = uuid.UUID(current_user_id)
        task_service = TaskService(session)
        db_task = task_service.update_task(task_id, task_update, user_uuid)

        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found or not authorized")

        return db_task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "task update")


@router.delete("/{user_id}/tasks/{task_id}",
               summary="Delete a task for the specified user",
               description="Delete a task by its ID if it belongs to the specified user.")
@limiter.limit("20/minute")  # Limit to 20 task deletions per minute per IP
def delete_task(user_id: str, task_id: uuid.UUID, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Delete a task for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Convert string user_id to UUID for database operations
        user_uuid = uuid.UUID(current_user_id)
        task_service = TaskService(session)
        success = task_service.delete_task(task_id, user_uuid)

        if not success:
            raise HTTPException(status_code=404, detail="Task not found or not authorized")

        return {"message": "Task deleted successfully"}
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "task deletion")


# Add the PATCH endpoint for toggling task completion
@router.patch("/{user_id}/tasks/{task_id}/complete",
              response_model=TaskRead,
              summary="Toggle task completion status for the specified user",
              description="Toggle the completion status of a task for the specified user.")
def toggle_task_completion(user_id: str, task_id: uuid.UUID, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Toggle the completion status of a task for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        task_service = TaskService(session)

        # Get the current task
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Check if the task belongs to the current user
        if str(task.user_id) != current_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this task")

        # Toggle the completion status
        updated_status = "completed" if task.status != "completed" else "pending"
        task_update = TaskUpdate(status=updated_status)

        if updated_status == "completed":
            from datetime import datetime
            task_update.completed_at = datetime.now()
        else:
            task_update.completed_at = None

        # Convert string user_id to UUID for database operations
        user_uuid = uuid.UUID(current_user_id)
        # Update the task
        db_task = task_service.update_task(task_id, task_update, user_uuid)

        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found or not authorized")

        return db_task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "task completion toggle")


class BulkTaskUpdateRequest(SQLModel):
    task_ids: List[uuid.UUID]
    update_data: TaskUpdate


class BulkTaskDeleteRequest(SQLModel):
    task_ids: List[uuid.UUID]


@router.post("/{user_id}/tasks/bulk-update",
             summary="Bulk update tasks for the specified user",
             description="Update multiple tasks at once for the specified user.")
def bulk_update_tasks(
    user_id: str,
    request: Request,
    bulk_request: BulkTaskUpdateRequest,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """Bulk update multiple tasks for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate the bulk request
        if not bulk_request.task_ids:
            raise HTTPException(status_code=400, detail="Task IDs list cannot be empty")

        if len(bulk_request.task_ids) > 100:  # Limit bulk operations
            raise HTTPException(status_code=400, detail="Cannot update more than 100 tasks at once")

        # Validate update data
        update_data = bulk_request.update_data
        if update_data.title and (not update_data.title.strip() or len(update_data.title) > 200):
            raise HTTPException(status_code=400, detail="Task title must be 1-200 characters if provided")

        if update_data.description and len(update_data.description) > 2000:
            raise HTTPException(status_code=400, detail="Task description is too long (maximum 2000 characters)")

        if update_data.status and update_data.status not in ["pending", "in-progress", "completed"]:
            raise HTTPException(status_code=400, detail="Invalid task status. Must be 'pending', 'in-progress', or 'completed'")

        if update_data.priority and update_data.priority not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid task priority. Must be 'low', 'medium', or 'high'")

        # Convert string user_id to UUID for database operations
        user_uuid = uuid.UUID(current_user_id)
        task_service = TaskService(session)

        updated_count = task_service.bulk_update_tasks(
            task_ids=bulk_request.task_ids,
            update_data=bulk_request.update_data,
            user_id=user_uuid
        )

        return {"message": f"Successfully updated {updated_count} tasks", "updated_count": updated_count}
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "bulk task update")


@router.post("/{user_id}/tasks/bulk-delete",
             summary="Bulk delete tasks for the specified user",
             description="Delete multiple tasks at once for the specified user.")
def bulk_delete_tasks(
    user_id: str,
    request: Request,
    bulk_request: BulkTaskDeleteRequest,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """Bulk delete multiple tasks for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete tasks for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate the bulk request
        if not bulk_request.task_ids:
            raise HTTPException(status_code=400, detail="Task IDs list cannot be empty")

        if len(bulk_request.task_ids) > 100:  # Limit bulk operations
            raise HTTPException(status_code=400, detail="Cannot delete more than 100 tasks at once")

        # Convert string user_id to UUID for database operations
        user_uuid = uuid.UUID(current_user_id)
        task_service = TaskService(session)

        deleted_count = task_service.bulk_delete_tasks(
            task_ids=bulk_request.task_ids,
            user_id=user_uuid
        )

        return {"message": f"Successfully deleted {deleted_count} tasks", "deleted_count": deleted_count}
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "bulk task deletion")