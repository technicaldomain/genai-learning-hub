"""OAuth metadata endpoints for MCP protected resource discovery."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

from app.auth.config import settings as oidc_settings

router = APIRouter(tags=["oauth"])


def _resolve_base_url(request: Request) -> str:
    return str(request.base_url).rstrip("/")


def _collect_resource_scopes() -> list[str]:
    from app.routes.mcp import _MCP_SERVERS

    scopes: set[str] = set()
    for server in _MCP_SERVERS:
        for scope in server.oidc_scopes or []:
            scopes.add(scope)
    return sorted(scopes)


@router.get("/.well-known/oauth-protected-resource")
@router.get("/.well-known/oauth-protected-resource/{resource_path:path}")
async def oauth_protected_resource_metadata(request: Request, resource_path: str = "") -> dict[str, Any]:
    base_url = _resolve_base_url(request)
    resource_path = resource_path.lstrip("/")
    resource_url = f"{base_url}/{resource_path}" if resource_path else base_url

    return {
        "resource": resource_url,
        "authorization_servers": [oidc_settings.issuer],
        "resource_name": "GenAI Learning Hub MCP",
        "resource_documentation": f"{base_url}/community/mcp-connect",
        "bearer_methods_supported": ["header"],
        "scopes_supported": _collect_resource_scopes(),
    }