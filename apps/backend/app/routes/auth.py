"""OIDC authentication routes — login, callback, and logout."""

from __future__ import annotations

import os
import urllib.parse
import warnings
from typing import Optional

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse

from app.auth.config import settings as oidc_settings
from app.auth.pkce import generate_pkce_params

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Login — redirect to OIDC provider
# ---------------------------------------------------------------------------


@router.get("/login")
async def login(request: Request):
    """Initiate OIDC login — redirects to the provider's authorize endpoint."""
    if not oidc_settings.is_configured:
        raise HTTPException(
            status_code=503,
            detail="OIDC provider is not configured. Set OIDC_AUTHORITY and OIDC_CLIENT_ID.",
        )

    state = __generate_state()

    # Store state in signed cookie (persisted across requests)
    from itsdangerous import URLSafeTimedSerializer
    s = URLSafeTimedSerializer(
        os.getenv("JWT_SECRET", "change-me-in-production"),
        salt="genai-oauth-state",
    )
    signed = s.dumps({"state": state})

    resp = RedirectResponse(
        __build_authorize_url(
            well_known=await oidc_settings.get_well_known(),
            state=state,
            code_challenge=None,  # No PKCE — mock provider uses client_secret_post
        )
    )
    resp.set_cookie(
        "_oidc_state",
        signed,
        httponly=True,
        max_age=300,  # 5 minutes
        samesite="lax",
    )
    return resp


# ---------------------------------------------------------------------------
# Callback — exchange code for tokens, set session
# ---------------------------------------------------------------------------


@router.get("/callback")
async def callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
):
    """Handle OIDC callback — exchange authorization code for tokens."""
    if error:
        error_desc = request.query_params.get("error_description", error)
        raise HTTPException(status_code=400, detail=f"OIDC error: {error} — {error_desc}")

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state parameter")

    # Verify state from cookie
    from itsdangerous import Serializer
    signed_state = request.cookies.get("_oidc_state")
    if not signed_state:
        print(f"[DEBUG] callback: no _oidc_state cookie. All cookies: {list(request.cookies.keys())}")
        raise HTTPException(status_code=400, detail="Missing OIDC state cookie — please try logging in again")

    try:
        from itsdangerous import URLSafeTimedSerializer
        s = URLSafeTimedSerializer(
            os.getenv("JWT_SECRET", "change-me-in-production"),
            salt="genai-oauth-state",
        )
        print(f"[DEBUG] cookie value: {signed_state[:60]}...")
        data = s.loads(signed_state)  # type: ignore[arg-type]
        print(f"[DEBUG] loaded data: {data}")
        stored_state = data.get("state")
        print(f"[DEBUG] stored_state: {stored_state}, callback state: {state}")
    except Exception as e:
        print(f"[DEBUG] loads error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid OIDC state cookie: {e}")

    if state != stored_state:
        raise HTTPException(status_code=400, detail="State mismatch — possible CSRF attack")

    # Exchange code for tokens
    well_known = await oidc_settings.get_well_known()
    token_response = await __exchange_code(
        token_endpoint=well_known.token_endpoint,
        code=code,
    )

    # Extract user info from id_token or userinfo endpoint
    user_info = await __extract_user_info(token_response)

    # Set session cookie
    request.state._session_action = "set"
    request.state._session_value = user_info

    # Redirect to frontend auth callback page
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:4200")
    return RedirectResponse(f"{frontend_url}/auth/callback", status_code=302)


# ---------------------------------------------------------------------------
# Logout — clear session cookie
# ---------------------------------------------------------------------------


@router.get("/logout")
async def logout(request: Request):
    """Clear the session cookie and redirect to frontend home."""
    request.state._session_action = "clear"
    return RedirectResponse("/", status_code=302)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def __generate_state() -> str:
    """Generate a random state value for CSRF protection."""
    import secrets
    return secrets.token_urlsafe(32)


def __build_authorize_url(
    well_known,
    state: str,
    code_challenge: Optional[str],
) -> str:
    """Build the OIDC authorization URL."""
    params = {
        "response_type": "code",
        "client_id": oidc_settings.client_id,
        "redirect_uri": oidc_settings.redirect_uri,
        "state": state,
        "scope": oidc_settings.scopes,
    }
    if code_challenge:
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"
    return f"{well_known.authorization_endpoint}?{urllib.parse.urlencode(params)}"


async def __exchange_code(
    token_endpoint: str,
    code: str,
) -> dict:
    """Exchange authorization code for tokens using client_secret_post."""
    import httpx

    async with httpx.AsyncClient(timeout=15) as client:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": oidc_settings.redirect_uri,
            "client_id": oidc_settings.client_id,
            "client_secret": oidc_settings.client_secret,
        }
        resp = await client.post(token_endpoint, data=data)
        resp.raise_for_status()
        return resp.json()


async def __extract_user_info(token_response: dict) -> dict:
    """Extract user info from id_token or the userinfo endpoint."""
    import httpx
    from jose import jwt

    id_token = token_response.get("id_token")

    if id_token:
        # Decode id_token to get issuer (for JWKS URL)
        unverified = jwt.decode(id_token, options={"verify_signature": False})
        issuer = unverified.get("iss", oidc_settings.issuer)

        # Fetch JWKS and verify id_token signature
        well_known = await oidc_settings.get_well_known()
        jwks_resp = await httpx.AsyncClient(timeout=10).get(well_known.jwks_uri)
        jwks_resp.raise_for_status()
        jwks = jwks_resp.json()

        # Find the matching key by kid
        headers = jwt.get_unverified_headers(id_token)
        kid = headers.get("kid")

        key = None
        for k in jwks.get("keys", []):
            if k.get("kid") == kid:
                from jose import jwks as jose_jwks
                key = jose_jwks.get_jwk_from_dict(k).as_pem()
                break

        if key is None and jwks.get("keys"):
            from jose import jwks as jose_jwks
            key = jose_jwks.get_jwk_from_dict(jwks["keys"][0]).as_pem()

        if key is None:
            raise HTTPException(status_code=500, detail="No JWKS key found for token signing")

        # Verify and decode
        payload = jwt.decode(
            id_token,
            key,
            algorithms=["RS256"],
            audience=oidc_settings.client_id,
            issuer=issuer,
        )
        return payload

    # No id_token — use access_token to call userinfo endpoint
    access_token = token_response.get("access_token")
    if not access_token:
        raise HTTPException(status_code=500, detail="No id_token or access_token received")

    well_known = await oidc_settings.get_well_known()
    async with httpx.AsyncClient(timeout=10) as client:
        ui_resp = await client.get(
            well_known.userinfo_endpoint,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        ui_resp.raise_for_status()
        return ui_resp.json()
