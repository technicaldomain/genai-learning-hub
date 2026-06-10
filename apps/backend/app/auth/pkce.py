"""PKCE (Proof Key for Code Exchange) parameter generation."""

from __future__ import annotations

import base64
import hashlib
import secrets


def generate_pkce_params() -> tuple[str, str]:
    """Generate a code_verifier and its S256 code_challenge.

    Returns:
        (code_verifier, code_challenge) tuple.
    """
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b"=").decode()
    return code_verifier, code_challenge
