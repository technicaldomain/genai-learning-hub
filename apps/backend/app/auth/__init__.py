"""OIDC authentication module — session cookies, PKCE, and token validation."""

from __future__ import annotations

from .middleware import SessionMiddleware
from .config import settings as oidc_settings
from .pkce import generate_pkce_params

__all__ = ["SessionMiddleware", "oidc_settings", "generate_pkce_params"]
