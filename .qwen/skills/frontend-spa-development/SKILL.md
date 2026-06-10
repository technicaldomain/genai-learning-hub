---
name: frontend-spa-development
description: Build React SPA with TypeScript, Vite, Material UI, and TanStack Query for enterprise content platforms
source: auto-skill
extracted_at: '2026-06-09T23:45:41.629Z'
---

## Purpose

Build React-based single-page applications with TypeScript, Vite, Material UI components, and TanStack Query for data fetching in enterprise content platforms.

## Project Context

This project is an Nx monorepo with:
- Frontend at `apps/frontend/`
- React 19 with TypeScript, Vite bundler
- Material UI for UI components
- TanStack Query for server state management
- react-router-dom v6 for routing
- Shared component library at `libs/ui-components/`
- CSS modules for styling

## Directory Structure

```
apps/frontend/
  public/               # Static assets
  src/
    app/
      app.tsx           # Root component with Router + Routes
      app.module.css    # Root styles
    main.tsx            # Entry point (ReactDOM.createRoot)
    styles.css          # Global styles
  vite.config.mts       # Vite configuration
  tsconfig.app.json     # App TypeScript config
  index.html            # HTML entry
libs/ui-components/
  src/
    index.ts            # Barrel export
    lib/
      ui-components.tsx # Component implementation
```

## Implementation Approach

### 1. Application Shell — Data Router Pattern (NOT BrowserRouter)

**Critical: Never use `<BrowserRouter>` in both `main.tsx` AND `app.tsx`.** You must pick one pattern:

**Preferred: `createBrowserRouter` + `RouterProvider`** (data router pattern)

```tsx
// apps/frontend/src/app/app.tsx — app.tsx handles all routing
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "../pages/Home";
import SkillsPage from "../pages/Skills";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  },
});

const router = createBrowserRouter([
  { element: <MainLayout />, children: [
    { index: true, element: <HomePage /> },
    { path: "skills", element: <SkillsPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ]},
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

**Entry point must NOT wrap `<BrowserRouter>`** — `createBrowserRouter`/`RouterProvider` provides its own router context:

```tsx
// apps/frontend/src/main.tsx — entry point, NO BrowserRouter
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<StrictMode><App /></StrictMode>);
```

**DO NOT do this** — it causes `Uncaught Error: You cannot render a <Router> inside another <Router>`:
```tsx
// WRONG: main.tsx wraps App in BrowserRouter
<BrowserRouter><App /></BrowserRouter>  // App already has RouterProvider!
```

### 2. Page Components

Each page follows a consistent pattern:

```tsx
// apps/frontend/src/pages/SkillsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { Grid, Paper, Typography } from '@mui/material';
import { SkillCard } from '@genai-learning-hub/ui-components';

async function fetchSkills() {
  const res = await fetch('/api/skills');
  if (!res.ok) throw new Error('Failed to fetch skills');
  return res.json();
}

export default function SkillsPage() {
  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills,
  });

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={3}>
      {skills?.map((skill) => (
        <Grid item xs={12} md={6} lg={4} key={skill.id}>
          <SkillCard skill={skill} />
        </Grid>
      ))}
    </Grid>
  );
}
```

### 3. Shared UI Components

Build reusable components in `libs/ui-components/`:

```tsx
// libs/ui-components/src/lib/SkillCard.tsx
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{skill.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {skill.description}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Chip label={skill.category} size="small" />
          <Chip label={skill.difficulty} size="small" sx={{ ml: 1 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
```

Export from barrel: `libs/ui-components/src/index.ts`:
```ts
export * from './lib/SkillCard';
export * from './lib/Navbar';
// ... other components
```

### 4. API Service Layer

Centralize API calls:

```ts
// libs/ui-components/src/lib/api.ts (or a dedicated libs/api layer)
const API_BASE = '/api';

export async function getSkills() {
  const res = await fetch(`${API_BASE}/skills`);
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/me`);
  if (!res.ok) return null;
  return res.json();
}
```

## Pages Required (per content strategy)

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Hero, featured skills, news |
| `/skills` | SkillsPage | AI Skills Marketplace grid/list |
| `/prompts` | PromptsPage | Prompt Library |
| `/resources` | ResourcesPage | Tools & APIs directory |
| `/news` | NewsPage | News & Updates feed |
| `/getting-started` | GettingStartedPage | Onboarding and basics |
| `/learning-paths` | LearningPathsPage | Curated learning journeys |
| `/community` | CommunityPage | Crowdsourced content |

## Verification

1. `nx dev frontend` — check all pages load
2. Verify API integration works with backend running
3. Test responsive layouts on different screen sizes
4. Check Material UI theme consistency across pages
