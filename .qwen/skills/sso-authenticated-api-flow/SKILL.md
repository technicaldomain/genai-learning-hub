---
name: sso-authenticated-api-flow
description: Implement SSO-authenticated FastAPI backend where all API routes require session auth, with frontend redirect-to-login on 401
source: auto-skill
extracted_at: '2026-06-10T13:15:00.000Z'
---

## Purpose

Protect all backend API routes with SSO authentication (session cookies), with a frontend that redirects unauthenticated users to a login page with a sign-in button.

## Auth Architecture

```
Frontend SPA (React + Vite)  ←→  Backend API (FastAPI)  ←→  OIDC Provider
        |                               |                        |
   401 on any /api/*       all /api/* except           Authorization
   → redirect to           /api/auth/* &               Code Flow +
   /auth/login page        /api/health                 Client Secret
```

## Backend: Auth Dependency Pattern

Create a reusable async dependency that validates session cookies:

```python
# app/auth/dependencies.py
from fastapi import HTTPException, Request, status

async def get_current_user(request: Request) -> dict:
    """FastAPI dependency that validates session cookie and returns user dict."""
    user_data = getattr(request.state, "user", None)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Session"},
        )
    return user_data
```

**Critical:** This must be an `async def` function — FastAPI's `Depends()` expects either a sync callable or an async function. A class with `__call__` that is NOT async does NOT work as a FastAPI dependency.

### Protect Routes

Use `Depends(get_current_user)` as the **first parameter** to every protected route:

```python
from fastapi import Depends
from app.auth.dependencies import get_current_user

@router.get("/skills")
async def list_skills(
    user: dict = Depends(get_current_user),  # <-- first param, enforces auth
    category: Optional[str] = Query(None),
    ...
):
    ...
```

**Exception:** Routes under `/api/auth/*` (login, callback, logout) and `/api/health` remain **unprotected**.

## Frontend: 401 → Login Redirect Flow

### Auth Check Hook (`useAuthCheck`)

The hook must return `{ isLoading, isAuthenticated }` and re-validate on every location change (not just mount). This is critical for handling the redirect flow after OIDC callback:

```typescript
// src/hooks/useAuthCheck.ts
import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useAuthCheck() {
  const [status, setStatus] = React.useState({
    isLoading: true,
    isAuthenticated: false,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const checkedAt = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Re-check on every route change — handles redirect from /auth/callback back to /
    const key = location.pathname + location.search;
    if (checkedAt.current === key) return;
    checkedAt.current = key;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
        if (!cancelled) {
          if (!res.ok) {
            const isLogin = location.pathname === "/login";
            setStatus({ isLoading: false, isAuthenticated: false });
            if (!isLogin) {
              navigate("/login", { replace: true, state: { from: location } });
            }
          } else {
            setStatus({ isLoading: false, isAuthenticated: true });
          }
        }
      } catch {
        if (!cancelled) {
          const isLogin = location.pathname === "/login";
          setStatus({ isLoading: false, isAuthenticated: false });
          if (!isLogin) {
            navigate("/login", { replace: true, state: { from: location } });
          }
        }
      }
    }

    check();
    return () => { cancelled = true; };
  }, [navigate, location]);

  return status;
}
```

**Key design decisions:**
- **Location-keyed `checkedAt` ref** (not a boolean): A simple `hasChecked.current = true` ref prevents re-checking after redirect back from `/auth/callback`. Using `location.pathname + location.search` as the key ensures auth is re-validated on every route change.
- **Always returns `isAuthenticated`**: Must not be omitted from the return value — `AuthGuard` checks `!isAuthenticated` to decide whether to render children.
- **`credentials: "include"`**: Required so the session cookie is sent with the `/api/me` check.
- **Cancels in-flight requests on unmount**: `let cancelled = false` + cleanup function prevents `setState` on unmounted components.

### Auth Guard Component

Wraps all protected routes with the auth check hook:

```tsx
// src/app/app.tsx
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthCheck();

  // Still loading — show loader (blocks render)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <svg className="h-10 w-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Not authenticated — block render, redirect will happen
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### API Client 401 Handler

```typescript
// src/api/client.ts
if (response.status === 401) {
  window.location.href = "/login";
  throw new Error("Unauthorized");
}
```

### Login Page (`/login`)

Shows a **sign-in button** that redirects to the backend auth endpoint:

```tsx
// src/pages/Auth/LoginPage.tsx
const handleSignIn = () => {
  window.location.href = "/api/auth/login";  // Backend OIDC start
};
```

### Callback Page — Preserves Original Location

After OIDC login, the callback page should redirect back to where the user was before login:

```typescript
// src/pages/Auth/CallbackPage.tsx
const from = (location.state as { from?: { pathname: string } } | undefined)?.from?.pathname;
navigate(from || "/", { replace: true });
```

The `useAuthCheck` hook passes `state: { from: location }` when navigating to `/login`, so the original page is available in `location.state`.

## Complete Flow

1. User visits any page → API calls return 401
2. API client redirects to `/login` (frontend page with sign-in button)
3. User clicks "Sign in" → redirects to `/api/auth/login` (backend)
4. Backend sets `_oidc_state` cookie, redirects to OIDC provider
5. User authenticates with OIDC provider → redirects to `/api/auth/callback` (backend)
6. Backend validates state cookie, exchanges code for tokens, sets session cookie
7. Backend redirects to frontend `/auth/callback` page
8. Frontend polls `/api/me` to confirm auth → redirects to `state.from` (or home)
9. `useAuthCheck` re-validates on the new route → `isAuthenticated = true` → content renders
10. User is now authenticated — all API calls succeed

## Environment Variables

```env
# Backend .env
JWT_SECRET=<random-hex-64>                    # Signs session cookies & state cookies
OIDC_AUTHORITY=https://oidc-mock.technicaldomain.xyz
OIDC_CLIENT_ID=<registered-client-id>
OIDC_CLIENT_SECRET=<registered-client-secret>
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/callback
FRONTEND_URL=http://localhost:4200            # Where to redirect after OIDC callback
```

## Common Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Using `class AuthRequired` with `__call__` instead of `async def` | 500 Internal Server Error on protected routes | Use `async def get_current_user(request: Request)` with `Depends()` |
| Using `session` middleware with cookie-based auth | Cookies not persisted | Use `itsdangerous` signed cookies + `request.state._session_action` |
| OIDC `redirect_uri` points to frontend | State cookie can't be read on callback | Must point to backend (`/api/auth/callback`) |
| `token_endpoint_auth_method: "none"` | 401 on token exchange with mock provider | Register client with `client_secret_post` |
| `URLSafeTimedSerializer` signature mismatch | "Invalid OIDC state cookie" | Ensure secret at sign time matches secret at verify time (`.env` must be loaded) |
| Using `Serializer` with `urlencode` payload | Cookie value contains quotes, breaks on round-trip | Use `URLSafeTimedSerializer` with dict payload |
| Auto-redirect on 401 from hooks | Blinking loop on page load | Handle 401 in component (show "Sign in"), not in API client |

## File Layout

```
apps/backend/
  app/
    auth/
      dependencies.py   # AuthRequired dependency
      config.py         # OIDC settings
      middleware.py     # SessionMiddleware
      pkce.py           # PKCE helpers
    routes/
      auth.py           # /api/auth/login, /callback, /logout (unprotected)
      me.py             # /api/me (protected)
      skills.py         # /api/skills (protected)
      resources.py      # /api/resources (protected)
      prompts.py        # /api/prompts (protected)
      news.py           # /api/news (protected)

apps/frontend/
  src/
    api/
      client.ts         # 401 → redirect to /login
      hooks.ts          # useCurrentUser, useLogout
    hooks/
      useAuthCheck.ts   # Auth guard hook — returns { isLoading, isAuthenticated }
    pages/
      Auth/
        LoginPage.tsx   # Sign-in button → /api/auth/login
        CallbackPage.tsx # Polls /api/me → redirect to state.from (or /)
    app/
      app.tsx           # Router + AuthGuard wrapper
```

## Common Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| `useAuthCheck` only returns `{ isLoading }` — `isAuthenticated` is `undefined` | `AuthGuard` always shows spinner forever | Always return `{ isLoading, isAuthenticated }` from the hook |
| Using `hasChecked` boolean ref instead of location-keyed ref | Auth never re-validates after redirect from `/auth/callback` — spinner stuck | Use `checkedAt.current = location.pathname + location.search` so re-check happens on route change |
| Not passing `state: { from: location }` when redirecting to login | After login, user always goes to home instead of original page | Pass `state` in `navigate()` to `/login`, read it in `CallbackPage` |
| Using `!res.ok` instead of checking for error thrown | 4xx non-401 responses incorrectly treated as authenticated | Check `res.ok` explicitly; treat non-200 as unauthenticated |
| Missing `credentials: "include"` in `/api/me` check | Auth check always fails (no cookie sent) | Always use `credentials: "include"` for cookie-based auth |
| Using `class AuthRequired` with `__call__` instead of `async def` | 500 Internal Server Error on protected routes | Use `async def get_current_user(request: Request)` with `Depends()` |
| Using `session` middleware with cookie-based auth | Cookies not persisted | Use `itsdangerous` signed cookies + `request.state._session_action` |
| OIDC `redirect_uri` points to frontend | State cookie can't be read on callback | Must point to backend (`/api/auth/callback`) |
| `token_endpoint_auth_method: "none"` | 401 on token exchange with mock provider | Register client with `client_secret_post` |
| `URLSafeTimedSerializer` signature mismatch | "Invalid OIDC state cookie" | Ensure secret at sign time matches secret at verify time (`.env` must be loaded) |
| Using `Serializer` with `urlencode` payload | Cookie value contains quotes, breaks on round-trip | Use `URLSafeTimedSerializer` with dict payload |
| Auto-redirect on 401 from hooks | Blinking loop on page load | Handle 401 in component (show "Sign in"), not in API client |
