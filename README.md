# AetherVault

AetherVault is a practical full-stack secure document repository built for a Database Systems Engineering and Distributed Backend Development course. It demonstrates authentication, RBAC, relational data modeling, document upload/download, a gateway layer, a second backend service, MongoDB-backed search metadata, and simple semantic search with Sentence Transformers.

## Architecture

```text
React + Vite + Material UI
  -> FastAPI Gateway
    -> Spring Boot + Spring Security + JWT -> PostgreSQL
    -> Node.js + Express Search Service -> MongoDB
```

## Modules

- `frontend/` - React, Vite, Material UI, Axios, React Router
- `gateway/` - FastAPI reverse proxy for frontend requests
- `spring-backend/` - Spring Boot API with JWT auth, BCrypt hashing, RBAC, PostgreSQL persistence, file storage
- `node-backend/` - Express search API with MongoDB and Sentence Transformers embedding helper
- `database/` - PostgreSQL schema and MongoDB initialization script

## Implemented Features

- Register, login, logout
- JWT authentication
- BCrypt password hashing
- Login-first frontend flow with dashboard redirect after authentication
- Roles: `ADMIN`, `USER`
- Admin management for users and categories
- Authenticated document upload, listing, details, edit, delete, and download
- Keyword search
- Semantic search using:

```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
```

- PostgreSQL tables: `roles`, `users`, `categories`, `documents`
- MongoDB collections: `document_embeddings`, `search_history`
- Dark mode and responsive frontend layout

## Default Demo Accounts

The Spring backend seeds roles and a default admin account on startup:

- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

New users created through registration receive the `USER` role.

## API Summary

Spring Boot:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/documents`
- `GET /api/documents/{id}`
- `POST /api/documents`
- `PUT /api/documents/{id}`
- `DELETE /api/documents/{id}`
- `GET /api/documents/{id}/download`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`

Node.js:

- `GET /search?q=keyword`
- `POST /search/semantic`

FastAPI gateway exposes the same paths from `http://localhost:8000`. The React frontend is configured to call this gateway.
Swagger UI is available from the Spring backend at `http://localhost:8080/swagger-ui.html`.

## Run Locally

This project is intended to run with the course stack directly on your machine.

For GitHub + Render deployment, see [`RENDER_DEPLOYMENT.md`](RENDER_DEPLOYMENT.md).

Required software:

- Java 17
- Maven
- Node.js and npm
- Python 3.10+
- PostgreSQL
- MongoDB Atlas account or MongoDB server

Start PostgreSQL locally first. Create the PostgreSQL database and tables:

```bash
psql -U postgres -d aethervault -f database/schema.sql
```

MongoDB Atlas is configured from `node-backend/.env`. Collections are created automatically when the Node backend indexes documents and stores search history.

### 1. Spring Boot Backend

The Spring backend is the Maven project.

```bash
cd spring-backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`.

### 2. Node.js Search Backend

The Node backend uses npm and calls the Python Sentence Transformers helper for embeddings.

```bash
cd node-backend
npm install
pip install -r requirements.txt
npm run dev
```

Runs on `http://localhost:5000`.

### 3. FastAPI Gateway

The gateway runs with `uvicorn`.

```bash
cd gateway
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`.

### 4. React Vite Frontend

The frontend is a normal npm + Vite + React project using JSX files.

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

Open `http://localhost:5173` in the browser.

The first semantic search or document indexing request may take time because the Sentence Transformers model must load.

## Semantic Search Workflow

1. A user uploads a document through the React frontend.
2. The frontend sends the multipart request to FastAPI.
3. FastAPI forwards it to Spring Boot.
4. Spring saves the file on the server and metadata in PostgreSQL.
5. Spring calls the Node search service.
6. Node generates an embedding from `title + description`.
7. Node stores the vector in MongoDB.
8. On semantic search, Node embeds the query, computes cosine similarity, and returns top matches.

## Notes

- Uploaded files are stored in the Spring backend upload directory.
- PostgreSQL remains the source of truth for users, categories, and document metadata.
- MongoDB stores search-oriented document vectors and search history.
- The AI search implementation is intentionally simple and course-friendly, not a production vector database replacement.
