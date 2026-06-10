# GenAI Learning Hub

A prototype AI enablement platform designed to help organizations:

- Discover AI tools
- Share AI knowledge
- Learn best practices
- Promote AI adoption
- Showcase reusable AI skills

## Quick Start

```bash
# Install dependencies
pnpm install

# Backend (terminal 1)
npx nx serve backend

# Frontend (terminal 2)
npx nx serve frontend

# Open http://localhost:4200
```

`uv run` (used by `nx serve backend`) auto-manages the Python virtualenv and
installs dependencies from `pyproject.toml` — no manual venv or activation
needed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup instructions.

## Architecture

- **Frontend**: React 19, TypeScript, Vite, Material UI, TanStack Query
- **Backend**: FastAPI, Pydantic v2, JSON-based data storage
- **Monorepo**: Nx 22, pnpm workspaces
- **Docker**: Multi-stage Dockerfiles, docker-compose for orchestration

API endpoints documented at `http://localhost:8000/docs` (Swagger UI).

## Project Structure

```
apps/
  frontend/          # React SPA (port 4200)
  backend/           # FastAPI API (port 8000)
libs/
  shared-types/      # TypeScript domain interfaces
  api-contracts/     # API request/response schemas
  ui-components/     # Shared MUI component library
docker/              # Dockerfiles + docker-compose
docs/                # Project documentation
```

## Assignment Deliverables

| Deliverable | Location |
|------------|-----------|
| Content Strategy | docs/02-content-strategy.md |
| Stakeholder Engagement | docs/03-stakeholder-engagement.md |
| Technical Architecture | docs/04-technical-architecture.md |
| Visual Identity | docs/05-visual-identity.md |
| Executive Review | docs/06-executive-review.md |
| Deployment Guide | docs/07-deployment-guide.md |
| Contributing | CONTRIBUTING.md |

## Available Scripts

| Command | Description |
|---|---|
| `npx nx serve frontend` | Start frontend dev server |
| `npx nx build frontend` | Build frontend for production |
| `npx nx test frontend` | Run frontend tests (Vitest) |
| `npx nx lint frontend` | Lint frontend code |

## License

MIT
