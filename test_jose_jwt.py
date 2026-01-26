from jose import jwt

# Test token decoding with jose library
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjM4NDM3Ni1kNTQ1LTQxOTYtODFkMS0zZTAzZTdkNGQwZWUiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzY5MzUyMTEwLCJleHAiOjE3NjkzNTM5MTB9._gQwVlGITYnQpskKKAYISTrjDcpkwCQEASvEbewV8Xo"
secret = "your-super-secret-jwt-key-change-in-production"

try:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    print("Token decoded successfully with jose:", payload)
except Exception as e:
    print(f"Error decoding token with jose: {e}")