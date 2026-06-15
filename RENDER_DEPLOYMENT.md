# AetherVault Render Deployment Guide

This project is deployed as separate Render services. Do not use Docker.

## Required Render Resources

Create these Render resources:

1. PostgreSQL database: `aethervault`
2. Web Service: `aethervault-spring-backend`
3. Web Service: `aethervault-node-backend`
4. Web Service: `aethervault-gateway`
5. Static Site: `aethervault-frontend`

Deploy in this order:

```text
PostgreSQL -> Spring backend -> Node backend -> Gateway -> Frontend
```

## 1. PostgreSQL

You already created the Render PostgreSQL database.

For Spring Boot, convert the external database URL:

```text
postgresql://USER:PASSWORD@HOST/DATABASE
```

to JDBC format:

```text
jdbc:postgresql://HOST:5432/DATABASE
```

Example:

```text
jdbc:postgresql://dpg-d8nnp1q8qa3s73fa0l5g-a.ohio-postgres.render.com:5432/aethervault
```

## 2. Spring Backend Render Service

Create a Render **Web Service**.

Settings:

```text
Root Directory: spring-backend
Language: Docker
```

Environment variables:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://YOUR_RENDER_POSTGRES_HOST:5432/aethervault
SPRING_DATASOURCE_USERNAME=YOUR_RENDER_POSTGRES_USER
SPRING_DATASOURCE_PASSWORD=YOUR_RENDER_POSTGRES_PASSWORD
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRATION_MS=86400000
UPLOAD_DIR=uploads
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@aethervault.local
ADMIN_PASSWORD=admin123
NODE_BACKEND_URL=https://YOUR_NODE_BACKEND.onrender.com
FRONTEND_URL=https://YOUR_FRONTEND.onrender.com
```

After deployment, copy the Spring service URL. It will look like:

```text
https://aethervault-spring-backend.onrender.com
```

## 3. Node Backend Render Service

Create another Render **Web Service**.

Settings:

```text
Root Directory: node-backend
Language: Docker
```

Environment variables:

```env
MONGO_URI=YOUR_MONGODB_ATLAS_NON_SRV_URI
PYTHON_BIN=python
```

Notes:

- MongoDB Atlas Network Access must allow Render outbound connections. For a demo, `0.0.0.0/0` works.
- The first semantic search/indexing request can be slow because `all-MiniLM-L6-v2` loads for the first time.

After deployment, copy the Node service URL. It will look like:

```text
https://aethervault-node-backend.onrender.com
```

Then return to the Spring service and set:

```env
NODE_BACKEND_URL=https://aethervault-node-backend.onrender.com
```

Redeploy Spring after changing this value.

## 4. FastAPI Gateway Render Service

Create another Render **Web Service**.

Settings:

```text
Root Directory: gateway
Language: Docker
```

Environment variables:

```env
SPRING_BACKEND_URL=https://YOUR_SPRING_BACKEND.onrender.com
NODE_BACKEND_URL=https://YOUR_NODE_BACKEND.onrender.com
FRONTEND_URL=https://YOUR_FRONTEND.onrender.com
```

After deployment, copy the Gateway URL. It will look like:

```text
https://aethervault-gateway.onrender.com
```

## 5. React Frontend Render Service

Create a Render **Web Service**.

Settings:

```text
Root Directory: frontend
Language: Docker
```

Environment variables:

```env
VITE_API_BASE_URL=https://YOUR_GATEWAY.onrender.com
```

Render also supports deploying the frontend as a Static Site. If you use Static Site instead of Docker, use:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment variables:

```env
VITE_API_BASE_URL=https://YOUR_GATEWAY.onrender.com
```

After changing this value, redeploy the frontend because Vite reads env variables at build time.

## Final URL Flow

```text
Frontend -> Gateway -> Spring -> PostgreSQL
Frontend -> Gateway -> Node -> MongoDB Atlas
```

## Smoke Tests

Gateway health:

```text
https://YOUR_GATEWAY.onrender.com/health
```

Expected:

```json
{
  "gateway": "ok",
  "spring": "ok",
  "node": "ok"
}
```

Spring Swagger:

```text
https://YOUR_SPRING_BACKEND.onrender.com/swagger-ui.html
```

Node health:

```text
https://YOUR_NODE_BACKEND.onrender.com/health
```

Frontend:

```text
https://YOUR_FRONTEND.onrender.com
```

Default admin login:

```text
username: admin
password: admin123
```

## Important Notes

- Never commit real `.env` files or database passwords to GitHub.
- `application.properties` uses environment variables and safe local defaults.
- On Render, never use `localhost` to connect services. Use the deployed `https://...onrender.com` service URLs.
- Uploaded files on Render free services are not permanent unless you attach persistent disk storage. For a course demo this is usually acceptable, but for long-term use attach a disk or use cloud object storage.
