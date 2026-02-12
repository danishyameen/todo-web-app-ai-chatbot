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

    # First, let's try to get the actual user ID by making a request to a protected endpoint
    # that might return user details including the ID
    response = requests.get('https://api.render.com/v1/services', headers=headers, params={'limit': 1})
    
    if response.status_code == 200:
        services_data = response.json()
        print(f"Services data: {services_data}")
        
        # If we have services, try to extract owner ID from there
        if isinstance(services_data, list) and len(services_data) > 0:
            service = services_data[0]
            owner_id = service.get('ownerId')
            print(f"Owner ID from existing service: {owner_id}")
        elif isinstance(services_data, dict) and 'services' in services_data and len(services_data['services']) > 0:
            service = services_data['services'][0]
            owner_id = service.get('ownerId')
            print(f"Owner ID from existing service: {owner_id}")
        else:
            print("No existing services found")
            owner_id = None
    else:
        print(f"Could not get services: {response.status_code}, {response.text}")
        owner_id = None

    # If we couldn't get owner ID from existing services, we'll try a different approach
    # Let's try to make a request to see if we can get user details another way
    if not owner_id:
        # Try to get user details from the API key context
        # Sometimes the user ID is returned as part of the authentication context
        response = requests.get('https://api.render.com/v1/users', headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            print(f"User data: {user_data}")
            
            # Some Render API implementations return the user ID in the response
            # Let's try to make a request to create a service with a placeholder owner ID
            # and see if the error message contains the correct ID
            service_data = {
                "service": {
                    "name": "todo-backend-test",
                    "type": "web",
                    "runtime": "python",
                    "repoUrl": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",
                    "ownerId": "placeholder",  # Placeholder to see error message
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
        else:
            print("Could not get user data")