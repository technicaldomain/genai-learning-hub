"""OIDC provider configuration — loaded from environment variables."""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()  # reads variables from a .env file and sets them in os.environ


class OidcWellKnown(BaseModel):
    """Parsed .well-known/openid-configuration response."""

    issuer: str
    authorization_endpoint: str
    token_endpoint: str
    userinfo_endpoint: str
    jwks_uri: str
    response_types_supported: list[str] = Field(default_factory=list)
    grant_types_supported: list[str] = Field(default_factory=list)
    response_modes_supported: list[str] = Field(default_factory=list)
    id_token_signing_alg_values_supported: list[str] = Field(default_factory=list)
    scopes_supported: list[str] = Field(default_factory=list)


def _get_env(key: str, default: str = "") -> str:
    """Get env var, trying GENAI_ prefix then the bare name."""
    for k in (f"GENAI_{key.upper()}", key.upper()):
        val = os.getenv(k)
        if val:
            return val
    return default


class Settings(BaseModel):
    """OIDC settings resolved from environment."""

    issuer: str = ""
    client_id: str = ""
    client_secret: str = ""
    redirect_uri: str = ""
    scopes: str = "openid+profile+email"
    jwks_cache_ttl: int = 3600

    @property
    def is_configured(self) -> bool:
        return bool(self.issuer and self.client_id)

    async def get_well_known(self) -> OidcWellKnown:
        """Fetch and parse the provider's .well-known/openid-configuration."""
        if not self.issuer:
            raise RuntimeError("OIDC_ISSUER not configured")
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{self.issuer}/.well-known/openid-configuration")
            resp.raise_for_status()
            return OidcWellKnown(**resp.json())


settings = Settings(
    issuer=_get_env("OIDC_AUTHORITY"),
    client_id=_get_env("OIDC_CLIENT_ID"),
    client_secret=_get_env("OIDC_CLIENT_SECRET"),
    redirect_uri=_get_env("OIDC_REDIRECT_URI", "http://localhost:8000/api/auth/callback"),
)
