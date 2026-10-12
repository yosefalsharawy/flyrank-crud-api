# Task API

A RESTful Task API built with **Node.js** and **Express.js** for the FlyRank Backend Internship.

The project evolved from an in-memory API to SQLite, then to **PostgreSQL with Docker Compose**.

## Tech Stack

Node.js, Express.js, PostgreSQL 18, Docker, Docker Compose, JavaScript, Swagger/OpenAPI.

## Features

- Complete CRUD operations
- Input validation and HTTP status codes
- PostgreSQL with parameterized SQL queries
- Automatic table creation and seeding
- Environment variables using `.env`
- Docker Compose with persistent database storage
- Swagger API documentation

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

Swagger UI: http://localhost:3000/docs

## Development Progress

### Week 1 — In-Memory CRUD

Implemented REST endpoints, validation, controllers, Swagger documentation, and API testing.

### Week 2 — SQLite

Replaced in-memory storage with SQLite using `better-sqlite3`. Implemented SQL-based CRUD and persistent local storage.

### Week 3 — PostgreSQL & Docker

- **Stage 0:** Created and tested PostgreSQL in Docker.
- **Stage 1:** Connected Express to PostgreSQL using `pg` and `.env`.
- **Stage 2:** Migrated GET endpoints to PostgreSQL.
- **Stage 3:** Migrated POST, PUT, and DELETE using parameterized SQL.
- **Stage 4:** Containerized Express and PostgreSQL with Docker Compose.
- **Stage 5:** Documented setup and verified database persistence.

## Running the Project

### Prerequisites

- Docker
- Docker Compose
- Git

### Setup

```bash
git clone https://github.com/yosefalsharawy/flyrank-crud-api.git
cd flyrank-crud-api
```

Copy `.env.example` to `.env` and configure:

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=tasks
DATABASE_URL=postgres://postgres:your_password@localhost:5432/tasks
```

Start the containers:

```bash
docker compose up --build -d
```

Check their status:

```bash
docker compose ps
```

API: http://localhost:3000

Swagger: http://localhost:3000/docs

## Testing

Get all tasks:

```bash
curl -i http://localhost:3000/tasks
```

Create a task (Windows CMD):

```cmd
curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Docker test\"}"
```

## Database Persistence

PostgreSQL uses a named Docker volume to preserve data.

Persistence was verified by creating a task, removing the containers, restarting them, and confirming the task still existed.

```bash
docker compose down
docker compose up -d
```

**Note:** `docker compose down -v` deletes the database volume.

## Project Structure

```text
flyrank-crud-api/
├── src/
│   ├── controllers/
│   ├── routes/
│   └── db/
│       ├── database.js
│       └── task.repository.js
├── server.js
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── .env.example
├── openapi.json
├── package.json
└── README.md
```

## Conclusion

The final application runs Express and PostgreSQL in separate Docker containers, supports full CRUD operations, and preserves data across container restarts.