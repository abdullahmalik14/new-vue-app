import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadRouteConfig() {
  const configPath = join(process.cwd(), 'src/router/routeConfig.json');
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

describe('dashboard app page route sections', () => {
  it('assigns dashboard-global to /dashboard/analytics and /payout', () => {
    const routes = loadRouteConfig();

    for (const slug of ['/dashboard/analytics', '/payout']) {
      const route = routes.find((entry) => entry.slug === slug);
      expect(route, `missing route ${slug}`).toBeDefined();
      expect(route.section).toBe('dashboard-global');
      expect(route.requiresAuth).toBe(true);
      expect(route.redirectIfNotAuth).toBe('/log-in');
    }
  });

  it('redirects legacy /analytics to /dashboard/analytics', () => {
    const routes = loadRouteConfig();
    const legacy = routes.find((entry) => entry.slug === '/analytics');
    expect(legacy?.redirect).toBe('/dashboard/analytics');
  });
});
