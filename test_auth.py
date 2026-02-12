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

    # Try to get user info
    response = requests.get(
        'https://api.render.com/v1/self',
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Authentication successful!")
        user_data = response.json()
        print(f"User Data: {user_data}")
    else:
        print("Authentication failed!")