/**
 * API client — centralized fetch with base URL and cookie-based auth.
 * Automatically sends credentials (cookies) for all requests.
 * On 401, redirects to /auth/login (frontend login page).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

async function fetchApi<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = false, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...rest.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    // Redirect to frontend login page
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string, options?: FetchOptions) => fetchApi<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
};
