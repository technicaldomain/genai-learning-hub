---
name: genai-oidc-mock-integration
description: Implement OIDC Auth Code Flow with PKCE using the technicaldomain OIDC mock provider (oidc-mock.technicaldomain.xyz) with cookie-based sessions
source: auto-skill
extracted_at: '2026-06-10T04:20:00.000Z'
---

## OIDC Mock Provider Integration

### Provider Details

- **Issuer:** `https://oidc-mock.technicaldomain.xyz`
- **Well-known:** `https://oidc-mock.technicaldomain.xyz/.well-known/openid-configuration`
- **Authorize:** `https://oidc-mock.technicaldomain.xyz/oauth2/authorize`
- **Token:** `https://oidc-mock.technicaldomain.xyz/oauth2/token`
- **JWKS:** `https://oidc-mock.technicaldomain.xyz/jwks`
- **UserInfo:** `https://oidc-mock.technicaldomain.xyz/userinfo`
- **Client registration:** `POST https://oidc-mock.technicaldomain.xyz/oauth2/clients`

### Provider Behavior (Important)

1. **Authorize page** shows a login form with a single `sub` text field (accepts any email)
2. **Form submission:** POST to `/oauth2/authorize` with `sub=<email>` + all query params from the GET request
3. **Token endpoint requires `client_secret_post`** auth method — `token_endpoint_auth_method: "none"` does NOT work
4. **PKCE is NOT enforced** at the token endpoint — the `code_verifier` is ignored
5. **Callback must match** the registered `redirect_uri` exactly (path matters)

### Registration Script

```bash
curl -s -X POST "https://oidc-mock.technicaldomain.xyz/oauth2/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "redirect_uris": ["<YOUR_REDIRECT_URI>"],
    "token_endpoint_auth_method": "client_secret_post",
    "grant_types": ["authorization_code"],
    "response_types": ["code"]
  }'
```

Returns `client_id` and `client_secret`.

### State Cookie Pattern

The OIDC state + PKCE verifier must be stored in a **signed cookie**, NOT in `request.state`, because:
- `request.state` is per-request and is lost between the `/login` redirect and `/callback` return
- The browser navigates to the OIDC provider, then back to `/callback` — two separate HTTP requests

```python
# In /login route:
payload = urllib.parse.urlencode({"state": state, "verifier": code_verifier})
signed = Serializer(JWT_SECRET, salt="genai-oauth-state").dumps(payload)
resp = RedirectResponse(authorize_url)
resp.set_cookie("_oidc_state", signed, httponly=True, max_age=300, samesite="lax")
return resp

# In /callback route:
signed_state = request.cookies.get("_oidc_state")
payload = Serializer(JWT_SECRET, salt="genai-oauth-state").loads(signed_state)
params = dict(urllib.parse.parse_qsl(payload))
stored_state = params.get("state")
code_verifier = params.get("verifier")
```

### Cookie-Based Session Middleware

Uses `itsdangerous.Serializer` for secure signed cookies:

```python
# Set session:
request.state._session_action = "set"
request.state._session_value = user_dict

# Clear session:
request.state._session_action = "clear"

# Middleware reads these and writes Set-Cookie header
```

### Route Structure (all under /api/)

| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | GET | Generates state/verifier, sets state cookie, redirects to OIDC authorize |
| `/api/auth/callback` | GET | Validates state cookie, exchanges code for tokens, sets session cookie, redirects to `/` |
| `/api/auth/logout` | GET | Clears session cookie, redirects to `/` |
| `/api/me` | GET | Returns user profile from session cookie, 401 if unauthenticated |

### Frontend Pattern

**API client:** Do NOT auto-redirect on 401. Let the calling component handle it.

```typescript
// client.ts - no auto-redirect on 401
if (!response.ok) {
  throw new Error(`API error: ${response.status} ${response.statusText}`);
}
```

**UserMenu component:** Calls `useCurrentUser()`, shows "Sign in" button on 401, user clicks to trigger redirect.

```typescript
// No automatic redirect from hooks — UserMenu handles it
const handleLogin = () => {
  window.location.href = "/api/auth/login";
};
```

**Vite proxy:** Only proxy `/api/*` to backend:
```typescript
proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } }
```

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "State mismatch" on callback | State stored in `request.state` not persisted | Use signed cookie instead |
| 401 on token exchange | Client registered with `token_endpoint_auth_method: "none"` | Register with `"client_secret_post"` |
| 400 `invalid_response_type` | Form POST missing query params | Include `response_type`, `client_id`, `redirect_uri`, `state` in form data |
| Blinking on 401 | API client auto-redirects on every 401 from hooks | Remove auto-redirect, handle in component |
| `/auth/*` not reaching backend | Vite proxy only has `/api` | Add `/auth` to proxy or move routes under `/api/` |
| `.env` vars not loaded in auth module | `auth/config.py` uses plain `BaseModel` not `BaseSettings` | Call `load_dotenv()` explicitly or use `BaseSettings` |

### Files

- `apps/backend/app/auth/__init__.py`
- `apps/backend/app/auth/config.py`
- `apps/backend/app/auth/pkce.py`
- `apps/backend/app/auth/middleware.py`
- `apps/backend/app/routes/auth.py`
- `apps/frontend/src/pages/Auth/LoginPage.tsx`
- `apps/frontend/src/pages/Auth/CallbackPage.tsx`
