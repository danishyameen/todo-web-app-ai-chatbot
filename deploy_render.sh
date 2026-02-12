#!/bin/bash

# Render API ke liye credentials
RENDER_API_KEY="YOUR_RENDER_API_KEY_HERE"
SERVICE_NAME="todo-backend"
PLAN_ID="starter"  # Free tier plan

# Service create karne ke liye API call
curl -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service": {
      "name": "'"$SERVICE_NAME"'",
      "type": "web",
      "runtime": "python",
      "repoUrl": "https://github.com/danishyameen/todo-web-app-ai-chatbot.git",
      "branch": "main",
      "plan": "'"$PLAN_ID"'",
      "autoDeploy": true,
      "region": "oregon",
      "buildCommand": "pip install -r backend/requirements.txt",
      "startCommand": "cd backend && python start_server.py",
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
  }' \
  https://api.render.com/v1/services