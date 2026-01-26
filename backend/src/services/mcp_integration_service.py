"""
MCP Integration Service for Todo AI Chatbot
Connects to GitHub, Context7, and Vercel MCP servers
"""

import os
import requests
import json
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MCPServerConnector:
    """
    Connector class to interface with different MCP servers
    """

    def __init__(self):
        self.servers = {}

        # Initialize GitHub connector
        github_token = os.getenv('GITHUB_TOKEN')
        if github_token:
            self.servers['github'] = {
                'base_url': 'https://api.github.com',
                'headers': {
                    'Authorization': f'token {github_token}',
                    'Accept': 'application/vnd.github.v3+json'
                }
            }

        # Initialize Context7 connector
        context7_api_key = os.getenv('CONTEXT7_API_KEY')
        if context7_api_key:
            self.servers['context7'] = {
                'base_url': 'https://api.context7.com',
                'headers': {
                    'Authorization': f'Bearer {context7_api_key}',
                    'Content-Type': 'application/json'
                }
            }

        # Initialize Vercel connector
        vercel_token = os.getenv('VERCEL_TOKEN')
        if vercel_token:
            self.servers['vercel'] = {
                'base_url': 'https://api.vercel.com',
                'headers': {
                    'Authorization': f'Bearer {vercel_token}',
                    'Content-Type': 'application/json'
                }
            }

    def test_connection(self, server_name: str) -> bool:
        """
        Test connection to a specific MCP server
        """
        if server_name not in self.servers:
            logger.error(f"Server {server_name} not configured")
            return False

        server_config = self.servers[server_name]

        try:
            if server_name == 'github':
                # Test GitHub connection by getting user info
                response = requests.get(
                    f"{server_config['base_url']}/user",
                    headers=server_config['headers'],
                    timeout=10
                )
            elif server_name == 'context7':
                # Test Context7 connection - could be a health check endpoint
                response = requests.get(
                    f"{server_config['base_url']}/health",
                    headers=server_config['headers'],
                    timeout=10
                )
            elif server_name == 'vercel':
                # Test Vercel connection by getting user info
                response = requests.get(
                    f"{server_config['base_url']}/www/user",
                    headers=server_config['headers'],
                    timeout=10
                )
            else:
                logger.error(f"Unknown server type: {server_name}")
                return False

            success = response.status_code in [200, 201, 204]
            if success:
                logger.info(f"Successfully connected to {server_name}")
            else:
                logger.error(f"Failed to connect to {server_name}: {response.status_code}")

            return success

        except Exception as e:
            logger.error(f"Error connecting to {server_name}: {str(e)}")
            return False

    def execute_github_operation(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Optional[Dict]:
        """
        Execute a GitHub API operation
        """
        if 'github' not in self.servers:
            logger.error("GitHub server not configured")
            return None

        server_config = self.servers['github']

        try:
            url = f"{server_config['base_url']}{endpoint}"

            if method.upper() == 'GET':
                response = requests.get(url, headers=server_config['headers'])
            elif method.upper() == 'POST':
                response = requests.post(url, headers=server_config['headers'], json=data)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=server_config['headers'], json=data)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=server_config['headers'])
            else:
                logger.error(f"Unsupported method: {method}")
                return None

            if response.status_code in [200, 201, 204]:
                return response.json() if response.content else {}
            else:
                logger.error(f"GitHub operation failed: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Error executing GitHub operation: {str(e)}")
            return None

    def execute_context7_operation(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Optional[Dict]:
        """
        Execute a Context7 API operation
        """
        if 'context7' not in self.servers:
            logger.error("Context7 server not configured")
            return None

        server_config = self.servers['context7']

        try:
            url = f"{server_config['base_url']}{endpoint}"

            if method.upper() == 'GET':
                response = requests.get(url, headers=server_config['headers'])
            elif method.upper() == 'POST':
                response = requests.post(url, headers=server_config['headers'], json=data)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=server_config['headers'], json=data)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=server_config['headers'])
            else:
                logger.error(f"Unsupported method: {method}")
                return None

            if response.status_code in [200, 201, 204]:
                return response.json() if response.content else {}
            else:
                logger.error(f"Context7 operation failed: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Error executing Context7 operation: {str(e)}")
            return None

    def execute_vercel_operation(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Optional[Dict]:
        """
        Execute a Vercel API operation
        """
        if 'vercel' not in self.servers:
            logger.error("Vercel server not configured")
            return None

        server_config = self.servers['vercel']

        try:
            url = f"{server_config['base_url']}{endpoint}"

            if method.upper() == 'GET':
                response = requests.get(url, headers=server_config['headers'])
            elif method.upper() == 'POST':
                response = requests.post(url, headers=server_config['headers'], json=data)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=server_config['headers'], json=data)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=server_config['headers'])
            else:
                logger.error(f"Unsupported method: {method}")
                return None

            if response.status_code in [200, 201, 204]:
                return response.json() if response.content else {}
            else:
                logger.error(f"Vercel operation failed: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            logger.error(f"Error executing Vercel operation: {str(e)}")
            return None


class MCPIntegrationService:
    """
    Main service class to integrate MCP servers with the Todo AI Chatbot
    """

    def __init__(self):
        self.connector = MCPServerConnector()

        # Test all connections on initialization
        self.connected_servers = {}
        for server_name in ['github', 'context7', 'vercel']:
            self.connected_servers[server_name] = self.connector.test_connection(server_name)

        logger.info(f"MCP Integration initialized. Connected servers: {self.connected_servers}")

    def get_connected_servers(self) -> Dict[str, bool]:
        """
        Get status of all connected servers
        """
        return self.connected_servers

    def process_tool_request(self, server_name: str, tool_name: str, parameters: Dict[str, Any]) -> Optional[Dict]:
        """
        Process a tool request through the appropriate MCP server
        """
        if not self.connected_servers.get(server_name, False):
            logger.error(f"Server {server_name} is not connected")
            return None

        # Map tool names to appropriate operations
        if server_name == 'github':
            return self._handle_github_tool(tool_name, parameters)
        elif server_name == 'context7':
            return self._handle_context7_tool(tool_name, parameters)
        elif server_name == 'vercel':
            return self._handle_vercel_tool(tool_name, parameters)
        else:
            logger.error(f"Unknown server: {server_name}")
            return None

    def _handle_github_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Optional[Dict]:
        """
        Handle GitHub-specific tools
        """
        if tool_name == "get_repo_info":
            owner = parameters.get("owner")
            repo = parameters.get("repo")
            if owner and repo:
                return self.connector.execute_github_operation(f"/repos/{owner}/{repo}")
        elif tool_name == "list_user_repos":
            return self.connector.execute_github_operation("/user/repos")
        elif tool_name == "create_issue":
            owner = parameters.get("owner")
            repo = parameters.get("repo")
            title = parameters.get("title")
            body = parameters.get("body", "")
            if owner and repo and title:
                data = {"title": title, "body": body}
                return self.connector.execute_github_operation(f"/repos/{owner}/{repo}/issues", "POST", data)

        logger.error(f"Unknown GitHub tool: {tool_name}")
        return None

    def _handle_context7_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Optional[Dict]:
        """
        Handle Context7-specific tools
        """
        if tool_name == "search_docs":
            query = parameters.get("query")
            library = parameters.get("library", "")
            if query:
                endpoint = f"/libraries/{library}/search" if library else "/search"
                data = {"query": query}
                return self.connector.execute_context7_operation(endpoint, "POST", data)
        elif tool_name == "get_library_info":
            library = parameters.get("library")
            if library:
                return self.connector.execute_context7_operation(f"/libraries/{library}")

        logger.error(f"Unknown Context7 tool: {tool_name}")
        return None

    def _handle_vercel_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Optional[Dict]:
        """
        Handle Vercel-specific tools
        """
        if tool_name == "get_deployments":
            project_name = parameters.get("project_name")
            if project_name:
                return self.connector.execute_vercel_operation(f"/v13/deployments?project={project_name}")
        elif tool_name == "create_deployment":
            project_name = parameters.get("project_name")
            files = parameters.get("files", {})
            if project_name and files:
                data = {"files": files, "project": project_name}
                return self.connector.execute_vercel_operation("/v13/deployments", "POST", data)

        logger.error(f"Unknown Vercel tool: {tool_name}")
        return None


# Global instance
mcp_service = MCPIntegrationService()


def get_mcp_service() -> MCPIntegrationService:
    """
    Get the global MCP integration service instance
    """
    return mcp_service