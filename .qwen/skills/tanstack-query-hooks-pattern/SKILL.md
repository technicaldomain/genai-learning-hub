---
name: tanstack-query-hooks-pattern
description: Create API client and TanStack Query hooks for all endpoints in a React SPA consuming a REST API
source: auto-skill
extracted_at: '2026-06-10T12:00:00.000Z'
---

## Purpose

Create a centralized API client and TanStack Query hooks for all backend endpoints in a React SPA, following a consistent pattern for data fetching with pagination, filtering, and sorting.

## Project Context

This project uses:
- React 19 with TypeScript
- TanStack Query v5 for server state management
- A FastAPI backend with REST endpoints
- Shared TypeScript types in `libs/shared-types`

## Directory Structure

```
apps/frontend/
  src/
    api/
      client.ts           # Centralized fetch wrapper
      hooks.ts            # TanStack Query hooks for all endpoints
```

## Implementation Approach

### 1. Centralized API Client

Create a thin fetch wrapper in `src/api/client.ts`:

```ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = false, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...rest.headers,
  };

  if (auth) {
    const token = localStorage.getItem("auth_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...rest, headers });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  get: <T>(path: string, options?: FetchOptions) =>
    fetchApi<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
};
```

### 2. TanStack Query Hooks Pattern

Create hooks in `src/api/hooks.ts` that follow a consistent pattern:

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { Skill, PaginatedResponse } from "@genai-learning-hub/shared-types";

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
```

**Key patterns:**
- All hooks accept params as a single object with optional fields
- Query params are built with `URLSearchParams` for proper encoding
- `queryKey` includes the full query string so different filters produce different cache entries
- Return the raw `useQuery` result so the page controls loading/error states
- Set `staleTime` at the QueryClient level (5 minutes) to avoid refetching on every focus

### 3. App Shell with QueryClient

```tsx
// src/app/app.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Wrap app in <QueryClientProvider client={queryClient}>
```

### 4. Page Component Usage

```tsx
// src/pages/Skills/SkillsPage.tsx
export default function SkillsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSkills({
    search: search || undefined,
    category: category || undefined,
    page,
  });

  if (isLoading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      {data?.data.map((skill) => (
        <Grid item key={skill.id}>
          <SkillCard skill={skill} />
        </Grid>
      ))}
    </Grid>
  );
}
```

## Verification

1. All hooks should return `PaginatedResponse<T>` with `data`, `total`, `page`, `pageSize`
2. Query keys should include all filter params to prevent cache collisions
3. Frontend types from `shared-types` should match the actual API response shape
4. Check that Pydantic camelCase aliases produce field names that match the TS interfaces
