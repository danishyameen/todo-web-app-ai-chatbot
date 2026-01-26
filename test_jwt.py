import jwt
import uuid

# Test token decoding
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjM4NDM3Ni1kNTQ1LTQxOTYtODFkMS0zZTAzZTdkNGQwZWUiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzY5MzUxODgyLCJleHAiOjE3NjkzNTM2ODJ9.w3PiqSx_RIQOV82RxZJqFz6ALFvdLcjHsF8FJRadKQI"
secret = "your-super-secret-jwt-key-change-in-production"

try:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    print("Token decoded successfully:", payload)
    
    # Check if sub is a valid UUID
    user_id = payload.get("sub")
    if user_id:
        try:
            uuid.UUID(user_id)
            print(f"Valid UUID: {user_id}")
        except ValueError:
            print(f"Invalid UUID: {user_id}")
    else:
        print("No sub field in token")
        
except Exception as e:
    print(f"Error decoding token: {e}")