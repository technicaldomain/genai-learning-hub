---
name: fastapi-backend-development
description: Build FastAPI backend with Pydantic v2 models, JSON data store, and service layer for API-driven platforms
source: auto-skill
extracted_at: '2026-06-09T23:45:41.629Z'
---

## Purpose

Create FastAPI-based backend services with a layered architecture suitable for MVP platforms that use JSON-based content storage (no database).

## Project Context

This project is a GenAI Learning Hub — an Nx monorepo with:
- Backend at `apps/backend/`
- Python 3.12+ with FastAPI, Pydantic v2, uvicorn
- JSON file-based content storage (no database for MVP)
- Separate lib packages for shared types and API contracts

## Directory Structure

```
apps/backend/
  pyproject.toml          # Dependencies: fastapi, uvicorn, pydantic, python-jose, httpx, pyjwt
  project.json            # Nx task config (serve, lint, test)
  main.py                 # FastAPI app entry point
  app/
    main.py               # FastAPI app + /api/health route
    api/                  # Route handlers (endpoints)
    auth/                 # Authentication logic
    models/               # Pydantic v2 data models
    services/             # Business logic layer
    data/                 # JSON content files
```

## Implementation Approach

### 1. Define Pydantic v2 Models

Create models in `app/models/` that match the API contract:

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Skill(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: str
    author: str
    tags: list[str] = []
    created_at: datetime
    updated_at: datetime

class Resource(BaseModel):
    id: str
    name: str
    type: str
    description: str
    url: str
    approved: bool
    owner: str

class Prompt(BaseModel):
    id: str
    title: str
    prompt: str
    category: str
    output_example: Optional[str] = None
    author: str

class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    url: Optional[str] = None
    source: str
    published_at: datetime
```

### 2. Build JSON Data Store

Create a service in `app/services/` that reads/writes from JSON files in `app/data/`:

```python
import json
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent / "data"

def read_json(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, "r") as f:
        return json.load(f)

def write_json(filename: str, data: list[dict]) -> None:
    path = DATA_DIR / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
```

### 3. Implement Service Layer

Business logic lives in `app/services/`, keeping endpoints thin:

```python
# app/services/skills_service.py
from app.models import Skill
from app.services.data_store import read_json, write_json

def get_all_skills() -> list[Skill]:
    raw = read_json("skills.json")
    return [Skill(**item) for item in raw]

def get_skills_by_category(category: str) -> list[Skill]:
    return [s for s in get_all_skills() if s.category == category]
```

### 4. Create API Endpoints

Route files go in `app/api/`:

```python
# app/api/skills.py
from fastapi import APIRouter
from app.services.skills_service import get_all_skills

router = APIRouter(prefix="/api/skills", tags=["skills"])

@router.get("")
async def list_skills():
    return get_all_skills()
```

Register all routers in `app/main.py`:

```python
from app.api import skills, resources, prompts, news, auth_router

app.include_router(skills.router)
app.include_router(resources.router)
app.include_router(prompts.router)
app.include_router(news.router)
app.include_router(auth_router)
```

## API Endpoints Required

Per `docs/04-technical-architecture.md`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check (already exists) |
| GET | /api/me | OIDC user identity |
| GET | /api/skills | AI Skills Marketplace |
| GET | /api/resources | Tools & APIs content |
| GET | /api/prompts | Prompt Library |
| GET | /api/news | News & Updates |

## Verification

1. Run `nx serve backend` and verify each endpoint responds
2. Run `nx test backend` for unit tests
3. Check data JSON files are valid and loadable
