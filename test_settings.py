import sys
sys.path.insert(0, r'C:\Users\Evantagers\Desktop\todo_web_app\backend')

from src.config.settings import settings
print(f"JWT_SECRET_KEY: {settings.JWT_SECRET_KEY}")
print(f"Type: {type(settings.JWT_SECRET_KEY)}")
print(f"Length: {len(settings.JWT_SECRET_KEY) if settings.JWT_SECRET_KEY else 0}")