from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, select
from typing import List
import uuid

from ..db.session import get_session
from ..models.category import Category, CategoryCreate, CategoryUpdate, CategoryRead
from ..models.user import User
from ..utils.jwt_better_auth import get_current_user_id
from ..utils.exceptions import handle_database_error


# Initialize rate limiter for this module
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


@router.get("/{user_id}/categories", response_model=List[CategoryRead])
@limiter.limit("30/minute")  # Limit to 30 requests per minute per IP
def get_categories(user_id: str, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Get all categories for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's categories")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    categories = session.exec(
        select(Category).where(Category.user_id == current_user_id)
    ).all()

    return categories


@router.get("/{user_id}/categories/{category_id}", response_model=CategoryRead)
def get_category(user_id: str, category_id: uuid.UUID, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Get a specific category by ID for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's categories")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    category = session.get(Category, category_id)

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if the category belongs to the current user
    if str(category.user_id) != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this category")

    return category


@router.post("/{user_id}/categories", response_model=CategoryRead)
@limiter.limit("10/minute")  # Limit to 10 category creations per minute per IP
def create_category(user_id: str, request: Request, category: CategoryCreate, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Create a new category for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create categories for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate category data
        if not category.name or not category.name.strip():
            raise HTTPException(status_code=400, detail="Category name is required")

        if len(category.name.strip()) > 100:
            raise HTTPException(status_code=400, detail="Category name is too long (maximum 100 characters)")

        if category.description and len(category.description) > 500:
            raise HTTPException(status_code=400, detail="Category description is too long (maximum 500 characters)")

        # Ensure the category is assigned to the current user
        category_data = category.dict()
        category_data['user_id'] = current_user_id

        db_category = Category(**category_data)
        session.add(db_category)
        session.commit()
        session.refresh(db_category)

        return db_category
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        session.rollback()
        handle_database_error(e, "category creation")


@router.put("/{user_id}/categories/{category_id}", response_model=CategoryRead)
def update_category(user_id: str, category_id: uuid.UUID, request: Request, category_update: CategoryUpdate, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Update an existing category for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update categories for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # Validate update data
        if category_update.name and (not category_update.name.strip() or len(category_update.name.strip()) > 100):
            raise HTTPException(status_code=400, detail="Category name must be 1-100 characters if provided")

        if category_update.description and len(category_update.description) > 500:
            raise HTTPException(status_code=400, detail="Category description is too long (maximum 500 characters)")

        db_category = session.get(Category, category_id)

        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")

        # Check if the category belongs to the current user
        if str(db_category.user_id) != current_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this category")

        # Update the category with the provided fields
        update_data = category_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)

        session.add(db_category)
        session.commit()
        session.refresh(db_category)

        return db_category
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        session.rollback()
        handle_database_error(e, "category update")


@router.delete("/{user_id}/categories/{category_id}")
def delete_category(user_id: str, category_id: uuid.UUID, request: Request, session: Session = Depends(get_session), current_user_id: str = Depends(get_current_user_id)):
    """Delete a category for the specified user."""
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete categories for this user")

    # Validate user_id format
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        category = session.get(Category, category_id)

        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        # Check if the category belongs to the current user
        if str(category.user_id) != current_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this category")

        session.delete(category)
        session.commit()

        return {"message": "Category deleted successfully"}
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        session.rollback()
        handle_database_error(e, "category deletion")