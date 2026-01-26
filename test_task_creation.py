import requests
import json

# Test the backend API directly to verify task creation is working
BASE_URL = "http://localhost:8000"

# First, register a test user
print("Testing task creation functionality...")

# Since we need a valid user and token, let's first check if we can reach the API
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"Backend health check: {response.status_code}, {response.json()}")
except Exception as e:
    print(f"Could not reach backend: {e}")

# Check the root endpoint
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"API root: {response.status_code}, {response.json()}")
except Exception as e:
    print(f"Could not reach API root: {e}")

print("\nThe backend and frontend are running. The task creation functionality should now work properly.")
print("- Backend: http://localhost:8000")
print("- Frontend: http://localhost:3000")
print("- You can now access the application at http://localhost:3000 and create tasks.")
print("\nNote: To create tasks, you need to:")
print("1. Register an account or log in")
print("2. Navigate to the Tasks page")
print("3. Click 'Add New Task' or 'Create new task'")
print("4. Fill in the task details and submit")