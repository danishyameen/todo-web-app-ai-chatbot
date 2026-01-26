from datetime import datetime, timedelta
from typing import Optional
import uuid
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from sqlmodel import Session, select
from ..models.user import User
from ..config.settings import settings


class PasswordResetService:
    def __init__(self, session: Session):
        self.session = session

    def generate_reset_token(self, user_email: str) -> Optional[str]:
        """Generate a password reset token for the user."""
        # Find the user by email
        user = self.session.exec(
            select(User).where(User.email == user_email)
        ).first()

        if not user:
            # Don't reveal if the email exists to prevent enumeration attacks
            return str(uuid.uuid4())

        # Generate a unique reset token
        reset_token = str(uuid.uuid4())
        
        # In a real application, you would store the token in a database
        # with an expiration time, but for this demo we'll just return it
        # For now, we'll simulate storing it in a temporary way
        
        # In a real application, you would:
        # 1. Store the token in a password_reset_tokens table
        # 2. Associate it with the user_id
        # 3. Set an expiration time (e.g., 1 hour)
        
        return reset_token

    def send_reset_email(self, user_email: str, reset_token: str) -> bool:
        """Send a password reset email to the user."""
        try:
            # In a real application, you would use a proper email service
            # like SendGrid, AWS SES, or similar
            
            # For this demo, we'll just print the reset link
            reset_link = f"{settings.BETTER_AUTH_URL}/reset-password?token={reset_token}"
            print(f"Password reset link for {user_email}: {reset_link}")
            
            # In a real application, you would send an actual email:
            # msg = MIMEMultipart()
            # msg['Subject'] = "Password Reset Request"
            # msg['From'] = settings.EMAIL_SENDER
            # msg['To'] = user_email
            # 
            # body = f"Click the link to reset your password: {reset_link}"
            # msg.attach(MIMEText(body, 'plain'))
            # 
            # with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            #     server.starttls()
            #     server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
            #     server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Error sending reset email: {str(e)}")
            return False

    def reset_password(self, reset_token: str, new_password: str) -> bool:
        """Reset the user's password using the reset token."""
        try:
            # In a real application, you would:
            # 1. Verify the reset token exists in the database
            # 2. Check if it hasn't expired
            # 3. Get the associated user_id
            # 4. Update the user's password
            
            # For this demo, we'll simulate the process
            # Since we can't actually verify the token without storing it,
            # we'll just return True to indicate success
            # In a real app, you'd have a proper token verification system
            
            # Validate the new password
            if len(new_password) < 8:
                raise ValueError("Password must be at least 8 characters long")
            
            # In a real application, you would:
            # 1. Find the user associated with this token
            # 2. Hash the new password
            # 3. Update the user's password
            # 4. Invalidate the reset token
            
            return True
        except Exception as e:
            print(f"Error resetting password: {str(e)}")
            return False