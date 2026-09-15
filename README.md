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
  - [Pagination & Filtering](#pagination--filtering)
  - [Docker Containerization](#docker-containerization)
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
npm install 

### Seed the Database
npm run seed

### Start Development Server (Hot Reload)
npm run dev

The server will start at `http://localhost:3001`.

### Start Production Server (Non-Hot Reload)
npm start

---

## Running Automated Tests

We use **Vitest** and **Supertest** to execute full integration tests across all 5 CRUD operations, boundary conditions, input validation, and pagination.

### Run the test suite:
npm test

### Or run once without watch mode:
npm run test:run

---

# Bonus Features

## 1. Pagination
- Supports `GET /api/products?page=1&limit=5` with response metadata (`totalItems`, `totalPages`, `page`, `limit`).

## 2. Docker Containerization
A production-ready [Dockerfile](./Dockerfile) and [.dockerignore](./.dockerignore) are included for containerized deployment.

### Build the Docker Image
`docker build -t macky-merch-api .`

### Run the Container (detached mode, port 3001)
docker run -d -p 3001:3001 --name macky-api macky-merch-api

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

### 1. Why this Folder Structure?
The project adheres to a clean separation of concerns:
- **`config/`**: Centralizes database configuration and connection handling. SQLite parameters like WAL mode and table creation scripts reside here, decoupling infrastructure from application business logic.
- **`src/schemas.ts`**: Centralized data validation layer using Zod. By defining input validation schemas and inferring TypeScript types directly from them, runtime validation and compile-time type safety remain unified in a single source of truth.
- **`src/routes/`**: Handles HTTP request routing, parameter extraction, response serialization, and error mapping.
- **`src/app.ts` vs `src/server.ts`**: Separation of the Express app instance (`app.ts`) from the HTTP listener (`server.ts`) allows Supertest to import `app.ts` directly during test runs without binding to an active network port, preventing port collisions in CI/CD.
- **`src/tests/`**: Automated test suites mirroring API behavior.

### 2. Why SQLite (`better-sqlite3`)?
- **Zero Configuration & Embedded Simplicity**: SQLite requires no external daemon, container, or credentials setup, making the repository fully self-contained and reproducible across any developer environment.
- **ACID Compliance & Relational Integrity**: Provides transactional guarantees and SQL constraints (`CHECK(price > 0)`, `CHECK(stock >= 0)`).
- **High Performance Synchronous I/O**: `better-sqlite3` uses direct V8 C++ bindings that outperform asynchronous SQLite drivers while significantly reducing async overhead and locking issues.
- **WAL Mode (Write-Ahead Logging)**: Configured with `PRAGMA journal_mode = WAL`, allowing concurrent readers without blocking writes.

---

## Challenges Faced & Solutions

### Challenge 1: Dynamic Parameterized SQL for Partial `PUT` Updates
- **Problem**: In a RESTful `PUT` endpoint that accepts any subset of attributes for partial updates, dynamically constructing SQL statements can easily lead to SQL injection vulnerabilities or brittle string concatenation if not carefully handled.
- **Solution**: Dynamically generated the `SET` clauses by mapping the validated keys of the request body into named parameter placeholders (e.g. `price = @price, stock = @stock`) and passing the combined sanitized object `{ ...data, id }` to `better-sqlite3`'s statement executor. This preserved strict parameterized query protection while maintaining flexibility.

### Challenge 2: Test Suite Isolation and Ephemeral State
- **Problem**: When running integration tests with a file-backed SQLite database, previous test executions or seed data could contaminate subsequent test assertions (e.g. total count assertions on `GET /api/products`).
- **Solution**: Implemented a `beforeEach` database cleanup hook in `src/tests/db.spec.ts` using `DELETE FROM products`. Each test inserts its own required fixtures, ensuring complete test isolation and deterministic results.
