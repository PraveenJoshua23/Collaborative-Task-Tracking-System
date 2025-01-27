# Task Management System API

A comprehensive REST API for managing tasks, teams, and user collaboration built with Node.js, Express, and MongoDB.

## Features

- 🔐 Authentication & Authorization with JWT
- 👥 Team Management
- 📋 Task Creation and Assignment
- 🔍 Advanced Task Filtering and Search
- 💬 Task Comments
- 📎 File Attachments
- 👤 User Profiles
- 🔒 Role-Based Access Control (RBAC)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret_key
```

4. Create upload directories:
```bash
mkdir -p uploads/avatars uploads/tasks
```

## Project Structure

```
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── taskController.js
│   └── teamController.js
├── middlewares/
│   ├── auth.js
│   ├── rbac.js
│   └── upload.js
├── models/
│   ├── Task.js
│   ├── Team.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── taskRoutes.js
│   └── teamRoutes.js
├── uploads/
│   ├── avatars/
│   └── tasks/
├── .env
├── .gitignore
├── index.js
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Profile Management

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `DELETE /api/profile` - Delete profile
- `PUT /api/profile/password` - Change password
- `POST /api/profile/avatar` - Upload avatar
- `GET /api/profile/teams` - Get user's teams

### Team Management

- `POST /api/teams` - Create new team
- `GET /api/teams` - List all teams
- `GET /api/teams/:teamId` - Get team details
- `PUT /api/teams/:teamId` - Update team
- `DELETE /api/teams/:teamId` - Delete team
- `POST /api/teams/:teamId/members` - Add team member
- `DELETE /api/teams/:teamId/members/:userId` - Remove team member
- `PATCH /api/teams/:teamId/members/:userId/role` - Update member role

### Task Management

- `POST /api/tasks` - Create new task
- `GET /api/tasks` - List tasks (with filtering)
- `GET /api/tasks/:taskId` - Get task details
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task
- `POST /api/tasks/:taskId/comments` - Add comment
- `POST /api/tasks/:taskId/attachments` - Add attachments
- `DELETE /api/tasks/:taskId/attachments/:attachmentId` - Remove attachment

## Role-Based Access Control

The system implements RBAC with the following roles:

### System Roles
- **Admin**: Full system access
- **Team Leader**: Can create teams and manage team tasks
- **Team Member**: Basic task and team member capabilities
- **Viewer**: Read-only access

### Team Roles
- **Leader**: Full team management capabilities
- **Member**: Can create and manage tasks
- **Viewer**: Read-only access to team content

## Task Filtering

Tasks can be filtered using query parameters:

```javascript
GET /api/tasks?status=open&priority=high&teamId=123&search=urgent
```

Available filters:
- `status`: open, in_progress, completed
- `priority`: low, medium, high
- `teamId`: Filter by specific team
- `assignedTo`: Filter by assigned user
- `search`: Search in title and description
- `startDate`: Filter by due date range start
- `endDate`: Filter by due date range end

## File Upload Specifications

### Avatars
- Maximum size: 5MB
- Allowed types: JPEG, PNG, GIF

### Task Attachments
- Maximum size: 10MB per file
- Maximum files per upload: 5
- Allowed types: 
  - Images (JPEG, PNG, GIF)
  - Documents (PDF, DOC, DOCX, TXT)
  - Spreadsheets (XLS, XLSX)

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Security

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- File upload validation
- MongoDB injection protection

## Development

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Production Deployment

1. Set production environment variables
2. Build the project:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details