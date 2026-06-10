"""Prompts library endpoints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_prompts
from app.models import PaginatedResponse, Prompt, PromptCategory

router = APIRouter()


def _normalize(s: str) -> str:
    return s.strip().lower()


@router.get("/prompts")
async def list_prompts(
    user: dict = Depends(get_current_user),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title, description, template"),
    sort_by: Optional[str] = Query(None, description="Sort by field"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """List reusable prompt templates."""
    raw = get_prompts()

    # Convert query params
    category_val: Optional[PromptCategory] = None
    if category:
        try:
            category_val = PromptCategory(category)
        except ValueError:
            category_val = None

    # Parse datetime fields
    prompts = []
    for item in raw:
        dt_map = {}
        for key in ("created_at",):
            val = item.get(key)
            if isinstance(val, str):
                dt_map[key] = datetime.fromisoformat(val.replace("Z", "+00:00"))
        p = Prompt(**{**item, **dt_map})
        prompts.append(p)

    # Filter
    filtered = prompts
    if category_val:
        filtered = [p for p in filtered if p.category == category_val]
    if search:
        q = _normalize(search)
        filtered = [
            p
            for p in filtered
            if q in _normalize(p.title)
            or q in _normalize(p.description)
            or q in _normalize(p.template)
        ]

    # Sort
    if sort_by == "rating":
        filtered.sort(key=lambda p: p.rating or 0, reverse=True)
    elif sort_by == "usageCount":
        filtered.sort(key=lambda p: p.usage_count or 0, reverse=True)
    elif sort_by == "createdAt":
        filtered.sort(key=lambda p: p.created_at.timestamp(), reverse=True)
    else:
        filtered.sort(key=lambda p: p.usage_count or 0, reverse=True)

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = [p.model_dump(by_alias=True) for p in filtered[start:end]]

    return PaginatedResponse(
        data=page_data,
        total=total,
        page=page,
        page_size=page_size,
    ).model_dump(by_alias=True)
