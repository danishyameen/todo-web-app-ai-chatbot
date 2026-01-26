"""
AI Agent Service for Todo AI Chatbot
Handles natural language processing and MCP tool orchestration
"""

from typing import Dict, Any, Tuple, Optional
import re
from datetime import datetime
from sqlmodel import Session
import logging
import uuid

from ..mcp_tools.task_tools import (
    AddTaskParams, ListTasksParams, UpdateTaskParams,
    CompleteTaskParams, DeleteTaskParams,
    add_task, list_tasks, update_task, complete_task, delete_task
)
from .mcp_validation_service import get_mcp_validator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIIntentClassifier:
    """
    Classifies user intents from natural language input
    """

    def __init__(self):
        self.intent_patterns = {
            'add_task': [
                r'add\s+(a\s+)?(new\s+)?task\s+(to\s+|for\s+)?(.+)',
                r'create\s+(a\s+)?(new\s+)?task\s+(to\s+|for\s+)?(.+)',
                r'make\s+(a\s+)?(new\s+)?task\s+(to\s+|for\s+)?(.+)',
                r'need\s+to\s+(.+)',
                r'remember\s+to\s+(.+)',
                r'don\'t\s+forget\s+to\s+(.+)',
            ],
            'list_tasks': [
                r'show\s+(me\s+)?(my\s+)?tasks',
                r'what\s+(do\s+i\s+have|are\s+my\s+tasks)',
                r'list\s+(my\s+)?tasks',
                r'display\s+(my\s+)?tasks',
                r'view\s+(my\s+)?tasks',
                r'get\s+(my\s+)?tasks',
                r'list\b',
            ],
            'complete_task': [
                r'mark.*complete',
                r'mark.*done',
                r'complete\s+(the\s+)?(.+)',
                r'finish\s+(the\s+)?(.+)',
                r'accomplish\s+(the\s+)?(.+)',
                r'check\s+(off|out)',
            ],
            'update_task': [
                r'update\s+(the\s+)?(.+)',
                r'change\s+(the\s+)?(.+)',
                r'modify\s+(the\s+)?(.+)',
                r'edit\s+(the\s+)?(.+)',
                r'adjust\s+(the\s+)?(.+)',
            ],
            'delete_task': [
                r'delete\s+(the\s+)?(.+)',
                r'remove\s+(the\s+)?(.+)',
                r'eradicate\s+(the\s+)?(.+)',
                r'get\s+rid\s+of\s+(the\s+)?(.+)',
            ],
            'help': [
                r'help',
                r'how\s+to\s+use',
                r'how\s+do\s+i',
                r'how\s+can\s+i',
                r'guide\s+me',
                r'instructions',
                r'help\s+me',
                r'i\s+need\s+help',
                r'what\s+can\s+you\s+do',
                r'what\s+can\s+i\s+do',
                r'kaise\s+use\s+karna\s+hain',
                r'kaise\s+kaam\s+karta\s+hain',
                r'manual',
                r'tutorial',
                r'usage',
            ],
            'fields': [
                r'what\s+fields',
                r'input\s+fields',
                r'form\s+fields',
                r'field\s+list',
                r'kya\s+fields\s+hai',
                r'fields\s+list',
                r'fields\s+needed',
                r'information\s+needed',
                r'what\s+information',
            ],
        }

    def classify_intent(self, text: str) -> Tuple[str, Dict[str, Any]]:
        """
        Classify the intent from user input text
        Returns: (intent_type, extracted_parameters)
        """
        text_lower = text.lower().strip()

        # Check each intent pattern
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text_lower)
                if match:
                    # Extract parameters based on intent
                    params = self._extract_parameters(intent, text, match)
                    return intent, params

        # Default to general response if no intent matched
        return "general", {"original_text": text}

    def _extract_parameters(self, intent: str, original_text: str, match: re.Match) -> Dict[str, Any]:
        """
        Extract parameters based on the matched intent
        """
        params = {"original_text": original_text}

        if intent == "add_task":
            # Extract task details from the match
            groups = match.groups()
            # Usually the last group contains the task description
            task_desc = groups[-1] if groups[-1] else original_text

            # Clean up the task description
            task_desc = task_desc.strip().capitalize()

            # Look for due date mentions
            due_date = self._extract_date(original_text)
            if due_date:
                params["due_date"] = due_date

            # Look for priority mentions
            priority = self._extract_priority(original_text)
            if priority:
                params["priority"] = priority

            params["title"] = task_desc
            params["description"] = task_desc  # Use the same as title for now

        elif intent == "list_tasks":
            # Check for status filters
            if any(word in original_text.lower() for word in ["pending", "todo", "incomplete"]):
                params["status"] = "pending"
            elif any(word in original_text.lower() for word in ["completed", "done", "finished"]):
                params["status"] = "completed"
            else:
                params["status"] = "all"

        elif intent == "complete_task":
            # Extract task identifier if mentioned
            task_identifier = self._extract_task_identifier(original_text)
            if task_identifier:
                params["task_identifier"] = task_identifier

        elif intent == "update_task":
            # Extract task identifier and update details
            task_identifier = self._extract_task_identifier(original_text)
            if task_identifier:
                params["task_identifier"] = task_identifier
            # Also extract what needs to be updated
            update_details = self._extract_update_details(original_text)
            params.update(update_details)

        elif intent == "delete_task":
            # Extract task identifier
            task_identifier = self._extract_task_identifier(original_text)
            if task_identifier:
                params["task_identifier"] = task_identifier

        return params

    def _extract_date(self, text: str) -> Optional[str]:
        """
        Extract date from text using common patterns
        """
        # Look for common date patterns
        date_patterns = [
            r'tomorrow',
            r'next\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
            r'in\s+(\d+)\s+(days?|weeks?|months?)',
            r'on\s+(\d{1,2}[/-]\d{1,2}(/\d{2,4})?|\d{4}-\d{2}-\d{2})',
            r'by\s+(\d{1,2}[/-]\d{1,2}(/\d{2,4})?|\d{4}-\d{2}-\d{2})',
        ]

        text_lower = text.lower()
        for pattern in date_patterns:
            match = re.search(pattern, text_lower)
            if match:
                # In a real implementation, we would convert this to ISO format
                # For now, return a simplified representation
                return match.group(0)

        return None

    def _extract_priority(self, text: str) -> Optional[str]:
        """
        Extract priority from text
        """
        text_lower = text.lower()

        if any(word in text_lower for word in ["high", "important", "urgent", "critical", "asap"]):
            return "high"
        elif any(word in text_lower for word in ["low", "not urgent", "later"]):
            return "low"
        else:
            return "medium"

    def _extract_task_identifier(self, text: str) -> Optional[str]:
        """
        Extract task identifier (by name, number, etc.)
        """
        # Look for numeric IDs in the text
        id_pattern = r'(?:id|number|task)\s*(?:is|=|:)?\s*(\d+)'
        id_match = re.search(id_pattern, text, re.IGNORECASE)
        if id_match:
            return id_match.group(1)

        # Look for task titles (simple approach)
        # Remove common verbs to isolate the task name
        text_lower = text.lower()
        for verb in ['mark', 'complete', 'finish', 'update', 'delete', 'remove', 'add']:
            text_lower = re.sub(rf'\b{verb}\b', '', text_lower)

        # Remove common articles and prepositions
        text_clean = re.sub(r'\b(the|a|an|to|for|with|by|on|at|in)\b', ' ', text_lower)
        text_clean = re.sub(r'\s+', ' ', text_clean).strip()

        return text_clean if text_clean else text  # Return cleaned text or original if no cleaning happened

    def _extract_update_details(self, text: str) -> Dict[str, Any]:
        """
        Extract details about what should be updated
        """
        details = {}

        # Look for new title/description
        if "title" in text.lower() or "name" in text.lower():
            # Extract new title
            pass  # Simplified implementation

        # Look for new due date
        due_date = self._extract_date(text)
        if due_date:
            details["due_date"] = due_date

        # Look for new priority
        priority = self._extract_priority(text)
        if priority:
            details["priority"] = priority

        return details


class AIAgentService:
    """
    Main AI Agent service that orchestrates natural language processing
    and MCP tool execution
    """

    def __init__(self):
        self.intent_classifier = AIIntentClassifier()
        self.mcp_validator = get_mcp_validator()

    def process_user_input(self, user_input: str, user_id: str, session: Session) -> str:
        """
        Process user input and return appropriate response
        """
        try:
            logger.info(f"Processing user input for user {user_id}: {user_input}")

            # Validate MCP tools availability
            mcp_status = self.mcp_validator.validate_mcp_tool_availability()

            if not mcp_status.get('all_tools_working', False):
                logger.warning(f"Some MCP tools are not working: {mcp_status.get('tool_validation', {})}")
                # Could implement fallback logic here if needed

            # Classify intent
            intent, params = self.intent_classifier.classify_intent(user_input)

            # Execute appropriate MCP tool based on intent
            response = self._execute_intent(intent, params, user_id, session)

            logger.info(f"Processed intent {intent} for user {user_id}, response: {response}")
            return response

        except Exception as e:
            logger.error(f"Error processing user input for user {user_id}: {str(e)}")
            return f"Sorry, I encountered an error processing your request: {str(e)}"

    def _execute_intent(self, intent: str, params: Dict[str, Any], user_id: str, session: Session) -> str:
        """
        Execute the appropriate MCP tool based on classified intent
        """
        if intent == "add_task":
            return self._handle_add_task(params, user_id, session)
        elif intent == "list_tasks":
            return self._handle_list_tasks(params, user_id, session)
        elif intent == "complete_task":
            return self._handle_complete_task(params, user_id, session)
        elif intent == "update_task":
            return self._handle_update_task(params, user_id, session)
        elif intent == "delete_task":
            return self._handle_delete_task(params, user_id, session)
        elif intent == "help":
            # For help intent, pass the original text to the general response handler
            # which has the logic for different help scenarios
            params["original_text"] = params.get("original_text", "")
            return self._handle_general_response(params, intent)
        elif intent == "fields":
            # For fields intent, return the field list information
            return """For creating a new task, I need these fields:

1. Task Title (required) - The name of the task
2. Description (optional) - Additional details about the task
3. Priority (optional) - low, medium, or high (defaults to medium)
4. Due Date (optional) - When the task should be completed

Example: "Add a task to buy groceries with high priority" or "Create task wash clothes by tomorrow"

For updating a task, you can change: title, description, priority, due date, or status."""
        else:
            # General response for unmatched intents
            return self._handle_general_response(params, intent)

    def _handle_add_task(self, params: Dict[str, Any], user_id: str, session: Session) -> str:
        """
        Handle add task intent
        """
        try:
            logger.info(f"Handling add_task for user {user_id} with params: {params}")

            # Create MCP tool parameters
            add_params = AddTaskParams(
                title=params.get("title", "Default task"),
                description=params.get("description", ""),
                due_date=params.get("due_date"),
                priority=params.get("priority", "medium"),
                user_id=user_id
            )

            # Validate the parameters before executing the tool
            if not add_params.title.strip():
                return "I need a title for the task. Please specify what task you'd like to add."

            # Execute MCP tool
            result = add_task(add_params, session)

            if result.success:
                logger.info(f"Successfully added task for user {user_id}")
                return result.message
            else:
                logger.warning(f"Failed to add task for user {user_id}: {result.message}")
                return f"Sorry, I couldn't add that task: {result.message}"

        except Exception as e:
            logger.error(f"Error in _handle_add_task for user {user_id}: {str(e)}")
            return f"Error adding task: {str(e)}"

    def _handle_list_tasks(self, params: Dict[str, Any], user_id: str, session: Session) -> str:
        """
        Handle list tasks intent
        """
        try:
            logger.info(f"Handling list_tasks for user {user_id} with params: {params}")

            # Create MCP tool parameters
            status = params.get("status", "all")
            list_params = ListTasksParams(
                user_id=user_id,
                status=status if status != "all" else None,
                limit=params.get("limit", 100),
                offset=params.get("offset", 0)
            )

            # Execute MCP tool
            result = list_tasks(list_params, session)

            if result.success:
                task_list = result.data.get("tasks", [])
                if not task_list:
                    status_display = status if status != "all" else "any"
                    return f"You don't have any {status_display} tasks right now."

                task_titles = [f"- {task['title']} ({task['status']})" for task in task_list[:10]]  # Limit to first 10
                tasks_str = "\n".join(task_titles)

                if len(task_list) > 10:
                    return f"You have {len(task_list)} {status} tasks:\n{tasks_str}\n\n...and {len(task_list) - 10} more."
                else:
                    return f"You have {len(task_list)} {status} tasks:\n{tasks_str}"
            else:
                logger.warning(f"Failed to list tasks for user {user_id}: {result.message}")
                return f"Sorry, I couldn't retrieve your tasks: {result.message}"

        except Exception as e:
            logger.error(f"Error in _handle_list_tasks for user {user_id}: {str(e)}")
            return f"Error listing tasks: {str(e)}"

    def _handle_complete_task(self, params: Dict[str, Any], user_id: str, session: Session) -> str:
        """
        Handle complete task intent
        """
        try:
            logger.info(f"Handling complete_task for user {user_id}")

            # Check if we have a task identifier
            task_identifier = params.get("task_identifier")

            if task_identifier is None:
                return "To complete a task, please specify which task by name or ID. For example: 'Complete the grocery task' or 'Mark task 123 as complete.'"

            # If the identifier looks like a number, treat it as an ID
            task_completed = False

            # First, try to find by ID if the identifier is a valid UUID
            try:
                task_uuid = uuid.UUID(task_identifier)
                # Import here to avoid circular imports
                from ..models.task import Task
                task = session.get(Task, task_uuid)

                if task and str(task.user_id) == user_id:
                    # Execute MCP tool to complete the task
                    complete_params = CompleteTaskParams(
                        task_id=task_identifier,  # Keep as string for the params
                        user_id=user_id
                    )
                    result = complete_task(complete_params, session)

                    if result.success:
                        task_completed = True
                        return result.message
                    else:
                        return f"Sorry, I couldn't complete that task: {result.message}"
                elif task:
                    return "You don't have permission to complete this task. It belongs to another user."
                else:
                    return f"Task with ID {task_identifier} not found."
            except ValueError:
                # If not a valid UUID, try to find by title/content
                # Import here to avoid circular imports
                from ..models.task import Task
                # Convert user_id string to UUID for comparison
                user_uuid = uuid.UUID(user_id)
                # Find tasks by title that belong to this user
                user_tasks = session.query(Task).filter(
                    Task.user_id == user_uuid,
                    Task.title.ilike(f"%{task_identifier}%")
                ).all()

                if not user_tasks:
                    return f"I couldn't find any tasks containing '{task_identifier}'. Please check the task name or provide a task ID."

                # If we have exactly one match, complete it
                if len(user_tasks) == 1:
                    complete_params = CompleteTaskParams(
                        task_id=str(user_tasks[0].id),  # Convert UUID to string for the params
                        user_id=user_id
                    )
                    result = complete_task(complete_params, session)

                    if result.success:
                        task_completed = True
                        return result.message
                    else:
                        return f"Sorry, I couldn't complete that task: {result.message}"

                # If we have multiple matches, ask for clarification
                else:
                    task_titles = [f"'{task.title}' (ID: {task.id})" for task in user_tasks[:5]]  # Limit to 5 suggestions
                    return f"I found multiple tasks matching '{task_identifier}'. Please specify by ID:\n" + "\n".join(task_titles)

            if not task_completed:
                return f"Could not find a task matching '{task_identifier}' that belongs to you."

        except Exception as e:
            logger.error(f"Error in _handle_complete_task for user {user_id}: {str(e)}")
            return f"Error completing task: {str(e)}"

    def _handle_update_task(self, params: Dict[str, Any], user_id: str, session: Session) -> str:
        """
        Handle update task intent
        """
        try:
            logger.info(f"Handling update_task for user {user_id}")

            # Check if we have a task identifier
            task_identifier = params.get("task_identifier")

            if task_identifier is None:
                return "To update a task, please specify which task and what you'd like to change. For example: 'Update the meeting task due date to Friday' or 'Change priority of task 123 to high.'"

            # Extract what needs to be updated
            update_details = self._extract_update_details(params.get("original_text", ""))

            if not update_details or len(update_details) == 1 and "original_text" in update_details:
                return "Please specify what you'd like to update. You can change the title, description, due date, or priority. For example: 'Update the meeting task due date to Friday' or 'Change priority of task 123 to high.'"

            # If the identifier looks like a number, treat it as an ID
            task_updated = False

            # First, try to find by ID if the identifier is a valid UUID
            try:
                task_uuid = uuid.UUID(task_identifier)
                # Import here to avoid circular imports
                from ..models.task import Task
                task = session.get(Task, task_uuid)

                if task and str(task.user_id) == user_id:
                    # Execute MCP tool to update the task
                    update_params = UpdateTaskParams(
                        task_id=task_identifier,  # Keep as string for the params
                        user_id=user_id,
                        title=update_details.get("title"),
                        description=update_details.get("description"),
                        due_date=update_details.get("due_date"),
                        priority=update_details.get("priority"),
                        status=update_details.get("status")
                    )
                    result = update_task(update_params, session)

                    if result.success:
                        task_updated = True
                        return result.message
                    else:
                        return f"Sorry, I couldn't update that task: {result.message}"
                elif task:
                    return "You don't have permission to update this task. It belongs to another user."
                else:
                    return f"Task with ID {task_identifier} not found."
            except ValueError:
                # If not a valid UUID, try to find by title/content
                # Import here to avoid circular imports
                from ..models.task import Task
                # Convert user_id string to UUID for comparison
                user_uuid = uuid.UUID(user_id)
                # Find tasks by title that belong to this user
                user_tasks = session.query(Task).filter(
                    Task.user_id == user_uuid,
                    Task.title.ilike(f"%{task_identifier}%")
                ).all()

                if not user_tasks:
                    return f"I couldn't find any tasks containing '{task_identifier}'. Please check the task name or provide a task ID."

                # If we have exactly one match, update it
                if len(user_tasks) == 1:
                    update_params = UpdateTaskParams(
                        task_id=str(user_tasks[0].id),  # Convert UUID to string for the params
                        user_id=user_id,
                        title=update_details.get("title"),
                        description=update_details.get("description"),
                        due_date=update_details.get("due_date"),
                        priority=update_details.get("priority"),
                        status=update_details.get("status")
                    )
                    result = update_task(update_params, session)

                    if result.success:
                        task_updated = True
                        return result.message
                    else:
                        return f"Sorry, I couldn't update that task: {result.message}"

                # If we have multiple matches, ask for clarification
                else:
                    task_titles = [f"'{task.title}' (ID: {task.id})" for task in user_tasks[:5]]  # Limit to 5 suggestions
                    return f"I found multiple tasks matching '{task_identifier}'. Please specify by ID:\n" + "\n".join(task_titles)

            if not task_updated:
                return f"Could not find a task matching '{task_identifier}' that belongs to you."

        except Exception as e:
            logger.error(f"Error in _handle_update_task for user {user_id}: {str(e)}")
            return f"Error updating task: {str(e)}"

    def _handle_delete_task(self, params: Dict[str, Any], user_id: str, session: Session) -> str:
        """
        Handle delete task intent
        """
        try:
            logger.info(f"Handling delete_task for user {user_id}")

            # Check if we have a task identifier
            task_identifier = params.get("task_identifier")

            if task_identifier is None:
                return "To delete a task, please specify which task by name or ID. For example: 'Delete the grocery task' or 'Remove task 123.' WARNING: This action cannot be undone."

            # If the identifier looks like a number, treat it as an ID
            task_deleted = False

            # First, try to find by ID if the identifier is a valid UUID
            try:
                task_uuid = uuid.UUID(task_identifier)
                # Import here to avoid circular imports
                from ..models.task import Task
                task = session.get(Task, task_uuid)

                if task and str(task.user_id) == user_id:
                    # Execute MCP tool to delete the task
                    delete_params = DeleteTaskParams(
                        task_id=task_identifier,  # Keep as string for the params
                        user_id=user_id
                    )
                    result = delete_task(delete_params, session)

                    if result.success:
                        task_deleted = True
                        return result.message
                    else:
                        return f"Sorry, I couldn't delete that task: {result.message}"
                elif task:
                    return "You don't have permission to delete this task. It belongs to another user."
                else:
                    return f"Task with ID {task_identifier} not found."
            except ValueError:
                # If not a valid UUID, try to find by title/content
                # Import here to avoid circular imports
                from ..models.task import Task
                # Convert user_id string to UUID for comparison
                user_uuid = uuid.UUID(user_id)
                # Find tasks by title that belong to this user
                user_tasks = session.query(Task).filter(
                    Task.user_id == user_uuid,
                    Task.title.ilike(f"%{task_identifier}%")
                ).all()

                if not user_tasks:
                    return f"I couldn't find any tasks containing '{task_identifier}'. Please check the task name or provide a task ID."

                # If we have exactly one match, delete it
                if len(user_tasks) == 1:
                    delete_params = DeleteTaskParams(
                        task_id=str(user_tasks[0].id),  # Convert UUID to string for the params
                        user_id=user_id
                    )
                    result = delete_task(delete_params, session)

                    if result.success:
                        task_deleted = True
                        return result.message
                    else:
                        return f"Sorry, I couldn't delete that task: {result.message}"

                # If we have multiple matches, ask for clarification
                else:
                    task_titles = [f"'{task.title}' (ID: {task.id})" for task in user_tasks[:5]]  # Limit to 5 suggestions
                    return f"I found multiple tasks matching '{task_identifier}'. Please specify by ID:\n" + "\n".join(task_titles)

            if not task_deleted:
                return f"Could not find a task matching '{task_identifier}' that belongs to you."

        except Exception as e:
            logger.error(f"Error in _handle_delete_task for user {user_id}: {str(e)}")
            return f"Error deleting task: {str(e)}"

    def _handle_general_response(self, params: Dict[str, Any], intent: str) -> str:
        """
        Handle general/unmatched intents
        """
        original_text = params.get("original_text", "")
        logger.info(f"Handling general intent for user with input: {original_text}")

        # Detect if the user is asking for help/instructions
        help_keywords = ['help', 'how to', 'how do', 'guide', 'instructions', 'kaise', 'kya', 'kya kar', 'kaise use', 'manual', 'instruction', 'tutor', 'tips']
        task_create_keywords = ['create', 'add', 'new task', 'make task', 'banane', 'create task', 'add task']
        task_update_keywords = ['update', 'change', 'modify', 'edit', 'badlo', 'update task', 'change task']
        task_delete_keywords = ['delete', 'remove', 'erase', 'delete task', 'remove task', 'hatado', 'delete all']
        field_list_keywords = ['fields', 'field list', 'input fields', 'form fields', 'kya', 'kya fields', 'fields list']

        original_lower = original_text.lower()

        # Check for help requests
        if any(keyword in original_lower for keyword in help_keywords):
            return """I'm your AI Task Assistant! Here's how to use me:

To create a task: Say "Add a task to [your task]" or "Create a task [your task]"
To list tasks: Say "Show me my tasks" or "What are my tasks?"
To complete a task: Say "Complete task [task name]" or "Mark [task name] as done"
To update a task: Say "Update task [old name] to [new name]" or "Change [task name] to [new details]"
To delete a task: Say "Delete task [task name]" or "Remove [task name]"
To get help: Say "Help" or "How to use this app?"

I support multiple languages - just speak in your preferred language!"""

        # Check for field list requests
        elif any(keyword in original_lower for keyword in field_list_keywords):
            return """For creating a new task, I need these fields:

1. Task Title (required) - The name of the task
2. Description (optional) - Additional details about the task
3. Priority (optional) - low, medium, or high (defaults to medium)
4. Due Date (optional) - When the task should be completed

Example: "Add a task to buy groceries with high priority" or "Create task wash clothes by tomorrow"

For updating a task, you can change: title, description, priority, due date, or status."""

        # Check for task creation help
        elif any(keyword in original_lower for keyword in task_create_keywords):
            return """To create a task, use these formats:

Examples:
- "Add a task to buy groceries"
- "Create task wash the car with high priority"
- "Make a task to call mom by Friday"
- "Add task exercise for 30 minutes with medium priority"

I will automatically create the task for you!"""

        # Check for task update help
        elif any(keyword in original_lower for keyword in task_update_keywords):
            return """To update a task, use these formats:

Examples:
- "Update task 'buy groceries' to 'buy weekly groceries'"
- "Change task 'wash car' to 'wash family car'"
- "Update priority of 'meeting' to high"
- "Change due date of 'report' to Friday"

Note: Use the exact task name as shown in your task list."""

        # Check for task deletion help
        elif any(keyword in original_lower for keyword in task_delete_keywords):
            return """To delete tasks, use these formats:

Examples:
- "Delete task 'buy groceries'" (deletes single task)
- "Remove task 'wash car'" (deletes single task)
- "Delete all tasks" (deletes all your tasks)

Note: Use the exact task name as shown in your task list. Deleted tasks cannot be recovered."""

        # Default response
        return f"I understand you said: '{original_text}'. I'm your AI assistant for managing tasks. You can ask me to add, list, update, or complete tasks. For help, say 'help' or 'how to use this app'. For field list, say 'what fields do you need?'"

    def _extract_update_details(self, text: str) -> Dict[str, Any]:
        """
        Extract details about what should be updated
        """
        details = {}

        # Look for new title/description
        if "title" in text.lower() or "name" in text.lower():
            # Extract new title
            pass  # Simplified implementation

        # Look for new due date
        due_date = self.intent_classifier._extract_date(text)
        if due_date:
            details["due_date"] = due_date

        # Look for new priority
        priority = self.intent_classifier._extract_priority(text)
        if priority:
            details["priority"] = priority

        return details