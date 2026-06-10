/**
 * Tailwind CSS — dark/light mode support via CSS custom properties.
 */

import { ThemeMode } from "./app";

export function getThemeCSS(mode: ThemeMode): string {
  const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return `
    :root {
      --bg-default: ${isDark ? "#121212" : "#f5f7fa"};
      --bg-paper: ${isDark ? "#1e1e1e" : "#ffffff"};
      --text-primary: ${isDark ? "#e0e0e0" : "#212121"};
      --text-secondary: ${isDark ? "#b0b0b0" : "#616161"};
      --border-color: ${isDark ? "#333333" : "#e0e0e0"};
    }
    html { color-scheme: ${isDark ? "dark" : "light"}; }
  `;
}

export type { ThemeMode };
