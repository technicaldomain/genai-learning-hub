---
name: ui-component-library
description: Build Material UI component libraries in an Nx monorepo for shared frontend design systems
source: auto-skill
extracted_at: '2026-06-09T23:45:41.629Z'
---

## Purpose

Create a shared Material UI component library in an Nx monorepo that provides reusable, themed, and tested UI components consumed by application packages.

## Project Context

This project uses:
- `libs/ui-components/` for shared components
- Nx with `@nx/react` generator using Vite bundler
- Material UI v5+ for UI primitives
- Vitest for unit tests
- CSS modules for component-specific styling
- tsconfig.lib.json for library TypeScript config
- Vite with `vite-plugin-dts` for TypeScript declaration output

## Directory Structure

```
libs/ui-components/
  package.json            # Library package (exports for apps)
  project.json            # Nx targets: build, test, lint
  vite.config.mts         # Library build config (dts plugin)
  tsconfig.lib.json       # Library TS config
  tsconfig.spec.json      # Test TS config
  src/
    index.ts              # Barrel exports
    lib/
      ui-components.tsx   # Existing component (template)
      ui-components.module.css
      ui-components.spec.tsx
```

## Implementation Approach

### 1. Configure Library Build

Ensure `vite.config.mts` includes the dts plugin:

```ts
// libs/ui-components/vite.config.mts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      tsconfigPath: 'tsconfig.lib.json',
    }),
  ],
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
    },
  },
});
```

### 2. Create Components

Each component gets its own file in `src/lib/`:

```tsx
// libs/ui-components/src/lib/Navbar.tsx
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box,
} from '@mui/material';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Skills', path: '/skills' },
  { label: 'Prompts', path: '/prompts' },
  { label: 'Resources', path: '/resources' },
  { label: 'News', path: '/news' },
];

export function Navbar() {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          GenAI Learning Hub
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <Button key={item.path} component={Link} to={item.path}>
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
```

### 3. Barrel Exports

```ts
// libs/ui-components/src/index.ts
export { Navbar } from './lib/Navbar';
export { SkillCard } from './lib/SkillCard';
export { ResourceCard } from './lib/ResourceCard';
export { PromptCard } from './lib/PromptCard';
export { NewsCard } from './lib/NewsCard';
```

### 4. Writing Tests

```tsx
// libs/ui-components/src/lib/Navbar.spec.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders all navigation items', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });
});
```

### 5. Publishing / Consumption

The library exports ES modules. Apps consume via the Nx workspace alias (e.g., `@genai-learning-hub/ui-components`). No separate publishing needed during development — Nx handles workspace linking.

## Verification

1. `nx test ui-components` — all component tests pass
2. `nx build ui-components` — builds successfully with `.d.ts` files
3. Import components in `apps/frontend` and verify no TS errors
4. Visual inspection in dev server for rendering correctness
