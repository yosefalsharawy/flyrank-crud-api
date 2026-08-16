# FlyRank CRUD API

A simple RESTful CRUD API built with Node.js and Express.js as part of the FlyRank Backend Internship assignment.

The project demonstrates the fundamentals of building a REST API, handling HTTP requests and responses, validating request data, using appropriate HTTP status codes, and documenting an API with Swagger UI and OpenAPI.

## Tech Stack

- Node.js
- Express.js
- Swagger UI
- OpenAPI 3.0

## Features

- Create tasks
- Get all tasks
- Get a task by ID
- Update a task's title and/or completion status
- Delete a task
- Request validation
- Proper HTTP status codes
- Interactive API documentation with Swagger UI

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Getting Started

### Prerequisites

- Node.js installed on your machine
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/yosefalsharawy/flyrank-crud-api.git
