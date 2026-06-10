"""User endpoint — returns authenticated user profile."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter()


@router.get("/me")
async def get_current_user_route(user: dict = Depends(get_current_user)):
    """Return the authenticated user profile from the session cookie."""
    sub = user.get("sub", "unknown")
    name = user.get("name") or user.get("preferred_username") or sub
    email = user.get("email") or sub
    roles_raw = user.get("roles", user.get("groups", []))
    avatar_url = user.get("picture") or user.get("avatar_url")
    department = user.get("department") or user.get("org")

    from app.models import UserRole

    roles = []
    for r in roles_raw:
        try:
            roles.append(UserRole(r))
        except ValueError:
            pass

    return User(
        sub=sub,
        name=name,
        email=email,
        roles=roles,
        avatar_url=avatar_url,
        department=department,
    )
