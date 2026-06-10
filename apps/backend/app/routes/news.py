"""News & updates endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_news
from app.models import PaginatedResponse, NewsItem

router = APIRouter()


@router.get("/news")
async def list_news(
    user: dict = Depends(get_current_user),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    featured: Optional[bool] = Query(None, description="Only featured news"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """List AI news and updates."""
    raw = get_news()

    # Parse datetime fields
    items = []
    for item in raw:
        dt_map = {}
        for key in ("published_at",):
            val = item.get(key)
            if isinstance(val, str):
                dt_map[key] = datetime.fromisoformat(val.replace("Z", "+00:00"))
        n = NewsItem(**{**item, **dt_map})
        items.append(n)

    # Filter
    filtered = items
    if tag:
        tag_lower = tag.lower()
        filtered = [n for n in filtered if any(tag_lower in t.lower() for t in n.tags)]
    if featured is True:
        filtered = [n for n in filtered if n.featured]

    # Sort by published date descending
    filtered.sort(key=lambda n: n.published_at.timestamp(), reverse=True)

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = [n.model_dump(by_alias=True) for n in filtered[start:end]]

    return PaginatedResponse(
        data=page_data,
        total=total,
        page=page,
        page_size=page_size,
    ).model_dump(by_alias=True)
