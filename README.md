# Macky Merch RESTful API

Welcome to the backend inventory management API for **Macky Merch** (the official La Salle Computer Society merchandise), built for the **LSCS Backend Development Challenge (41st LSCS - Term 1)**.

This API is developed with **Node.js**, **Express.js**, and **TypeScript**, backed by **SQLite** (`better-sqlite3`), validated using **Zod**, and tested with **Vitest** and **Supertest**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Architecture & Folder Structure](#project-architecture--folder-structure)
- [Setup & Installation Instructions](#setup--installation-instructions)
- [Running Automated Tests](#running-automated-tests)
- [Bonus Features](#bonus-features)
  - [Pagination](#1-pagination)
  - [Docker Containerization](#2-docker-containerization)
- [Architectural Explanation](#architectural-explanation)
- [Challenges Faced & Solutions](#challenges-faced--solutions)

---

## Tech Stack

- **Runtime**: Node.js (v20+ or v22+)
- **Language**: TypeScript (ESModules / NodeNext)
- **Framework**: Express.js (v5)
- **Database**: SQLite via `better-sqlite3` (with WAL mode enabled)
- **Validation**: Zod (v4)
- **Testing**: Vitest + Supertest
- **Development Tooling**: `tsx` (TypeScript Execute & Watch)
- **Containerization**: Docker (Multi-stage Node Alpine image)

---

## Project Architecture & Folder Structure

```
├── requests/                       # VS Code REST client sample HTTP requests
│   ├── add_product.rest
│   ├── get_products.rest
│   ├── update_product.rest
│   └── delete_product.rest
├── scripts/
│   └── seed.ts                     # Database seeding script with sample Macky Merch items
├── src/
│   ├── config/
│   │   ├── db.ts                   # SQLite connection, WAL configuration, table initialization
│   │   └── schema.sql              # SQL table definition backup
│   ├── controllers/
│   │   └── product.controller.ts   # Request/response lifecycle & Zod validation
│   ├── middleware/
│   │   └── error.middleware.ts     # Global Express error handler
│   ├── routes/
│   │   └── product.routes.ts       # Express router mapping endpoints to controller
│   ├── schemas/
│   │   └── product.schema.ts       # Zod validation schemas & TypeScript interfaces
│   ├── services/
│   │   └── product.service.ts      # Core business logic & database queries
│   ├── tests/
│   │   └── product.routes.spec.ts  # Vitest & Supertest integration tests
│   ├── app.ts                      # Express application setup
│   └── server.ts                   # HTTP listener bootstrap
├── .dockerignore                   # Docker build ignore rules
├── .gitignore                      # Git ignore rules for node_modules, .env, and local database
├── Dockerfile                      # Production-ready Docker container definition
├── package.json                    # Dependencies and npm scripts
├── schema.sql                      # Root SQL schema file with table definitions & constraints
├── tsconfig.json                   # TypeScript compiler configuration
└── vitest.config.ts                # Vitest test runner configuration
```

## Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- `npm` (bundled with Node.js)

### Install Dependencies
```bash
npm install
```

### Seed the Database
```bash
npm run seed
```

### Start Development Server (Hot Reload)
```bash
npm run dev
```

The server will start at `http://localhost:3001`.

### Start Production Server (Non-Hot Reload)
```bash
npm start
```

---

## Running Automated Tests

We use **Vitest** and **Supertest** to execute full integration tests across all 5 CRUD operations, boundary conditions, input validation, and pagination.

### Run the test suite:
```bash
npm test
```

### Or run once without watch mode:
```bash
npm run test:run
```

---

## Bonus Features

### 1. Pagination
- Supports `GET /api/products?page=1&limit=5` with response metadata (`totalItems`, `totalPages`, `page`, `limit`).

### 2. Docker Containerization
A production-ready [Dockerfile](./Dockerfile) and [.dockerignore](./.dockerignore) are included for containerized deployment.

#### Build the Docker Image
```bash
docker build -t macky-merch-api .
```

#### Run the Container (detached mode, port 3001)
```bash
docker run -d -p 3001:3001 --name macky-api macky-merch-api
```

#### Container Management & Logs
```bash
# View live logs
docker logs -f macky-api

# Stop the container
docker stop macky-api

# Start the container
docker start macky-api

# Remove the container
docker rm -f macky-api
```

---

## Architectural Explanation

### 1. Layered Architecture & Separation of Concerns
Originally, the prototype logic resided inside a single `app.ts`. To ensure scalability, testability, and clean code standards, the application was refactored into distinct architectural layers:
- **Routes (`/routes`)**: Purely responsible for URL routing and delegating endpoints to controllers.
- **Controllers (`/controllers`)**: Manages the HTTP request/response lifecycle, status codes, and input payload validation via Zod.
- **Services (`/services`)**: Encapsulates core business logic and database interactions, isolated from HTTP-specific objects (`req`, `res`).
- **Middleware (`/middleware`)**: Centralized error handling and cross-cutting concerns.
- **Schemas (`/schemas`)**: Single source of truth for runtime validation schemas and inferred TypeScript types.

### 2. Database Selection: SQLite (`better-sqlite3`)
- **Zero-latency embedded database**: Self-contained with zero external database server setup required.
- **Synchronous execution & speed**: `better-sqlite3` is significantly faster than standard `sqlite3` and avoids promise/callback overhead for local queries.
- **Write-Ahead Logging (WAL)**: Enabled to allow concurrent readers without blocking write operations.
- **Prepared Statements**: Used for all parameterized SQL queries to prevent SQL injection vulnerabilities.

---

## Challenges Faced & Solutions

### 1. Adopting Vitest & Integration Testing with Supertest
- **Challenge**: Transitioning to Vitest for backend testing and ensuring HTTP endpoints, query parameters, and boundary conditions were thoroughly tested.
- **Solution**: Implemented end-to-end integration tests using `supertest` to simulate HTTP requests against Express routes. Structured test suites covering happy paths, validation failures (400), non-existent resources (404), and pagination edge cases.

### 2. Transitioning from Monolith to Scalable Layered Structure
- **Challenge**: Determining an optimal folder structure that separates HTTP transport from business logic while avoiding circular dependencies and tight coupling.
- **Solution**: Studied established Node.js/Express design patterns and R&D codebase conventions to separate responsibilities cleanly across Controllers, Services, and validation Schemas.