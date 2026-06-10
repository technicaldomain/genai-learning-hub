"""Main FastAPI application entry point — wires all routers and middleware together."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.auth.middleware import SessionMiddleware
from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.me import router as me_router
from app.routes.contributions import router as contributions_router
from app.routes.marketplace import router as marketplace_router
from app.routes.news import router as news_router
from app.routes.showcases import router as showcases_router
from app.routes.mcp import router as mcp_router

app = FastAPI(
    title="GenAI Learning Hub",
    description="AI enablement platform for learning, discovery, and knowledge sharing.",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# Session middleware (must be first for auth to work on all routes)
# ---------------------------------------------------------------------------

app.add_middleware(SessionMiddleware)

# ---------------------------------------------------------------------------
# CORS middleware — allow credentials for cookie-based auth
# ---------------------------------------------------------------------------

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
if not origins or origins == ["*"]:
    # In production, set CORS_ORIGINS to your frontend URL(s)
    origins = ["http://localhost:4200"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------

# Auth routes (no prefix — /auth/login, /auth/callback, /auth/logout)
app.include_router(auth_router)

# API routes (prefix /api)
app.include_router(health_router, prefix="/api")
app.include_router(me_router, prefix="/api")
app.include_router(marketplace_router, prefix="/api")
app.include_router(contributions_router, prefix="/api")
app.include_router(showcases_router, prefix="/api")
app.include_router(mcp_router, prefix="/api")
app.include_router(news_router, prefix="/api")
