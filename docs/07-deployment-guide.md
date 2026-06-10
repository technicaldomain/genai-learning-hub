# Deployment Guide

## Overview

GenAI Learning Hub runs as two services:
- **Frontend**: Static React app served by Nginx
- **Backend**: FastAPI application served by uvicorn

Both are containerized and orchestrated with Docker Compose.

## Prerequisites

- Docker Engine ≥ 20.10
- Docker Compose ≥ 2.0
- (Optional) Reverse proxy (e.g., nginx, Caddy) for TLS

## Local Docker Compose

```bash
# Build and start all services
docker compose -f docker/docker-compose.yml up --build

# Start in detached mode
docker compose -f docker/docker-compose.yml up --build -d

# Stop all services
docker compose -f docker/docker-compose.yml down

# View logs
docker compose -f docker/docker-compose.yml logs -f
```

This starts:
| Service | Port | Description |
|---|---|---|
| `frontend` | 80 | Nginx serving the React SPA |
| `backend` | 8000 | uvicorn running FastAPI |

Access the portal at `http://localhost`.

## Production Deployment

### 1. Build Docker Images

```bash
# Frontend
docker build -t genai-learning-hub/frontend -f docker/frontend.Dockerfile .

# Backend
docker build -t genai-learning-hub/backend -f docker/backend.Dockerfile .
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Backend settings
APP_NAME=GenAI Learning Hub
DEBUG=false
JWT_SECRET=<replace-with-strong-secret>
CORS_ORIGINS=https://your-domain.com

# OIDC (when ready to wire up real auth)
OIDC_AUTHORITY=https://your-oidc-provider.com
OIDC_CLIENT_ID=<client-id>
OIDC_CLIENT_SECRET=<client-secret>
```

### 3. Deploy with Docker Compose

```yaml
# docker-compose.prod.yml
services:
  frontend:
    image: genai-learning-hub/frontend:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=https://api.your-domain.com/api
    depends_on:
      - backend
    restart: always
    networks:
      - app-network

  backend:
    image: genai-learning-hub/backend:latest
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: always
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 4. Deploy to Cloud Platforms

#### Docker Swarm

```bash
docker swarm init
docker stack deploy -c docker/docker-compose.yml genai-hub
```

#### Kubernetes (basic)

Apply the manifests in `docker/k8s/` (create as needed):

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

## Health Checks

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Backend health check |
| `GET /` | Frontend serve check |

Both services include Docker HEALTHCHECK instructions.

## Troubleshooting

### Frontend can't reach backend

Ensure the nginx proxy in `docker/frontend.nginx.conf` has the correct backend hostname:

```nginx
location /api/ {
    proxy_pass http://backend:8000;
    ...
}
```

### CORS errors

Set `CORS_ORIGINS` in the backend environment to match your frontend domain.

### Build fails

```bash
# Clear Docker build cache
docker compose -f docker/docker-compose.yml down --rmi all --volumes
docker compose -f docker/docker-compose.yml up --build --no-cache
```
