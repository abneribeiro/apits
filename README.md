# User Management API

A professional user management API built with TypeScript, Node.js, Drizzle ORM, and PostgreSQL. This API provides comprehensive user authentication, authorization, and role-based permission management.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with refresh tokens
- 👥 **User Management**: Complete CRUD operations for users
- 🎯 **Role-Based Permissions**: Flexible role and permission system
- 📊 **Rate Limiting**: Configurable rate limiting for API endpoints
- 🔍 **Input Validation**: Comprehensive validation using Zod
- 📝 **Logging**: Structured logging with Winston
- 🧪 **Testing**: Comprehensive unit and integration tests
- 🐳 **Docker Support**: Containerized application with Docker Compose
- 🏗️ **Professional Architecture**: Clean architecture with services, controllers, and repositories

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod
- **Testing**: Jest with Supertest
- **Logging**: Winston
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd user-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Quick start with script:
```bash
./scripts/start-dev.sh
```

Or manually:

4. Start the database with Docker:
```bash
docker-compose up -d postgres
```

5. Run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

6. Seed the database with initial data:
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Default Users

After seeding, you can use these default accounts:

- **Admin**: admin@example.com / Admin123!
- **Moderator**: moderator@example.com / Moderator123!
- **User**: user@example.com / User123!

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/userdb` |
| `JWT_SECRET` | JWT secret key | `your-super-secret-jwt-key-here` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Register a new user |
| `POST` | `/api/v1/users/login` | Login user |
| `POST` | `/api/v1/users/logout` | Logout user |
| `POST` | `/api/v1/users/refresh-token` | Refresh access token |

### User Management

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/api/v1/users/profile` | Get current user profile | ✓ | Any |
| `PUT` | `/api/v1/users/profile` | Update current user profile | ✓ | Any |
| `PUT` | `/api/v1/users/profile/change-password` | Change password | ✓ | Any |
| `GET` | `/api/v1/users` | Get all users | ✓ | Admin |
| `GET` | `/api/v1/users/:id` | Get user by ID | ✓ | Admin/Self |
| `PUT` | `/api/v1/users/:id` | Update user | ✓ | Admin |
| `DELETE` | `/api/v1/users/:id` | Delete user | ✓ | Admin |
| `PUT` | `/api/v1/users/:id/deactivate` | Deactivate user | ✓ | Admin |
| `PUT` | `/api/v1/users/:id/activate` | Activate user | ✓ | Admin |

### Permission Management

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/api/v1/permissions` | Create permission | ✓ | Admin |
| `GET` | `/api/v1/permissions` | Get all permissions | ✓ | Admin |
| `GET` | `/api/v1/permissions/:id` | Get permission by ID | ✓ | Admin |
| `PUT` | `/api/v1/permissions/:id` | Update permission | ✓ | Admin |
| `DELETE` | `/api/v1/permissions/:id` | Delete permission | ✓ | Admin |
| `POST` | `/api/v1/permissions/role/assign` | Assign permission to role | ✓ | Admin |
| `POST` | `/api/v1/permissions/role/revoke` | Revoke permission from role | ✓ | Admin |
| `GET` | `/api/v1/permissions/role/:role` | Get role permissions | ✓ | Admin |
| `POST` | `/api/v1/permissions/user/assign` | Assign permission to user | ✓ | Admin |
| `POST` | `/api/v1/permissions/user/revoke` | Revoke permission from user | ✓ | Admin |
| `GET` | `/api/v1/permissions/user/:userId` | Get user permissions | ✓ | Admin |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

## Request/Response Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### Get Profile

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `username` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `role` (ENUM: admin, user, moderator)
- `isActive` (BOOLEAN)
- `isEmailVerified` (BOOLEAN)
- `lastLogin` (TIMESTAMP)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Permissions Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `description` (TEXT)
- `resource` (VARCHAR)
- `action` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Role Permissions Table
- `id` (UUID, Primary Key)
- `role` (ENUM)
- `permissionId` (UUID, Foreign Key)
- `createdAt` (TIMESTAMP)

### User Permissions Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `permissionId` (UUID, Foreign Key)
- `createdAt` (TIMESTAMP)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Testing

Run the test suite:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Docker Deployment

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production

```bash
# Build and start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Configurable rate limits to prevent abuse
- **Input Validation**: Comprehensive validation with Zod
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet.js for security headers

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Add tests
5. Submit a pull request

## License

MIT License