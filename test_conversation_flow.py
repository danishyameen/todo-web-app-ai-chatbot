#!/usr/bin/env python3
"""
Test script to verify the complete conversation flow:
add → list → update → complete → delete tasks
"""

import asyncio
import uuid
from backend.src.services.ai_agent_service import AIAgentService
from backend.src.db.session import get_session

# Test the complete flow
def test_conversation_flow():
    """Test the complete conversation flow: add → list → update → complete → delete tasks"""

    print("Testing complete conversation flow...")

    # Create a test user ID
    test_user_id = str(uuid.uuid4())
    print(f"Using test user ID: {test_user_id[:8]}...")

    # Initialize AI Agent Service
    ai_service = AIAgentService()

    # Use the actual database session from the app
    session_generator = get_session()
    session = next(session_generator)  # Get the session from the generator

    try:
        print("\n1. Adding a task...")
        add_response = ai_service.process_user_input(
            "Add a task to buy groceries",
            test_user_id,
            session
        )
        print(f"Add response: {add_response}")

        print("\n2. Listing tasks...")
        list_response = ai_service.process_user_input(
            "Show me my tasks",
            test_user_id,
            session
        )
        print(f"List response: {list_response}")

        print("\n3. Updating the task...")
        update_response = ai_service.process_user_input(
            "Update the grocery task priority to high",
            test_user_id,
            session
        )
        print(f"Update response: {update_response}")

        print("\n4. Completing the task...")
        complete_response = ai_service.process_user_input(
            "Mark the grocery task as complete",
            test_user_id,
            session
        )
        print(f"Complete response: {complete_response}")

        print("\n5. Deleting the task...")
        delete_response = ai_service.process_user_input(
            "Delete the grocery task",
            test_user_id,
            session
        )
        print(f"Delete response: {delete_response}")

        print("\n6. Verifying task is deleted...")
        final_list_response = ai_service.process_user_input(
            "Show me my tasks",
            test_user_id,
            session
        )
        print(f"Final list response: {final_list_response}")

    finally:
        session.close()

    print("\nConversation flow test completed!")

if __name__ == "__main__":
    test_conversation_flow()