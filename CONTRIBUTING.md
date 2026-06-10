# Contributing to GenAI Learning Hub

## Prerequisites

| Tool | Minimum Version |
|---|---|
| [Node.js](https://nodejs.org) | ≥ 18 |
| [pnpm](https://pnpm.io) | ≥ 8 |
| [Python](https://python.org) | ≥ 3.12 |
| [uv](https://github.com/astral-sh/uv) | ≥ 0.4 (auto-manages venvs) |
| [Docker](https://docker.com) | (optional, for containerized dev) |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/<org>/genai-learning-hub.git
cd genai-learning-hub

# 2. Install Node.js dependencies
pnpm install

# 3. Start both services
# Terminal 1 — Backend
npx nx serve backend

# Terminal 2 — Frontend
npx nx serve frontend

# 4. Open http://localhost:4200
```

`uv run` (used by the backend serve target) automatically manages the Python
virtualenv and installs dependencies from `pyproject.toml` — no manual venv
creation or activation needed.

## Project Structure

```
genai-learning-hub/
├── apps/
│   ├── frontend/            # React + Vite SPA
│   │   ├── src/
│   │   │   ├── app/         # App entry + routing
│   │   │   ├── assets/      # SVG graphics
│   │   │   ├── api/         # API client + TanStack Query hooks
│   │   │   ├── hooks/       # Custom React hooks (auth check, theme, etc.)
│   │   │   ├── layout/      # MainLayout (header, sidebar)
│   │   │   ├── pages/       # Home, Skills, Prompts, etc.
│   │   │   ├── providers/   # ThemeContext and other providers
│   │   │   └── styles.css   # Global styles + Tailwind imports
│   │   └── vite.config.mts  # Vite config with API proxy
│   └── backend/             # FastAPI backend
│       ├── app/
│       │   ├── data/        # JSON data files
│       │   ├── models/      # Pydantic models
│       │   └── routes/      # API route handlers
│       └── pyproject.toml   # Python dependencies
├── libs/
│   ├── shared-types/        # TypeScript domain interfaces
│   └── api-contracts/       # API request/response schemas
├── docker/                  # Dockerfiles + docker-compose
└── docs/                    # Project documentation
```

## Available Scripts

| Command | Description |
|---|---|
| `npx nx serve frontend` | Start frontend dev server (port 4200) |
| `npx nx build frontend` | Build frontend for production |
| `uvicorn app.main:app --reload` | Start backend dev server (port 8000) |
| `npx nx test frontend` | Run frontend tests (Vitest) |

## Code Style

- **Formatting**: Prettier (configured at root). Run `pnpm exec prettier --write <file>`
- **Linting**: ESLint (root `eslint.config.mjs`). Run `npx nx lint frontend`
- **TypeScript**: Strict mode enabled. No `any` types preferred.
- **Python**: Conventions follow [PEP 8](https://peps.python.org/pep-0008/). Use type hints.

## Adding a New Page

1. Create `apps/frontend/src/pages/<Name>/<Name>Page.tsx`
2. Add a route in `apps/frontend/src/app/app.tsx`
3. Add a nav item in `apps/frontend/src/layout/MainLayout.tsx`
4. Create an API hook in `apps/frontend/src/api/hooks.ts` if needed

## Adding a New API Endpoint

1. Define the Pydantic model in `apps/backend/app/models/__init__.py`
2. Create a route file in `apps/backend/app/routes/`
3. Register the router in `apps/backend/app/main.py`
4. Update the TypeScript contract in `libs/api-contracts/src/index.ts`
5. Create a TanStack Query hook in `apps/frontend/src/api/hooks.ts`

## Architecture

See `docs/04-technical-architecture.md` for the full technical architecture.

**Frontend stack:** React 19 + TypeScript, Vite 8, Tailwind CSS v4 (utility-first, zero MUI), TanStack Query, React Router 6, lucide-react for icons. Theme support: light / dark / system with localStorage persistence.

**Backend stack:** FastAPI, Python, Pydantic v2, JSON file-based data store.

## Reporting Issues

Please open a GitHub issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details (for frontend issues)
