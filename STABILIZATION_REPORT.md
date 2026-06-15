# AetherVault Stabilization Report

## Architecture Review

AetherVault is now organized as a local, non-Docker, course-stack project:

```text
React + Vite frontend
  -> FastAPI gateway
    -> Spring Boot API -> PostgreSQL
    -> Node.js search API -> MongoDB Atlas
```

The Spring backend is the system of record for authentication, users, categories, document metadata, and file storage. The Node backend remains prepared for search indexing and semantic search. The FastAPI gateway forwards frontend requests to the backend services.

## Issues Found

- Spring datasource password was hardcoded in `application.properties`.
- Hibernate was configured with `create-drop`, which drops data on restart.
- REST routes used root paths like `/auth` and `/documents` instead of gateway-friendly `/api/*` paths.
- Controllers returned JPA entities directly.
- Global exception handling was missing.
- Validation annotations and DTO validation were missing.
- JWT filter did not safely handle malformed or expired tokens.
- Security config exposed an `AuthenticationProvider` bean pattern that can trigger a `UserDetailsService` warning.
- CORS allowed more origins than needed.
- File upload accepted any extension and needed stronger path checks.
- Document file deletion did not remove the physical file.
- User/category deletion could be blocked by document foreign keys.
- Swagger/OpenAPI was missing.
- SQL schema did not fully match the current entity model.
- Stale generated Spring `target` output contained old configuration.

## Fixes Applied

- Moved Spring secrets to environment-backed configuration through `.env`, `application.properties`, and `application-dev.properties`.
- Set `spring.jpa.hibernate.ddl-auto=update`.
- Added Spring validation and Swagger/OpenAPI dependencies.
- Added `/api/auth`, `/api/users`, `/api/categories`, and `/api/documents` route prefixes.
- Replaced entity responses with DTOs:
  - `LoginRequest`
  - `RegisterRequest`
  - `AuthResponse`
  - `UserRequest`
  - `UserResponse`
  - `CategoryRequest`
  - `CategoryResponse`
  - `DocumentResponse`
- Added `GlobalExceptionHandler` with consistent JSON errors.
- Hardened entities with validation, explicit constraints, lazy relationships, and lifecycle timestamps.
- Improved JWT filter handling for invalid tokens.
- Updated Spring Security to use a local DAO authentication provider in the filter chain.
- Restricted CORS to `http://localhost:5173`.
- Added structured SLF4J logs for registration, login, upload, download, delete, and search-service failures.
- Restricted uploads to `PDF`, `DOCX`, and `TXT`.
- Normalized upload paths and prevented path traversal.
- Added file deletion when documents are deleted.
- Cleared document references before deleting users/categories.
- Added Swagger UI at `/swagger-ui.html` and API docs at `/v3/api-docs`.
- Updated SQL schema and added `database/migration_update.sql`.
- Updated React frontend API calls to use `/api/*`.
- Removed stale Spring `target` build output.

## Updated Folder Structure

```text
AetherVault/
  database/
    schema.sql
    migration_update.sql
    mongo-init.js
  frontend/
    src/
    package.json
    vite.config.js
  gateway/
    app/main.py
    requirements.txt
  node-backend/
    src/server.js
    src/embed.py
    package.json
    requirements.txt
  spring-backend/
    src/main/java/com/aethervault/api/
      config/
      controller/
      dto/
      exception/
      mapper/
      model/
      repository/
      security/
      service/
    src/main/resources/
      application.properties
      application-dev.properties
    pom.xml
  README.md
  RUN_PROJECT.md
```

## Updated Configuration

Spring uses:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/aethervault}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
jwt.secret=${JWT_SECRET}
```

Local values are stored in `spring-backend/.env`.

## Updated SQL Schema

The current schema is in:

```text
database/schema.sql
```

For existing older databases, use:

```text
database/migration_update.sql
```

## API Documentation

After starting Spring Boot:

```text
http://localhost:8080/swagger-ui.html
http://localhost:8080/v3/api-docs
```

## Verification

Completed:

- Frontend production build passed with `npm run build`.
- Node backend syntax check passed.
- FastAPI gateway Python compile passed.
- Sentence Transformer helper Python compile passed.

Not completed in this shell:

- Maven compile, because `mvn` is not available on the current PATH. The project remains a Maven project and should be run with Maven installed or through an IDE with Maven support.
