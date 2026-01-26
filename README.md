# Taskly - Progressive Todo Management Application

A modern, feature-rich todo management application built with Next.js 14, FastAPI, and PostgreSQL. This application provides a complete solution for managing tasks with authentication, categorization, and advanced filtering capabilities, with PWA support for offline functionality.

## 🌟 Features

### Core Features
- **Progressive Web App (PWA)**: Installable application that works offline and online
- **Authentication System**: Complete login, signup, and logout functionality with password visibility toggle
- **Task Management**: Create, read, update, and delete tasks with real-time updates
- **Advanced Filtering**: Filter tasks by status, priority, categories, and search terms
- **User Dashboard**: Personalized dashboard showing task statistics and overview
- **Profile Management**: Update user profile information and settings
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

### AI-Powered Features
- **Natural Language Processing**: AI assistant for task management using natural language
- **Smart Task Creation**: Create tasks using conversational commands
- **Task Automation**: Intelligent task categorization and prioritization
- **Multi-Language Support**: Understands commands in multiple languages (English, Hindi, etc.)

### Security Features
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Visibility Toggle**: Secure password input with show/hide functionality
- **Password Reset**: Secure password reset with token-based verification
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: Protection against brute force and DoS attacks
- **CSRF Protection**: Cross-site request forgery protection
- **SQL Injection Prevention**: ORM-based query construction
- **XSS Prevention**: Output encoding and input sanitization
- **CORS Protection**: Proper cross-origin resource sharing

### Performance & UX
- **Dark/Light Theme**: Automatic theme switching with user preference saving
- **Skeleton Loaders**: Smooth loading experiences with skeleton screens
- **Offline Support**: Full PWA functionality with offline access to tasks
- **Keyboard Shortcuts**: Enhanced accessibility with keyboard navigation
- **Accessibility**: WCAG compliant interface with proper ARIA attributes
- **Smooth Animations**: Framer Motion for fluid UI transitions
- **Real-time Updates**: Live synchronization of task changes

### Advanced Features
- **Recurring Tasks**: Schedule tasks that repeat automatically
- **Task Sharing**: Share tasks with other users (coming soon)
- **Calendar Integration**: Sync tasks with calendar applications (coming soon)
- **Email Notifications**: Get notified about upcoming tasks (coming soon)
- **Export/Import**: Export tasks to various formats (coming soon)
- **Bulk Operations**: Update or delete multiple tasks at once
- **Task Categories**: Organize tasks into custom categories
- **Priority Management**: Assign priority levels (low, medium, high) to tasks

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API, Zustand
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **PWA Support**: Service workers and manifest
- **Build Tool**: Webpack (via Next.js)

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (with Neon Serverless support)
- **ORM**: SQLModel (combines SQLAlchemy and Pydantic)
- **Authentication**: JWT with PyJWT and PassLib for password hashing
- **Migrations**: Alembic
- **Validation**: Pydantic
- **Security**: BCrypt for password hashing
- **AI Integration**: Natural language processing with MCP tools
- **Rate Limiting**: SlowAPI
- **Web Server**: Uvicorn

## 📁 Project Structure

```
todo_web_app/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── src/
│   │   ├── api/             # API routes (auth, tasks, categories, chat)
│   │   ├── auth/            # Authentication services
│   │   ├── config/          # Configuration and settings
│   │   ├── db/              # Database session, monitoring, backup
│   │   ├── mcp_tools/       # Model Control Plane tools for AI
│   │   ├── middleware/      # Application middleware
│   │   ├── models/          # SQLModel database models
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utilities (JWT, exceptions, etc.)
│   │   └── main.py          # Server startup script
│   ├── requirements.txt     # Python dependencies
│   ├── start_server.py      # Server startup script
│   └── seed_db.py           # Database seeding script
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes (placeholder - actual API is in backend)
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard page
│   │   ├── profile/        # Profile management
│   │   ├── tasks/          # Task management pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── providers.tsx   # React providers wrapper
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx      # Application header
│   │   ├── PasswordVisibilityToggle.tsx  # Password visibility toggle
│   │   ├── AiChatbot.tsx   # AI assistant component
│   │   └── ...             # Other components
│   ├── lib/                 # Utility functions and context
│   │   ├── api-client.ts   # API client for backend communication
│   │   ├── auth-context.tsx # Authentication context
│   │   ├── theme-context.tsx # Theme context
│   │   ├── chat-service.ts # Chat service for AI assistant
│   │   ├── chat-config.ts  # Chat configuration
│   │   └── ...             # Other utilities
│   ├── public/              # Static assets
│   │   ├── img/            # Images and logos
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js           # Service worker
│   ├── styles/              # Global styles
│   ├── package.json         # Node.js dependencies
│   └── next.config.js       # Next.js configuration
├── docker-compose.yml       # Docker orchestration
├── .github/workflows/       # CI/CD pipelines
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) for frontend
- **Python** (v3.8 or higher) for backend
- **PostgreSQL** database (or Neon Serverless account)
- **npm** or **yarn** for frontend package management
- **Docker** and **Docker Compose** (recommended for easy setup)

### Quick Setup with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/todo-web-app.git
   cd todo-web-app
   ```

2. Create environment files:
   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   ```

3. Build and start all services:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`

### Setting up Neon Database (Recommended for Production)

1. **Create a Neon Account**:
   - Go to [Neon Console](https://console.neon.tech/)
   - Sign up for a free account
   - Create a new project (e.g., "todo-web-app")

2. **Get Your Database Connection String**:
   - In the Neon Console, go to your project
   - Click on "Connection Details"
   - Copy the connection string (it will look like: `postgresql://username:password@ep-...us-east-1.aws.neon.tech:5432/neondb?sslmode=require`)

3. **Configure Your Application**:
   - Update `backend/.env` with your Neon connection string:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@ep-polished-feather-12345678.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
   ```

   - For local development with Neon, update your `.env` file:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@ep-polished-feather-12345678.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
   DB_POOL_SIZE=5
   DB_MAX_OVERFLOW=10
   DB_POOL_RECYCLE=300
   ```

4. **Run Database Migrations**:
   ```bash
   # Navigate to backend
   cd backend

   # Activate your virtual environment if using one
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Run migrations to set up your database tables
   alembic upgrade head
   ```

5. **Deploy Your Application**:
   - You can deploy your backend to platforms like Railway, Render, or Heroku
   - The frontend can be deployed to Vercel, Netlify, or similar platforms
   - Make sure to update the `NEXT_PUBLIC_BACKEND_API_URL` in your frontend environment to point to your deployed backend

6. **Alternative: Local Development with Neon**:
   - You can run the backend locally while connecting to Neon database
   - Just make sure your Neon database allows connections from your IP
   - Update the `DATABASE_URL` in your local `.env` file
   - Run the backend locally: `python start_server.py`
   - Run the frontend locally: `npm run dev`

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET_KEY=your-super-secret-refresh-key-change-in-production
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   python start_server.py
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update the backend API URL in `.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:3000`.

## 📱 Progressive Web App Features

### Installing the PWA
1. Open the application in a modern browser (Chrome, Firefox, Safari, Edge)
2. Look for the "Install" button in the address bar
3. Click "Install" to add the app to your home screen
4. The app will work offline and provide a native-like experience

### PWA Capabilities
- **Offline Support**: Access your tasks even without internet connection
- **Installable**: Add to home screen for quick access
- **Push Notifications**: Receive task reminders (coming soon)
- **Background Sync**: Sync data when connection is restored
- **Native Feel**: App-like experience with smooth animations
- **Service Workers**: Cache assets and enable offline functionality
- **Manifest File**: Define app properties for installation

## 🔐 Authentication & Security

### Password Visibility Toggle
All password fields include an eye icon that allows users to toggle password visibility:
- Click the eye icon to show the password
- Click again to hide the password
- This feature is available on login, signup, and profile pages

### Security Measures
- **JWT Tokens**: Secure authentication with refresh tokens
- **Password Hashing**: BCrypt for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation and sanitization
- **CORS Protection**: Proper cross-origin resource sharing
- **CSRF Protection**: Cross-site request forgery prevention
- **Session Management**: Proper token lifecycle management
- **Password Strength Validation**: Enforces strong password requirements

## 🤖 AI Assistant Features

### Natural Language Processing
Interact with the AI assistant using natural language:
- "Add a task to buy groceries tomorrow"
- "Show me all pending tasks"
- "Mark the meeting task as completed"
- "Update the project deadline to Friday"
- "Create task wash the car with high priority"
- "Complete task 'buy groceries'"
- "Delete task 'call mom'"

### Supported AI Commands
- **Task Creation**: "Add a task to [description]", "Create task [description]", "Need to [action]"
- **Task Listing**: "Show me my tasks", "What are my pending tasks?", "List my tasks"
- **Task Completion**: "Mark [task name] as completed", "Complete task [task name]", "Finish [task name]"
- **Task Updates**: "Update [task name] to [new details]", "Change [task name] priority to high"
- **Task Deletion**: "Delete task [task name]", "Remove [task name]", "Eradicate [task name]"
- **Help**: "Help", "How to use this app?", "What can you do?"

### MCP Integration
The application uses Model Control Plane (MCP) tools for:
- Task creation and management
- Natural language understanding
- Smart task categorization
- Automated task scheduling
- Intent classification and entity extraction

### Multi-Language Support
The AI assistant supports commands in multiple languages:
- English: "Add a task to buy groceries"
- Hindi: "काम जोड़ो कि ग्रॉसरी लानी है"
- Mixed languages: "Add task कि मीटिंग है tomorrow"

## 🎨 Theming

### Dark/Light Mode
- Automatic theme detection based on system preference
- Manual toggle in the header
- Theme preference saved in localStorage
- Smooth transitions between themes
- Consistent color schemes across all components

## 📊 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login and get access tokens
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `GET /me` - Get current user info
- `PUT /profile` - Update user profile
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

### Tasks (`/api/{user_id}/tasks`)
- `GET /` - Get all tasks for the current user
- `GET /{task_id}` - Get a specific task
- `POST /` - Create a new task
- `PUT /{task_id}` - Update an existing task
- `DELETE /{task_id}` - Delete a task
- `PATCH /{task_id}/complete` - Toggle task completion
- `POST /bulk-update` - Bulk update tasks
- `POST /bulk-delete` - Bulk delete tasks

### Categories (`/api/{user_id}/categories`)
- `GET /` - Get all categories for the current user
- `GET /{category_id}` - Get a specific category
- `POST /` - Create a new category
- `PUT /{category_id}` - Update an existing category
- `DELETE /{category_id}` - Delete a category

### Chat (`/api/{user_id}/chat`)
- `POST /` - Send message to AI assistant
- `GET /{conversation_id}` - Get conversation history

### Recurring Tasks (`/api/{user_id}/recurring-tasks`)
- `GET /` - Get all recurring tasks for the current user
- `GET /{recurring_task_id}` - Get a specific recurring task
- `POST /` - Create a new recurring task
- `PUT /{recurring_task_id}` - Update an existing recurring task
- `DELETE /{recurring_task_id}` - Delete a recurring task

## 📅 Recurring Tasks

### Recurring Task Configuration
- **Interval Days**: Set how often the task repeats (e.g., every 1 day, 7 days, 30 days)
- **Next Occurrence**: Timestamp of when the next task instance should be created
- **End Date**: Optional date when the recurring task should stop
- **Max Occurrences**: Optional maximum number of times the task should repeat
- **Task Template**: Define the base task that gets repeated

### Scheduler System
- **Background Processing**: Runs in a separate thread
- **Periodic Checks**: Checks for due recurring tasks hourly
- **Automatic Task Creation**: Generates new task instances when due
- **Next Occurrence Update**: Updates schedule after each occurrence

## 🔄 Offline Functionality

### Offline-First Architecture
- **Local Storage**: Uses localStorage and sessionStorage for data persistence
- **Offline-First Design**: Operations work even when disconnected
- **Background Sync**: Automatically synchronizes data when connection is restored
- **Cached Assets**: Critical resources are cached for instant loading
- **Data Synchronization**: Two-way sync between local and server data

### Sync Mechanisms
- **Conflict Resolution**: Handles cases where both local and server data have been modified
- **Automatic Sync**: Periodic synchronization when online
- **Manual Sync**: User-initiated synchronization
- **Status Tracking**: Tracks which items have been synchronized
- **Retry Logic**: Automatically retries failed sync operations

### Offline Storage Service
- **Task Persistence**: Save, update, and delete tasks locally
- **Conversation Storage**: Store chat conversations when offline
- **Sync Status Tracking**: Mark items as synced or pending
- **Data Statistics**: Track offline data size and counts

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Test Coverage
- **Unit Tests**: Individual components and functions
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Complete user workflows
- **Security Tests**: Authentication and authorization flows

## 🚢 Deployment

### Production Deployment

#### Environment Setup
1. Set up production environment variables
2. Configure database connection
3. Set up SSL certificates
4. Configure domain and DNS

#### Docker Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Deployment Platforms
- **Backend**: Railway, Render, Heroku, AWS, Google Cloud
- **Frontend**: Vercel, Netlify, AWS S3, Firebase Hosting
- **Database**: Neon, AWS RDS, Google Cloud SQL, PostgreSQL hosting

### Environment Variables
#### Backend Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET_KEY`: Secret key for refresh tokens
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time
- `CORS_ALLOWED_ORIGINS`: Allowed origins for CORS
- `DB_POOL_SIZE`: Database connection pool size
- `DB_MAX_OVERFLOW`: Maximum database connections
- `DB_POOL_RECYCLE`: Connection recycle time

#### Frontend Environment Variables
- `NEXT_PUBLIC_BACKEND_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_DOMAIN`: Application domain
- `NEXT_PUBLIC_PROD_DOMAIN`: Production domain
- `NEXT_PUBLIC_CHAT_API_URL`: Chat API URL
- `NEXT_PUBLIC_CHAT_TIMEOUT`: Chat timeout in milliseconds

## 📊 Database Schema

### User Table
- `id`: UUID (Primary Key)
- `email`: String (Unique, Not Null)
- `first_name`: String (Not Null)
- `last_name`: String (Not Null)
- `hashed_password`: String (Not Null)
- `is_active`: Boolean (Default: True)
- `is_verified`: Boolean (Default: False)
- `created_at`: DateTime (Default: Current Time)
- `updated_at`: DateTime (Default: Current Time)

### Task Table
- `id`: UUID (Primary Key)
- `title`: String (Not Null)
- `description`: String (Nullable)
- `status`: String (Not Null) - Values: 'pending', 'in-progress', 'completed'
- `priority`: String (Not Null) - Values: 'low', 'medium', 'high'
- `due_date`: DateTime (Nullable)
- `completed_at`: DateTime (Nullable)
- `user_id`: UUID (Foreign Key to users, Not Null)
- `category_id`: UUID (Foreign Key to categories, Nullable)
- `recurring_task_id`: UUID (Foreign Key to recurring_tasks, Nullable)
- `created_at`: DateTime (Default: Current Time)
- `updated_at`: DateTime (Default: Current Time)

### Category Table
- `id`: UUID (Primary Key)
- `name`: String (Not Null)
- `description`: String (Nullable)
- `user_id`: UUID (Foreign Key to users, Not Null)
- `created_at`: DateTime (Default: Current Time)
- `updated_at`: DateTime (Default: Current Time)

### Conversation Table
- `id`: UUID (Primary Key)
- `title`: String (Not Null)
- `user_id`: UUID (Foreign Key to users, Not Null)
- `created_at`: DateTime (Default: Current Time)
- `updated_at`: DateTime (Default: Current Time)

### Message Table
- `id`: UUID (Primary Key)
- `role`: String (Not Null) - Values: 'user', 'assistant'
- `content`: String (Not Null)
- `conversation_id`: UUID (Foreign Key to conversations, Not Null)
- `timestamp`: DateTime (Default: Current Time)

### RecurringTask Table
- `id`: UUID (Primary Key)
- `title`: String (Not Null)
- `description`: String (Nullable)
- `status`: String (Not Null) - Values: 'pending', 'in-progress', 'completed'
- `priority`: String (Not Null) - Values: 'low', 'medium', 'high'
- `interval_days`: Integer (Not Null)
- `next_occurrence`: DateTime (Not Null)
- `end_date`: DateTime (Nullable)
- `max_occurrences`: Integer (Nullable)
- `user_id`: UUID (Foreign Key to users, Not Null)
- `created_at`: DateTime (Default: Current Time)
- `updated_at`: DateTime (Default: Current Time)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Write tests for new functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write comprehensive unit and integration tests
- Document new features and API endpoints
- Update the README with new functionality
- Ensure all tests pass before submitting a PR

### Code Standards
- **Frontend**: TypeScript, React best practices, Tailwind CSS conventions
- **Backend**: Python PEP 8, FastAPI best practices, SQLModel conventions
- **Documentation**: Clear, concise, and comprehensive documentation
- **Testing**: Maintain high test coverage (>80%)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository or contact the maintainers.

---

Built with ❤️ using Next.js, FastAPI, and PostgreSQL.

**Taskly** - Your intelligent task management companion.