"""FastAPI dependency for requiring authenticated users."""

from __future__ import annotations

from fastapi import HTTPException, Request, status


async def get_current_user(request: Request) -> dict:
    """FastAPI dependency that validates session cookie and returns user dict.

    Usage in routes:
        @router.get("/protected")
        async def protected(user: dict = Depends(get_current_user)):
            ...
    """
    user_data = getattr(request.state, "user", None)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Session"},
        )
    return user_data
