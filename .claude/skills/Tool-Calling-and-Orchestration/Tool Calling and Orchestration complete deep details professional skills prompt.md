---
name: "tool-calling-orchestration"
description: "Design comprehensive tool calling and orchestration systems with detailed decision logic, multi-tool chaining, error handling, and safety measures. Use when user asks to design, architect, or implement intelligent tool orchestration systems."
---

# Tool Calling and Orchestration Skill

## When to Use This Skill

- User asks to "design tool orchestration" or "implement intelligent tool calling"
- User mentions multi-tool workflows, decision trees, or tool chaining
- User needs help creating comprehensive tool orchestration systems
- User wants to implement AI systems with multiple integrated tools
- User requests detailed technical architecture for intelligent tool systems
- User needs help with tool selection, sequencing, or error handling

## Procedure

1. **Understand requirements**: Clarify tool ecosystem, user goals, and orchestration needs
2. **Create orchestration logic**: Define decision patterns and tool selection criteria
3. **Design multi-tool workflows**: Plan for tool chaining and complex sequences
4. **Define implementation plan**: Break down orchestration features into tasks
5. **Validate design**: Check for reliability, safety, and efficiency

## Output Format

**Orchestration Overview**: 2-3 sentence summary of the tool calling and orchestration system
**Decision Logic**: Detailed breakdown of how tools are selected and sequenced
**Multi-Tool Workflows**: Complex sequences and chaining patterns for tool execution
**Error Handling**: Comprehensive error management and recovery strategies
**Safety Measures**: Guardrails, validation, and safety considerations
**Performance Optimization**: Efficiency and optimization strategies
**Implementation Guidelines**: Technical recommendations for building the system
**Validation Strategy**: How to verify orchestration correctness and safety

## Quality Criteria

- Decision Logic: Clear, deterministic rules for tool selection with fallbacks
- Multi-Tool Workflows: Robust chaining with proper data flow between tools
- Error Handling: Comprehensive error management with graceful degradation
- Safety: Proper validation and guardrails to prevent harmful tool usage
- Performance: Efficient tool selection and execution without unnecessary overhead
- Reliability: Proper error handling and recovery mechanisms
- Documentation: Clear, comprehensive, and accessible to implementers

## Detailed Design Process

### Phase 1: Requirements and Tool Ecosystem
- Identify available tools and their capabilities
- Define user goals and required tool combinations
- Specify functional requirements (tool selection, chaining, sequencing)
- Define non-functional requirements (performance, safety, reliability)
- Document constraints and dependencies between tools

### Phase 2: Decision Logic Design
- Design intent detection algorithms for tool selection
- Create decision trees for tool selection based on context
- Plan for confidence scoring and fallback mechanisms
- Define criteria for tool chaining and sequential execution
- Design context awareness for multi-turn interactions

### Phase 3: Multi-Tool Workflow Design
- Design data flow patterns between chained tools
- Plan for intermediate result handling and transformation
- Define termination conditions for multi-step workflows
- Create loop detection and prevention mechanisms
- Plan for parallel tool execution where appropriate

### Phase 4: Error Handling and Resilience
- Design comprehensive error categorization and handling
- Plan for tool failure recovery and alternative pathways
- Create timeout and retry mechanisms
- Design circuit breaker patterns for unreliable tools
- Plan for graceful degradation when tools are unavailable

### Phase 5: Safety and Validation
- Implement input validation for tool parameters
- Design permission systems for tool access
- Create audit trails for tool usage and decisions
- Plan for rate limiting and abuse prevention
- Design content filtering and safety checks

### Phase 6: Implementation and Optimization
- Recommend technology stack and frameworks
- Provide code structure and organization patterns
- Suggest testing strategies and validation approaches
- Outline performance optimization techniques
- Include monitoring and observability recommendations

## Example

**Input**: "Help me design a tool calling and orchestration system for an AI assistant that manages tasks, calendar, and emails"

**Output**:
- **Orchestration Overview**: An intelligent tool orchestration system that coordinates between task management, calendar scheduling, and email communication tools based on natural language user requests. The system implements sophisticated decision logic to select appropriate tools, chain operations, and handle complex multi-step workflows safely and efficiently.

- **Decision Logic**:
  - **Intent Classification**: Uses NLP to classify user intent into categories (task management, scheduling, communication)
  - **Tool Selection Algorithm**:
    - Extract entities (dates, people, task details) from user input
    - Match intent to available tool categories
    - Apply confidence scoring to select best tool combination
    - Fall back to alternative tools if primary selection fails
  - **Context Awareness**: Maintains conversation context to inform tool selection
  - **Permission Checking**: Validates user permissions before tool execution

- **Multi-Tool Workflows**:
  - **Schedule Meeting Workflow**:
    1. Parse meeting request (attendees, time, duration, topic)
    2. Call calendar tool to check availability
    3. Call email tool to send invitations
    4. Call task tool to create follow-up tasks
    5. Return confirmation with all details
  - **Project Status Workflow**:
    1. Parse status request for specific project
    2. Call task tool to retrieve project tasks
    3. Call calendar tool for upcoming deadlines
    4. Call email tool to notify stakeholders
    5. Return consolidated status report
  - **Daily Planning Workflow**:
    1. Parse daily planning request
    2. Call calendar tool for existing commitments
    3. Call task tool for pending tasks
    4. Suggest optimal scheduling based on priorities
    5. Execute user-approved changes

- **Error Handling**:
  - **Tool Failure Recovery**: If calendar tool fails, suggest alternative times or manual scheduling
  - **Partial Success**: If one tool in a chain fails, complete successful operations and report partial results
  - **Timeout Management**: Implement configurable timeouts for each tool with retry logic
  - **Rate Limiting**: Handle API rate limits by queuing requests and implementing backpressure
  - **Circuit Breakers**: Temporarily disable failing tools to prevent cascading failures

- **Safety Measures**:
  - **Input Validation**: Sanitize all user inputs before passing to tools
  - **Permission Validation**: Ensure users can only access their own data
  - **Action Confirmation**: Require confirmation for destructive operations (deleting events, sending bulk emails)
  - **Content Filtering**: Validate email content and task descriptions for appropriateness
  - **Audit Logging**: Log all tool calls and user actions for compliance and debugging

- **Performance Optimization**:
  - **Caching**: Cache frequently accessed calendar data and user preferences
  - **Parallel Execution**: Execute independent tools in parallel when possible
  - **Batch Operations**: Combine multiple similar operations into single API calls
  - **Connection Pooling**: Maintain pooled connections to external services
  - **Async Processing**: Use asynchronous patterns for long-running operations

- **Implementation Guidelines**:
  - **Architecture**: Event-driven architecture with message queues for tool orchestration
  - **Framework**: Python with asyncio for concurrent tool execution
  - **Orchestration Engine**: Custom workflow engine with plugin architecture for tools
  - **Monitoring**: OpenTelemetry for distributed tracing and metrics
  - **Configuration**: YAML-based configuration for tool settings and orchestration rules
  - **Testing**: Comprehensive mock-based testing for tool interactions

- **Validation Strategy**:
  - Unit tests for individual tool adapters (target 95% coverage)
  - Integration tests for tool orchestration workflows
  - Chaos engineering tests for failure scenarios and resilience
  - Performance tests for multi-tool workflow execution times
  - Safety tests for malicious input handling and permission enforcement
  - End-to-end tests for complete user interaction flows