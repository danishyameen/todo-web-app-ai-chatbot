import requests
import os

# Get the API key from environment
api_key = os.environ.get('RENDER_API_KEY')

if not api_key:
    print("ERROR: RENDER_API_KEY environment variable not set")
else:
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    # Try to get user info to extract ID if possible
    response = requests.get('https://api.render.com/v1/users', headers=headers)
    if response.status_code == 200:
        user_data = response.json()
        print(f"User data: {user_data}")
        
        # Try to create service with email as identifier if needed
        service_data = {
            "service": {
                "name": "todo-backend-test",
                "type": "web",
                "runtime": "python",
                "repoUrl": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",
                "owner": user_data.get("email"),  # Using email as owner
                "branch": "main",
                "plan": "free",
                "autoDeploy": True,
                "region": "oregon",
                "buildCommand": "pip install -r backend/requirements.txt",
                "startCommand": "cd backend && python start_server.py",
                "envVars": [
                    {
                        "key": "DATABASE_URL",
                        "value": "postgresql://neondb_owner:npg_6Jpbvyxg5CPa@ep-long-boat-afzxm68c-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
                    },
                    {
                        "key": "PORT",
                        "value": "10000"
                    }
                ]
            }
        }
        
        # Try creating service
        create_response = requests.post(
            'https://api.render.com/v1/services',
            headers=headers,
            json=service_data
        )
        
        print(f"Create service status: {create_response.status_code}")
        print(f"Create service response: {create_response.text}")
    else:
        print("Could not get user data")