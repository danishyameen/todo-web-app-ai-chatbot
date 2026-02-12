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

    # Try to get the user's workspace information
    # According to documentation, user IDs start with 'own-' and can be used to get default workspace
    # But first let's try to get the user ID from the /users endpoint
    response = requests.get('https://api.render.com/v1/users', headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"User data: {user_data}")
        
        # Now try to get the workspace information
        # According to documentation, workspace IDs start with 'tea-'
        # Let's try to list all owners (workspaces)
        owners_response = requests.get('https://api.render.com/v1/owners', headers=headers)
        print(f"Owners response status: {owners_response.status_code}")
        print(f"Owners response: {owners_response.text}")
        
        if owners_response.status_code == 200:
            owners_data = owners_response.json()
            print(f"All owners: {owners_data}")
            
            # Look for a workspace ID that starts with 'tea-'
            if isinstance(owners_data, list):
                for owner in owners_data:
                    if isinstance(owner, dict) and 'id' in owner:
                        owner_id = owner['id']
                        if owner_id.startswith('tea-'):
                            print(f"Found workspace ID: {owner_id}")
                            
                            # Now try to create a service with this workspace ID
                            service_data = {
                                "service": {
                                    "name": "todo-backend-test",
                                    "type": "web",
                                    "runtime": "python",
                                    "repoUrl": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",
                                    "ownerId": owner_id,  # Using the workspace ID
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
                            
                            create_response = requests.post(
                                'https://api.render.com/v1/services',
                                headers=headers,
                                json=service_data
                            )
                            
                            print(f"Create service status: {create_response.status_code}")
                            print(f"Create service response: {create_response.text}")
                            break
            elif isinstance(owners_data, dict):
                # If it's a single owner object
                if 'id' in owners_data and owners_data['id'].startswith('tea-'):
                    owner_id = owners_data['id']
                    print(f"Found workspace ID: {owner_id}")
                else:
                    print("No workspace ID found starting with 'tea-'")
        else:
            print("Could not get owners list")
    else:
        print("Could not get user data")