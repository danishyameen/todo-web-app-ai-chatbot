---
name: "mcp-tool-design"
description: "Design comprehensive Model Control Plane (MCP) tools with detailed specifications, interfaces, validation rules, and implementation guidelines. Use when user asks to design, architect, or plan MCP tools and server implementations."
---

# MCP Tool Design Skill

## When to Use This Skill

- User asks to "design an MCP tool" or "create a model control plane server"
- User mentions tool specifications, API contracts, or server implementations
- User needs help creating comprehensive MCP tool designs
- User wants to implement tools following MCP server specifications
- User requests detailed technical architecture for MCP tools
- User needs help with tool signatures, parameters, or response formats

## Procedure

1. **Understand requirements**: Clarify tool purpose, inputs, outputs, and constraints
2. **Create tool specification**: Define parameters, validation rules, and error cases
3. **Design interfaces**: Specify input/output contracts and data schemas
4. **Define implementation plan**: Break down tool creation into testable tasks
5. **Validate design**: Check for completeness, security, and usability

## Output Format

**Tool Overview**: 2-3 sentence summary of the MCP tool
**Purpose and Responsibility**: Primary function and responsibilities of the tool
**Input Parameters**: Detailed parameter specifications with types, validation, and descriptions
**Output Schema**: Expected response structure and data format
**Error Cases**: Potential error scenarios and their responses
**Implementation Guidelines**: Technical recommendations for implementation
**Security Considerations**: Authentication, authorization, and data protection requirements
**Validation Strategy**: How to verify tool correctness and behavior

## Quality Criteria

- Specifications: Complete, unambiguous, and testable parameters
- Interfaces: Follows MCP standards, clear contracts, proper error handling
- Parameters: Well-typed, validated, with clear required/optional distinctions
- Responses: Consistent format, meaningful data, proper error reporting
- Security: Proper authentication, input sanitization, and access controls
- Documentation: Clear, comprehensive, and accessible to implementers

## Detailed Design Process

### Phase 1: Tool Purpose and Requirements
- Identify core functionality and user intent
- Define primary responsibility and scope
- Specify functional requirements (what the tool must do)
- Define non-functional requirements (performance, reliability, security)
- Document constraints and dependencies

### Phase 2: Parameter Design
- Define all input parameters with types and validation rules
- Specify required vs optional parameters
- Create parameter descriptions and usage examples
- Design validation schemas and error messages
- Plan for extensibility and future parameter additions

### Phase 3: Response Schema Design
- Define output data structure and format
- Specify success response format with all fields
- Design error response format with codes and messages
- Plan for metadata and contextual information
- Ensure consistency with other MCP tools

### Phase 4: Error Case Analysis
- Identify all potential failure scenarios
- Define appropriate error codes and messages
- Plan for graceful degradation and fallbacks
- Consider user-friendly error messages
- Design debugging and diagnostic information

### Phase 5: Implementation Guidelines
- Recommend technology stack and frameworks
- Provide code structure and organization patterns
- Suggest testing strategies and validation approaches
- Outline deployment and operational considerations
- Include performance and scalability recommendations

### Phase 6: Security and Validation
- Define authentication and authorization requirements
- Specify input sanitization and validation rules
- Plan for audit logging and monitoring
- Address data privacy and compliance requirements
- Create comprehensive test scenarios

## Example

**Input**: "Help me design an MCP tool for managing user profiles in an AI application"

**Output**:
- **Tool Overview**: A comprehensive user profile management tool that enables creation, retrieval, updating, and deletion of user profiles in an AI application. The tool handles profile data validation, privacy compliance, and integration with authentication systems.

- **Purpose and Responsibility**:
  - Primary function: Manage complete user profile lifecycle
  - Secondary functions: Validate profile data, enforce privacy rules, handle profile associations
  - Integration: Works with authentication systems and AI model personalization

- **Input Parameters**:
  - `user_id` (string, required): Unique identifier for the user
    - Validation: UUID format, must exist in system
    - Example: "123e4567-e89b-12d3-a456-426614174000"
  - `profile_data` (object, required): User profile information
    - `name` (string, required): Full name, max 100 chars
    - `email` (string, required): Valid email format
    - `preferences` (object, optional): User preferences and settings
    - `metadata` (object, optional): Additional profile attributes
  - `action` (string, required): Operation to perform ("create", "read", "update", "delete")
    - Validation: Must be one of allowed values

- **Output Schema**:
  - Success response:
    ```json
    {
      "success": true,
      "data": {
        "user_id": "string",
        "profile": {
          "name": "string",
          "email": "string",
          "preferences": {},
          "created_at": "timestamp",
          "updated_at": "timestamp"
        },
        "action": "string"
      },
      "timestamp": "ISO8601 timestamp"
    }
    ```
  - Error response:
    ```json
    {
      "success": false,
      "error": {
        "code": "string",
        "message": "string",
        "details": {}
      },
      "timestamp": "ISO8601 timestamp"
    }
    ```

- **Error Cases**:
  - `INVALID_USER_ID`: User ID format is invalid
  - `USER_NOT_FOUND`: Specified user does not exist
  - `PROFILE_VALIDATION_ERROR`: Profile data fails validation
  - `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
  - `DUPLICATE_PROFILE`: Profile already exists for user
  - `INTERNAL_ERROR`: Unexpected server error occurred

- **Implementation Guidelines**:
  - Technology: Python with FastAPI for server implementation
  - Database: PostgreSQL with proper indexing on user_id
  - Validation: Pydantic models for request/response validation
  - Authentication: JWT token validation with role-based access
  - Caching: Redis for frequently accessed profiles
  - Logging: Structured logging with correlation IDs

- **Security Considerations**:
  - Authentication: Verify valid JWT token with appropriate scopes
  - Authorization: Ensure user can only access their own profile
  - Data Privacy: Encrypt sensitive profile data at rest
  - Input Validation: Sanitize all inputs to prevent injection
  - Audit Trail: Log all profile access and modifications
  - Rate Limiting: Prevent abuse and brute force attempts

- **Validation Strategy**:
  - Unit tests for parameter validation logic
  - Integration tests for database operations
  - Security tests for authentication and authorization
  - Performance tests for response times under load
  - End-to-end tests for complete user workflows
  - Compliance tests for data privacy regulations