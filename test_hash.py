import sys
sys.path.insert(0, r'C:\Users\Evantagers\Desktop\todo_web_app\backend')

from src.utils.jwt_utils import hash_password

# Test the hash_password function
test_password = "TestPass123!"
print(f"Original password: {test_password}")
print(f"Password length: {len(test_password.encode('utf-8'))} bytes")

try:
    hashed = hash_password(test_password)
    print(f"Password hashed successfully: {hashed[:20]}...")
except Exception as e:
    print(f"Error hashing password: {e}")