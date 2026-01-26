// frontend/app/api/chat/route.ts
// API route to handle chat requests from the frontend
// This will act as a proxy to the backend service

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { userId, message, conversationId } = body;

    // Validate the request
    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would call the backend API
    // For now, we'll simulate a response
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/${userId}/chat`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({ message, conversationId }),
    // });

    // For simulation purposes, we'll return a mock response
    // that mimics what the backend would return
    const mockResponse = {
      conversationId: conversationId || `conv_${Date.now()}`,
      response: generateMockResponse(message),
      success: true,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: 'userId and conversationId are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would fetch from the backend
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/api/${userId}/chat/${conversationId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
    //   },
    // });

    // For simulation, return mock conversation history
    const mockConversation = {
      conversationId,
      messages: [
        {
          id: `msg_${Date.now() - 10000}`,
          role: 'user',
          content: 'Hello, can you help me create a task?',
          timestamp: new Date(Date.now() - 10000).toISOString(),
        },
        {
          id: `msg_${Date.now() - 5000}`,
          role: 'assistant',
          content: 'Of course! I can help you create tasks. Just tell me what task you\'d like to add.',
          timestamp: new Date(Date.now() - 5000).toISOString(),
        },
        {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: 'Add a task to buy groceries',
          timestamp: new Date().toISOString(),
        },
      ],
      success: true,
    };

    return NextResponse.json(mockConversation);
  } catch (error) {
    console.error('Error in GET chat API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock responses based on user input
function generateMockResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return "Hello! I'm your AI assistant for managing tasks. How can I help you today?";
  } else if (lowerMsg.includes('task') || lowerMsg.includes('add') || lowerMsg.includes('create')) {
    const taskMatch = userMessage.match(/(?:to|for)\s+(.+)/i);
    const task = taskMatch ? taskMatch[1] : 'the task you mentioned';
    return `I've created a task for "${task}". Is there anything else you'd like me to do?`;
  } else if (lowerMsg.includes('list') || lowerMsg.includes('show') || lowerMsg.includes('see')) {
    if (lowerMsg.includes('completed') || lowerMsg.includes('done')) {
      return "You have 2 completed tasks: 'Buy groceries' and 'Call mom'.";
    } else if (lowerMsg.includes('pending') || lowerMsg.includes('todo')) {
      return "You have 3 pending tasks: 'Finish report', 'Schedule meeting', and 'Update project status'.";
    } else {
      return "You have 5 tasks in total: 3 pending and 2 completed. Would you like to see pending or completed tasks?";
    }
  } else if (lowerMsg.includes('complete') || lowerMsg.includes('done') || lowerMsg.includes('finish')) {
    return "I've marked that task as completed. Great job!";
  } else if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('modify')) {
    return "I can help you update your tasks. What would you like to change?";
  } else if (lowerMsg.includes('help') || lowerMsg.includes('what can you')) {
    return "I can help you with your tasks! You can ask me to: add a task, list your tasks, update a task, or complete a task. For example, try saying 'Add a task to call John tomorrow'";
  } else {
    return `I understood that you said: "${userMessage}". I'm your AI assistant for managing tasks. You can ask me to add, list, update, or complete tasks.`;
  }
}