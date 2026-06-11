"""Curated homepage content for the trailhead experience."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.data import get_learning_paths, get_news, get_prompts, get_resources, get_showcases, get_skills

router = APIRouter()


def _parse_iso(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _days_ago(value: str | None) -> int:
    delta = datetime.now(timezone.utc) - _parse_iso(value)
    return max(delta.days, 0)


@router.get("/home")
async def home_content(user: dict = Depends(get_current_user)):
    """Return the curated homepage content model."""
    prompts = get_prompts()
    learning_paths = sorted(get_learning_paths(), key=lambda item: _parse_iso(item.get("created_at")), reverse=True)
    showcases = sorted(get_showcases(), key=lambda item: _parse_iso(item.get("updated_at")), reverse=True)
    news_items = sorted(get_news(), key=lambda item: _parse_iso(item.get("published_at")), reverse=True)
    skills = get_skills()
    resources = get_resources()

    featured_prompts = sorted(
        prompts,
        key=lambda item: (item.get("rating") or 0, item.get("usage_count") or 0),
        reverse=True,
    )[:3]

    return {
        "hero": {
            "eyebrow": "Trailhead / pathways",
            "title": "One hub, layered depth.",
            "subtitle": "A curated starting point for every employee: one clear first step, fast access to practical prompts, and deeper paths when people are ready.",
            "freshness": "Updated weekly with a visible freshness signal.",
            "primaryAction": {"label": "Start here", "path": "/learn/paths"},
            "secondaryAction": {"label": "Browse prompts", "path": "/marketplace/prompts"},
        },
        "startHere": {
            "title": "10-minute trailhead",
            "description": "Choose your pace without having to label yourself a beginner or expert.",
            "steps": [
                {
                    "title": "Never used AI",
                    "description": "Start with a short orientation and one safe prompt you can try immediately.",
                    "path": "/learn/paths",
                    "effort": "5 min",
                },
                {
                    "title": "Use it weekly",
                    "description": "Jump straight to practical prompts and approved tools that save time now.",
                    "path": "/marketplace/prompts",
                    "effort": "30 min",
                },
                {
                    "title": "Build with it",
                    "description": "Explore APIs, skills, and patterns for shipping AI into real workflows.",
                    "path": "/marketplace/tools",
                    "effort": "Deep dive",
                },
            ],
        },
        "promptLibrary": {
            "title": "Prompt library",
            "description": "Searchable, rated, and tagged prompts for daily use across the org.",
            "featured": [
                {
                    "id": item["id"],
                    "title": item["title"],
                    "description": item["description"],
                    "category": item["category"],
                    "rating": item.get("rating"),
                    "usageCount": item.get("usage_count"),
                    "tags": item.get("tags", []),
                    "path": "/marketplace/prompts",
                }
                for item in featured_prompts
            ],
        },
        "learningPaths": {
            "title": "Learning paths",
            "description": "Structured paths for foundational literacy, prompting, tools, and building with AI.",
            "items": [
                {
                    "id": item["id"],
                    "title": item["title"],
                    "description": item["description"],
                    "level": item["level"],
                    "estimatedHours": item["estimated_hours"],
                    "moduleCount": len(item.get("modules", [])),
                    "path": "/learn/paths",
                    "tags": item.get("tags", []),
                }
                for item in learning_paths[:3]
            ],
        },
        "showcase": {
            "title": "Use case showcase",
            "description": "Short stories from real teams: challenge, approach, result, and what changed.",
            "items": [
                {
                    "id": item["id"],
                    "title": item["title"],
                    "description": item["description"],
                    "author": item["author"],
                    "authorDepartment": item.get("author_department"),
                    "tags": item.get("tags", []),
                    "status": item.get("status", "active"),
                    "path": "/community/showcases",
                }
                for item in showcases[:2]
            ],
        },
        "whatsNew": {
            "title": "What's new",
            "description": "A freshness feed for approved tools, new prompts, policy updates, and relevant external shifts.",
            "items": [
                {
                    "id": item["id"],
                    "title": item["title"],
                    "summary": item["summary"],
                    "source": item["source"],
                    "publishedAt": item["published_at"],
                    "freshnessLabel": f"{_days_ago(item.get('published_at'))}d ago",
                    "featured": item.get("featured", False),
                    "tags": item.get("tags", []),
                    "path": "/learn/news",
                }
                for item in news_items[:4]
            ],
        },
        "stats": [
            {"label": "Prompts", "value": str(len(prompts)), "detail": "rated and ready to copy"},
            {"label": "Paths", "value": str(len(learning_paths)), "detail": "structured learning tracks"},
            {"label": "Showcases", "value": str(len(showcases)), "detail": "real team examples"},
            {"label": "Approved tools", "value": str(len(resources)), "detail": "safe starting points"},
            {"label": "Skills", "value": str(len(skills)), "detail": "reusable automations"},
        ],
    }