// =============================================================================
// Domain Types - Core entities for the GenAI Learning Hub
// =============================================================================

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  sub: string;
  name: string;
  email: string;
  roles: UserRole[];
  avatarUrl?: string;
  department?: string;
}

export type UserRole = "admin" | "editor" | "contributor" | "viewer";

// ---------------------------------------------------------------------------
// Skill (AI Skills Marketplace)
// ---------------------------------------------------------------------------

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  level: SkillLevel;
  author: string;
  tags: string[];
  assets: SkillAsset[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  popularity?: number;
}

export type SkillCategory =
  | "data-processing"
  | "content-generation"
  | "code-assistance"
  | "analysis"
  | "automation"
  | "design"
  | "other";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface SkillAsset {
  type: "code" | "notebook" | "script" | "template";
  name: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Resource (Tools & APIs)
// ---------------------------------------------------------------------------

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  url: string;
  type: ResourceType;
  tags: string[];
  featured?: boolean;
  createdAt: string; // ISO date string
}

export type ResourceCategory =
  | "model"
  | "platform"
  | "tool"
  | "api"
  | "framework"
  | "documentation"
  | "other";

export type ResourceType =
  | "web-app"
  | "sdk"
  | "api"
  | "cli-tool"
  | "library"
  | "documentation";

// ---------------------------------------------------------------------------
// Prompt (Prompt Library)
// ---------------------------------------------------------------------------

export interface Prompt {
  id: string;
  title: string;
  description: string;
  template: string;
  category: PromptCategory;
  tags: string[];
  author: string;
  usageCount?: number;
  rating?: number;
  createdAt: string; // ISO date string
}

export type PromptCategory =
  | "writing"
  | "coding"
  | "analysis"
  | "creative"
  | "summarization"
  | "translation"
  | "other";

// ---------------------------------------------------------------------------
// News (News & Updates)
// ---------------------------------------------------------------------------

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  publishedAt: string; // ISO date string
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Home Content
// ---------------------------------------------------------------------------

export interface HomeContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    freshness: string;
    primaryAction: { label: string; path: string };
    secondaryAction: { label: string; path: string };
  };
  startHere: {
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
      path: string;
      effort: string;
    }>;
  };
  promptLibrary: {
    title: string;
    description: string;
    featured: Array<{
      id: string;
      title: string;
      description: string;
      category: PromptCategory;
      rating?: number;
      usageCount?: number;
      tags: string[];
      path: string;
    }>;
  };
  learningPaths: {
    title: string;
    description: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      level: SkillLevel;
      estimatedHours: number;
      moduleCount: number;
      path: string;
      tags: string[];
    }>;
  };
  showcase: {
    title: string;
    description: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      author: string;
      authorDepartment?: string;
      tags: string[];
      status: string;
      path: string;
    }>;
  };
  whatsNew: {
    title: string;
    description: string;
    items: Array<{
      id: string;
      title: string;
      summary: string;
      source: string;
      publishedAt: string;
      freshnessLabel: string;
      featured?: boolean;
      tags: string[];
      path?: string;
    }>;
  };
  stats: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
}

// ---------------------------------------------------------------------------
// Learning Path
// ---------------------------------------------------------------------------

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: SkillLevel;
  modules: LearningModule[];
  estimatedHours: number;
  tags: string[];
  createdAt: string; // ISO date string
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  resources: string[]; // resource IDs
  durationMinutes: number;
}

// ---------------------------------------------------------------------------
// Community Contribution
// ---------------------------------------------------------------------------

export interface CommunityContribution {
  id: string;
  title: string;
  description: string;
  author: string;
  authorDepartment?: string;
  type: ContributionType;
  tags: string[];
  resources?: string[]; // resource/skill IDs referenced
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  likes?: number;
}

export type ContributionType = "use-case" | "prompt" | "lesson-learned" | "tip";

// ---------------------------------------------------------------------------
// Showcase (Use Case Showcase)
// ---------------------------------------------------------------------------

export interface ShowcaseResource {
  name: string;
  url?: string;
  type?: string;
}

export type ShowcaseCategory =
  | "industry-solution"
  | "internal-tool"
  | "proof-of-concept"
  | "experiment"
  | "other";

export interface Showcase {
  id: string;
  title: string;
  description: string;
  category?: ShowcaseCategory;
  author: string;
  authorDepartment?: string;
  tags: string[];
  resources: ShowcaseResource[];
  status?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

export type McpTransport = "sse" | "stdio";

export interface McpServerConfig {
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
}

export interface McpServer {
  id: string;
  name: string;
  description: string;
  transport: McpTransport;
  config: McpServerConfig;
  authRequired: boolean;
  oidcScopes?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ---------------------------------------------------------------------------
// API Response Wrappers
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ---------------------------------------------------------------------------
// Navigation / Routing
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string;
  path: string;
  icon?: string; // Material UI icon name
}
