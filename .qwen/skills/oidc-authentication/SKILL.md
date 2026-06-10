---
name: oidc-authentication
description: Implement OIDC authentication with Authorization Code Flow + PKCE for enterprise-ready platforms
source: auto-skill
extracted_at: '2026-06-09T23:45:41.629Z'
---

## Purpose

Add OIDC (OpenID Connect) authentication to a FastAPI backend using Authorization Code Flow with PKCE for enterprise SSO integration.

## Project Context

This project uses a Generic OIDC Provider with:
- Authorization Code Flow with PKCE (no client secret needed)
- FastAPI backend at `apps/backend/`
- Existing deps: `python-jose`, `httpx`, `pyjwt` in `pyproject.toml`
- Auth code should live in `apps/backend/app/auth/`

## PKCE Flow Overview

```
1. User navigates to /auth/login
2. Backend generates code_verifier + code_challenge (S256)
3. Backend redirects user to OIDC provider's authorize URL
4. User authenticates with provider
5. Provider redirects back to /auth/callback?code=...
6. Backend exchanges code + verifier for tokens (access_token, id_token)
7. Backend validates id_token (signature, issuer, audience, expiry)
8. Backend issues its own session cookie / sets user in session
9. /api/me endpoint returns user info
```

## Implementation Approach

### 1. OIDC Configuration

Store OIDC provider metadata in a config module:

```python
# app/auth/config.py
import os

OIDC_ISSUER = os.getenv("OIDC_ISSUER", "https://accounts.example.com")
OIDC_CLIENT_ID = os.getenv("OIDC_CLIENT_ID", "")
OIDC_REDIRECT_URI = os.getenv("OIDC_REDIRECT_URI", "http://localhost:8000/auth/callback")

# .well-known/openid-configuration endpoint
def get_well_known():
    import httpx
    response = httpx.get(f"{OIDC_ISSUER}/.well-known/openid-configuration")
    response.raise_for_status()
    return response.json()
```

### 2. PKCE Utilities

```python
# app/auth/pkce.py
import secrets
import base64
import hashlib

def generate_pkce_params() -> tuple[str, str]:
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b"=").decode()
    return code_verifier, code_challenge
```

### 3. Auth Routes

```python
# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from app.auth.pkce import generate_pkce_params
from app.auth.config import get_well_known, OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_REDIRECT_URI
import httpx
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/login")
async def login(request: Request):
    state = secrets.token_urlsafe(32)
    code_verifier, code_challenge = generate_pkce_params()
    
    request.session["state"] = state
    request.session["code_verifier"] = code_verifier
    
    well_known = get_well_known()
    authorize_url = f"{well_known['authorization_endpoint']}?response_type=code&client_id={OIDC_CLIENT_ID}&redirect_uri={OIDC_REDIRECT_URI}&code_challenge={code_challenge}&code_challenge_method=S256&state={state}&scope=openid+profile+email"
    
    return RedirectResponse(authorize_url)

@router.get("/callback")
async def callback(request: Request, code: str, state: str):
    stored_state = request.session.get("state")
    if state != stored_state:
        raise HTTPException(400, "Invalid state parameter")
    
    code_verifier = request.session.get("code_verifier")
    well_known = get_well_known()
    
    token_response = httpx.post(
        well_known["token_endpoint"],
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": OIDC_REDIRECT_URI,
            "client_id": OIDC_CLIENT_ID,
            "code_verifier": code_verifier,
        }
    )
    token_response.raise_for_status()
    tokens = token_response.json()
    
    # Decode and validate id_token
    from jose import jwt
    id_token = tokens["id_token"]
    # Use provider's JWKS to verify signature, then decode
    payload = jwt.decode(id_token, algorithms=["RS256"], options={"verify_signature": True})
    
    # Set session / cookie here
    request.session["user"] = payload
    
    return RedirectResponse("/")
```

### 4. /api/me Endpoint

```python
# app/api/me.py
from fastapi import APIRouter, Request, HTTPException

router = APIRouter()

@router.get("/api/me")
async def get_me(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user
```

### 5. Frontend Integration

From the React frontend, protect routes that require auth:
- Use the `/auth/login` redirect for unauthenticated access
- Use `/api/me` to check login status
- Store OIDC user data in React context or TanStack Query cache

## File Layout

```
apps/backend/app/
  auth/
    __init__.py
    config.py       # OIDC provider configuration
    pkce.py         # PKCE parameter generation
    token.py        # Token validation / JWKS client
  api/
    auth.py         # /auth/login, /auth/callback routes
    me.py           # /api/me endpoint
```

## Verification

1. Test the full login/callback flow end-to-end
2. Verify `/api/me` returns user info when authenticated, 401 when not
3. Test with an actual OIDC provider (Keycloak, Auth0, Okta, etc.)
