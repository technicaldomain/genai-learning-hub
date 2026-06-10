---
name: tailwindcss-v4-vite
description: Set up Tailwind CSS v4 with Vite plugin, @theme tokens, dark mode, and replace MUI with utility-first CSS
source: auto-skill
extracted_at: '2026-06-10T02:41:58.765Z'
---

## Purpose

Set up Tailwind CSS v4 with the Vite plugin for a React SPA, replacing a MUI-based design system with utility-first CSS. Supports dark/light/system mode toggling with localStorage persistence.

## Project Context

This project uses:
- Vite 8.x as the bundler
- React 19 with TypeScript
- Previously used `@mui/material` — fully removed
- Now uses `tailwindcss@4`, `@tailwindcss/vite`, and `lucide-react` for icons

## Installation

```bash
pnpm add -D tailwindcss @tailwindcss/vite
pnpm add lucide-react
```

## Configuration

### 1. Vite config — add the plugin

```ts
// apps/frontend/vite.config.mts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  plugins: [tailwindcss(), react(), /* other plugins */],
}));
```

### 2. styles.css — import Tailwind + define tokens

```css
@import "tailwindcss";

@theme {
  --color-primary-50: #e3f2fd;
  --color-primary-100: #bbdefb;
  --color-primary-400: #42a5f5;
  --color-primary-500: #0d47a1;
  --color-primary-600: #0a3675;

  --color-secondary-400: #4dd0c0;
  --color-secondary-500: #00bfa5;
  --color-secondary-600: #009688;

  --font-family-sans: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif;
}

@layer base {
  body {
    @apply bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100;
    font-family: var(--font-family-sans);
  }
}
```

**Critical: Do NOT add `* { margin: 0; padding: 0; }`** — it conflicts with Tailwind's built-in reset and strips all spacing.

## Dark/Light/System Mode

### 1. Theme context (single source of truth)

```tsx
// src/providers/ThemeContext.tsx
import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  mode: "system",
  toggleTheme: () => {},
});

export function useThemeMode() {
  return React.useContext(ThemeContext);
}
```

### 2. Apply theme in App

```tsx
// src/app/app.tsx
const THEME_KEY = "genai-hub-theme-mode";
const DEFAULT_MODE: ThemeMode = "system";

function getInitialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {}
  return DEFAULT_MODE;
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.remove("dark");
  if (isDark) document.documentElement.classList.add("dark");
}

export default function App() {
  const [mode, setMode] = React.useState(getInitialMode);

  React.useEffect(() => { applyTheme(mode); }, [mode]);

  const toggleTheme = () => {
    const next: ThemeMode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  };

  const ctx = React.useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={ctx}>
        <RouterProvider router={router} />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
```

### 3. Theme toggle button in layout

```tsx
// src/layout/MainLayout.tsx
export default function MainLayout() {
  const { mode, toggleTheme } = useThemeMode();

  const resolvedMode: "light" | "dark" =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : mode;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        {/* ... */}
        <button onClick={toggleTheme} aria-label="Toggle theme">
          {resolvedMode === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>
    </div>
  );
}
```

**Critical: Never read `document.documentElement.classList.contains("dark")` inside a component's JSX for icon logic** — the DOM update happens in `useEffect` (after paint), so the icon is always one step behind. Always derive from the context state.

## Common Patterns

### Card with hover

```tsx
<div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
  <div className="p-5">...</div>
</div>
```

### Filter bar with search input

```tsx
<div className="relative flex-1 min-w-[220px]">
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" ...>
  <input className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm" />
</div>
```

### Responsive grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Chip / tag

```tsx
<span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{tag}</span>
```

### Section wrapper

```tsx
<div className="flex flex-col gap-8">
```

## Verification

1. `npx nx build frontend` — builds with no errors
2. Toggle theme button — icon changes, dark/light classes apply correctly
3. Refresh — theme persists via localStorage
4. OS dark mode — "system" respects `prefers-color-scheme`
