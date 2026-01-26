# backend_start.ps1

# 1. Activate Python virtual environment
Write-Host "Activating Python virtual environment..."
& .\venv\Scripts\Activate.ps1

# 2. Pull latest MCP tools from GitHub
Write-Host "Pulling latest MCP server repo..."
if (Test-Path ".\mcp_server") {
    git -C .\mcp_server pull
} 

# 3. Start MCP Server (Context 7)
Write-Host "Starting MCP Server..."
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m mcp_server.main --config .\mcp_server\mcp_config.yaml"

# Wait for MCP server to initialize
Write-Host "Waiting 5 seconds for MCP server to initialize..."
Start-Sleep -Seconds 5

# 4. Start FastAPI backend
Write-Host "Starting FastAPI backend..."
Start-Process -NoNewWindow -FilePath "uvicorn" -ArgumentList "backend.main:app --reload --host 0.0.0.0 --port 8000"

Write-Host "Backend + MCP server started successfully!"
