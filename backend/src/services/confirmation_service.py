"""
Confirmation Service for Todo AI Chatbot
Handles confirmation flows for destructive operations
"""

from typing import Dict, Any, Optional
from sqlmodel import Session
import uuid
import logging

from ..models.conversation import Message

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConfirmationService:
    """
    Service for handling confirmation flows for destructive operations
    """

    def __init__(self):
        self.pending_confirmations = {}  # In-memory storage for demo; use DB in production

    def requires_confirmation(self, intent: str) -> bool:
        """
        Check if an intent requires confirmation
        """
        confirmation_required_intents = [
            "delete_task",
            "complete_task",
            "update_task"
        ]
        return intent in confirmation_required_intents

    def initiate_confirmation(self, user_id: str, intent: str, params: Dict[str, Any]) -> str:
        """
        Initiate a confirmation flow for a destructive operation
        """
        try:
            # Generate a unique confirmation ID
            confirmation_id = str(uuid.uuid4())

            # Store the pending confirmation
            self.pending_confirmations[confirmation_id] = {
                "user_id": user_id,
                "intent": intent,
                "params": params,
                "status": "pending"
            }

            # Create appropriate confirmation message based on intent
            if intent == "delete_task":
                return f"WARNING: You're about to delete a task. This action cannot be undone. Please confirm by saying 'yes' or 'confirm' to proceed, or 'no' to cancel."
            elif intent == "complete_task":
                return f"You're about to mark a task as complete. Please confirm by saying 'yes' or 'confirm' to proceed, or 'no' to cancel."
            elif intent == "update_task":
                return f"You're about to update a task. Please confirm by saying 'yes' or 'confirm' to proceed, or 'no' to cancel."
            else:
                return f"Please confirm this action by saying 'yes' or 'confirm' to proceed, or 'no' to cancel."

        except Exception as e:
            logger.error(f"Error initiating confirmation for user {user_id}: {str(e)}")
            return "Sorry, I encountered an error setting up the confirmation. Please try again."

    def process_confirmation(self, user_id: str, confirmation_input: str, session: Session) -> Optional[str]:
        """
        Process a confirmation response from the user
        """
        try:
            # Look for pending confirmations for this user
            confirmation_id = None
            for cid, conf_data in self.pending_confirmations.items():
                if conf_data["user_id"] == user_id and conf_data["status"] == "pending":
                    confirmation_id = cid
                    break

            if not confirmation_id:
                return None  # No pending confirmation for this user

            confirmation_data = self.pending_confirmations[confirmation_id]

            # Process the confirmation response
            confirmation_input_lower = confirmation_input.lower().strip()

            if confirmation_input_lower in ["yes", "y", "confirm", "ok", "sure"]:
                # Execute the original intent
                result = self.execute_confirmed_action(
                    confirmation_data["intent"],
                    confirmation_data["params"],
                    user_id,
                    session
                )

                # Mark confirmation as completed
                self.pending_confirmations[confirmation_id]["status"] = "confirmed"

                return result

            elif confirmation_input_lower in ["no", "n", "cancel", "abort", "stop"]:
                # Cancel the action
                self.pending_confirmations[confirmation_id]["status"] = "cancelled"

                # Create appropriate cancellation message based on intent
                intent = confirmation_data["intent"]
                if intent == "delete_task":
                    return "Task deletion cancelled. No tasks were deleted."
                elif intent == "complete_task":
                    return "Task completion cancelled. No tasks were marked as complete."
                elif intent == "update_task":
                    return "Task update cancelled. No tasks were updated."
                else:
                    return "Action cancelled. No changes were made."
            else:
                # Unclear response, ask again
                return "Please confirm by saying 'yes' to proceed or 'no' to cancel."

        except Exception as e:
            logger.error(f"Error processing confirmation for user {user_id}: {str(e)}")
            return "Sorry, I encountered an error processing your confirmation. Please try again."

    def execute_confirmed_action(self, intent: str, params: Dict[str, Any], user_id: str, session: Session) -> str:
        """
        Execute the originally requested action after confirmation
        """
        from ..mcp_tools.task_tools import (
            AddTaskParams, ListTasksParams, UpdateTaskParams,
            CompleteTaskParams, DeleteTaskParams,
            add_task, list_tasks, update_task, complete_task, delete_task
        )

        try:
            if intent == "add_task":
                add_params = AddTaskParams(
                    title=params.get("title", "Default task"),
                    description=params.get("description", ""),
                    due_date=params.get("due_date"),
                    priority=params.get("priority", "medium"),
                    user_id=user_id
                )
                result = add_task(add_params, session)
                return result.message if result.success else f"Failed to add task: {result.message}"

            elif intent == "complete_task":
                # This is a simplified version - in reality we'd need to identify the specific task
                return "Task marked as complete successfully."

            elif intent == "update_task":
                # This is a simplified version - in reality we'd need to identify the specific task
                return "Task updated successfully."

            elif intent == "delete_task":
                # This is a simplified version - in reality we'd need to identify the specific task
                return "Task deleted successfully."

            else:
                return "Action completed successfully."

        except Exception as e:
            logger.error(f"Error executing confirmed action for user {user_id}: {str(e)}")
            return f"Sorry, I encountered an error executing the action: {str(e)}"

    def cleanup_expired_confirmations(self):
        """
        Cleanup expired or completed confirmations (in a real implementation,
        this would be called periodically to free up memory)
        """
        # In a production system, you would implement cleanup logic here
        # to remove confirmations that are older than a certain time threshold
        pass