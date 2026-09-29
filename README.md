# Task Manager API — Take-Home Assignment

A RESTful Task Manager API built with Node.js and Express, with automated unit and integration tests using Jest and Supertest.

## Features

- Create tasks
- Retrieve all tasks
- Retrieve tasks by status
- Pagination
- Update tasks
- Delete tasks
- Complete tasks
- Assign tasks to users
- Task statistics
- Input validation
- Error handling
- Unit testing
- Integration testing
- Code coverage

## Tech Stack

- Node.js
- Express.js
- Jest
- Supertest
- UUID

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks?status=todo` | Get tasks by status |
| GET | `/tasks?page=1&limit=10` | Get paginated tasks |
| GET | `/tasks/stats` | Get task statistics |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/complete` | Mark a task as completed |
| PATCH | `/tasks/:id/assign` | Assign a task to a user |

## Task Statuses

The API supports the following task statuses:

- `todo`
- `in_progress`
- `done`

## Task Priorities

The API supports:

- `low`
- `medium`
- `high`

## Example: Create Task

```http
POST /tasks
Content-Type: application/json


{
  "title": "Complete assignment",
  "description": "Finish the take-home assignment",
  "priority": "high"
}

Example: Assign Task
PATCH /tasks/:id/assign
Content-Type: application/json

{
  "assignee": "Uday"
}

A task that has already been assigned cannot be reassigned.
Testing
The project includes:
- Unit tests for taskService.js
- Integration tests for API routes using Supertest
- Validation tests
- Edge-case testing
Run the test suite:
npm test

Run tests with coverage:
npm run coverage

Test Results
Current test suite:
- 3 test suites passed
- 49 tests passed
- 0 failed
Coverage:
- Statements: 96.12%
- Branches: 91.95%
- Functions: 93.10%
- Lines: 95.74%
Project Structure
task-api/
├── src/
│   ├── app.js
│   ├── routes/
│   │   └── tasks.js
│   ├── services/
│   │   └── taskService.js
│   └── utils/
│       └── validators.js
├── tests/
│   ├── taskService.test.js
│   ├── tasks.routes.test.js
│   └── validators.test.js
├── BUGS.md
├── ASSIGNMENT-NOTES.md
├── jest.config.js
├── package.json
└── README.md

Bugs Identified and Fixed
During testing and code review, the following issues were identified:
1. Pagination used an incorrect offset calculation.
2. Completing a task unexpectedly changed its priority to medium.
3. Status filtering uses partial string matching instead of exact matching.
The first two issues were fixed and covered by tests. The status filtering behavior is documented as a potential improvement.
Design Decisions
- Task assignment requires a non-empty string.
- Assignment values are trimmed before storing.
- Assigning a non-existent task returns 404.
- Reassigning an already assigned task returns 400.
- Invalid task input returns 400.
- Missing tasks return 404.
Production Considerations
For a production system, I would consider:
- Persistent database storage
- Authentication and authorization
- Structured logging
- API rate limiting
- Request validation middleware
- Database transactions
- API documentation using OpenAPI/Swagger
- Monitoring and health checks
- More comprehensive security testing
