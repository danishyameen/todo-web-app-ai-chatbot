"""
Agent and Skill Activation Service for Todo AI Chatbot
Activates all required backend agents and skills
"""

import logging
from typing import Dict, Any, List
from datetime import datetime

from .mcp_validation_service import get_mcp_validator
from .agent_activation_service import get_agent_activator
from .skill_activation_service import get_skill_activator
from .ai_agent_service import AIAgentService
from .mcp_integration_service import get_mcp_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentSkillActivationService:
    """
    Service to activate all required backend agents and skills
    """

    def __init__(self):
        self.activation_results = {}
        self.last_activation_time = None

        # Initialize all required services
        self.mcp_validator = get_mcp_validator()
        self.agent_activator = get_agent_activator()
        self.skill_activator = get_skill_activator()
        self.ai_agent_service = AIAgentService()
        self.mcp_service = get_mcp_service()

    def activate_all_agents_and_skills(self) -> Dict[str, Any]:
        """
        Activate all required backend agents and skills
        """
        logger.info("Starting activation of all backend agents and skills...")

        results = {}

        # Activate backend agents
        results['agents'] = self._activate_backend_agents()

        # Activate backend skills
        results['skills'] = self._activate_backend_skills()

        # Validate MCP server connection
        results['mcp_server'] = self._validate_mcp_server()

        # Validate AI agent integration
        results['ai_agent_integration'] = self._validate_ai_agent_integration()

        self.activation_results = results
        self.last_activation_time = datetime.utcnow()

        logger.info(f"All agents and skills activation completed: {results}")
        return results

    def _activate_backend_agents(self) -> Dict[str, Any]:
        """
        Activate all required backend agents
        """
        logger.info("Activating backend agents...")

        # Activate all agents
        agent_results = self.agent_activator.activate_all_agents()

        # Check overall status
        all_active = all(status for status in agent_results.values())

        return {
            'activated': all_active,
            'individual_results': agent_results,
            'total_agents': len(agent_results),
            'active_agents': sum(1 for status in agent_results.values() if status),
            'timestamp': datetime.utcnow().isoformat()
        }

    def _activate_backend_skills(self) -> Dict[str, Any]:
        """
        Activate all required backend skills
        """
        logger.info("Activating backend skills...")

        # Activate all skills
        skill_results = self.skill_activator.activate_all_skills()

        # Check overall status
        all_active = all(status for status in skill_results.values())

        return {
            'activated': all_active,
            'individual_results': skill_results,
            'total_skills': len(skill_results),
            'active_skills': sum(1 for status in skill_results.values() if status),
            'timestamp': datetime.utcnow().isoformat()
        }

    def _validate_mcp_server(self) -> Dict[str, Any]:
        """
        Validate MCP server connection
        """
        logger.info("Validating MCP server connection...")

        # Validate all connections
        connection_results = self.mcp_validator.validate_all_connections()

        # Check if all connections are successful
        all_connected = all(
            result.get('connected', False)
            for name, result in connection_results.items()
            if name != 'local_mcp_tools'  # Exclude local tools from connection check
        )

        return {
            'connected': all_connected,
            'connection_results': connection_results,
            'timestamp': datetime.utcnow().isoformat()
        }

    def _validate_ai_agent_integration(self) -> Dict[str, Any]:
        """
        Validate AI agent integration with MCP tools
        """
        logger.info("Validating AI agent integration...")

        try:
            # Validate MCP tool availability
            tool_validation = self.mcp_validator.validate_mcp_tool_availability()

            # The AI agent service should be initialized
            ai_agent_ready = self.ai_agent_service is not None

            # Check if all required tools are available
            all_tools_available = tool_validation.get('all_tools_working', False)

            return {
                'integrated': ai_agent_ready and all_tools_available,
                'ai_agent_ready': ai_agent_ready,
                'mcp_tools_available': all_tools_available,
                'tool_validation': tool_validation,
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error validating AI agent integration: {str(e)}")
            return {
                'integrated': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    def get_activation_summary(self) -> Dict[str, Any]:
        """
        Get summary of all activations
        """
        if not self.activation_results:
            self.activate_all_agents_and_skills()

        agents = self.activation_results.get('agents', {})
        skills = self.activation_results.get('skills', {})
        mcp = self.activation_results.get('mcp_server', {})
        ai_agent = self.activation_results.get('ai_agent_integration', {})

        return {
            'overall_status': (
                agents.get('activated', False) and
                skills.get('activated', False) and
                mcp.get('connected', False) and
                ai_agent.get('integrated', False)
            ),
            'agents': agents,
            'skills': skills,
            'mcp_server': mcp,
            'ai_agent_integration': ai_agent,
            'timestamp': self.last_activation_time.isoformat() if self.last_activation_time else None
        }

    def is_fully_activated(self) -> bool:
        """
        Check if all agents and skills are fully activated
        """
        summary = self.get_activation_summary()
        return summary.get('overall_status', False)


# Global instance
agent_skill_activator = AgentSkillActivationService()


def get_agent_skill_activator() -> AgentSkillActivationService:
    """
    Get the global agent and skill activator instance
    """
    return agent_skill_activator