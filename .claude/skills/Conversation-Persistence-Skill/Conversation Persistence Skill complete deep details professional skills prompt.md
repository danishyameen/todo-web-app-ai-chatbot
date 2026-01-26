---
name: "conversation-persistence"
description: "Design comprehensive conversation persistence systems with detailed data models, storage strategies, retrieval patterns, and privacy compliance. Use when user asks to design, architect, or implement conversation storage and retrieval systems."
---

# Conversation Persistence Skill

## When to Use This Skill

- User asks to "design conversation storage" or "implement chat history persistence"
- User mentions message history, conversation threads, or data retention
- User needs help creating comprehensive conversation storage systems
- User wants to implement persistent chat experiences with data management
- User requests detailed technical architecture for conversation databases
- User needs help with privacy compliance or data lifecycle management

## Procedure

1. **Understand requirements**: Clarify storage needs, retention policies, and access patterns
2. **Create data models**: Define conversation and message schemas with relationships
3. **Design storage strategy**: Plan for efficient storage and retrieval patterns
4. **Define implementation plan**: Break down persistence features into testable tasks
5. **Validate design**: Check for performance, privacy, and compliance

## Output Format

**Persistence Overview**: 2-3 sentence summary of the conversation persistence system
**Data Models**: Detailed breakdown of conversation and message data structures
**Storage Strategy**: Approach for data storage, partitioning, and indexing
**Retrieval Patterns**: Query strategies and access patterns for conversation data
**Privacy Compliance**: Data protection, retention, and deletion strategies
**Performance Optimization**: Efficiency and scalability optimization strategies
**Implementation Guidelines**: Technical recommendations for building the system
**Validation Strategy**: How to verify persistence correctness and performance

## Quality Criteria

- Data Integrity: Robust schema design with proper relationships and constraints
- Performance: Fast retrieval for conversation history with efficient pagination
- Privacy: Comprehensive data protection and compliance with regulations
- Scalability: Ability to handle growing conversation volumes
- Reliability: Durable storage with backup and recovery capabilities
- Security: Proper access controls and data isolation
- Documentation: Clear, comprehensive, and accessible to implementers

## Detailed Design Process

### Phase 1: Requirements and Data Analysis
- Identify conversation storage needs and access patterns
- Define retention policies and compliance requirements
- Specify functional requirements (storage, retrieval, search)
- Define non-functional requirements (performance, security, privacy)
- Document data sensitivity and regulatory constraints

### Phase 2: Data Model Design
- Design conversation entity with metadata and relationships
- Define message entity with content and context information
- Plan for media attachments and rich content storage
- Design indexing strategy for efficient queries
- Consider data normalization and denormalization trade-offs

### Phase 3: Storage Strategy Design
- Choose appropriate database technology (relational, document, hybrid)
- Plan for data partitioning and sharding strategies
- Design backup and replication strategies
- Plan for data archival and lifecycle management
- Consider cloud storage for media and attachments

### Phase 4: Retrieval Pattern Design
- Design efficient query patterns for conversation history
- Plan for pagination and streaming of large conversation histories
- Create search and filtering capabilities
- Design caching strategies for frequently accessed conversations
- Plan for real-time updates and synchronization

### Phase 5: Privacy and Compliance
- Implement data retention and automatic deletion policies
- Design data anonymization and pseudonymization strategies
- Plan for user data access and portability requests
- Create data breach response and notification procedures
- Implement audit logging for data access and modifications

### Phase 6: Implementation and Optimization
- Recommend technology stack and frameworks
- Provide code structure and organization patterns
- Suggest data migration and seeding strategies
- Outline performance optimization techniques
- Include monitoring and data quality tracking recommendations

## Example

**Input**: "Help me design a conversation persistence system for an AI assistant platform"

**Output**:
- **Persistence Overview**: A scalable conversation persistence system that stores AI assistant interactions with full message history, metadata, and context. The system implements comprehensive privacy controls, efficient retrieval patterns, and automated data lifecycle management while ensuring regulatory compliance.

- **Data Models**:
  - **Conversations Table**:
    - `id`: UUID primary key
    - `user_id`: Foreign key to user
    - `title`: Generated conversation title (nullable)
    - `created_at`: Timestamp
    - `updated_at`: Last activity timestamp
    - `metadata`: JSONB for conversation properties
    - `status`: Active, archived, deleted
  - **Messages Table**:
    - `id`: UUID primary key
    - `conversation_id`: Foreign key to conversation
    - `role`: 'user' or 'assistant'
    - `content`: Text content of the message
    - `timestamp`: When message was sent
    - `metadata`: JSONB for message properties
    - `parent_message_id`: For threaded conversations
  - **Attachments Table**:
    - `id`: UUID primary key
    - `message_id`: Foreign key to message
    - `filename`: Original filename
    - `content_type`: MIME type
    - `file_size`: Size in bytes
    - `storage_path`: Cloud storage location

- **Storage Strategy**:
  - **Database**: PostgreSQL with JSONB support for flexible metadata
  - **Partitioning**: Partition by date (monthly) for conversation table
  - **Indexing**: Composite indexes on (user_id, created_at) and (conversation_id, timestamp)
  - **Replication**: Master-slave replication for read scaling
  - **Backup**: Automated backups with point-in-time recovery

- **Retrieval Patterns**:
  - **Recent Conversations**: Query with LIMIT and ORDER BY updated_at
  - **Conversation History**: Paginated queries with cursor-based pagination
  - **Search**: Full-text search on message content with ranking
  - **Filtering**: Filter by date range, message count, or metadata
  - **Real-time Sync**: WebSocket notifications for new messages

- **Privacy Compliance**:
  - **GDPR Compliance**: Right to access, portability, and erasure
  - **Data Retention**: Automatic deletion after 2 years (configurable)
  - **Encryption**: At-rest encryption for sensitive conversation data
  - **Access Controls**: Row-level security by user_id
  - **Audit Logging**: All data access and modification logged

- **Performance Optimization**:
  - **Caching**: Redis cache for recent conversations and user sessions
  - **Read Replicas**: Offload read queries to replica databases
  - **Connection Pooling**: Efficient database connection management
  - **Compression**: Compress large message content before storage
  - **Lazy Loading**: Stream large conversation histories in chunks

- **Implementation Guidelines**:
  - **ORM**: SQLAlchemy with PostgreSQL-specific optimizations
  - **API**: GraphQL for flexible data fetching and mutations
  - **Authentication**: JWT tokens with user_id claims for access control
  - **File Storage**: AWS S3 with signed URLs for attachment access
  - **Background Jobs**: Celery for data cleanup and maintenance tasks
  - **Monitoring**: Custom metrics for query performance and data growth

- **Validation Strategy**:
  - Unit tests for data model operations (target 95% coverage)
  - Integration tests for conversation retrieval patterns
  - Performance tests for query response times with large datasets
  - Privacy compliance tests for data access and deletion
  - Load tests for concurrent user access to conversation data
  - Backup and recovery tests for data durability