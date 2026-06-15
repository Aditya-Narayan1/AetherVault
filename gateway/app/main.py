import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

SPRING_BACKEND_URL = os.getenv("SPRING_BACKEND_URL", "http://localhost:8080")
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL.rstrip("/"))

app = FastAPI(title="AetherVault Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com|http://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+):5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def target_for(path: str) -> str:
    if path.startswith("/search") or path.startswith("/internal"):
        return NODE_BACKEND_URL
    return SPRING_BACKEND_URL


async def proxy(request: Request, path: str) -> Response:
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)
    url = f"{target_for('/' + path)}/{path}"

    async with httpx.AsyncClient(timeout=60.0) as client:
        proxied = await client.request(
            request.method,
            url,
            params=request.query_params,
            content=body,
            headers=headers,
        )

    excluded = {"content-encoding", "transfer-encoding", "connection"}
    response_headers = {k: v for k, v in proxied.headers.items() if k.lower() not in excluded}
    return Response(content=proxied.content, status_code=proxied.status_code, headers=response_headers)


@app.get("/health")
async def health():
    results = {"gateway": "ok", "spring": "unknown", "node": "unknown"}
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(f"{SPRING_BACKEND_URL}/swagger-ui.html")
            results["spring"] = "ok" if response.status_code < 500 else "error"
        except httpx.HTTPError:
            results["spring"] = "down"
        try:
            response = await client.get(f"{NODE_BACKEND_URL}/health")
            results["node"] = "ok" if response.status_code == 200 else "error"
        except httpx.HTTPError:
            results["node"] = "down"
    return results


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def route_all(request: Request, path: str):
    return await proxy(request, path)
