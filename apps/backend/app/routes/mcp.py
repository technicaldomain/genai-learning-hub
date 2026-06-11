"""MCP server endpoints — serves MCP server configurations with OIDC auth."""

from __future__ import annotations

import urllib.parse
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.auth.dependencies import get_current_user
from app.models import McpServer, McpTransport, PaginatedResponse, User
from app.utils.request_url import get_external_base_url, get_external_request_url

router = APIRouter()


async def get_mcp_authenticated_user(request: Request) -> User:
    """Authenticate MCP routes and advertise a browser login URL when missing session."""
    try:
        return await get_current_user(request)
    except HTTPException:
        base_url = get_external_base_url(request)
        return_to = urllib.parse.quote(get_external_request_url(request), safe="")
        authorization_uri = f"{base_url}/api/auth/login?return_to={return_to}"
        resource_path = request.url.path.lstrip("/")
        resource_metadata = f"{base_url}/.well-known/oauth-protected-resource/{resource_path}"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={
                "WWW-Authenticate": f'Bearer resource_metadata="{resource_metadata}", authorization_uri="{authorization_uri}"',
            },
        )


# ---------------------------------------------------------------------------
# MCP server catalog (could be loaded from a JSON file in production)
# ---------------------------------------------------------------------------

_MCP_SERVERS: list[McpServer] = [
    McpServer(
        id="data-pipeline",
        name="Data Pipeline MCP Server",
        description="Connect to your internal data pipeline for querying datasets, running ETL jobs, and monitoring pipeline health.",
        transport=McpTransport.sse,
        config={
            "url": "http://localhost:8000/mcp/data-pipeline/sse",
            "headers": {"Authorization": "Bearer {token}"},
        },
        auth_required=True,
        oidc_scopes=["openid", "profile", "email", "data-pipeline:read"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
    McpServer(
        id="model-serving",
        name="Model Serving MCP Server",
        description="Interact with deployed ML models — trigger inference, manage model versions, and view metrics.",
        transport=McpTransport.sse,
        config={
            "url": "http://localhost:8000/mcp/model-serving/sse",
            "headers": {"Authorization": "Bearer {token}"},
        },
        auth_required=True,
        oidc_scopes=["openid", "profile", "email", "model-serving:read", "model-serving:write"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
    McpServer(
        id="community-tools",
        name="Community Tools MCP Server",
        description="Expose community interaction tools — post use cases, post skills, vote, start learning paths, and grab content for local projects.",
        transport=McpTransport.sse,
        config={
            "url": "http://localhost:8000/mcp/community-tools/sse",
            "headers": {"Authorization": "Bearer {token}"},
        },
        auth_required=True,
        oidc_scopes=["openid", "profile", "email"],
        tools=[
            {
                "name": "post_usecase",
                "description": "Submit a new use case to the showcase. Requires title and description.",
                "parameters": {
                    "title": "string — Use case title",
                    "description": "string — Use case description",
                    "tags": "string[] — Comma-separated tags",
                },
            },
            {
                "name": "post_skill",
                "description": "Submit a new skill to the marketplace. Requires title and description.",
                "parameters": {
                    "title": "string — Skill title",
                    "description": "string — Skill description",
                    "tags": "string[] — Comma-separated tags",
                },
            },
            {
                "name": "vote",
                "description": "Vote for a skill or use case. Increments the vote count.",
                "parameters": {
                    "target_id": "string — ID of the item to vote for",
                    "target_type": "string — Either 'skill' or 'usecase'",
                },
            },
            {
                "name": "start_learning",
                "description": "Enroll in a learning path. Returns enrollment info with progress tracking.",
                "parameters": {
                    "path_id": "string — ID of the learning path",
                    "path_title": "string — Title of the learning path",
                },
            },
            {
                "name": "grab",
                "description": "Add a skill or prompt to your local project. Returns download link and file list.",
                "parameters": {
                    "item_id": "string — ID of the item to grab",
                    "item_type": "string — Either 'skill' or 'prompt'",
                    "item_title": "string — Title of the item",
                },
            },
        ],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
]


@router.get("/mcp/servers")
async def list_mcp_servers(
    request: Request,
    user: User = Depends(get_mcp_authenticated_user),
):
    """List available MCP servers. Returns connection info and auth requirements."""
    base_url = get_external_base_url(request)
    resolved_servers = [
        server.model_copy(
            update={
                "config": server.config.model_copy(
                    update={"url": f"{base_url}/mcp/{server.id}/sse"}
                )
            }
        )
        for server in _MCP_SERVERS
    ]

    # Filter servers based on user roles in production
    return PaginatedResponse(
        data=resolved_servers,
        total=len(resolved_servers),
        page=1,
        page_size=len(resolved_servers),
    )


@router.get("/mcp/servers/{server_id}")
async def get_mcp_server(
    server_id: str,
    request: Request,
    user: User = Depends(get_mcp_authenticated_user),
):
    """Get a single MCP server configuration by ID."""
    base_url = get_external_base_url(request)
    for server in _MCP_SERVERS:
        if server.id == server_id:
            return server.model_copy(
                update={
                    "config": server.config.model_copy(
                        update={"url": f"{base_url}/mcp/{server.id}/sse"}
                    )
                }
            )
    return {"error": "MCP server not found"}, 404


@router.get("/mcp/{server_id}/sse")
async def mcp_sse_endpoint(
    server_id: str,
    user: User = Depends(get_mcp_authenticated_user),
):
    """
    SSE endpoint for an MCP server. In production, this would stream
    JSON-RPC messages from the actual MCP server process.

    For now, returns connection info.
    """
    # Verify the server exists
    matching = [s for s in _MCP_SERVERS if s.id == server_id]
    if not matching:
        return {"error": "MCP server not found"}, 404

    server = matching[0]

    return {
        "server_id": server.id,
        "server_name": server.name,
        "transport": server.transport.value,
        "auth_required": server.auth_required,
        "connection_info": {
            "endpoint": f"/mcp/{server_id}/sse",
            "auth_type": "bearer",
            "scopes": server.oidc_scopes or [],
        },
    }


# ---------------------------------------------------------------------------
# MCP Actions — post, vote, start learning, grab
# ---------------------------------------------------------------------------


@router.post("/mcp/actions/post-usecase")
async def post_usecase(
    body: dict,
    user: dict = Depends(get_mcp_authenticated_user),
):
    """Post a new use case (fake — logs and returns success)."""
    return {
        "ok": True,
        "message": "Use case posted successfully.",
        "usecase": {
            "id": f"uc-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "title": body.get("title", ""),
            "status": "pending_review",
        },
    }


@router.post("/mcp/actions/post-skill")
async def post_skill(
    body: dict,
    user: dict = Depends(get_mcp_authenticated_user),
):
    """Post a new skill (fake — logs and returns success)."""
    return {
        "ok": True,
        "message": "Skill posted successfully.",
        "skill": {
            "id": f"sk-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "title": body.get("title", ""),
            "status": "pending_review",
        },
    }


@router.post("/mcp/actions/vote")
async def vote(
    body: dict,
    user: dict = Depends(get_mcp_authenticated_user),
):
    """Vote for a skill or use case (fake — returns incremented count)."""
    target_id = body.get("target_id", "")
    target_type = body.get("target_type", "skill")
    increment = body.get("increment", 1)
    return {
        "ok": True,
        "message": f"Vote recorded.",
        "target_id": target_id,
        "target_type": target_type,
        "new_vote_count": body.get("current_votes", 0) + increment,
    }


@router.post("/mcp/actions/start-learning")
async def start_learning(
    body: dict,
    user: dict = Depends(get_mcp_authenticated_user),
):
    """Start a learning path (fake — returns enrollment info)."""
    path_id = body.get("path_id", "")
    path_title = body.get("path_title", "")
    return {
        "ok": True,
        "message": f"Enrolled in '{path_title}'.",
        "enrollment": {
            "path_id": path_id,
            "path_title": path_title,
            "progress": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "next_module": 1,
        },
    }


@router.post("/mcp/actions/grab")
async def grab(
    body: dict,
    user: dict = Depends(get_mcp_authenticated_user),
):
    """Grab a skill or prompt for local project (fake — returns download link)."""
    item_id = body.get("item_id", "")
    item_type = body.get("item_type", "skill")
    item_title = body.get("item_title", "")
    return {
        "ok": True,
        "message": f"'{item_title}' added to your local project.",
        "grab": {
            "item_id": item_id,
            "item_type": item_type,
            "item_title": item_title,
            "download_url": f"/api/mcp/download/{item_id}",
            "files": [
                f"{item_id}/README.md",
                f"{item_id}/main.py",
                f"{item_id}/pyproject.toml",
            ],
        },
    }
