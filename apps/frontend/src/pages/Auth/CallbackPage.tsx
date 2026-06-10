/**
 * Callback page — handles OIDC provider redirect after login.
 * The backend sets the session cookie on /auth/callback, so we just
 * need to poll /me to confirm authentication, then redirect home.
 */

import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../api/client";

export default function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        // Poll /me until we get a valid response (session cookie is set)
        // Give it a few seconds for the backend to finish the OIDC flow
        for (let i = 0; i < 30; i++) {
          if (cancelled) return;

          try {
            await api.get<{ sub: string }>("/me");
            // Success — session is established
            if (!cancelled) {
              // Redirect to the page the user was on before login, or home
              const from = (location.state as { from?: { pathname: string } } | undefined)?.from?.pathname;
              navigate(from || "/", { replace: true });
            }
            return;
          } catch (err: unknown) {
            const errorObj = err as { status?: number; message?: string };
            if (errorObj.status === 401 || errorObj.message?.includes("401")) {
              // Not authenticated yet — wait and retry
              await new Promise((resolve) => setTimeout(resolve, 500));
              continue;
            }
            // Other error
            throw err;
          }
        }

        // Timed out
        if (!cancelled) {
          setError("Login timed out. Please try again.");
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(`Authentication failed: ${message}`);
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, location]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center">
        {error ? (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Authentication failed
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {error}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-primary-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Completing sign in...
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Please wait while we verify your identity.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
