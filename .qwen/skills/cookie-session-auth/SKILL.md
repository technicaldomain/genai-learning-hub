---
name: cookie-session-auth
description: Implement secure cookie-based session authentication with FastAPI and React SPA
source: auto-skill
extracted_at: '2026-06-10T04:06:13.414Z'
---

## Purpose

Add secure, stateless cookie-based session authentication to a FastAPI backend serving a React SPA — no JWT access tokens, just signed session cookies.

## Key Decisions (vs JWT approach)

- **Use `itsdangerous`** for signing/verifying session cookies (not pyjwt for access tokens)
- **Server-side stateless** — all user claims stored in the signed cookie itself
- **HttpOnly + SameSite=Lax** cookies prevent XSS and CSRF
- **No refresh token flow** — user re-authenticates on cookie expiry (8 hours default)
- **OIDC is the identity source** — backend exchanges the OIDC code for tokens, then creates its own session cookie

## Implementation Pattern

### 1. Session Cookie Middleware

Use `BaseHTTPMiddleware` to decode the signed cookie on every request and attach `request.state.user`. Auth routes set the session via `request.state._session_action` and `request.state._session_value`.

```python
class SessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Decode session cookie
        cookie = request.cookies.get("genai_session")
        request.state.user = deserialize_session(cookie)

        # Initialize session setter
        request.state._session_action = None
        request.state._session_value = None

        response = await call_next(request)

        # Apply session action on the way out
        action = getattr(request.state, "_session_action", None)
        value = getattr(request.state, "_session_value", None)

        if action == "set" and value:
            response.set_cookie(
                "genai_session",
                serialize_session(value),
                max_age=28800,  # 8 hours
                httponly=True,
                secure=not request.url.scheme == "http",
                samesite="lax",
            )
        elif action == "clear":
            response.set_cookie("genai_session", "", max_age=0, httponly=True)

        return response
```

### 2. Signed Cookie Serialization

Use `itsdangerous.Serializer` — it handles signing, expiration, and serialization in one library.

```python
from itsdangerous import Serializer, SignatureExpired

def serialize_session(data: dict) -> str:
    return Serializer(secret_key, salt="session-salt").dumps(data)

def deserialize_session(cookie_value: str | None) -> dict | None:
    if not cookie_value:
        return None
    try:
        return Serializer(secret_key, salt="session-salt").loads(cookie_value)
    except SignatureExpired:
        return None
    except Exception:
        return None
```

### 3. Auth Routes — State Cookie for PKCE

Three routes only:
- `GET /auth/login` — generates PKCE params, stores state+verifier in **signed cookie**, redirects to OIDC provider
- `GET /auth/callback` — reads state from cookie, verifies it, exchanges code for tokens, creates session cookie
- `GET /auth/logout` — clears session cookie, redirects to `/`

**Critical: The OIDC state/PKCE verifier must be stored in a cookie, NOT in `request.state`.** The `/auth/login` and `/auth/callback` endpoints are separate HTTP requests — `request.state` from step 1 is gone in step 2.

```python
@router.get("/login")
async def login(request: Request):
    state = secrets.token_urlsafe(32)
    code_verifier, code_challenge = generate_pkce_params()

    # Package state + verifier into a signed cookie
    payload = urllib.parse.urlencode({"state": state, "verifier": code_verifier})
    signed = Serializer(
        os.getenv("JWT_SECRET", "default-secret"),
        salt="genai-oauth-state",
    ).dumps(payload)

    resp = RedirectResponse(build_authorize_url(state, code_challenge))
    resp.set_cookie(
        "_oidc_state",
        signed,
        httponly=True,
        max_age=300,  # 5 minutes — short TTL for CSRF protection
        samesite="lax",
    )
    return resp

@router.get("/callback")
async def callback(request: Request, code: Optional[str] = None, state: Optional[str] = None):
    if not code or not state:
        raise HTTPException(400, "Missing code or state")

    # Read and verify signed cookie
    signed_state = request.cookies.get("_oidc_state")
    if not signed_state:
        raise HTTPException(400, "Missing OIDC state cookie")

    payload = Serializer(secret, salt="genai-oauth-state").loads(signed_state)
    params = dict(urllib.parse.parse_qsl(payload))

    if state != params.get("state"):
        raise HTTPException(400, "State mismatch — possible CSRF attack")

    code_verifier = params.get("verifier")
    # ... exchange code + verifier for tokens
```

### 4. Redirect URI must point to the backend

The OIDC provider redirects to the `redirect_uri` registered with the client. This **must** be the backend URL (e.g., `http://localhost:8000/auth/callback`), not the frontend. The backend needs to receive the callback so it can read the state cookie and exchange the authorization code.

If the frontend proxies `/auth/*` to the backend, the proxy config must include `/auth`:

```typescript
// vite.config.mts
proxy: {
  '/api': { target: 'http://localhost:8000' },
  '/auth': { target: 'http://localhost:8000' },  // <-- essential
},
```

### 4. Protected Endpoints

Check `request.state.user` in any route that needs auth:

```python
@router.get("/me")
async def get_me(request: Request):
    if not getattr(request.state, "user", None):
        raise HTTPException(401, "Not authenticated")
    return build_user_response(request.state.user)
```

## Common Pitfalls

1. **`load_dotenv()` must be called before reading env vars in auth config** — Pydantic Settings in the main `config.py` loads `.env`, but `auth/config.py` uses plain `BaseModel` which doesn't auto-load. Call `load_dotenv()` at module level in `auth/config.py`.

2. **Vite dev proxy must include `/auth`** — Add `'/auth': { target: 'http://localhost:8000' }` to `vite.config.mts` server.proxy. Without this, `/auth/login` hits the frontend SPA and returns `index.html`, causing redirects to loop back to home.

3. **CORS must allow credentials** — Set `allow_credentials=True` in FastAPI CORS middleware and use `credentials: "include"` in frontend fetch calls.

4. **Don't auto-redirect on 401 from the API client** — The `UserMenu` component calling `/me` on mount will trigger a full-page redirect if the client auto-redirects on 401. Instead, let the component handle 401 gracefully (show "Sign in" button) and redirect only on explicit user action.

## File Layout

```
apps/backend/
  app/
    auth/
      __init__.py
      config.py       # OIDC settings + load_dotenv()
      pkce.py         # PKCE param generation
      middleware.py   # SessionMiddleware + cookie helpers
    routes/
      auth.py         # /auth/login, /auth/callback, /auth/logout
      me.py           # GET /api/me (validates session)
  .env                # OIDC_ISSUER, OIDC_CLIENT_ID, JWT_SECRET
  pyproject.toml      # itsdangerous, python-dotenv deps

apps/frontend/
  src/
    api/
      client.ts       # fetch wrapper with credentials: "include"
      hooks.ts        # useCurrentUser, useLogout
    pages/
      Auth/
        LoginPage.tsx   # Redirects to /auth/login (backend)
        CallbackPage.tsx # Polls /me after OIDC callback
    layout/
      MainLayout.tsx   # UserMenu with sign-in/sign-out
  vite.config.mts      # Proxy /auth to backend
```
