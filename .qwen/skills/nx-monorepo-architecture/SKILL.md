---
name: nx-monorepo-architecture
description: Architect an Nx monorepo with shared types library, API contracts library, frontend app, and FastAPI backend
source: auto-skill
extracted_at: '2026-06-10T12:00:00.000Z'
---

## Purpose

Set up a multi-package Nx monorepo with shared TypeScript types, API contract definitions, a React frontend app, and a FastAPI backend — all connected through workspace aliases and pnpm workspaces.

## Project Context

The GenAI Learning Hub uses an Nx monorepo with:
- Root `package.json` as the workspace root (no per-app package.json)
- pnpm workspaces with `autoInstallPeers: true`
- `@nx/react` plugin for the frontend (Vite bundler)
- `@nx/js` plugin for the backend (plain Python)
- Shared libraries in `libs/` consumed by both frontend and backend

## Directory Structure

```
project-root/
  package.json              # Workspace root (devDeps: nx, @nx/*, react, typescript, vite)
  pnpm-workspace.yaml       # autoInstallPeers: true
  nx.json                   # Nx config with plugins
  apps/
    frontend/
      vite.config.mts       # Vite config with proxy to backend
      src/
        main.tsx            # Entry point
        app/app.tsx         # App shell (QueryClient, ThemeProvider, Router)
        pages/              # Feature pages
        theme/              # Material UI theme
        layout/             # Layout components
        api/                # API client + TanStack Query hooks
    backend/
      pyproject.toml        # Python deps
      app/
        main.py             # FastAPI app + CORS + router wiring
        models/             # Pydantic models
        routes/             # Route modules
        data/               # JSON data files
        config.py           # Settings (pydantic-settings)
  libs/
    shared-types/
      src/index.ts          # TypeScript domain interfaces
      package.json          # @genai-learning-hub/shared-types
      tsconfig.json         # Library TS config (declaration-only)
    api-contracts/
      src/index.ts          # API request/response schemas
      package.json          # @genai-learning-hub/api-contracts
      tsconfig.json         # Library TS config
    ui-components/          # Shared component library (optional)
```

## Implementation Approach

### 1. Workspace Root Configuration

The root `package.json` holds all devDependencies. Frontend and backend apps have no `package.json` — they inherit from root.

```json
{
  "name": "@genai-learning-hub/source",
  "private": true,
  "devDependencies": {
    "nx": "22.7.5",
    "@nx/react": "^22.7.5",
    "@nx/vite": "22.7.5",
    "@nx/js": "22.7.5"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "6.30.3"
  }
}
```

`pnpm-workspace.yaml`:
```yaml
autoInstallPeers: true
```

### 2. Shared Types Library

Create a declaration-only TypeScript library in `libs/shared-types/`:

```json
// libs/shared-types/package.json
{
  "name": "@genai-learning-hub/shared-types",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

```json
// libs/shared-types/tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "emitDeclarationOnly": true,
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@genai-learning-hub/shared-types": ["libs/shared-types/src/index.ts"]
    }
  },
  "include": ["src/**/*.ts"]
}
```

Define domain interfaces that mirror the backend models:

```ts
// libs/shared-types/src/index.ts
export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  level: SkillLevel;
  author: string;
  tags: string[];
  assets: SkillAsset[];
  createdAt: string;
  updatedAt: string;
  popularity?: number;
}
// ... more types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 3. API Contracts Library

Similar setup in `libs/api-contracts/` with request/response parameter types for each endpoint.

### 4. Backend Pydantic Models with camelCase Alias

Key insight: Backend models use snake_case for storage (JSON files), but frontend expects camelCase. Use Pydantic's `alias_generator`:

```python
from pydantic import BaseModel
from pydantic.alias_generators import to_camel

class CamelBase(BaseModel):
    model_config = {"alias_generator": to_camel, "populate_by_name": True}

class Skill(CamelBase):
    id: str
    title: str
    description: str
    # snake_case fields...
    created_at: datetime
    popularity: int | None
```

This automatically converts `created_at` → `createdAt`, `popularity` → `popularity`, etc. on serialization.

### 5. Vite Proxy for Local Development

Configure `apps/frontend/vite.config.mts` to proxy `/api` requests:

```ts
server: {
  port: 4200,
  host: 'localhost',
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

## Key Lessons

- **Root package.json for pnpm workspaces**: When apps don't have their own `package.json`, all deps go in root. Use `pnpm add <pkg>` at root level.
- **Pydantic camelCase aliases**: Use `alias_generator: to_camel` to auto-convert snake_case fields to camelCase on JSON output — eliminates manual mapping.
- **Shared types as ground truth**: Keep `shared-types` as the single source of truth. Both frontend hooks and backend models derive from the same domain concepts.
- **Vite proxy over API client baseURL**: For local dev, proxy `/api` through Vite instead of configuring `BASE_URL`. The API client can use relative paths.
