import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import App from './app';

vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input);

  if (url.includes('/api/me')) {
    return new Response(JSON.stringify({
      sub: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['viewer'],
      department: 'Enablement',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.includes('/api/home')) {
    return new Response(JSON.stringify({
      hero: {
        eyebrow: 'Trailhead / pathways',
        title: 'One hub, layered depth.',
        subtitle: 'A curated starting point for every employee.',
        freshness: 'Updated weekly with a visible freshness signal.',
        primaryAction: { label: 'Start here', path: '/learn/paths' },
        secondaryAction: { label: 'Browse prompts', path: '/marketplace/prompts' },
      },
      startHere: {
        title: '10-minute trailhead',
        description: 'Choose your pace without having to label yourself.',
        steps: [
          { title: 'Never used AI', description: 'Start here.', path: '/learn/paths', effort: '5 min' },
          { title: 'Use it weekly', description: 'Try prompts.', path: '/marketplace/prompts', effort: '30 min' },
          { title: 'Build with it', description: 'Explore tools.', path: '/marketplace/tools', effort: 'Deep dive' },
        ],
      },
      promptLibrary: { title: 'Prompt library', description: 'Searchable prompts.', featured: [] },
      learningPaths: { title: 'Learning paths', description: 'Structured paths.', items: [] },
      showcase: { title: 'Use case showcase', description: 'Real team stories.', items: [] },
      whatsNew: { title: "What's new", description: 'Freshness feed.', items: [] },
      stats: [],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch);

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the trailhead hero', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('One hub, layered depth.')).toBeTruthy();
    });
  });
});
