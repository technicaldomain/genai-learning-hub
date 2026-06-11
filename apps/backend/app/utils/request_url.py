"""Utilities for deriving externally reachable URLs behind reverse proxies."""

from __future__ import annotations

from fastapi import Request


def get_external_base_url(request: Request) -> str:
    """Return base URL as seen by external clients (proxy-aware)."""
    forwarded_proto = request.headers.get("x-forwarded-proto", "")
    forwarded_host = request.headers.get("x-forwarded-host", "")

    proto = (forwarded_proto.split(",", 1)[0].strip() or request.url.scheme)
    host = (
        forwarded_host.split(",", 1)[0].strip()
        or request.headers.get("host", "").strip()
        or request.url.netloc
    )

    return f"{proto}://{host}".rstrip("/")


def get_external_request_url(request: Request) -> str:
    """Return full request URL as seen by external clients (proxy-aware)."""
    base_url = get_external_base_url(request)
    path = request.url.path
    query = request.url.query
    if query:
        return f"{base_url}{path}?{query}"
    return f"{base_url}{path}"
