---
name: "spec-driven-ai-design"
description: "Design comprehensive AI systems using spec-driven methodology with detailed architecture, implementation plans, and validation. Use when user asks to design, architect, or plan AI systems with proper specifications."
---

# Spec-Driven AI System Design Skill

## When to Use This Skill

- User asks to "design an AI system" or "architect an AI solution"
- User mentions system architecture, specifications, or detailed planning
- User needs help creating comprehensive AI system designs
- User wants to implement AI features following spec-driven development
- User requests detailed technical architecture for AI projects

## Procedure

1. **Understand requirements**: Clarify system scope, constraints, and objectives
2. **Create system specification**: Define components, interfaces, and data flows
3. **Design architecture**: Map out system layers, services, and interactions
4. **Define implementation plan**: Break down features into testable tasks
5. **Validate design**: Check for completeness, consistency, and feasibility

## Output Format

**System Overview**: 2-3 sentence summary of the AI system
**Requirements Analysis**: Functional and non-functional requirements
**Component Architecture**: Detailed breakdown of system components and their responsibilities
**Data Flow Diagram**: How data moves through the system
**Technology Stack**: Recommended technologies and frameworks
**Implementation Roadmap**: Phased approach with priorities
**Validation Strategy**: How to verify system correctness and performance

## Quality Criteria

- Specifications: Complete, unambiguous, and testable requirements
- Architecture: Follows separation of concerns, scalability principles
- Components: Well-defined interfaces, loose coupling, high cohesion
- Implementation: Modular, maintainable, and follows best practices
- Documentation: Clear, comprehensive, and accessible to stakeholders
- Validation: Includes both functional and non-functional testing

## Detailed Design Process

### Phase 1: Requirements and Specification
- Identify core use cases and user stories
- Define functional requirements (what the system must do)
- Define non-functional requirements (performance, security, reliability)
- Specify system constraints and limitations
- Document assumptions and dependencies

### Phase 2: System Architecture Design
- Create high-level system architecture diagram
- Define service boundaries and responsibilities
- Design data models and storage strategies
- Plan API contracts and communication protocols
- Establish security and authentication mechanisms
- Design monitoring and observability systems

### Phase 3: Component Design
- Break down system into manageable components
- Define component interfaces and contracts
- Specify data flow between components
- Design error handling and recovery mechanisms
- Plan for scalability and performance requirements

### Phase 4: Implementation Planning
- Create phased implementation roadmap
- Prioritize features based on value and dependencies
- Define test strategies for each component
- Plan for deployment and operational concerns
- Establish metrics and success criteria

### Phase 5: Validation and Testing
- Define acceptance criteria for each feature
- Plan integration and end-to-end testing
- Specify performance benchmarks
- Create monitoring and alerting strategies
- Plan for security and compliance validation

## Example

**Input**: "Help me design an AI-powered customer support chatbot system"

**Output**:
- **System Overview**: A conversational AI system that handles customer inquiries through natural language processing, integrates with existing CRM systems, and escalates complex issues to human agents when needed. The system learns from interactions to improve responses over time.

- **Requirements Analysis**:
  - Functional: Handle customer inquiries, provide instant responses, escalate to humans, integrate with CRM
  - Non-functional: <2s response time, 99.9% uptime, GDPR compliant, multilingual support
  - Constraints: Must integrate with existing Zendesk setup, limited to $5K/month budget for AI services

- **Component Architecture**:
  1. **Frontend Interface**: Web widget and mobile SDK for customer interaction
  2. **Natural Language Processing**: Intent recognition and entity extraction using transformer models
  3. **Knowledge Base**: Structured FAQ and document repository with semantic search
  4. **Conversation Manager**: Dialogue flow control and context management
  5. **CRM Integration**: Sync with customer data and ticket systems
  6. **Analytics Engine**: Track conversation metrics and model performance
  7. **Admin Dashboard**: Configuration, training, and monitoring interface

- **Data Flow Diagram**: Customer input → NLP processing → Intent classification → Knowledge base query → Response generation → CRM update → Customer response

- **Technology Stack**:
  - Backend: FastAPI with Python 3.9+
  - ML: spaCy, Hugging Face Transformers, OpenAI GPT
  - Database: PostgreSQL with vector extensions
  - Cache: Redis for session management
  - Queue: Celery with Redis for async tasks
  - Frontend: React with TypeScript
  - Infrastructure: Docker containers with Kubernetes orchestration

- **Implementation Roadmap**:
  - Phase 1: Core NLP and basic response system (Weeks 1-4)
  - Phase 2: Knowledge base integration and CRM sync (Weeks 5-8)
  - Phase 3: Advanced features and admin dashboard (Weeks 9-12)
  - Phase 4: Performance optimization and monitoring (Weeks 13-16)

- **Validation Strategy**:
  - Unit tests for all components (target 90% coverage)
  - Integration tests for API contracts
  - Load testing for performance requirements
  - A/B testing for response quality improvements
  - Security penetration testing before production