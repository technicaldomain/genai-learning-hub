"""Skills marketplace endpoints."""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_skills
from app.models import PaginatedResponse, Skill, SkillCategory, SkillLevel

router = APIRouter()


def _normalize(s: str) -> str:
    return s.strip().lower()


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
        filtered = [s for s in filtered if _normalize(s.category) == _normalize(category)]
    if level:
        filtered = [s for s in filtered if _normalize(s.level) == _normalize(level)]
    if search:
        search_lower = _normalize(search)
        filtered = [
            s
            for s in filtered
            if search_lower in _normalize(s.title) or search_lower in _normalize(s.description)
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
