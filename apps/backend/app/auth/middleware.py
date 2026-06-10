"""Session cookie middleware — stores user claims in an encrypted signed cookie."""

from __future__ import annotations

import json
import os
import warnings
from typing import Any, Dict, Optional

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from itsdangerous import URLSafeTimedSerializer, SignatureExpired

COOKIE_NAME = "genai_session"
COOKIE_MAX_AGE = 60 * 60 * 8  # 8 hours in seconds


def _get_secret() -> str:
    secret = os.getenv("JWT_SECRET", "change-me-in-production")
    if secret == "change-me-in-production":
        warnings.warn(
            "Using default session secret — set JWT_SECRET in .env!",
            stacklevel=2,
        )
    return secret


def _create_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(_get_secret(), salt="genai-learning-hub-session")


def serialize_session(data: Dict[str, Any]) -> str:
    """Serialize session data into a signed cookie string."""
    return _create_serializer().dumps(json.dumps(data))


def deserialize_session(cookie_value: Optional[str]) -> Optional[Dict[str, Any]]:
    """Deserialize and verify a session cookie string.

    Returns None if the cookie is missing, invalid, or expired.
    """
    if not cookie_value:
        return None
    try:
        json_str = _create_serializer().loads(cookie_value)  # type: ignore[arg-type]
        return json.loads(json_str)
    except SignatureExpired:
        return None
    except Exception:
        return None


class SessionMiddleware(BaseHTTPMiddleware):
    """Middleware that reads a signed session cookie and exposes ``request.state.user``.

    Auth routes can set the session by calling:
        request.state._session_action = "set"
        request.state._session_value = user_dict

    Or clear it:
        request.state._session_action = "clear"
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Decode session
        cookie = request.cookies.get(COOKIE_NAME)
        request.state.user = deserialize_session(cookie)

        # Initialize state
        request.state._session_action = None  # type: ignore[attr-defined]
        request.state._session_value = None  # type: ignore[attr-defined]

        response = await call_next(request)

        # Apply session action
        action: Optional[str] = getattr(request.state, "_session_action", None)
        value: Optional[Dict[str, Any]] = getattr(request.state, "_session_value", None)

        if action == "set" and value is not None:
            response.set_cookie(
                COOKIE_NAME,
                serialize_session(value),
                max_age=COOKIE_MAX_AGE,
                httponly=True,
                secure=not request.url.scheme == "http",
                samesite="lax",
            )
        elif action == "clear":
            response.set_cookie(
                COOKIE_NAME,
                "",
                max_age=0,
                httponly=True,
                secure=not request.url.scheme == "http",
                samesite="lax",
            )

        return response
