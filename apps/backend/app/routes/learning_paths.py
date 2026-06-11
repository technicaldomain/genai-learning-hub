"""Learning path endpoints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.data import get_learning_paths
from app.models import PaginatedResponse, SkillLevel

router = APIRouter()


def _parse_iso(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


@router.get("/learning-paths")
async def list_learning_paths(
    user: dict = Depends(get_current_user),
    level: Optional[SkillLevel] = Query(None, description="Filter by level"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """List guided learning paths."""
    items = sorted(get_learning_paths(), key=lambda item: _parse_iso(item.get("created_at")), reverse=True)

    if level:
        items = [item for item in items if item.get("level") == level.value]

    data = [
        {
            "id": item["id"],
            "title": item["title"],
            "description": item["description"],
            "level": item["level"],
            "modules": [
                {
                    "id": module["id"],
                    "title": module["title"],
                    "description": module["description"],
                    "resources": module.get("resources", []),
                    "durationMinutes": module["duration_minutes"],
                }
                for module in item.get("modules", [])
            ],
            "estimatedHours": item["estimated_hours"],
            "tags": item.get("tags", []),
            "createdAt": item["created_at"],
        }
        for item in items
    ]

    total = len(data)
    start = (page - 1) * page_size
    end = start + page_size

    return PaginatedResponse(
        data=data[start:end],
        total=total,
        page=page,
        page_size=page_size,
    ).model_dump(by_alias=True)