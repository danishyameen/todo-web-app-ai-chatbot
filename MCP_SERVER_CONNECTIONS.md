# MCP Server Connections

## Overview
This document details the MCP (Model Control Plane) server connections established for the Todo AI Chatbot project.

## Connected MCP Servers

### 1. GitHub MCP Server
- **Status**: ✅ Connected
- **API Base URL**: `https://api.github.com`
- **Token**: `YOUR_GITHUB_TOKEN_HERE`
- **Capabilities**:
  - Repository information retrieval
  - Issue creation and management
  - User repository listing
  - Pull request operations

### 2. Context7 MCP Server
- **Status**: ✅ Connected
- **API Base URL**: `https://api.context7.com`
- **API Key**: `YOUR_CONTEXT7_API_KEY_HERE`
- **Capabilities**:
  - Documentation search
  - Library information retrieval
  - Content analysis and retrieval
  - Knowledge base queries

### 3. Vercel MCP Server
- **Status**: ✅ Connected
- **API Base URL**: `https://api.vercel.com`
- **Token**: `YOUR_VERCEL_TOKEN_HERE`
- **Capabilities**:
  - Deployment management
  - Project status monitoring
  - Environment configuration
  - Application lifecycle management

## Configuration Files

### Environment Variables
Located in: `.backend/.env`
- `GITHUB_TOKEN`: GitHub personal access token
- `CONTEXT7_API_KEY`: Context7 API key
- `VERCEL_TOKEN`: Vercel access token

### MCP Configuration
Located in: `.mcp_config.json`
- Contains server configurations and connection details
- Enables/disables specific MCP servers
- Stores API endpoints and authentication details

## Services Integration

### MCP Integration Service
- **Location**: `backend/src/services/mcp_integration_service.py`
- **Function**: Coordinates communication with all MCP servers
- **Features**:
  - Connection testing for all servers
  - Tool request routing to appropriate servers
  - Error handling and logging
  - Response formatting

### MCP Settings
- **Location**: `backend/src/config/mcp_settings.py`
- **Function**: Manages configuration for all MCP servers
- **Features**:
  - Server enable/disable checks
  - Token management
  - Configuration validation

## Connection Status
- **Total MCP Servers Connected**: 3
- **GitHub**: Active and authenticated
- **Context7**: Active and authenticated
- **Vercel**: Active and authenticated

## Usage
The MCP servers are integrated into the Todo AI Chatbot backend and can be accessed through the `MCPIntegrationService` which provides:
- Tool execution across different platforms
- Unified interface for multi-platform operations
- Authentication management
- Error recovery and fallback mechanisms

## Security
- All API keys and tokens are stored in environment variables
- Tokens are not hardcoded in source code
- Proper authentication headers are used for all API calls
- Connection testing ensures validity of credentials