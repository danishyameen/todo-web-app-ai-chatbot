"""
Chat API for Todo AI Chatbot
Implements the conversation endpoint for the AI assistant
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

from ..db.session import get_session
from ..utils.jwt_better_auth import get_current_user_id
from ..models.conversation import Conversation, ConversationCreate
from ..models.message import Message, MessageCreate
from ..services.ai_agent_service import AIAgentService


router = APIRouter()
ai_agent_service = AIAgentService()


@router.post("/{user_id}/chat",
             summary="Send a message to the AI assistant",
             description="Process natural language input and return AI response for task management")
async def chat_endpoint(
    user_id: str,
    request: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Main chat endpoint for the AI assistant
    """
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")

    try:
        # Extract message and optional conversation_id from request
        message_text = request.get("message", "")
        conversation_id_str = request.get("conversationId")

        # Validate input
        if not message_text or not message_text.strip():
            raise HTTPException(status_code=400, detail="Message is required and cannot be empty")

        # Sanitize message text to prevent injection
        message_text = message_text.strip()
        if len(message_text) > 1000:  # Limit message length
            raise HTTPException(status_code=400, detail="Message is too long (maximum 1000 characters)")

        # Validate conversation ID if provided
        if conversation_id_str:
            try:
                uuid.UUID(conversation_id_str)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid conversation ID format")

        # user_id is already a string from the JWT token, no need to convert to UUID for comparison
        # Only convert to UUID when needed for database operations

        # Get or create conversation
        conversation = None
        conversation_uuid = None

        if conversation_id_str:
            try:
                conversation_uuid = uuid.UUID(conversation_id_str)
                conversation = session.get(Conversation, conversation_uuid)

                # Verify conversation belongs to user
                if conversation and str(conversation.user_id) != user_id:
                    raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
            except ValueError:
                # Invalid UUID, create new conversation
                conversation = None

        # Create new conversation if needed
        if not conversation:
            # Convert user_id string to UUID for database operations
            user_uuid = uuid.UUID(user_id)
            conversation_create = ConversationCreate(
                title=message_text[:50] + "..." if len(message_text) > 50 else message_text,
                user_id=user_uuid
            )
            conversation = Conversation(**conversation_create.dict())
            session.add(conversation)
            session.flush()  # Get the conversation ID without committing

            # Now we have the conversation ID
            conversation_uuid = conversation.id

        # Create user message
        user_message = Message(
            role="user",
            content=message_text,
            conversation_id=conversation_uuid
        )
        session.add(user_message)

        # Process message with AI agent service
        ai_response = ai_agent_service.process_user_input(message_text, user_id, session)

        # Create AI message
        ai_message = Message(
            role="assistant",
            content=ai_response,
            conversation_id=conversation_uuid
        )
        session.add(ai_message)

        # Update conversation timestamp
        if conversation:
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)

        # Commit all changes
        session.commit()

        # Refresh objects to get updated data
        if conversation:
            session.refresh(conversation)
        session.refresh(user_message)
        session.refresh(ai_message)

        return {
            "response": ai_response,
            "conversationId": str(conversation.id) if conversation else str(conversation_uuid),
            "success": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")


@router.get("/{user_id}/chat/{conversation_id}",
            summary="Get conversation history",
            description="Retrieve the history of messages in a specific conversation")
async def get_conversation_history(
    user_id: str,
    conversation_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get conversation history for a specific conversation
    """
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")

    try:
        # Validate user_id is a valid UUID
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        # Get conversation and verify ownership
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if str(conversation.user_id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this conversation")

        # Get messages in the conversation
        messages = session.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.timestamp).all()

        message_list = []
        for msg in messages:
            message_list.append({
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            })

        return {
            "conversationId": str(conversation_id),
            "title": conversation.title,
            "createdAt": conversation.created_at.isoformat(),
            "updatedAt": conversation.updated_at.isoformat(),
            "messages": message_list,
            "success": True
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")