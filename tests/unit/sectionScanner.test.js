import { describe, it, expect } from 'vitest';
import { join } from 'path';
import {
  generateContentPathsForSection,
  scanRouteConfigForSections,
} from '../../build/tailwind/sectionScanner.js';

const ROUTE_CONFIG_PATH = join(process.cwd(), 'src/router/routeConfig.json');

const SHARED_DASHBOARD_CHROME_MARKERS = [
  'templates/dashboard/shared/',
];

describe('sectionScanner shared dashboard chrome', () => {
  it('includes dashboard shell components in every section content paths', () => {
    const sections = scanRouteConfigForSections(ROUTE_CONFIG_PATH);

    for (const [sectionName, metadata] of sections.entries()) {
      const paths = generateContentPathsForSection(sectionName, metadata);
      const normalized = paths.map((p) => p.replace(/\\/g, '/'));

      for (const marker of SHARED_DASHBOARD_CHROME_MARKERS) {
        expect(normalized.some((p) => p.includes(marker)), `${sectionName} missing ${marker}`).toBe(
          true,
        );
      }
    }
  });

  it('includes dashboard shell in misc even though misc routes live outside templates/dashboard', () => {
    const sections = scanRouteConfigForSections(ROUTE_CONFIG_PATH);
    const misc = sections.get('misc');
    expect(misc).toBeDefined();

    const paths = generateContentPathsForSection('misc', misc);
    const normalized = paths.map((p) => p.replace(/\\/g, '/'));

    expect(normalized.some((p) => p.includes('templates/dashboard/shared/'))).toBe(true);
    expect(normalized.some((p) => p.includes('DashboardSharedSidebar.vue'))).toBe(true);
  });
});
