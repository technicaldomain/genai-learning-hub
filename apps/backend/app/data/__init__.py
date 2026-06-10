"""Sample data layer backed by JSON files."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

_DATA_DIR = Path(__file__).parent


def _load_json(filename: str) -> list[dict[str, Any]]:
    """Load a JSON file from the data directory."""
    path = _DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_skills() -> list[dict[str, Any]]:
    return _load_json("skills.json")


def get_resources() -> list[dict[str, Any]]:
    return _load_json("resources.json")


def get_prompts() -> list[dict[str, Any]]:
    return _load_json("prompts.json")


def get_news() -> list[dict[str, Any]]:
    return _load_json("news.json")


def get_learning_paths() -> list[dict[str, Any]]:
    return _load_json("learning_paths.json")


def get_contributions() -> list[dict[str, Any]]:
    return _load_json("contributions.json")


def get_showcases() -> list[dict[str, Any]]:
    return _load_json("showcases.json")
