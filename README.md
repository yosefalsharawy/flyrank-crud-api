# Task API

A RESTful Task Management API built with **Node.js**, **Express.js**, and **PostgreSQL** for the FlyRank Backend Internship.

The project evolved from an in-memory CRUD API to SQLite, then PostgreSQL with Docker Compose, and now includes **Supabase Authentication**, JWT-protected endpoints, and interactive Swagger documentation.

## Tech Stack

- **Backend:** Node.js, Express.js, JavaScript
- **Database:** PostgreSQL 18
- **Authentication:** Supabase Auth, JWT Bearer Tokens
- **Containerization:** Docker, Docker Compose
- **Documentation:** Swagger UI, OpenAPI 3.0
- **Database Driver:** node-postgres (`pg`)

## Features

- Complete CRUD operations for tasks
- Input validation and appropriate HTTP status codes
- PostgreSQL with parameterized SQL queries
- Automatic database initialization and task seeding
- Docker Compose with persistent database storage
- Environment-based configuration using `.env`
- User registration and login with Supabase Auth
- JWT verification through Supabase
- Reusable authentication middleware
- Protected profile and dashboard endpoints
- Authenticated logout
- Interactive Swagger documentation with Bearer authentication

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Retrieve all tasks |
| GET | `/tasks/:id` | Retrieve a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |

### Authentication

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register a user |
| POST | `/auth/login` | Public | Log in and receive tokens |
| POST | `/auth/logout` | Bearer JWT | Log out the authenticated user |

### Public and Protected Routes

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/` | Public | API information |
| GET | `/health` | Public | Health check |
| GET | `/public/info` | Public | Public welcome message |
| GET | `/protected/profile` | Bearer JWT | Retrieve authenticated user profile |
| GET | `/protected/dashboard` | Bearer JWT | Retrieve authenticated dashboard |

### API Documentation

Swagger UI is available at:

http://localhost:3000/docs

Protected endpoints support JWT Bearer authentication through Swagger's **Authorize** button.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/yosefalsharawy/flyrank-crud-api.git
cd flyrank-crud-api
```

### 2. Configure environment variables

Copy `.env.example` to `.env`.

Windows CMD:

```cmd
copy .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Configure the following values:

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=tasks

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-publishable-key
```

Use the Supabase project URL and publishable/anon key from your Supabase project settings.

The Docker Compose configuration constructs the PostgreSQL connection URL using the database environment variables.

**Security:** Never commit `.env`, database passwords, JWT access tokens, or refresh tokens to GitHub.

### 3. Start the application

```bash
docker compose up --build -d
```

Docker Compose starts the Express API and PostgreSQL database. The application initializes the required database tables and seeds initial task data.

No manual database setup is required.

### 4. Verify the containers

```bash
docker compose ps
```

Check the API:

```bash
curl -i http://localhost:3000/health
```

Retrieve the seeded tasks:

```bash
curl -i http://localhost:3000/tasks
```

### 5. Open Swagger UI

Visit:

http://localhost:3000/docs

All documented endpoints can be explored and tested through the Swagger interface.

## Authentication Guide

### 1. Register a user

**Endpoint:** `POST /auth/signup`

Windows CMD:

```cmd
curl -i -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"ExamplePassword123!\"}"
```

Expected response: **201 Created**

Supabase creates the user account.

### 2. Log in

**Endpoint:** `POST /auth/login`

```cmd
curl -i -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"ExamplePassword123!\"}"
```

Expected response: **200 OK**

Example response:

```json
{
  "access_token": "<access-token>",
  "refresh_token": "<refresh-token>"
}
```

The access token is used to authenticate requests to protected endpoints.

### 3. Access a protected endpoint

**Endpoint:** `GET /protected/profile`

```cmd
curl -i http://localhost:3000/protected/profile -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Replace `YOUR_ACCESS_TOKEN` with the token returned by the login endpoint.

Expected response: **200 OK**

```json
{
  "id": "user-uuid",
  "email": "test@example.com",
  "created_at": "2026-10-13T16:04:51.456762Z"
}
```

### 4. Test unauthorized access

Without a token:

```bash
curl -i http://localhost:3000/protected/profile
```

Expected response: **401 Unauthorized**

```json
{
  "error": "Access token required"
}
```

With an invalid token:

```cmd
curl -i http://localhost:3000/protected/profile -H "Authorization: Bearer invalid123"
```

Expected response: **401 Unauthorized**

```json
{
  "error": "Invalid or expired token"
}
```

### 5. Log out

**Endpoint:** `POST /auth/logout`

```cmd
curl -i -X POST http://localhost:3000/auth/logout -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response: **204 No Content**

Logout invalidates the applicable Supabase refresh-token sessions. Already-issued access JWTs may remain valid until expiration.

## Testing Tasks CRUD

### Get all tasks

```bash
curl -i http://localhost:3000/tasks
```

### Create a task

Windows CMD:

```cmd
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Docker test\"}"
```

Expected response: **201 Created**

## Swagger Bearer Authentication

To test protected endpoints using Swagger UI:

1. Open http://localhost:3000/docs.
2. Execute `POST /auth/login` with valid credentials.
3. Copy the returned `access_token`.
4. Click **Authorize**.
5. Paste the JWT into the `bearerAuth` field without the `Bearer` prefix.
6. Click **Authorize**, then close the dialog.
7. Execute `GET /protected/profile` or `GET /protected/dashboard`.

Swagger automatically attaches the Authorization header to protected requests.

### Swagger Screenshot

Add a screenshot of the Swagger interface showing the authentication and protected endpoints.

![Swagger UI with Bearer Authentication](docs/swagger-auth.png)

## Database Persistence

PostgreSQL uses a named Docker volume to preserve task data across container restarts.

Persistence was verified by creating a task, stopping the containers, restarting them, and confirming the task still existed.

```bash
docker compose down
docker compose up -d
```

**Note:** Running `docker compose down -v` removes the database volume and deletes the stored database data.

## Project Structure

```text
flyrank-crud-api/
├── src/
│   ├── config/
│   │   └── supabase.js
│   ├── controllers/
│   │   └── authController.js
│   │   └── taskController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── publicRoutes.js
│   │   ├── protectedRoutes.js
│   │   └── task.route.js
│   ├── db/
│   │   ├── database.js
│   │   └── task.repository.js
│   └── app.js
├── docs/
│   └── swagger-auth.png
├── server.js
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── .gitignore
├── .env.example
├── openapi.json
├── package.json
└── README.md
```

## Development Progress

### Week 1 — In-Memory CRUD

Implemented REST endpoints, input validation, controllers, Swagger documentation, and API testing.

### Week 2 — SQLite

Replaced in-memory storage with SQLite using `better-sqlite3`. Implemented SQL-based CRUD and persistent local storage.

### Week 3 — PostgreSQL & Docker

- **Stage 0:** Created and tested PostgreSQL in Docker.
- **Stage 1:** Connected Express to PostgreSQL using `pg` and environment variables.
- **Stage 2:** Migrated GET endpoints to PostgreSQL.
- **Stage 3:** Migrated POST, PUT, and DELETE using parameterized SQL.
- **Stage 4:** Containerized Express and PostgreSQL with Docker Compose.
- **Stage 5:** Documented setup and verified database persistence.

### Week 4 — Supabase Authentication

- **Stage 0:** Configured Supabase and environment variables.
- **Stage 1:** Implemented signup and login endpoints.
- **Stage 2:** Created public and protected routes with Bearer token extraction.
- **Stage 3:** Added JWT verification through Supabase.
- **Stage 4:** Extracted reusable authentication middleware and implemented logout.
- **Stage 5:** Extended Swagger documentation with JWT Bearer authentication.
- **Stage 6:** Updated documentation and prepared the project for GitHub publication.

## Conclusion

The application provides a containerized REST API with PostgreSQL persistence, complete task CRUD operations, Supabase user authentication, reusable JWT verification middleware, and interactive Swagger documentation.

The project can be started using Docker Compose with no manual PostgreSQL initialization.
