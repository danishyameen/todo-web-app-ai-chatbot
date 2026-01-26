# Project Constitution: Todo AI Chatbot

## Core Principles
- Accuracy in task management and AI agent behavior
- Scalability and stateless architecture
- Reliability of AI responses through MCP tool usage
- User-friendly conversational interface

## Key Standards
- AI agents must follow specified tool-first design
- All actions must persist correctly in database
- Conversation history integrity must be maintained
- Frontend and backend integration must be seamless
- Error handling and confirmations must be consistent

## Constraints
- Stateless server architecture (no in-memory state)
- Support multi-user interactions
- Must use MCP server tools for all task operations
- Frontend to use ChatKit with domain security allowlist

## Success Criteria
- All natural language commands correctly mapped to MCP tools
- Conversation state persists correctly across sessions
- AI responses are accurate, actionable, and confirm user intent
- System handles errors gracefully without breaking workflow

## Architectural Requirements
- Conversation state must be persisted in Neon PostgreSQL database
- All user data must be properly isolated by user_id
- AI agent responses must be generated through MCP tool invocations
- System must support horizontal scaling without shared state
- Frontend must securely connect to backend APIs with proper authentication
- MCP tools must handle all task CRUD operations with proper error handling

## Quality Assurance Standards
- All user interactions must be validated and sanitized
- Error messages must be user-friendly and not expose internal details
- Tool responses must be formatted consistently for frontend consumption
- Confirmation flows must be implemented for destructive operations
- Rate limiting and security measures must be enforced at all system boundaries