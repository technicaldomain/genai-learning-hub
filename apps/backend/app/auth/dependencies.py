"""FastAPI dependency for requiring authenticated users."""

from __future__ import annotations

from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, Request, status
from jose import jwt

from app.auth.config import settings as oidc_settings


def _normalize_user_claims(claims: Dict[str, Any]) -> Dict[str, Any]:
    sub = claims.get("sub", "unknown")
    name = claims.get("name") or claims.get("preferred_username") or sub
    email = claims.get("email") or sub
    roles_raw = claims.get("roles", claims.get("groups", []))
    avatar_url = claims.get("picture") or claims.get("avatar_url")
    department = claims.get("department") or claims.get("org")

    roles = []
    for role in roles_raw or []:
        try:
            from app.models import UserRole

            roles.append(UserRole(role))
        except Exception:
            pass

    return {
        "sub": sub,
        "name": name,
        "email": email,
        "roles": roles,
        "avatar_url": avatar_url,
        "department": department,
    }


async def _decode_bearer_token(token: str) -> Dict[str, Any]:
    """Validate a bearer token issued by the OIDC provider and return claims."""
    if not oidc_settings.is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OIDC provider is not configured.",
        )

    well_known = await oidc_settings.get_well_known()
    unverified = jwt.get_unverified_header(token)
    kid = unverified.get("kid")

    async with httpx.AsyncClient(timeout=10) as client:
        jwks_resp = await client.get(well_known.jwks_uri)
        jwks_resp.raise_for_status()
        jwks = jwks_resp.json()

    key = None
    for jwk in jwks.get("keys", []):
        if kid and jwk.get("kid") != kid:
            continue
        from jose import jwks as jose_jwks

        key = jose_jwks.get_jwk_from_dict(jwk).as_pem()
        break

    if key is None and jwks.get("keys"):
        from jose import jwks as jose_jwks

        key = jose_jwks.get_jwk_from_dict(jwks["keys"][0]).as_pem()

    if key is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unable to verify bearer token")

    try:
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=oidc_settings.client_id,
            issuer=well_known.issuer,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid bearer token: {exc}") from exc

    return _normalize_user_claims(claims)


async def get_current_user(request: Request) -> dict:
    """FastAPI dependency that validates session cookie and returns user dict.

    Usage in routes:
        @router.get("/protected")
        async def protected(user: dict = Depends(get_current_user)):
            ...
    """
    user_data = getattr(request.state, "user", None)
    if user_data:
        return user_data

    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token:
            return await _decode_bearer_token(token)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
