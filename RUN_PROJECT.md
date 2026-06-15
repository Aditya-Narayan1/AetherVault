# AetherVault Run Guide

Run each service in a separate terminal.

## Prerequisites

- Java 17
- Maven
- Node.js and npm
- Python 3.10+
- PostgreSQL running locally
- MongoDB Atlas configured in `node-backend/.env`

## Database

Create the PostgreSQL database named `aethervault`, then run:

```powershell
cd "D:\DBMS\final project T3\AetherVault"
psql -U postgres -d aethervault -f database\schema.sql
```

If you already have an older copy of the schema, run:

```powershell
psql -U postgres -d aethervault -f database\migration_update.sql
```

MongoDB Atlas does not need a local `mongosh` setup. The Node backend creates `document_embeddings` and `search_history` automatically.

## Terminal 1: Spring Boot Backend

```powershell
cd "D:\DBMS\final project T3\AetherVault\spring-backend"
mvn spring-boot:run
```

URL: `http://localhost:8080`

## Terminal 2: Node Search Backend

```powershell
cd "D:\DBMS\final project T3\AetherVault\node-backend"
npm install
pip install -r requirements.txt
npm run dev
```

URL: `http://localhost:5000`

## Terminal 3: FastAPI Gateway

```powershell
cd "D:\DBMS\final project T3\AetherVault\gateway"
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

URL: `http://localhost:8000`

The React frontend must call the gateway, not Spring directly:

```text
frontend/.env -> VITE_API_BASE_URL=http://localhost:8000
```

## Terminal 4: React Vite Frontend

```powershell
cd "D:\DBMS\final project T3\AetherVault\frontend"
npm install
npm run dev
```

Open: `http://localhost:5173`

## Login

The frontend opens the login page first when no JWT is saved. After successful login, it redirects to the dashboard.

Default admin account:

```text
username: admin
password: admin123
```
