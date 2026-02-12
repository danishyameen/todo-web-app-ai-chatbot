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
        # Try creating service with buildCommand at top level
        service_data = {
            "name": "todo-backend-test",
            "type": "web_service",
            "ownerId": owner_id,
            "repo": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",
            "buildCommand": "pip install -r backend/requirements.txt",  # Top level
            "serviceDetails": {
                "runtime": "python",
                "planId": "starter",
                "region": "oregon",
                "autoDeploy": True,
                "branch": "main",
                "repoUrl": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",
                "startCommand": "cd backend && python start_server.py",
                "envSpecificDetails": {
                    "pythonVersion": "3.11"
                }
            }
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