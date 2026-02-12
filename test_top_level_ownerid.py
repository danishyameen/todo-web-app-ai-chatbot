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

    # Get the workspace ID
    response = requests.get('https://api.render.com/v1/owners', headers=headers)
    owner_id = None
    
    if response.status_code == 200:
        owners_data = response.json()
        if isinstance(owners_data, list):
            for owner_entry in owners_data:
                if isinstance(owner_entry, dict) and 'owner' in owner_entry:
                    owner_info = owner_entry['owner']
                    if isinstance(owner_info, dict) and 'id' in owner_info:
                        owner_id = owner_info['id']
                        if owner_id.startswith('tea-'):
                            print(f"Using workspace ID: {owner_id}")
                            break

    if owner_id:
        # Try creating service with the top-level ownerId field (outside of service object)
        service_data = {
            "name": "todo-backend-test",
            "type": "web",
            "runtime": "python",
            "repoUrl": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",
            "ownerId": owner_id,  # Top level field
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
        
        create_response = requests.post(
            'https://api.render.com/v1/services',
            headers=headers,
            json=service_data
        )
        
        print(f"Create service status: {create_response.status_code}")
        print(f"Create service response: {create_response.text}")
    else:
        print("Could not get owner ID")