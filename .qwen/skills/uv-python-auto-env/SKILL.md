---
name: uv-python-auto-env
description: Use uv to auto-manage Python virtual environments and install from pyproject.toml for zero-config dev workflows
source: auto-skill
extracted_at: '2026-06-10T02:00:25.978Z'
---

## Purpose

Replace manual `python -m venv .venv && .venv/bin/activate && pip install -e .` with `uv run <command>`, which auto-creates the venv, installs dependencies from `pyproject.toml`, and runs the command — all in one step.

## Project Context

When building a FastAPI backend in an Nx monorepo:
- `apps/backend/` has `pyproject.toml` with all Python dependencies
- The `nx serve backend` target runs `uv run uvicorn app.main:app --reload --port 8000`
- No manual venv management, no activation, no `pip install` steps

## Why uv over pip + venv

| Manual venv | uv run |
|---|---|
| `python -m venv .venv` | automatic, per-project |
| `.venv/bin/activate` | not needed |
| `pip install -e .` | automatic, from `pyproject.toml` |
| `uvicorn ...` | `uv run uvicorn ...` |

uv creates the venv in the project directory, installs all dependencies (including the editable package), and runs the command — all transparently.

## Implementation Approach

### 1. pyproject.toml Setup

Ensure `apps/backend/pyproject.toml` lists all dependencies:

```toml
[project]
name = "genai-learning-hub-backend"
version = "0.1.0"
requires-python = ">=3.12"

dependencies = [
  "fastapi",
  "uvicorn[standard]",
  "pydantic",
  "pydantic-settings",
  "python-jose[cryptography]",
  "httpx",
  "pyjwt"
]

[tool.setuptools.packages.find]
include = ["app*"]
```

### 2. Nx Serve Target

Configure `apps/backend/project.json`:

```json
{
  "name": "backend",
  "targets": {
    "serve": {
      "executor": "nx:run-commands",
      "options": {
        "command": "uv run uvicorn app.main:app --reload --port 8000",
        "cwd": "apps/backend"
      }
    }
  }
}
```

The `cwd` ensures `uv` resolves `pyproject.toml` from the correct directory.

### 3. Adding New Dependencies

```bash
cd apps/backend
uv add pydantic  # adds to pyproject.toml + installs instantly
```

### 4. Prerequisites

Only Python ≥ 3.12 and `uv` need to be installed:

```bash
# macOS
brew install uv

# pip
pip install uv

# Other: https://docs.astral.sh/uv/getting-started/installation/
```

## Key Lessons

- **`uv run` replaces the entire venv lifecycle** — creation, activation, dependency install, and command execution in one invocation
- **`cwd` in Nx targets matters** — `uv` resolves `pyproject.toml` from the current working directory, so set `cwd: "apps/backend"` in the target config
- **`uv add` is the upgrade path** — when you need a new dependency, `uv add <pkg>` updates `pyproject.toml` and installs it instantly, no manual editing needed
- **`uv` is a drop-in replacement** — existing `uvicorn`, `pytest`, `ruff`, etc. all work via `uv run <tool> ...`

## Verification

1. `npx nx serve backend` — should start uvicorn automatically without manual setup
2. Kill and restart — uv recreates the venv and installs deps every time
3. `uv add new-package` — should update pyproject.toml and install in one command
