"""
Tool Validation Service for Todo AI Chatbot
Validates all MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) are functioning
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlmodel import Session
import uuid

from ..mcp_tools.task_tools import (
    AddTaskParams, ListTasksParams, UpdateTaskParams,
    CompleteTaskParams, DeleteTaskParams,
    add_task, list_tasks, update_task, complete_task, delete_task
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ToolValidationService:
    """
    Service to validate all MCP tools are functioning correctly
    """

    def __init__(self):
        self.validation_results = {}
        self.last_validation_time = None

    def validate_all_mcp_tools(self, session: Session) -> Dict[str, Any]:
        """
        Validate all MCP tools are functioning
        """
        logger.info("Starting MCP tools validation...")

        results = {}

        # Validate add_task tool
        results['add_task'] = self.validate_add_task(session)

        # Validate list_tasks tool
        results['list_tasks'] = self.validate_list_tasks(session)

        # Validate update_task tool
        results['update_task'] = self.validate_update_task(session)

        # Validate complete_task tool
        results['complete_task'] = self.validate_complete_task(session)

        # Validate delete_task tool
        results['delete_task'] = self.validate_delete_task(session)

        self.validation_results = results
        self.last_validation_time = datetime.utcnow()

        logger.info(f"MCP tools validation completed: {results}")
        return results

    def validate_add_task(self, session: Session) -> Dict[str, Any]:
        """
        Validate add_task tool is functioning
        """
        try:
            logger.info("Validating add_task tool...")

            # Create test parameters for add_task
            test_user_id = str(uuid.uuid4())
            test_params = AddTaskParams(
                title="Test Task for Validation",
                description="This is a test task created to validate the add_task tool",
                priority="medium",
                user_id=test_user_id
            )

            # Execute the tool
            result = add_task(test_params, session)

            # Check if the tool executed successfully
            success = result.success

            return {
                'valid': success,
                'functionality': 'Task creation',
                'test_user_id': test_user_id,
                'result': result.dict() if hasattr(result, 'dict') else {'success': success, 'message': result.message if hasattr(result, 'message') else 'Unknown result'},
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating add_task tool: {str(e)}")
            return {
                'valid': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def validate_list_tasks(self, session: Session) -> Dict[str, Any]:
        """
        Validate list_tasks tool is functioning
        """
        try:
            logger.info("Validating list_tasks tool...")

            # Create test parameters for list_tasks
            test_user_id = str(uuid.uuid4())
            test_params = ListTasksParams(
                user_id=test_user_id,
                status=None,
                limit=10,
                offset=0
            )

            # Execute the tool
            result = list_tasks(test_params, session)

            # Check if the tool executed successfully
            success = result.success

            return {
                'valid': success,
                'functionality': 'Task listing',
                'test_user_id': test_user_id,
                'result': result.dict() if hasattr(result, 'dict') else {'success': success, 'message': result.message if hasattr(result, 'message') else 'Unknown result'},
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating list_tasks tool: {str(e)}")
            return {
                'valid': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def validate_update_task(self, session: Session) -> Dict[str, Any]:
        """
        Validate update_task tool is functioning
        """
        try:
            logger.info("Validating update_task tool...")

            # First, create a test task to update
            test_user_id = str(uuid.uuid4())
            test_task_params = AddTaskParams(
                title="Test Task for Update Validation",
                description="This is a test task created to validate the update_task tool",
                priority="medium",
                user_id=test_user_id
            )

            # Create the test task
            add_result = add_task(test_task_params, session)
            if not add_result.success:
                return {
                    'valid': False,
                    'error': 'Could not create test task for update validation',
                    'timestamp': datetime.utcnow().isoformat()
                }

            # Get the task ID from the result
            task_id = add_result.data.get('task_id') if add_result.data else None
            if not task_id:
                # Try to extract from message
                import re
                match = re.search(r'task_id["\']?\s*[:=]\s*["\']?([a-f0-9-]+)', str(add_result.message or ''))
                if match:
                    task_id = match.group(1)
                else:
                    return {
                        'valid': False,
                        'error': 'Could not extract task_id from add_task result',
                        'timestamp': datetime.utcnow().isoformat()
                    }

            # Create test parameters for update_task
            test_params = UpdateTaskParams(
                task_id=task_id,
                user_id=test_user_id,
                title="Updated Test Task",
                description="Updated description for validation"
            )

            # Execute the tool
            result = update_task(test_params, session)

            # Check if the tool executed successfully
            success = result.success

            return {
                'valid': success,
                'functionality': 'Task updating',
                'test_user_id': test_user_id,
                'test_task_id': task_id,
                'result': result.dict() if hasattr(result, 'dict') else {'success': success, 'message': result.message if hasattr(result, 'message') else 'Unknown result'},
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating update_task tool: {str(e)}")
            return {
                'valid': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def validate_complete_task(self, session: Session) -> Dict[str, Any]:
        """
        Validate complete_task tool is functioning
        """
        try:
            logger.info("Validating complete_task tool...")

            # First, create a test task to complete
            test_user_id = str(uuid.uuid4())
            test_task_params = AddTaskParams(
                title="Test Task for Complete Validation",
                description="This is a test task created to validate the complete_task tool",
                priority="medium",
                user_id=test_user_id
            )

            # Create the test task
            add_result = add_task(test_task_params, session)
            if not add_result.success:
                return {
                    'valid': False,
                    'error': 'Could not create test task for completion validation',
                    'timestamp': datetime.utcnow().isoformat()
                }

            # Get the task ID from the result
            task_id = add_result.data.get('task_id') if add_result.data else None
            if not task_id:
                # Try to extract from message
                import re
                match = re.search(r'task_id["\']?\s*[:=]\s*["\']?([a-f0-9-]+)', str(add_result.message or ''))
                if match:
                    task_id = match.group(1)
                else:
                    return {
                        'valid': False,
                        'error': 'Could not extract task_id from add_task result',
                        'timestamp': datetime.utcnow().isoformat()
                    }

            # Create test parameters for complete_task
            test_params = CompleteTaskParams(
                task_id=task_id,
                user_id=test_user_id
            )

            # Execute the tool
            result = complete_task(test_params, session)

            # Check if the tool executed successfully
            success = result.success

            return {
                'valid': success,
                'functionality': 'Task completion',
                'test_user_id': test_user_id,
                'test_task_id': task_id,
                'result': result.dict() if hasattr(result, 'dict') else {'success': success, 'message': result.message if hasattr(result, 'message') else 'Unknown result'},
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating complete_task tool: {str(e)}")
            return {
                'valid': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def validate_delete_task(self, session: Session) -> Dict[str, Any]:
        """
        Validate delete_task tool is functioning
        """
        try:
            logger.info("Validating delete_task tool...")

            # First, create a test task to delete
            test_user_id = str(uuid.uuid4())
            test_task_params = AddTaskParams(
                title="Test Task for Delete Validation",
                description="This is a test task created to validate the delete_task tool",
                priority="medium",
                user_id=test_user_id
            )

            # Create the test task
            add_result = add_task(test_task_params, session)
            if not add_result.success:
                return {
                    'valid': False,
                    'error': 'Could not create test task for deletion validation',
                    'timestamp': datetime.utcnow().isoformat()
                }

            # Get the task ID from the result
            task_id = add_result.data.get('task_id') if add_result.data else None
            if not task_id:
                # Try to extract from message
                import re
                match = re.search(r'task_id["\']?\s*[:=]\s*["\']?([a-f0-9-]+)', str(add_result.message or ''))
                if match:
                    task_id = match.group(1)
                else:
                    return {
                        'valid': False,
                        'error': 'Could not extract task_id from add_task result',
                        'timestamp': datetime.utcnow().isoformat()
                    }

            # Create test parameters for delete_task
            test_params = DeleteTaskParams(
                task_id=task_id,
                user_id=test_user_id
            )

            # Execute the tool
            result = delete_task(test_params, session)

            # Check if the tool executed successfully
            success = result.success

            return {
                'valid': success,
                'functionality': 'Task deletion',
                'test_user_id': test_user_id,
                'test_task_id': task_id,
                'result': result.dict() if hasattr(result, 'dict') else {'success': success, 'message': result.message if hasattr(result, 'message') else 'Unknown result'},
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating delete_task tool: {str(e)}")
            return {
                'valid': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def get_validation_summary(self) -> Dict[str, Any]:
        """
        Get a summary of all tool validation results
        """
        if not self.validation_results:
            return {
                'summary': 'No validation results available yet',
                'timestamp': datetime.utcnow().isoformat()
            }

        # Count valid tools
        valid_count = sum(1 for result in self.validation_results.values() if result.get('valid', False))
        total_count = len(self.validation_results)

        return {
            'total_tools': total_count,
            'valid_tools': valid_count,
            'invalid_tools': total_count - valid_count,
            'validation_rate': (valid_count / total_count * 100) if total_count > 0 else 0,
            'all_valid': valid_count == total_count,
            'results': self.validation_results,
            'timestamp': self.last_validation_time.isoformat() if self.last_validation_time else None
        }


# Global instance
tool_validator = ToolValidationService()


def get_tool_validator() -> ToolValidationService:
    """
    Get the global tool validator instance
    """
    return tool_validator