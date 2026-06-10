"""Community contributions endpoints — user-submitted tips, lessons, and prompts."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_contributions
from app.models import (
    CommunityContribution,
    ContributionType,
    PaginatedResponse,
)

router = APIRouter()


def _normalize(s: str) -> str:
    return s.strip().lower()


@router.get("/contributions")
async def list_contributions(
    user: dict = Depends(get_current_user),
    type_filter: Optional[ContributionType] = Query(None, description="Filter by contribution type"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """List all community contributions with optional filtering and search."""
    items = get_contributions()
    filtered = items

    if type_filter:
        filtered = [c for c in filtered if c.get("type") == type_filter]
    if search:
        search_lower = _normalize(search)
        filtered = [
            c
            for c in filtered
            if search_lower in _normalize(c.get("title", "")) or search_lower in _normalize(c.get("description", ""))
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


@router.get("/contributions/{contribution_id}")
async def get_contribution(
    contribution_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a single contribution by ID."""
    items = get_contributions()
    for item in items:
        if item.get("id") == contribution_id:
            return item
    return {"error": "Contribution not found"}, 404
