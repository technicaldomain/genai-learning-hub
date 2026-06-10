"""Marketplace endpoints — skills, prompts, and tools."""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_skills, get_prompts, get_resources
from app.models import (
    PaginatedResponse,
    Prompt,
    PromptCategory,
    Resource,
    ResourceCategory,
    ResourceCategory as ResourceType,
    Skill,
    SkillCategory,
    SkillLevel,
)

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


def _normalize(s: str) -> str:
    return s.strip().lower()


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------


@router.get("/skills")
async def list_skills(
    user: dict = Depends(get_current_user),
    category: Optional[str] = Query(None, description="Filter by category"),
    level: Optional[str] = Query(None, description="Filter by skill level"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """List all skills with optional filtering and search."""
    items = get_skills()
    filtered = items

    if category:
        filtered = [s for s in filtered if _normalize(s.get("category", "")) == _normalize(category)]
    if level:
        filtered = [s for s in filtered if _normalize(s.get("level", "")) == _normalize(level)]
    if search:
        search_lower = _normalize(search)
        filtered = [
            s
            for s in filtered
            if search_lower in _normalize(s.get("title", "")) or search_lower in _normalize(s.get("description", ""))
        ]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]

    return PaginatedResponse(
        data=paginated,
        total=total,
        page=page,
        page_size=page_size,
    )


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------


@router.get("/prompts")
async def list_prompts(
    user: dict = Depends(get_current_user),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    sort_by: str = Query("created_at", description="Sort field"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """List all prompts with optional filtering and sorting."""
    items = get_prompts()
    filtered = items

    if category:
        filtered = [p for p in filtered if _normalize(p.get("category", "")) == _normalize(category)]
    if search:
        search_lower = _normalize(search)
        filtered = [
            p
            for p in filtered
            if search_lower in _normalize(p.get("title", "")) or search_lower in _normalize(p.get("description", ""))
        ]

    if sort_by == "rating":
        filtered.sort(key=lambda p: p.get("rating") or 0, reverse=True)
    elif sort_by == "usage_count":
        filtered.sort(key=lambda p: p.get("usage_count") or 0, reverse=True)
    else:
        filtered.sort(key=lambda p: p.get("created_at") or datetime.now(timezone.utc), reverse=True)

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]

    return PaginatedResponse(
        data=paginated,
        total=total,
        page=page,
        page_size=page_size,
    )


# ---------------------------------------------------------------------------
# Tools (formerly /resources)
# ---------------------------------------------------------------------------


@router.get("/tools")
async def list_tools(
    user: dict = Depends(get_current_user),
    category: Optional[str] = Query(None, description="Filter by category"),
    type_filter: Optional[str] = Query(None, description="Filter by type"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    featured: Optional[bool] = Query(None, description="Only featured items"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """List all tools/APIs with optional filtering and search."""
    items = get_resources()
    filtered = items

    if category:
        filtered = [r for r in filtered if _normalize(r.get("category", "")) == _normalize(category)]
    if type_filter:
        filtered = [r for r in filtered if _normalize(r.get("type", "")) == _normalize(type_filter)]
    if featured:
        filtered = [r for r in filtered if r.get("featured")]
    if search:
        search_lower = _normalize(search)
        filtered = [
            r
            for r in filtered
            if search_lower in _normalize(r.get("title", "")) or search_lower in _normalize(r.get("description", ""))
        ]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]

    return PaginatedResponse(
        data=paginated,
        total=total,
        page=page,
        page_size=page_size,
    )
