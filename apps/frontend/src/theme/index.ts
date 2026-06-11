/**
 * Tailwind CSS — dark/light mode support via CSS custom properties.
 */

import { ThemeMode } from "./app";

export function getThemeCSS(mode: ThemeMode): string {
  const prefersDark = typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);

  return `
    :root {
      --bg-default: ${isDark ? "#020617" : "#f8fafc"};
      --bg-paper: ${isDark ? "#0f172a" : "#ffffff"};
      --text-primary: ${isDark ? "#f8fafc" : "#0f172a"};
      --text-secondary: ${isDark ? "#cbd5e1" : "#475569"};
      --border-color: ${isDark ? "#1e293b" : "#e2e8f0"};
    }
    html { color-scheme: ${isDark ? "dark" : "light"}; }
  `;
}

export type { ThemeMode };
