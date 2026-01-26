"""
MCP Server Settings Configuration
"""

import os
from typing import Dict, Any, Optional


class MCPServerSettings:
    """
    Configuration class for MCP servers
    """

    def __init__(self):
        # GitHub Configuration
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.github_enabled = bool(self.github_token)

        # Context7 Configuration
        self.context7_api_key = os.getenv('CONTEXT7_API_KEY')
        self.context7_enabled = bool(self.context7_api_key)

        # Vercel Configuration
        self.vercel_token = os.getenv('VERCEL_TOKEN')
        self.vercel_enabled = bool(self.vercel_token)

    def get_server_configs(self) -> Dict[str, Dict[str, Any]]:
        """
        Get configuration for all enabled servers
        """
        configs = {}

        if self.github_enabled:
            configs['github'] = {
                'enabled': True,
                'base_url': 'https://api.github.com',
                'token': self.github_token,
                'headers': {
                    'Authorization': f'token {self.github_token}',
                    'Accept': 'application/vnd.github.v3+json'
                }
            }

        if self.context7_enabled:
            configs['context7'] = {
                'enabled': True,
                'base_url': 'https://api.context7.com',
                'api_key': self.context7_api_key,
                'headers': {
                    'Authorization': f'Bearer {self.context7_api_key}',
                    'Content-Type': 'application/json'
                }
            }

        if self.vercel_enabled:
            configs['vercel'] = {
                'enabled': True,
                'base_url': 'https://api.vercel.com',
                'token': self.vercel_token,
                'headers': {
                    'Authorization': f'Bearer {self.vercel_token}',
                    'Content-Type': 'application/json'
                }
            }

        return configs

    def is_server_enabled(self, server_name: str) -> bool:
        """
        Check if a specific server is enabled
        """
        if server_name == 'github':
            return self.github_enabled
        elif server_name == 'context7':
            return self.context7_enabled
        elif server_name == 'vercel':
            return self.vercel_enabled
        else:
            return False

    def get_token(self, server_name: str) -> Optional[str]:
        """
        Get token for a specific server
        """
        if server_name == 'github':
            return self.github_token
        elif server_name == 'context7':
            return self.context7_api_key
        elif server_name == 'vercel':
            return self.vercel_token
        else:
            return None


# Global settings instance
mcp_settings = MCPServerSettings()


def get_mcp_settings() -> MCPServerSettings:
    """
    Get the global MCP settings instance
    """
    return mcp_settings