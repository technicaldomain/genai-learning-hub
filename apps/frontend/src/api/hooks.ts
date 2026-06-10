/**
 * API hooks — TanStack Query hooks for all GenAI Learning Hub endpoints.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  Skill,
  Resource,
  Prompt,
  NewsItem,
  LearningPath,
  CommunityContribution,
  User,
  PaginatedResponse,
} from "@genai-learning-hub/shared-types";
import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Logout hook
// ---------------------------------------------------------------------------

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async function logout() {
    try {
      await fetch("/auth/logout", { credentials: "include", method: "GET" });
    } catch {
      // Ignore logout errors — always redirect
    }
    // Clear all queries
    queryClient.clear();
    // Redirect to login
    navigate("/login", { replace: true });
  };
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ["user", "me"],
    queryFn: () => api.get<User>("/me"),
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

interface SkillsParams {
  category?: string;
  level?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useSkills(params: SkillsParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 10),
    ...(params.category && { category: params.category }),
    ...(params.level && { level: params.level }),
    ...(params.search && { search: params.search }),
  }).toString();

  return useQuery<PaginatedResponse<Skill>>({
    queryKey: ["skills", query],
    queryFn: () => api.get<PaginatedResponse<Skill>>(`/skills?${query}`),
  });
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

interface ResourcesParams {
  category?: string;
  type?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export function useResources(params: ResourcesParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 10),
    ...(params.category && { category: params.category }),
    ...(params.type && { type: params.type }),
    ...(params.search && { search: params.search }),
    ...(params.featured !== undefined && { featured: String(params.featured) }),
  }).toString();

  return useQuery<PaginatedResponse<Resource>>({
    queryKey: ["resources", query],
    queryFn: () => api.get<PaginatedResponse<Resource>>(`/resources?${query}`),
  });
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

interface PromptsParams {
  category?: string;
  search?: string;
  sortBy?: "rating" | "usageCount" | "createdAt";
  page?: number;
  pageSize?: number;
}

export function usePrompts(params: PromptsParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 10),
    ...(params.category && { category: params.category }),
    ...(params.search && { search: params.search }),
    ...(params.sortBy && { sort_by: params.sortBy }),
  }).toString();

  return useQuery<PaginatedResponse<Prompt>>({
    queryKey: ["prompts", query],
    queryFn: () => api.get<PaginatedResponse<Prompt>>(`/prompts?${query}`),
  });
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

interface NewsParams {
  tag?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export function useNews(params: NewsParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 10),
    ...(params.tag && { tag: params.tag }),
    ...(params.featured !== undefined && { featured: String(params.featured) }),
  }).toString();

  return useQuery<PaginatedResponse<NewsItem>>({
    queryKey: ["news", query],
    queryFn: () => api.get<PaginatedResponse<NewsItem>>(`/news?${query}`),
  });
}
