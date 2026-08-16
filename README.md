# Task API

A simple RESTful Task API built with **Node.js** and **Express.js** as part of the FlyRank Backend Internship assignment.

The project implements a complete CRUD API using an in-memory array, with interactive API documentation provided through Swagger UI.

## Features

- RESTful API built with Express.js
- In-memory task storage
- Complete CRUD operations
- Request validation
- Appropriate HTTP status codes
- Swagger UI / OpenAPI documentation
- API testing with `curl -i`

## Technologies

- Node.js
- Express.js
- Swagger UI Express
- OpenAPI 3.0
- JavaScript

## Installation

Clone the repository:

```bash
git clone https://github.com/yosefalsharawy/flyrank-crud-api.git
cd flyrank-crud-api
```

Install the dependencies:

```bash
npm install
```

## Running the API

Start the server:

```bash
npm start
```

The server runs on:

```text
http://localhost:3000
```

## API Endpoints

| Method | Endpoint     | Description         | Success | Errors   |
| ------ | ------------ | ------------------- | ------- | -------- |
| GET    | `/`          | Get API information | 200     | —        |
| GET    | `/health`    | Check server status | 200     | —        |
| GET    | `/tasks`     | Get all tasks       | 200     | —        |
| GET    | `/tasks/:id` | Get a task by ID    | 200     | 404      |
| POST   | `/tasks`     | Create a new task   | 201     | 400      |
| PUT    | `/tasks/:id` | Update a task       | 200     | 400, 404 |
| DELETE | `/tasks/:id` | Delete a task       | 204     | 404      |

## Task Format

A task has the following structure:

```json
{
	"id": 1,
	"title": "Learn Express",
	"done": false
}
```

## Creating a Task

### Request

```http
POST /tasks
Content-Type: application/json
```

Request body:

```json
{
	"title": "Learn Swagger"
}
```

### Response

```json
{
	"id": 4,
	"title": "Learn Swagger",
	"done": false
}
```

The API returns:

- `201 Created` when the task is created successfully.
- `400 Bad Request` when the title is missing, empty, or not a string.

## Updating a Task

A task can be updated by changing its `title`, `done` status, or both.

Example:

```http
PUT /tasks/4
Content-Type: application/json
```

Request body:

```json
{
	"done": true
}
```

Response:

```json
{
	"id": 4,
	"title": "Learn Swagger",
	"done": true
}
```

The API returns:

- `200 OK` when the task is updated successfully.
- `400 Bad Request` for an invalid or empty request body.
- `404 Not Found` when the task does not exist.

## Deleting a Task

```http
DELETE /tasks/4
```

Successful deletion returns:

```text
204 No Content
```

with an empty response body.

An unknown task ID returns:

```text
404 Not Found
```

## Swagger UI

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

Swagger UI provides a **Try it out** button for testing all five task endpoints directly from the browser.

![Swagger UI](swagger.png)

## curl Testing

The API was also tested using `curl -i` to verify the HTTP status codes.

Example of creating a task:

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"curl test task\"}"
```

Response:

```text
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 46

{"id":4,"title":"curl test task","done":false}
```

The complete CRUD cycle was also verified using `curl -i`:

```text
POST /tasks       → 201 Created
GET /tasks/4      → 200 OK
PUT /tasks/4      → 200 OK
GET /tasks/4      → 200 OK
DELETE /tasks/4   → 204 No Content
GET /tasks/4      → 404 Not Found
```

## Project Structure

```text
flyrank-crud-api/
│
├── server.js
├── openapi.json
├── package.json
├── package-lock.json
├── README.md
├── swagger.png
└── .gitignore
```

## Notes

- Tasks are stored in memory and are reset whenever the server restarts.
- No database is required for this assignment.
- Swagger documentation is defined in `openapi.json`.
