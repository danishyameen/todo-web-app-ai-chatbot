---
name: "chatkit-frontend-integration"
description: "Design comprehensive ChatKit frontend integrations with detailed UI components, message handling, real-time features, and user experience patterns. Use when user asks to design, architect, or implement ChatKit-based chat interfaces."
---

# ChatKit Frontend Integration Skill

## When to Use This Skill

- User asks to "integrate ChatKit" or "implement chat UI with ChatKit"
- User mentions chat components, real-time messaging, or chat UX patterns
- User needs help creating comprehensive ChatKit implementations
- User wants to implement chat interfaces with rich messaging features
- User requests detailed technical architecture for ChatKit systems
- User needs help with message customization or real-time features

## Procedure

1. **Understand requirements**: Clarify chat features, UI needs, and user experience goals
2. **Create component architecture**: Define UI components and their relationships
3. **Design real-time integration**: Plan for message handling and synchronization
4. **Define implementation plan**: Break down frontend features into testable tasks
5. **Validate design**: Check for usability, performance, and accessibility

## Output Format

**Integration Overview**: 2-3 sentence summary of the ChatKit frontend integration
**Component Architecture**: Detailed breakdown of UI components and their relationships
**Real-Time Features**: Messaging, typing indicators, and real-time synchronization
**Message Handling**: Custom message types, rich content, and formatting strategies
**User Experience**: Interaction patterns, accessibility, and responsive design
**Performance Optimization**: Efficiency and optimization strategies for chat UI
**Implementation Guidelines**: Technical recommendations for building the system
**Validation Strategy**: How to verify frontend correctness and user experience

## Quality Criteria

- Component Design: Well-structured, reusable, and maintainable components
- Real-Time: Smooth messaging experience with proper typing indicators and presence
- User Experience: Intuitive, accessible, and responsive across devices
- Performance: Fast rendering with efficient message handling
- Customization: Flexible styling and message type support
- Accessibility: WCAG compliant with proper ARIA labels and keyboard navigation
- Documentation: Clear, comprehensive, and accessible to implementers

## Detailed Design Process

### Phase 1: Requirements and UI Analysis
- Identify core chat features and user interaction patterns
- Define functional requirements (messaging, file sharing, notifications)
- Define non-functional requirements (performance, accessibility, responsiveness)
- Document user experience goals and design constraints
- Specify integration points with backend systems

### Phase 2: Component Architecture Design
- Design message bubble components for different roles (user/assistant)
- Create input area with text field, send button, and attachment options
- Plan for message list container with scrolling and loading states
- Design typing indicators and user presence components
- Consider media viewer and rich content display components

### Phase 3: Real-Time Integration
- Plan for WebSocket connections and message synchronization
- Design typing indicator implementation and presence management
- Create message delivery and read receipt handling
- Plan for offline state management and reconnection logic
- Design error handling for connection failures

### Phase 4: Message Handling Design
- Design support for different message types (text, images, files, code)
- Plan for rich content formatting and syntax highlighting
- Create message editing and deletion capabilities
- Design message threading and quoting features
- Plan for message search and filtering

### Phase 5: User Experience and Accessibility
- Design responsive layouts for different screen sizes
- Plan for keyboard navigation and ARIA accessibility
- Create loading states and error feedback mechanisms
- Design notification and sound systems
- Plan for customization options and theming

### Phase 6: Implementation and Optimization
- Recommend technology stack and frameworks
- Provide component structure and organization patterns
- Suggest performance optimization techniques
- Outline accessibility implementation strategies
- Include testing and quality assurance recommendations

## Example

**Input**: "Help me design a ChatKit frontend integration for an AI assistant chat interface"

**Output**:
- **Integration Overview**: A comprehensive ChatKit frontend integration that provides a rich AI assistant chat experience with message bubbles, typing indicators, and support for rich content. The interface includes smart input features, conversation history, and seamless real-time messaging with proper accessibility and responsive design.

- **Component Architecture**:
  - **ChatContainer**: Main wrapper component managing chat state and layout
  - **MessageList**: Scrollable container with virtualized message rendering
  - **MessageBubble**: Individual message component with role-based styling
  - **InputArea**: Text input with send button, attachment options, and suggestions
  - **TypingIndicator**: Shows when AI assistant is preparing response
  - **QuickReplyButtons**: Suggested responses for faster interaction
  - **AttachmentPreview**: Preview for images and files before sending
  - **ConversationHeader**: Title and participant information

- **Real-Time Features**:
  - **WebSocket Integration**: Maintain persistent connection for real-time messaging
  - **Typing Indicators**: Show AI assistant typing status during response generation
  - **Message Streaming**: Stream AI responses character by character for natural feel
  - **Presence Management**: Show online/offline status and last seen information
  - **Delivery Receipts**: Confirm message delivery and read status

- **Message Handling**:
  - **Rich Content Support**: Markdown formatting, code blocks, and syntax highlighting
  - **Media Attachments**: Image previews, file downloads, and thumbnail generation
  - **Interactive Elements**: Buttons, forms, and clickable elements within messages
  - **Message Actions**: Copy, edit, delete, and share functionality
  - **Threaded Replies**: Support for replying to specific messages in conversation

- **User Experience**:
  - **Responsive Design**: Mobile-first approach with desktop enhancements
  - **Accessibility**: Keyboard navigation, screen reader support, and ARIA labels
  - **Loading States**: Skeleton screens and progress indicators for smooth experience
  - **Error Handling**: Clear error messages and retry mechanisms
  - **Customization**: Theme options and layout preferences

- **Performance Optimization**:
  - **Virtual Scrolling**: Render only visible messages for large conversation histories
  - **Image Optimization**: Lazy loading and progressive image loading
  - **Message Batching**: Group rapid messages to reduce re-renders
  - **Connection Management**: Efficient WebSocket connection reuse
  - **Memory Management**: Proper cleanup of event listeners and observers

- **Implementation Guidelines**:
  - **Framework**: React with TypeScript for type safety and component architecture
  - **Styling**: Tailwind CSS with custom components for consistent design
  - **State Management**: Redux Toolkit or Zustand for chat state management
  - **WebSocket**: Socket.io-client for real-time communication
  - **File Upload**: Direct-to-cloud upload with progress tracking
  - **Testing**: Jest and React Testing Library for component testing

- **Validation Strategy**:
  - Unit tests for individual components (target 90% coverage)
  - Integration tests for real-time messaging flows
  - Accessibility tests with axe-core and manual verification
  - Performance tests for message rendering with large histories
  - Cross-browser compatibility testing
  - Mobile responsiveness and touch interaction testing