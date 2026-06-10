// =============================================================================
// API Contracts - Request/Response schemas for all GenAI Learning Hub endpoints
// =============================================================================

import type {
  User,
  Skill,
  Resource,
  Prompt,
  NewsItem,
  LearningPath,
  CommunityContribution,
  PaginatedResponse,
} from "@genai-learning-hub/shared-types";

// =============================================================================
// Health
// =============================================================================

export namespace HealthApi {
  export type Request = {};
  export type Response = { status: string };
}

// =============================================================================
// Me (Authentication)
// =============================================================================

export namespace MeApi {
  export type Request = {};
  export type Response = User;
}

// =============================================================================
// Skills
// =============================================================================

export namespace SkillsApi {
  export type Request = {
    category?: string;
    level?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  };

  export type Response = PaginatedResponse<Skill>;
}

// =============================================================================
// Resources
// =============================================================================

export namespace ResourcesApi {
  export type Request = {
    category?: string;
    type?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    pageSize?: number;
  };

  export type Response = PaginatedResponse<Resource>;
}

// =============================================================================
// Prompts
// =============================================================================

export namespace PromptsApi {
  export type Request = {
    category?: string;
    search?: string;
    sortBy?: "rating" | "usageCount" | "createdAt";
    page?: number;
    pageSize?: number;
  };

  export type Response = PaginatedResponse<Prompt>;
}

// =============================================================================
// News
// =============================================================================

export namespace NewsApi {
  export type Request = {
    tag?: string;
    featured?: boolean;
    page?: number;
    pageSize?: number;
  };

  export type Response = PaginatedResponse<NewsItem>;
}

// =============================================================================
// Learning Paths
// =============================================================================

export namespace LearningPathsApi {
  export type Request = {
    level?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  };

  export type Response = PaginatedResponse<LearningPath>;
}

// =============================================================================
// Community Contributions
// =============================================================================

export namespace CommunityApi {
  export type Request = {
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  };

  export type Response = PaginatedResponse<CommunityContribution>;
}
