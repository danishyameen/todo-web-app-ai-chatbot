# Todo AI Chatbot Frontend - Setup Instructions

## Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Environment Configuration

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3000/api/chat
NEXT_PUBLIC_APP_DOMAIN=localhost
NEXT_PUBLIC_PROD_DOMAIN=your-production-domain.com
NEXT_PUBLIC_CHAT_TIMEOUT=30000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Production Build
```bash
npm run build
npm start
```

## Available Pages

- **Main Chat Interface**: `http://localhost:3000/chat`
  - Primary AI task assistant interface
  - Natural language task management

- **API Test Page**: `http://localhost:3000/test-chat-api`
  - Test API connectivity and functionality

- **NLU Test Page**: `http://localhost:3000/test-nlu`
  - Test natural language understanding capabilities

## Key Features

### Chat Interface
- Real-time conversation with AI assistant
- Task management through natural language
- Conversation history tracking
- Responsive design for all devices

### Security
- Domain validation for API requests
- Input sanitization
- User isolation
- Secure API communication

### Natural Language Support
- Task creation: "Add a task to buy groceries"
- Task listing: "Show me my tasks"
- Task completion: "Mark task as complete"
- Task updates: "Update task due date"

## Troubleshooting

### Common Issues
1. **API Connection Errors**: Verify that the backend service is running and the API URL is correctly configured
2. **Security Warnings**: Ensure that the domain is properly added to the allowlist in the configuration
3. **Performance Issues**: Check browser console for any errors or warnings

### Debugging
- Enable verbose logging by adding `DEBUG=true` to your environment variables
- Check browser developer tools for console errors
- Verify API responses using the test pages

## Testing

Run the test pages to verify functionality:
1. Visit `/test-chat-api` to test API connectivity
2. Visit `/test-nlu` to test natural language understanding
3. Use the main chat interface to test full functionality

## Integration Notes

When integrating with the backend:
1. Replace mock API calls in `app/api/chat/route.ts` with actual backend endpoints
2. Update authentication methods as needed
3. Adjust timeout settings based on backend response times
4. Implement proper error handling for backend-specific errors

## Security Considerations

- The frontend validates domain access against the allowlist
- Input sanitization occurs before API requests
- User data is isolated by user ID
- API requests include proper authentication headers