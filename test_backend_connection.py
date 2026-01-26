import requests
import json

# Test if the backend is accessible
BASE_URL = "http://localhost:8000"

print("Checking backend connectivity...")

try:
    # Test the health endpoint
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health check: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Backend is not accessible: {e}")
    print("Make sure the backend server is running on port 8000")

try:
    # Test the root endpoint
    response = requests.get(f"{BASE_URL}/")
    print(f"Root endpoint: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Root endpoint error: {e}")