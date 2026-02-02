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
from ..models.conversation import Conversation, ConversationCreate, ConversationUpdate
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


@router.get("/{user_id}/conversations",
            summary="Get all conversations for a user",
            description="Retrieve all conversations belonging to a specific user")
async def get_conversations(
    user_id: str,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get all conversations for a user
    """
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these conversations")

    try:
        # Validate user_id is a valid UUID
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        # Get all conversations for the user
        conversations = session.query(Conversation).filter(
            Conversation.user_id == user_uuid
        ).order_by(Conversation.updated_at.desc()).all()

        conversation_list = []
        for conv in conversations:
            # Get message count for this conversation
            message_count = session.query(Message).filter(
                Message.conversation_id == conv.id
            ).count()

            conversation_list.append({
                "id": str(conv.id),
                "title": conv.title,
                "userId": str(conv.user_id),
                "createdAt": conv.created_at.isoformat(),
                "updatedAt": conv.updated_at.isoformat(),
                "messageCount": message_count
            })

        return {
            "conversations": conversation_list,
            "success": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversations: {str(e)}")


@router.get("/{user_id}/conversations/{conversation_id}",
            summary="Get a specific conversation by ID",
            description="Retrieve a specific conversation by its ID")
async def get_conversation(
    user_id: str,
    conversation_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific conversation by ID
    """
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")

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

        # Get message count for this conversation
        message_count = session.query(Message).filter(
            Message.conversation_id == conversation_id
        ).count()

        return {
            "id": str(conversation.id),
            "title": conversation.title,
            "userId": str(conversation.user_id),
            "createdAt": conversation.created_at.isoformat(),
            "updatedAt": conversation.updated_at.isoformat(),
            "messageCount": message_count,
            "success": True
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")


@router.post("/{user_id}/conversations",
             summary="Create a new conversation",
             description="Create a new conversation for the specified user")
async def create_conversation(
    user_id: str,
    conversation_data: ConversationCreate,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new conversation
    """
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create conversations for this user")

    try:
        # Validate user_id is a valid UUID
        user_uuid = uuid.UUID(user_id)

        # Ensure the conversation is created for the authenticated user
        if conversation_data.user_id != user_uuid:
            raise HTTPException(status_code=403, detail="Cannot create conversation for another user")

        # Create the conversation
        conversation = Conversation(
            title=conversation_data.title,
            user_id=conversation_data.user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        return {
            "id": str(conversation.id),
            "title": conversation.title,
            "userId": str(conversation.user_id),
            "createdAt": conversation.created_at.isoformat(),
            "updatedAt": conversation.updated_at.isoformat(),
            "success": True
        }

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating conversation: {str(e)}")


@router.put("/{user_id}/conversations/{conversation_id}",
            summary="Update an existing conversation",
            description="Update an existing conversation if it belongs to the specified user")
async def update_conversation(
    user_id: str,
    conversation_id: uuid.UUID,
    conversation_update: ConversationUpdate,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Update an existing conversation
    """
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this conversation")

    try:
        # Get conversation and verify ownership
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if str(conversation.user_id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this conversation")

        # Update the conversation with provided fields
        update_data = conversation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(conversation, field, value)

        # Update the timestamp
        conversation.updated_at = datetime.utcnow()

        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        return {
            "id": str(conversation.id),
            "title": conversation.title,
            "userId": str(conversation.user_id),
            "createdAt": conversation.created_at.isoformat(),
            "updatedAt": conversation.updated_at.isoformat(),
            "success": True
        }

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating conversation: {str(e)}")


@router.delete("/{user_id}/conversations/{conversation_id}",
               summary="Delete a conversation",
               description="Delete a conversation by its ID if it belongs to the specified user")
async def delete_conversation(
    user_id: str,
    conversation_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Delete a conversation
    """
    # Verify that the user_id in the URL matches the user_id from the JWT token
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this conversation")

    try:
        # Get conversation and verify ownership
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if str(conversation.user_id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this conversation")

        # Delete all messages in the conversation first (due to foreign key constraint)
        session.query(Message).filter(
            Message.conversation_id == conversation_id
        ).delete()

        # Delete the conversation
        session.delete(conversation)
        session.commit()

        return {
            "message": "Conversation deleted successfully",
            "success": True
        }

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
