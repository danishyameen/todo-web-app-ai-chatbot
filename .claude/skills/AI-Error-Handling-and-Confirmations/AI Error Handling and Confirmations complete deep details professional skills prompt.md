---
name: "ai-error-handling-confirmations"
description: "Design comprehensive AI error handling and confirmation systems with detailed error categorization, user feedback mechanisms, and safety measures. Use when user asks to design, architect, or implement robust AI interaction systems with proper error management."
---

# AI Error Handling and Confirmations Skill

## When to Use This Skill

- User asks to "design AI error handling" or "implement confirmation flows"
- User mentions error recovery, user safety, or AI reliability
- User needs help creating comprehensive AI interaction safeguards
- User wants to implement safe AI systems with proper validation
- User requests detailed technical architecture for error management
- User needs help with destructive action confirmations or safety checks

## Procedure

1. **Understand requirements**: Clarify error scenarios, safety needs, and confirmation requirements
2. **Create error taxonomy**: Define comprehensive error categories and handling strategies
3. **Design confirmation flows**: Plan for user validation and safety checks
4. **Define implementation plan**: Break down error handling features into testable tasks
5. **Validate design**: Check for safety, reliability, and user experience

## Output Format

**System Overview**: 2-3 sentence summary of the AI error handling and confirmation system
**Error Taxonomy**: Detailed breakdown of error categories and their handling strategies
**Confirmation Flows**: User validation patterns for critical actions and safety checks
**Recovery Mechanisms**: Error recovery and fallback strategies
**Safety Measures**: Protection mechanisms and risk mitigation strategies
**User Experience**: Feedback patterns and communication strategies
**Implementation Guidelines**: Technical recommendations for building the system
**Validation Strategy**: How to verify error handling correctness and safety

## Quality Criteria

- Error Coverage: Comprehensive handling of all possible error scenarios
- Safety: Robust confirmation flows for destructive or irreversible actions
- User Experience: Clear, helpful error messages without technical jargon
- Recovery: Effective fallback mechanisms and graceful degradation
- Performance: Minimal impact on normal operation while providing safety
- Reliability: Consistent error handling across all system components
- Documentation: Clear, comprehensive, and accessible to implementers

## Detailed Design Process

### Phase 1: Requirements and Risk Analysis
- Identify potential error scenarios and failure modes
- Define safety requirements and critical action categories
- Specify functional requirements (error detection, handling, reporting)
- Define non-functional requirements (reliability, safety, user experience)
- Document risk levels and mitigation priorities

### Phase 2: Error Taxonomy Design
- Categorize errors by severity (info, warning, error, critical)
- Define error types (validation, network, business logic, security)
- Plan for error correlation and grouping strategies
- Design error metadata and context capture
- Consider error aggregation and trending analysis

### Phase 3: Confirmation Flow Design
- Identify actions requiring user confirmation
- Design confirmation patterns for different risk levels
- Plan for escalation strategies for high-risk actions
- Create preview and undo capabilities where possible
- Design progressive disclosure for complex confirmations

### Phase 4: Recovery Mechanism Design
- Plan for automatic recovery where appropriate
- Design fallback strategies for different error types
- Create circuit breaker patterns for unstable services
- Plan for retry logic with exponential backoff
- Design rollback mechanisms for failed operations

### Phase 5: Safety and Validation
- Implement input validation and sanitization
- Design permission and access control checks
- Create audit trails for critical actions
- Plan for rate limiting and abuse prevention
- Design content filtering and safety checks

### Phase 6: Implementation and Validation
- Recommend technology stack and frameworks
- Provide code structure and organization patterns
- Suggest error simulation and testing strategies
- Outline monitoring and alerting recommendations
- Include user feedback and iteration strategies

## Example

**Input**: "Help me design an AI error handling and confirmation system for a task management assistant"

**Output**:
- **System Overview**: A comprehensive error handling and confirmation system for an AI task management assistant that provides safety checks for destructive actions, clear error messages for failures, and recovery mechanisms for system issues. The system implements progressive confirmation flows and intelligent error categorization.

- **Error Taxonomy**:
  - **Validation Errors** (`validation_error`): Invalid input parameters, malformed requests
    - Handling: Return specific error messages with expected format
    - Examples: Invalid date format, missing required fields, invalid priority values
  - **Business Logic Errors** (`business_error`): Violation of business rules
    - Handling: Explain why action is not allowed and suggest alternatives
    - Examples: Attempting to delete non-existent task, modifying completed task
  - **Network/Service Errors** (`service_error`): External API failures, timeouts
    - Handling: Inform user of temporary issue, offer retry or alternative
    - Examples: Calendar API unavailable, email service timeout
  - **Security Errors** (`security_error`): Unauthorized access attempts
    - Handling: Generic error message, log security incident
    - Examples: Accessing another user's tasks, unauthorized actions
  - **System Errors** (`system_error`): Internal system failures
    - Handling: Apologize and suggest trying again later
    - Examples: Database connection failure, unexpected exceptions

- **Confirmation Flows**:
  - **High-Risk Actions** (Task Deletion):
    - Preview: "You're about to delete task 'Complete project proposal'"
    - Confirmation: "Are you sure? This cannot be undone."
    - Options: "Yes, delete" / "Cancel"
  - **Medium-Risk Actions** (Bulk Updates):
    - Preview: "Update 5 tasks to 'completed' status?"
    - Confirmation: "This will affect multiple items."
    - Options: "Proceed" / "Review items" / "Cancel"
  - **Informational Safeguards** (Sensitive Operations):
    - Warning: "This action will share your tasks with others."
    - Acknowledgment: "I understand and confirm."

- **Recovery Mechanisms**:
  - **Automatic Retry**: Network errors with exponential backoff (1s, 2s, 4s)
  - **Graceful Degradation**: Fallback to cached data when services unavailable
  - **Circuit Breaker**: Temporarily disable failing services to prevent cascade
  - **Fallback Actions**: Alternative methods when primary service fails
  - **User Notification**: Clear communication about temporary limitations

- **Safety Measures**:
  - **Input Validation**: Sanitize all user inputs and validate against schemas
  - **Permission Checks**: Verify user can access requested resources
  - **Rate Limiting**: Prevent abuse through request throttling
  - **Content Filtering**: Block potentially harmful or inappropriate requests
  - **Audit Logging**: Log all critical actions and error occurrences

- **User Experience**:
  - **Clear Messaging**: Plain language explanations without technical jargon
  - **Actionable Guidance**: Specific steps users can take to resolve issues
  - **Progressive Disclosure**: Show relevant information without overwhelming
  - **Consistent Patterns**: Same error handling approach across all features
  - **Empathy**: Acknowledge user frustration and apologize appropriately

- **Implementation Guidelines**:
  - **Architecture**: Centralized error handling middleware with decorators
  - **Framework**: Custom error classes extending base exception types
  - **Logging**: Structured logging with correlation IDs for tracing
  - **Monitoring**: Error rate tracking and alerting for anomalies
  - **Testing**: Chaos engineering to test error handling resilience
  - **Documentation**: Comprehensive error code reference for developers

- **Validation Strategy**:
  - Unit tests for individual error handlers (target 95% coverage)
  - Integration tests for confirmation flow end-to-end scenarios
  - Chaos tests for error recovery and fallback mechanisms
  - Usability tests for confirmation flow effectiveness
  - Security tests for error information leakage
  - Performance tests for error handling overhead impact