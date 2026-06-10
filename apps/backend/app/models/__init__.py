"""Pydantic models matching the TypeScript shared-types interfaces."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional, Union

from pydantic import BaseModel, Field
from pydantic.alias_generators import to_camel
from pydantic_settings import BaseSettings


# ---------------------------------------------------------------------------
# Base model with camelCase field aliases (matches TS interfaces)
# ---------------------------------------------------------------------------


class CamelBase(BaseModel):
    model_config = {"alias_generator": to_camel, "populate_by_name": True}


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class UserRole(str, Enum):
    admin = "admin"
    editor = "editor"
    contributor = "contributor"
    viewer = "viewer"


class SkillCategory(str, Enum):
    data_processing = "data-processing"
    content_generation = "content-generation"
    code_assistance = "code-assistance"
    analysis = "analysis"
    automation = "automation"
    design = "design"
    other = "other"


class SkillLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class SkillAssetType(str, Enum):
    code = "code"
    notebook = "notebook"
    script = "script"
    template = "template"


class ResourceCategory(str, Enum):
    model = "model"
    platform = "platform"
    tool = "tool"
    api = "api"
    framework = "framework"
    documentation = "documentation"
    other = "other"


class ResourceType(str, Enum):
    web_app = "web-app"
    sdk = "sdk"
    api_type = "api"
    cli_tool = "cli-tool"
    library = "library"
    documentation = "documentation"


class PromptCategory(str, Enum):
    writing = "writing"
    coding = "coding"
    analysis = "analysis"
    creative = "creative"
    summarization = "summarization"
    translation = "translation"
    other = "other"


class ContributionType(str, Enum):
    use_case = "use-case"
    prompt = "prompt"
    lesson_learned = "lesson-learned"
    tip = "tip"


class ShowcaseCategory(str, Enum):
    industry_solution = "industry-solution"
    internal_tool = "internal-tool"
    proof_of_concept = "proof-of-concept"
    experiment = "experiment"
    other = "other"


class McpTransport(str, Enum):
    sse = "sse"
    stdio = "stdio"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------


class UserBase(CamelBase):
    sub: str
    name: str
    email: str
    roles: List[UserRole]
    avatar_url: Optional[str] = None
    department: Optional[str] = None


# Alias for convenience
User = UserBase


# ---------------------------------------------------------------------------
# Skill
# ---------------------------------------------------------------------------


class SkillAsset(CamelBase):
    type: SkillAssetType
    name: str
    content: str


class Skill(CamelBase):
    id: str
    title: str
    description: str
    category: SkillCategory
    level: SkillLevel
    author: str
    tags: List[str] = Field(default_factory=list)
    assets: List[SkillAsset] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    popularity: Optional[int] = None


# ---------------------------------------------------------------------------
# Resource
# ---------------------------------------------------------------------------


class Resource(CamelBase):
    id: str
    title: str
    description: str
    category: ResourceCategory
    url: str
    type: ResourceType
    tags: List[str] = Field(default_factory=list)
    featured: Optional[bool] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------


class Prompt(CamelBase):
    id: str
    title: str
    description: str
    template: str
    category: PromptCategory
    tags: List[str] = Field(default_factory=list)
    author: str
    usage_count: Optional[int] = None
    rating: Optional[float] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# News
# ---------------------------------------------------------------------------


class NewsItem(CamelBase):
    id: str
    title: str
    summary: str
    content: str
    source: str
    url: Optional[str] = None
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    published_at: datetime
    featured: Optional[bool] = None


# ---------------------------------------------------------------------------
# Learning Path
# ---------------------------------------------------------------------------


class LearningModule(CamelBase):
    id: str
    title: str
    description: str
    resources: List[str] = Field(default_factory=list)
    duration_minutes: int


class LearningPath(CamelBase):
    id: str
    title: str
    description: str
    level: SkillLevel
    modules: List[LearningModule] = Field(default_factory=list)
    estimated_hours: int
    tags: List[str] = Field(default_factory=list)
    created_at: datetime


# ---------------------------------------------------------------------------
# Community Contribution
# ---------------------------------------------------------------------------


class CommunityContribution(CamelBase):
    id: str
    title: str
    description: str
    author: str
    author_department: Optional[str] = None
    type: ContributionType
    tags: List[str] = Field(default_factory=list)
    resources: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    likes: Optional[int] = None


# ---------------------------------------------------------------------------
# Showcase
# ---------------------------------------------------------------------------


class ShowcaseResource(CamelBase):
    name: str
    url: Optional[str] = None
    type: str = "link"


class Showcase(CamelBase):
    id: str
    title: str
    description: str
    category: ShowcaseCategory
    author: str
    author_department: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    resources: List[ShowcaseResource] = Field(default_factory=list)
    status: str = "active"
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# MCP Server
# ---------------------------------------------------------------------------


class McpServerConfig(CamelBase):
    command: Optional[str] = None
    args: List[str] = Field(default_factory=list)
    url: Optional[str] = None
    headers: Optional[dict] = None


class McpServer(CamelBase):
    id: str
    name: str
    description: str
    transport: McpTransport
    config: McpServerConfig
    auth_required: bool = True
    oidc_scopes: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Paginated Response
# ---------------------------------------------------------------------------


class PaginatedResponse(CamelBase):
    data: list
    total: int
    page: int
    page_size: int
