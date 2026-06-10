"""Showcase endpoints — user-submitted use cases and solutions."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_showcases
from app.models import (
    Showcase,
    ShowcaseCategory,
    PaginatedResponse,
)

router = APIRouter()


def _normalize(s: str) -> str:
    return s.strip().lower()


@router.get("/showcases")
async def list_showcases(
    user: dict = Depends(get_current_user),
    category: Optional[ShowcaseCategory] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    status: str = Query("active", description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """List all showcases with optional filtering and search."""
    items = get_showcases()
    filtered = items

    if category:
        filtered = [s for s in filtered if s.get("category") == category]
    if status:
        filtered = [s for s in filtered if s.get("status") == status]
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


@router.get("/showcases/{showcase_id}")
async def get_showcase(
    showcase_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a single showcase by ID."""
    items = get_showcases()
    for item in items:
        if item.get("id") == showcase_id:
            return item
    return {"error": "Showcase not found"}, 404
