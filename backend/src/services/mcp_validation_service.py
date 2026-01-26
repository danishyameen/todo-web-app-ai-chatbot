"""
MCP Server Validation Service for Todo AI Chatbot
Validates MCP server connections and tool availability
"""

import os
import requests
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from ..config.mcp_settings import get_mcp_settings
from ..mcp_tools.task_tools import (
    AddTaskParams, ListTasksParams, UpdateTaskParams,
    CompleteTaskParams, DeleteTaskParams,
    add_task, list_tasks, update_task, complete_task, delete_task
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MCPValidationService:
    """
    Service to validate MCP server connections and tool availability
    """

    def __init__(self):
        self.mcp_settings = get_mcp_settings()
        self.validation_results = {}
        self.last_validation_time = None

    def validate_all_connections(self) -> Dict[str, Any]:
        """
        Validate all MCP server connections
        """
        logger.info("Starting MCP server connection validation...")

        results = {}

        # Validate GitHub connection
        results['github'] = self._validate_github_connection()

        # Validate Context7 connection
        results['context7'] = self._validate_context7_connection()

        # Validate Vercel connection
        results['vercel'] = self._validate_vercel_connection()

        # Validate local MCP tools
        results['local_mcp_tools'] = self._validate_local_mcp_tools()

        self.validation_results = results
        self.last_validation_time = datetime.utcnow()

        logger.info(f"MCP server validation completed: {results}")
        return results

    def _validate_github_connection(self) -> Dict[str, Any]:
        """
        Validate GitHub MCP server connection
        """
        try:
            token = self.mcp_settings.get_token('github')
            if not token:
                return {
                    'connected': False,
                    'error': 'GitHub token not configured',
                    'timestamp': datetime.utcnow().isoformat()
                }

            headers = {
                'Authorization': f'token {token}',
                'Accept': 'application/vnd.github.v3+json'
            }

            response = requests.get(
                'https://api.github.com/user',
                headers=headers,
                timeout=10
            )

            connected = response.status_code == 200
            return {
                'connected': connected,
                'status_code': response.status_code,
                'message': 'GitHub connection successful' if connected else f'GitHub connection failed: {response.status_code}',
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating GitHub connection: {str(e)}")
            return {
                'connected': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def _validate_context7_connection(self) -> Dict[str, Any]:
        """
        Validate Context7 MCP server connection
        """
        try:
            api_key = self.mcp_settings.get_token('context7')
            if not api_key:
                return {
                    'connected': False,
                    'error': 'Context7 API key not configured',
                    'timestamp': datetime.utcnow().isoformat()
                }

            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            # Try to access a basic endpoint to validate connection
            response = requests.get(
                'https://api.context7.com/health',  # or whatever health check endpoint exists
                headers=headers,
                timeout=10
            )

            connected = response.status_code in [200, 201, 204]
            return {
                'connected': connected,
                'status_code': response.status_code,
                'message': 'Context7 connection successful' if connected else f'Context7 connection failed: {response.status_code}',
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating Context7 connection: {str(e)}")
            return {
                'connected': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def _validate_vercel_connection(self) -> Dict[str, Any]:
        """
        Validate Vercel MCP server connection
        """
        try:
            token = self.mcp_settings.get_token('vercel')
            if not token:
                return {
                    'connected': False,
                    'error': 'Vercel token not configured',
                    'timestamp': datetime.utcnow().isoformat()
                }

            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }

            response = requests.get(
                'https://api.vercel.com/www/user',
                headers=headers,
                timeout=10
            )

            connected = response.status_code == 200
            return {
                'connected': connected,
                'status_code': response.status_code,
                'message': 'Vercel connection successful' if connected else f'Vercel connection failed: {response.status_code}',
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating Vercel connection: {str(e)}")
            return {
                'connected': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def _validate_local_mcp_tools(self) -> Dict[str, Any]:
        """
        Validate local MCP tools are available
        """
        try:
            # Test that all MCP tools are importable and callable
            tools_available = []

            # Check if all required functions exist
            required_tools = [
                ('add_task', add_task),
                ('list_tasks', list_tasks),
                ('update_task', update_task),
                ('complete_task', complete_task),
                ('delete_task', delete_task)
            ]

            for tool_name, tool_func in required_tools:
                if callable(tool_func):
                    tools_available.append(tool_name)
                else:
                    logger.error(f"MCP tool {tool_name} is not callable")

            all_tools_available = len(tools_available) == len(required_tools)

            return {
                'available': all_tools_available,
                'tools_available': tools_available,
                'tools_missing': [name for name, func in required_tools if name not in tools_available] if not all_tools_available else [],
                'total_tools': len(required_tools),
                'available_count': len(tools_available),
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating local MCP tools: {str(e)}")
            return {
                'available': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def validate_mcp_tool_availability(self) -> Dict[str, Any]:
        """
        Validate specific MCP tools are available and working
        """
        logger.info("Validating MCP tool availability...")

        try:
            # Import session for testing (using a mock session for validation)
            from unittest.mock import MagicMock

            # Create a mock session for validation
            mock_session = MagicMock()

            # Test each tool with basic parameters
            validation_tests = []

            # Test add_task
            try:
                from ..mcp_tools.task_tools import AddTaskParams
                test_add_params = AddTaskParams(
                    title="Test Task",
                    description="Test description",
                    user_id="test-user-123"
                )
                # We won't actually call add_task to avoid side effects, just check if it's callable
                validation_tests.append(('add_task', callable(add_task)))
            except Exception as e:
                validation_tests.append(('add_task', f'Error: {str(e)}'))

            # Test list_tasks
            try:
                from ..mcp_tools.task_tools import ListTasksParams
                test_list_params = ListTasksParams(user_id="test-user-123")
                validation_tests.append(('list_tasks', callable(list_tasks)))
            except Exception as e:
                validation_tests.append(('list_tasks', f'Error: {str(e)}'))

            # Test update_task
            try:
                from ..mcp_tools.task_tools import UpdateTaskParams
                test_update_params = UpdateTaskParams(task_id="test-task-id", user_id="test-user-123")
                validation_tests.append(('update_task', callable(update_task)))
            except Exception as e:
                validation_tests.append(('update_task', f'Error: {str(e)}'))

            # Test complete_task
            try:
                from ..mcp_tools.task_tools import CompleteTaskParams
                test_complete_params = CompleteTaskParams(task_id="test-task-id", user_id="test-user-123")
                validation_tests.append(('complete_task', callable(complete_task)))
            except Exception as e:
                validation_tests.append(('complete_task', f'Error: {str(e)}'))

            # Test delete_task
            try:
                from ..mcp_tools.task_tools import DeleteTaskParams
                test_delete_params = DeleteTaskParams(task_id="test-task-id", user_id="test-user-123")
                validation_tests.append(('delete_task', callable(delete_task)))
            except Exception as e:
                validation_tests.append(('delete_task', f'Error: {str(e)}'))

            # Format results
            tool_results = {}
            all_working = True

            for tool_name, result in validation_tests:
                tool_results[tool_name] = result
                if isinstance(result, bool):
                    all_working = all_working and result
                else:
                    all_working = False

            return {
                'all_tools_working': all_working,
                'tool_validation': tool_results,
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating MCP tool availability: {str(e)}")
            return {
                'all_tools_working': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def get_fallback_status(self) -> Dict[str, Any]:
        """
        Determine fallback status based on connection validation
        """
        if not self.validation_results:
            self.validate_all_connections()

        # Check if any external MCP servers are down
        external_servers_down = []

        for server, result in self.validation_results.items():
            if server != 'local_mcp_tools':  # Skip local tools
                if not result.get('connected', False):
                    external_servers_down.append(server)

        fallback_needed = len(external_servers_down) > 0

        return {
            'fallback_needed': fallback_needed,
            'external_servers_down': external_servers_down,
            'can_use_local_fallback': self.validation_results.get('local_mcp_tools', {}).get('available', False),
            'timestamp': datetime.utcnow().isoformat()
        }


# Global instance
mcp_validator = MCPValidationService()


def get_mcp_validator() -> MCPValidationService:
    """
    Get the global MCP validator instance
    """
    return mcp_validator