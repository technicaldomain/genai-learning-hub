/**
 * API hooks — TanStack Query hooks for all GenAI Learning Hub endpoints.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  Skill,
  Resource,
  Prompt,
  NewsItem,
  LearningPath,
  CommunityContribution,
  Showcase,
  McpServer,
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
// Skills (Marketplace)
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
    queryFn: () => api.get<PaginatedResponse<Skill>>(`/marketplace/skills?${query}`),
  });
}

// ---------------------------------------------------------------------------
// Tools / Resources (Marketplace)
// ---------------------------------------------------------------------------

interface ToolsParams {
  category?: string;
  type?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export function useTools(params: ToolsParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 10),
    ...(params.category && { category: params.category }),
    ...(params.type && { type: params.type }),
    ...(params.search && { search: params.search }),
    ...(params.featured !== undefined && { featured: String(params.featured) }),
  }).toString();

  return useQuery<PaginatedResponse<Resource>>({
    queryKey: ["tools", query],
    queryFn: () => api.get<PaginatedResponse<Resource>>(`/marketplace/tools?${query}`),
  });
}

// ---------------------------------------------------------------------------
// Prompts (Marketplace)
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
    queryFn: () => api.get<PaginatedResponse<Prompt>>(`/marketplace/prompts?${query}`),
  });
}

// ---------------------------------------------------------------------------
// News (Learn)
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

// ---------------------------------------------------------------------------
// Learning Paths (Learn)
// ---------------------------------------------------------------------------

export function useLearningPaths() {
  return useQuery<PaginatedResponse<LearningPath>>({
    queryKey: ["learning-paths"],
    queryFn: () => api.get<PaginatedResponse<LearningPath>>("/learning-paths"),
  });
}

// ---------------------------------------------------------------------------
// Community Contributions
// ---------------------------------------------------------------------------

interface ContributionsParams {
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useContributions(params: ContributionsParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 10),
    ...(params.type && { type: params.type }),
    ...(params.search && { search: params.search }),
  }).toString();

  return useQuery<PaginatedResponse<CommunityContribution>>({
    queryKey: ["contributions", query],
    queryFn: () => api.get<PaginatedResponse<CommunityContribution>>(`/contributions?${query}`),
  });
}

// ---------------------------------------------------------------------------
// Showcases (Community)
// ---------------------------------------------------------------------------

interface ShowcasesParams {
  category?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function useShowcases(params: ShowcasesParams = {}) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 10),
    ...(params.category && { category: params.category }),
    ...(params.search && { search: params.search }),
    ...(params.status && { status: params.status }),
  }).toString();

  return useQuery<PaginatedResponse<Showcase>>({
    queryKey: ["showcases", query],
    queryFn: () => api.get<PaginatedResponse<Showcase>>(`/showcases?${query}`),
  });
}

// ---------------------------------------------------------------------------
// MCP Servers
// ---------------------------------------------------------------------------

export function useMcpServers() {
  return useQuery<PaginatedResponse<McpServer>>({
    queryKey: ["mcp-servers"],
    queryFn: () => api.get<PaginatedResponse<McpServer>>("/mcp/servers"),
  });
}

// ---------------------------------------------------------------------------
// MCP Actions (mutations)
// ---------------------------------------------------------------------------

interface PostUsecasePayload {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

export function usePostUsecase(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PostUsecasePayload) => api.post<{ ok: boolean; message: string; usecase: any }>("/mcp/actions/post-usecase", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcases"] });
      onSuccess?.();
    },
  });
}

interface PostSkillPayload {
  title: string;
  description: string;
  category?: string;
  level?: string;
  tags?: string[];
}

export function usePostSkill(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PostSkillPayload) => api.post<{ ok: boolean; message: string; skill: any }>("/mcp/actions/post-skill", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      onSuccess?.();
    },
  });
}

interface VotePayload {
  target_id: string;
  target_type: "skill" | "usecase";
  current_votes: number;
}

export function useVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VotePayload) => api.post<{ ok: boolean; message: string; target_id: string; target_type: string; new_vote_count: number }>("/mcp/actions/vote", payload),
    onSuccess: (data, variables) => {
      // Optimistic: update the cached count
      if (variables.target_type === "skill") {
        queryClient.setQueryData<any[]>(["skills"], (old: any[] = []) =>
          old.map((s: any) => s.id === variables.target_id ? { ...s, votes: data.new_vote_count } : s)
        );
      } else if (variables.target_type === "usecase") {
        queryClient.setQueryData<any[]>(["showcases"], (old: any[] = []) =>
          old.map((s: any) => s.id === variables.target_id ? { ...s, votes: data.new_vote_count } : s)
        );
      }
    },
  });
}

export function useStartLearning() {
  return useMutation({
    mutationFn: (payload: { path_id: string; path_title: string }) =>
      api.post<{ ok: boolean; message: string; enrollment: any }>("/mcp/actions/start-learning", payload),
  });
}

interface GrabPayload {
  item_id: string;
  item_type: "skill" | "prompt";
  item_title: string;
}

export function useGrab() {
  return useMutation({
    mutationFn: (payload: GrabPayload) =>
      api.post<{ ok: boolean; message: string; grab: any }>("/mcp/actions/grab", payload),
  });
}
