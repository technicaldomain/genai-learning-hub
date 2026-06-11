/**
 * Root application — routes + theme context. Pure Tailwind, zero MUI.
 */

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeContext, ThemeContextValue } from "../providers/ThemeContext";
import MainLayout from "../layout/MainLayout";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import SkillsPage from "../pages/Skills/SkillsPage";
import PromptsPage from "../pages/Prompts/PromptsPage";
import ToolsPage from "../pages/Resources/ToolsPage";
import LearningPathsPage from "../pages/LearningPaths/LearningPathsPage";
import NewsPage from "../pages/News/NewsPage";
import ContributionsPage from "../pages/Community/ContributionsPage";
import ShowcasePage from "../pages/Community/ShowcasePage";
import McpConnectPage from "../pages/Community/McpConnectPage";
import LoginPage from "../pages/Auth/LoginPage";
import CallbackPage from "../pages/Auth/CallbackPage";
import { getApiBaseUrl } from "../runtime-config";

const THEME_KEY = "genai-hub-theme-mode";
export type ThemeMode = "light" | "dark" | "system";
const DEFAULT_MODE: ThemeMode = "system";

function getInitialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {}
  return DEFAULT_MODE;
}

function applyTheme(mode: ThemeMode) {
  const prefersDark = typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  document.documentElement.classList.remove("dark");
  if (isDark) {
    document.documentElement.classList.add("dark");
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  },
});

// ---------------------------------------------------------------------------
// Auth guard — shows loader while checking, blocks render if not authenticated
// ---------------------------------------------------------------------------

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = React.useState<{
    isLoading: boolean;
    isAuthenticated: boolean;
  }>({ isLoading: true, isAuthenticated: false });
  const navigate = useNavigate();
  const location = useLocation();
  const checkVersion = React.useRef(0);

  React.useEffect(() => {
    // Increment version on every route/dependency change to force re-check
    checkVersion.current += 1;
    const version = checkVersion.current;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/me`, { credentials: "include" });
        if (!cancelled && version === checkVersion.current) {
          if (!res.ok) {
            const isLogin = location.pathname === "/login";
            setAuthState({ isLoading: false, isAuthenticated: false });
            if (!isLogin) {
              navigate("/login", { replace: true, state: { from: location } });
            }
          } else {
            setAuthState({ isLoading: false, isAuthenticated: true });
          }
        }
      } catch {
        if (!cancelled && version === checkVersion.current) {
          const isLogin = location.pathname === "/login";
          setAuthState({ isLoading: false, isAuthenticated: false });
          if (!isLogin) {
            navigate("/login", { replace: true, state: { from: location } });
          }
        }
      }
    }

    check();

    return () => { cancelled = true; };
  }, [navigate, location]);

  const { isAuthenticated, isLoading } = authState;

  // Still loading — show loader (blocks render)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <svg
          className="h-10 w-10 animate-spin text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Not authenticated — block render, redirect will happen
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    element: <AuthGuard><MainLayout /></AuthGuard>,
    children: [
      { index: true, element: <HomePage /> },
      // Marketplace
      { path: "marketplace/skills", element: <SkillsPage /> },
      { path: "marketplace/prompts", element: <PromptsPage /> },
      { path: "marketplace/tools", element: <ToolsPage /> },
      // Learn
      { path: "learn/paths", element: <LearningPathsPage /> },
      { path: "learn/news", element: <NewsPage /> },
      // Community
      { path: "community/contributions", element: <ContributionsPage /> },
      { path: "community/showcases", element: <ShowcasePage /> },
      { path: "community/mcp-connect", element: <McpConnectPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/callback",
    element: <CallbackPage />,
  },
], {
  future: {
    v7_startTransition: true,
  },
});

export default function App() {
  const [mode, setMode] = React.useState<ThemeMode>(getInitialMode);

  React.useEffect(() => {
    applyTheme(mode);
    const handler = () => setMode(getInitialMode);
    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, [mode]);

  React.useEffect(() => { applyTheme(mode); }, [mode]);

  const toggleTheme = () => {
    const next: ThemeMode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  };

  const ctx: ThemeContextValue = React.useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={ctx}>
        <RouterProvider router={router} />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
