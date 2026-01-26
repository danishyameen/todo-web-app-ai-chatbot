from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session
from pydantic import EmailStr
from typing import Dict

from ..db.session import get_session
from ..services.password_reset_service import PasswordResetService
from ..utils.exceptions import handle_database_error


router = APIRouter()


@router.post("/forgot-password",
             summary="Request password reset",
             description="Send a password reset link to the user's email")
def forgot_password(
    email: EmailStr,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Request a password reset link."""
    try:
        password_reset_service = PasswordResetService(session)
        
        # Generate a reset token
        reset_token = password_reset_service.generate_reset_token(email)
        
        # Send reset email in the background
        background_tasks.add_task(
            password_reset_service.send_reset_email,
            email,
            reset_token
        )
        
        # Return a generic response to prevent email enumeration
        return {
            "message": "If an account with this email exists, a password reset link has been sent."
        }
    except Exception as e:
        handle_database_error(e, "password reset request")


@router.post("/reset-password",
             summary="Reset password with token",
             description="Reset the user's password using a reset token")
def reset_password(
    token: str,
    new_password: str,
    session: Session = Depends(get_session)
):
    """Reset password using the provided token."""
    try:
        password_reset_service = PasswordResetService(session)
        
        # Reset the password
        success = password_reset_service.reset_password(token, new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        return {
            "message": "Password has been reset successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        handle_database_error(e, "password reset")