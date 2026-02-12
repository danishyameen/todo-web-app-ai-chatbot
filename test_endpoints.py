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

    # Try to get user info from different endpoints
    endpoints = [
        'https://api.render.com/v1/self',
        'https://api.render.com/v1/users',
        'https://api.render.com/v1/accounts',
        'https://api.render.com/v1/account',
        'https://api.render.com/v1/profile'
    ]
    
    for endpoint in endpoints:
        print(f"Trying {endpoint}...")
        response = requests.get(endpoint, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        print("-" * 50)