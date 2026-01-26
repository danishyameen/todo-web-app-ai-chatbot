#!/usr/bin/env python3
"""
Debug script to test task creation functionality
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "TestPass123!"

def test_task_creation():
    print("Testing task creation functionality...")
    
    # Step 1: Login to get token
    print("\n1. Attempting to login...")
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    
    if login_response.status_code == 200:
        print("✓ Login successful")
        auth_data = login_response.json()
        token = auth_data.get("access_token")
        user_id = auth_data.get("user_id")
        
        print(f"  Token: {token[:20]}..." if token else "  No token received")
        print(f"  User ID: {user_id}")
    else:
        print(f"✗ Login failed: {login_response.status_code} - {login_response.text}")
        return False
    
    # Step 2: Try to create a task
    print("\n2. Attempting to create a task...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    task_data = {
        "title": "Test Task from Debug Script",
        "description": "This is a test task created by the debug script",
        "status": "pending",
        "priority": "medium",
        "due_date": None,
        "category_id": None
    }
    
    # Use the correct endpoint format: /api/{user_id}/tasks
    create_response = requests.post(
        f"{BASE_URL}/api/{user_id}/tasks",
        headers=headers,
        json=task_data
    )
    
    print(f"  Response Status: {create_response.status_code}")
    
    if create_response.status_code == 200:
        print("✓ Task created successfully")
        task = create_response.json()
        print(f"  Task ID: {task.get('id')}")
        print(f"  Task Title: {task.get('title')}")
        return True
    else:
        print(f"✗ Task creation failed: {create_response.text}")
        return False

def validate_user_id_format(user_id_str):
    """Helper function to validate UUID format"""
    try:
        uuid_obj = uuid.UUID(user_id_str)
        print(f"✓ Valid UUID: {uuid_obj}")
        return True
    except ValueError:
        print(f"✗ Invalid UUID format: {user_id_str}")
        return False

if __name__ == "__main__":
    print("Starting task creation debug test...")
    success = test_task_creation()
    
    if success:
        print("\n✓ Task creation test completed successfully!")
    else:
        print("\n✗ Task creation test failed!")
        
    # Test UUID validation
    print("\nTesting UUID validation...")
    test_uuid = "123e4567-e89b-12d3-a456-426614174000"
    validate_user_id_format(test_uuid)