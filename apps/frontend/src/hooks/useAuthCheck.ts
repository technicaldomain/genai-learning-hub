/**
 * Auth check hook — verifies if user is authenticated before rendering content.
 * Returns { isLoading, isAuthenticated }.
 */

import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useAuthCheck() {
  const [status, setStatus] = React.useState<{
    isLoading: boolean;
    isAuthenticated: boolean;
  }>({ isLoading: true, isAuthenticated: false });
  const navigate = useNavigate();
  const location = useLocation();
  const checkedAt = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Re-check on every route change (handles redirect from /auth/callback back to /)
    const key = location.pathname + location.search;

    if (checkedAt.current === key) return;
    checkedAt.current = key;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
        if (!cancelled) {
          if (!res.ok) {
            // Not authenticated — redirect to login unless already on login page
            const isLogin = location.pathname === "/login";
            setStatus({ isLoading: false, isAuthenticated: false });
            if (!isLogin) {
              navigate("/login", { replace: true, state: { from: location } });
            }
          } else {
            setStatus({ isLoading: false, isAuthenticated: true });
          }
        }
      } catch {
        if (!cancelled) {
          const isLogin = location.pathname === "/login";
          setStatus({ isLoading: false, isAuthenticated: false });
          if (!isLogin) {
            navigate("/login", { replace: true, state: { from: location } });
          }
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [navigate, location]);

  return status;
}
