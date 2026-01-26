---
name: "openai-agents-sdk-integration"
description: "Design comprehensive OpenAI Agents SDK integrations with detailed tool specifications, orchestration patterns, error handling, and deployment strategies. Use when user asks to design, architect, or implement OpenAI Agents SDK systems."
---

# OpenAI Agents SDK Integration Skill

## When to Use This Skill

- User asks to "integrate OpenAI Agents SDK" or "implement AI agent orchestration"
- User mentions agent tools, function calling, or agent workflows
- User needs help creating comprehensive OpenAI agent implementations
- User wants to implement AI assistants with custom tools and capabilities
- User requests detailed technical architecture for agent-based systems
- User needs help with tool design, orchestration, or response handling

## Procedure

1. **Understand requirements**: Clarify agent purpose, tools, and interaction patterns
2. **Create tool specifications**: Define parameters, validation rules, and error cases
3. **Design orchestration**: Plan agent workflows and decision logic
4. **Define implementation plan**: Break down features into testable tasks
5. **Validate design**: Check for reliability, safety, and performance

## Output Format

**Integration Overview**: 2-3 sentence summary of the OpenAI Agents SDK integration
**Agent Architecture**: Detailed breakdown of agent components and their responsibilities
**Tool Specifications**: Comprehensive tool definitions with parameters and schemas
**Orchestration Logic**: Decision patterns and workflow management strategies
**Error Handling**: Comprehensive error management and recovery strategies
**Safety Measures**: Guardrails, validation, and security considerations
**Implementation Guidelines**: Technical recommendations for building the system
**Validation Strategy**: How to verify agent correctness and safety

## Quality Criteria

- Tools: Well-defined, validated, with clear parameters and error handling
- Orchestration: Robust decision logic with proper fallbacks and safety checks
- Safety: Comprehensive guardrails and validation to prevent harmful outputs
- Performance: Efficient tool calling and response generation
- Reliability: Proper error handling and graceful degradation
- Security: Input validation, access controls, and data protection
- Documentation: Clear, comprehensive, and accessible to implementers

## Detailed Design Process

### Phase 1: Requirements and Agent Purpose
- Identify core agent functionality and user interactions
- Define functional requirements (tools, responses, workflows)
- Define non-functional requirements (safety, performance, reliability)
- Specify system constraints and integration requirements
- Document assumptions about user behavior and usage patterns

### Phase 2: Tool Design and Specifications
- Design comprehensive tool specifications with JSON schemas
- Define input parameters with validation rules and descriptions
- Plan for required vs optional parameters
- Design error response formats and codes
- Consider tool dependencies and chaining possibilities

### Phase 3: Agent Orchestration
- Design decision logic for tool selection and chaining
- Plan for multi-step reasoning and complex workflows
- Define conversation flow and context management
- Plan for user confirmation and safety checks
- Design fallback strategies for tool failures

### Phase 4: Safety and Validation
- Implement comprehensive input validation and sanitization
- Design guardrails for preventing harmful tool usage
- Plan for rate limiting and abuse prevention
- Define data privacy and compliance measures
- Create audit logging and monitoring systems

### Phase 5: Implementation Architecture
- Choose appropriate OpenAI client and SDK versions
- Design asynchronous processing patterns
- Plan for caching and performance optimization
- Define monitoring and observability strategies
- Plan for deployment and operational considerations

### Phase 6: Testing and Validation
- Create comprehensive test suites for tools and workflows
- Plan for safety testing and red-teaming exercises
- Design performance and load testing scenarios
- Implement validation for response quality and accuracy
- Create monitoring for ongoing safety and performance

## Example

**Input**: "Help me design an OpenAI Agents SDK integration for a task management assistant"

**Output**:
- **Integration Overview**: An OpenAI agent-based task management assistant that can create, list, update, and delete tasks through natural language interaction. The system implements custom tools for task operations with comprehensive safety measures and user confirmation flows.

- **Agent Architecture**:
  1. **Agent Controller**: Manages agent lifecycle and configuration
  2. **Tool Registry**: Registers and manages custom task management tools
  3. **Task Service**: Implements core task CRUD operations
  4. **User Context Manager**: Maintains conversation context and state
  5. **Safety Validator**: Validates inputs and prevents harmful actions
  6. **Confirmation Handler**: Manages user confirmations for destructive actions
  7. **Response Formatter**: Formats agent responses for user consumption
  8. **Audit Logger**: Logs all agent interactions and tool calls

- **Tool Specifications**:
  - `create_task`:
    - Parameters: `{title: string, description?: string, due_date?: string, priority?: "low"|"medium"|"high"}`
    - Returns: `{success: boolean, task_id: string, message: string}`
    - Error cases: `VALIDATION_ERROR`, `PERMISSION_DENIED`
  - `list_tasks`:
    - Parameters: `{status?: "all"|"pending"|"completed", limit?: number, sort_by?: "created"|"due_date"}`
    - Returns: `{tasks: Array<{id, title, status, created_at, due_date}>}`
    - Error cases: `PERMISSION_DENIED`
  - `update_task`:
    - Parameters: `{task_id: string, updates: {title?: string, description?: string, due_date?: string, status?: "pending"|"completed"}}`
    - Returns: `{success: boolean, message: string}`
    - Error cases: `TASK_NOT_FOUND`, `VALIDATION_ERROR`, `PERMISSION_DENIED`
  - `delete_task`:
    - Parameters: `{task_id: string}`
    - Returns: `{success: boolean, message: string}`
    - Error cases: `TASK_NOT_FOUND`, `PERMISSION_DENIED`

- **Orchestration Logic**:
  - Intent detection: Parse user input for task management intent
  - Tool selection: Match intent to appropriate tool with parameter extraction
  - Multi-step handling: Chain tools for complex operations (e.g., create then list)
  - Context awareness: Maintain conversation context for follow-up questions
  - Confirmation flows: Require user confirmation for destructive operations

- **Error Handling**:
  - Tool errors: Catch and format tool execution errors appropriately
  - Validation errors: Provide specific error messages for parameter validation
  - Network errors: Implement retry logic with exponential backoff
  - Rate limiting: Handle API rate limits gracefully with queueing
  - Fallback responses: Provide helpful responses when tools fail

- **Safety Measures**:
  - Input sanitization: Clean and validate all user inputs
  - Permission checks: Ensure users can only access their own tasks
  - Action confirmation: Require confirmation for destructive operations
  - Rate limiting: Prevent abuse through request throttling
  - Content filtering: Block potentially harmful or inappropriate requests

- **Implementation Guidelines**:
  - SDK: OpenAI Python SDK v1.0+ with async support
  - Framework: FastAPI for API endpoints with proper async handling
  - Database: PostgreSQL for task persistence with proper indexing
  - Authentication: JWT tokens for user identification and authorization
  - Caching: Redis for session management and rate limiting
  - Monitoring: Structured logging with correlation IDs

- **Validation Strategy**:
  - Unit tests for individual tools (target 95% coverage)
  - Integration tests for agent workflows and tool chains
  - Safety tests for malicious input handling and security measures
  - Performance tests for response times under load
  - End-to-end tests for complete user interaction flows
  - Red-team exercises for identifying potential vulnerabilities