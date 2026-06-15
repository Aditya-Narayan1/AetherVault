# AetherVault

AetherVault is a full-stack secure document management system built for the Database Systems Engineering and Distributed Backend Development course.

The project demonstrates authentication, role-based access control, document management, relational database storage, NoSQL storage, semantic search, and a gateway-based distributed backend architecture.

## Project Overview

AetherVault allows users to register, log in, upload documents, manage document metadata, download files, and search documents. Admin users can manage users, categories, and documents.

The system uses PostgreSQL for core relational data, MongoDB Atlas for semantic search data, Spring Boot for authenticated document APIs, Node.js for search APIs, FastAPI as the API gateway, and React for the frontend.

## Tech Stack

**Frontend**

- React
- Vite
- Material UI
- Axios
- React Router

**API Gateway**

- FastAPI
- Uvicorn

**Spring Backend**

- Spring Boot
- Spring Security
- JWT Authentication
- BCrypt Password Hashing
- Role-Based Access Control
- PostgreSQL

**Node Backend**

- Node.js
- Express
- MongoDB Atlas
- Sentence Transformers semantic search integration

**Databases**

- PostgreSQL
- MongoDB Atlas

**Deployment**

- GitHub
- Render
- Docker

## Main Features

- User registration and login
- JWT-based authentication
- Logout support
- Admin and user roles
- Admin user management
- Category CRUD operations
- Document upload, view, edit, delete, and download
- PostgreSQL metadata storage
- MongoDB document embedding storage
- Keyword search
- Semantic search
- FastAPI gateway routing
- Swagger API documentation

## Roles

**ADMIN**

- Manage users
- Manage categories
- Manage documents

**USER**

- View documents
- Search documents
- Upload documents
- Download documents

## Architecture

```text
React Frontend
    |
FastAPI Gateway
    |
    |-- Spring Boot Backend -> PostgreSQL
    |
    |-- Node.js Backend -> MongoDB Atlas
```

## Live Project Links

See [Live Project Link.md](./Live%20Project%20Link.md) for deployed Render links.
