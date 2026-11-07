# Employee Management System

A full-stack CRUD application: a layered **REST API** (Node.js + SQLite) with a lightweight web UI, input validation, and automated tests. Zero third-party dependencies.

## Features
- Create, read, update, delete employees (`/api/employees`)
- Search by name/email and filter by department
- Server-side validation (400), duplicate-email handling (409), not-found handling (404)
- Clean layered architecture: **routes → service (business rules) → repository (SQL)**
- Parameterised SQL queries (no SQL injection); XSS-safe UI rendering (`textContent`)
- Automated integration tests using the built-in Node test runner

## Tech stack
Node.js 22+, SQLite (`node:sqlite`), HTML/CSS/vanilla JavaScript

## Run locally
```bash
git clone https://github.com/<your-username>/employee-management-system.git
cd employee-management-system
npm start        # http://localhost:3000
npm test
```

## API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees?search=&department=` | List / filter |
| GET | `/api/employees/:id` | Get one |
| POST | `/api/employees` | Create |
| PUT | `/api/employees/:id` | Update |
| DELETE | `/api/employees/:id` | Delete |

Example body:
```json
{ "name": "Asha Verma", "email": "asha@example.com", "department": "Engineering", "role": "Developer", "salary": 600000 }
```

## Project structure
```
src/db.js          schema + connection
src/repository.js  data access (SQL)
src/service.js     validation + business rules
src/server.js      HTTP routing + static files
public/index.html  web UI
test/api.test.js   integration tests
```

## Possible improvements
JWT authentication, pagination, Docker, migration to MySQL/PostgreSQL.
