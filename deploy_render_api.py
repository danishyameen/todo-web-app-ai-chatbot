import os
import sys
import requests
import time
import json

def check_authentication():
    """
    Check karein ke RENDER_API_KEY set hai ya nahi
    """
    api_key = os.environ.get('RENDER_API_KEY')
    if not api_key:
        print("ERROR: RENDER_API_KEY environment variable set nahi hai")
        print("\nKaise set karein:")
        print("1. Render dashboard per ja kar: https://dashboard.render.com/keys")
        print("2. 'New Personal Access Token' create karein")
        print("3. Description mein 'Deployment Script' likhein")
        print("4. 'Create Token' button click karein")
        print("5. Token copy kar lein aur niche command mein paste karein:")
        print("\nCommand: set RENDER_API_KEY=your_render_api_key_here")
        print("\nPhir script run karein: python deploy_render_api.py")
        return None
    return api_key

def validate_existing_service(headers):
    """
    Check karein ke kya service already exists
    """
    response = requests.get(
        'https://api.render.com/v1/services',
        headers=headers,
        params={'name': 'todo-backend'}
    )
    
    if response.status_code == 200:
        data = response.json()
        # Response can be a list or dict depending on API
        if isinstance(data, list):
            services = data
        else:
            services = data.get('services', [])
        
        for service in services:
            if service.get('name') == 'todo-backend':
                print(f"Service already exists with ID: {service['id']}")
                return service['id']
    return None

def get_owner_id(headers):
    """
    Get the workspace ID from the Render API
    """
    # Get the workspace ID from the /owners endpoint
    response = requests.get('https://api.render.com/v1/owners', headers=headers)
    
    if response.status_code == 200:
        owners_data = response.json()
        if isinstance(owners_data, list):
            for owner_entry in owners_data:
                if isinstance(owner_entry, dict) and 'owner' in owner_entry:
                    owner_info = owner_entry['owner']
                    if isinstance(owner_info, dict) and 'id' in owner_info:
                        owner_id = owner_info['id']
                        # Workspace IDs start with 'tea-'
                        if owner_id.startswith('tea-'):
                            return owner_id
        elif isinstance(owners_data, dict):
            # Handle case where response is a single object
            if 'owner' in owners_data and isinstance(owners_data['owner'], dict):
                owner_info = owners_data['owner']
                if 'id' in owner_info:
                    owner_id = owner_info['id']
                    if owner_id.startswith('tea-'):
                        return owner_id
    
    return None

def deploy_to_render():
    """
    Render API ka istemal karke backend deploy karta hai
    """
    api_key = check_authentication()
    if not api_key:
        return None

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    # Get owner ID
    owner_id = get_owner_id(headers)
    if not owner_id:
        print("ERROR: Could not retrieve owner ID from API")
        return None

    print(f"Using owner ID: {owner_id}")

    # Check if service already exists
    existing_service_id = validate_existing_service(headers)
    if existing_service_id:
        print("Service already exists. Triggering a new deployment...")
        trigger_deploy_response = requests.post(
            f'https://api.render.com/v1/services/{existing_service_id}/deploys',
            headers=headers,
            json={"clearCache": "clear", "force": True}
        )
        
        if trigger_deploy_response.status_code == 201:
            print("New deployment triggered successfully!")
            return existing_service_id
        else:
            print(f"Failed to trigger new deployment: {trigger_deploy_response.status_code}")
            print(trigger_deploy_response.text)
            return None

    # Service creation payload - following the correct format based on API responses
    service_data = {
        "name": "todo-backend",
        "type": "web_service",  # Type at top level based on error messages
        "ownerId": owner_id,  # Top-level field as per API docs
        "repo": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",  # Adding repo field based on error
        "buildCommand": "pip install -r backend/requirements.txt",  # Top level based on error
        "serviceDetails": {
            "runtime": "python",  # Using runtime instead of env based on error
            "planId": "starter",  # Plan (free tier is starter)
            "region": "oregon",  # Deployment region
            "autoDeploy": True,  # Enable auto deploy
            "branch": "main",  # Git branch
            "repoUrl": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",  # Repository URL
            "startCommand": "cd backend && python start_server.py",  # Start command
            "envSpecificDetails": {
                "pythonVersion": "3.11"  # Required for Python services
            },
            "envVars": [
                {
                    "key": "DATABASE_URL",
                    "value": "postgresql://neondb_owner:npg_6Jpbvyxg5CPa@ep-long-boat-afzxm68c-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
                },
                {
                    "key": "JWT_SECRET_KEY",
                    "value": "VKNtP9E9EPeHgfKgECJWj9QKyTLdDo4cOnDTNFFtWT4"
                },
                {
                    "key": "JWT_REFRESH_SECRET_KEY",
                    "value": "7McGNa-KOgPMt4r5Wclnp-WXSewymj2jszVG-m9zZFc"
                },
                {
                    "key": "BETTER_AUTH_SECRET",
                    "value": "g3r1fTamim6swGxQelGHU090dWG_v3S4Fh8KN_VjK88"
                },
                {
                    "key": "PORT",
                    "value": "10000"
                },
                {
                    "key": "ENVIRONMENT",
                    "value": "production"
                },
                {
                    "key": "DEBUG",
                    "value": "False"
                },
                {
                    "key": "CORS_ALLOWED_ORIGINS",
                    "value": "https://todo-backend.onrender.com"
                }
            ]
        }
    }

    print("Deploying to Render...")
    
    # Service create karne ka API call
    response = requests.post(
        'https://api.render.com/v1/services',
        headers=headers,
        json=service_data
    )

    if response.status_code == 201:
        service_info = response.json()
        service_id = service_info['id']
        service_name = service_info['name']
        service_url = service_info.get('serviceDetails', {}).get('url', 'URL not available')
        
        print(f"SUCCESS: Service successfully created!")
        print(f"  Service ID: {service_id}")
        print(f"  Service Name: {service_name}")
        print(f"  URL: {service_url}")
        return service_id
    else:
        print(f"ERROR: Error creating service: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def monitor_deployment(service_id):
    """
    Deployment process ko monitor karta hai
    """
    api_key = check_authentication()
    if not api_key:
        return

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    print("\nMonitoring deployment...")
    print("This may take 5-10 minutes. Please wait...\n")
    
    max_attempts = 20  # 10 minutes total with 30-second intervals
    attempt = 0
    
    while attempt < max_attempts:
        response = requests.get(
            f'https://api.render.com/v1/services/{service_id}',
            headers=headers
        )

        if response.status_code == 200:
            service_info = response.json()
            
            # Get the latest build information
            builds_response = requests.get(
                f'https://api.render.com/v1/services/{service_id}/deploys',
                headers=headers,
                params={'limit': 1}
            )
            
            if builds_response.status_code == 200:
                builds = builds_response.json().get('deploys', [])
                if builds:
                    latest_build = builds[0]
                    current_status = latest_build.get('status', 'unknown')
                    
                    print(f"Status: {current_status}")
                    
                    if current_status == 'live':
                        print("\nSUCCESS: Deployment successful!")
                        service_url = service_info.get('serviceDetails', {}).get('url', 'URL not available')
                        print(f"Your app is live at: {service_url}")
                        return
                    elif current_status in ['failed', 'cancelled']:
                        print(f"\nERROR: Deployment {current_status}!")
                        print(f"Build ID: {latest_build.get('id', 'N/A')}")
                        print(f"Build Message: {latest_build.get('message', 'N/A')}")
                        return
                    elif current_status in ['created', 'building', 'uploading', 'starting', 'stopping']:
                        # Continue monitoring
                        pass
                    else:
                        print(f"Unknown status: {current_status}")
                        
        else:
            print(f"⚠️ Error getting service status: {response.status_code}")
            print(f"Response: {response.text}")
            if response.status_code == 404:
                print("Service might still be creating. Waiting...")
        
        attempt += 1
        time.sleep(30)  # 30 seconds delay

    print("\nTIMEOUT: Deployment is taking longer than expected.")
    print("Please check the status on Render dashboard: https://dashboard.render.com")

def main():
    print("Render Deployment Script")
    print("=" * 40)
    
    service_id = deploy_to_render()
    if service_id:
        print(f"\nService ID: {service_id}")
        monitor_deployment(service_id)
    else:
        print("\nDeployment failed. Please check the error messages above.")
        print("Make sure your RENDER_API_KEY is valid and you have permissions.")

if __name__ == "__main__":
    main()