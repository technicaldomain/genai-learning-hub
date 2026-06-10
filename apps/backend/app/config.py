"""Application configuration."""

from __future__ import annotations

from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "GenAI Learning Hub"
    debug: bool = False
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    oidc_authority: str = ""
    oidc_client_id: str = ""
    oidc_client_secret: str = ""
    oidc_redirect_uri: str = "http://localhost:4200/auth/callback"
    cors_origins: str = "http://localhost:4200"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
