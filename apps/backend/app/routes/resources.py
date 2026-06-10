"""Resources (Tools & APIs) endpoints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_resources
from app.models import PaginatedResponse, Resource, ResourceCategory, ResourceType

router = APIRouter()


def _normalize(s: str) -> str:
    return s.strip().lower()


@router.get("/resources")
async def list_resources(
    user: dict = Depends(get_current_user),
    category: Optional[str] = Query(None, description="Filter by category"),
    type_filter: Optional[str] = Query(None, description="Filter by type"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    featured: Optional[bool] = Query(None, description="Only featured resources"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """List approved AI resources, tools, and APIs."""
    raw = get_resources()

    # Convert query params
    category_val: Optional[ResourceCategory] = None
    if category:
        try:
            category_val = ResourceCategory(category)
        except ValueError:
            category_val = None

    type_val: Optional[ResourceType] = None
    if type_filter:
        try:
            type_val = ResourceType(type_filter)
        except ValueError:
            type_val = None

    # Parse datetime fields
    resources = []
    for item in raw:
        dt_map = {}
        for key in ("created_at",):
            val = item.get(key)
            if isinstance(val, str):
                dt_map[key] = datetime.fromisoformat(val.replace("Z", "+00:00"))
        r = Resource(**{**item, **dt_map})
        resources.append(r)

    # Filter
    filtered = resources
    if category_val:
        filtered = [r for r in filtered if r.category == category_val]
    if type_val:
        filtered = [r for r in filtered if r.type == type_val]
    if featured is True:
        filtered = [r for r in filtered if r.featured]
    if search:
        q = _normalize(search)
        filtered = [
            r
            for r in filtered
            if q in _normalize(r.title) or q in _normalize(r.description)
        ]

    # Featured first, then by date
    filtered.sort(key=lambda r: (not r.featured, -r.created_at.timestamp()))

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = [r.model_dump(by_alias=True) for r in filtered[start:end]]

    return PaginatedResponse(
        data=page_data,
        total=total,
        page=page,
        page_size=page_size,
    ).model_dump(by_alias=True)
