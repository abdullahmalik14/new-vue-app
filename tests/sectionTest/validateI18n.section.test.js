/**
 * validateI18n / collectKnownSectionNames — production section coverage (section test plan §71).
 */

import { describe, it, expect } from 'vitest';
import { collectKnownSectionNames, validateI18n } from '../../src/systems/i18n/validateI18n.js';
import {
  I18N_FOLDER_INTENTIONAL_GAPS,
  getNavigableRoutes,
  getProjectRoot,
  loadProductionRouteConfig,
  sectionI18nFolderExists,
} from '../helpers/sectionFixtures.js';

describe('validateI18n — production section coverage (Phase A §71)', () => {
  const routes = loadProductionRouteConfig();

  it('collectKnownSectionNames includes every simple production section string', () => {
    const known = collectKnownSectionNames(routes);

    for (const route of getNavigableRoutes(routes)) {
      if (typeof route.section !== 'string') {
        continue;
      }
      expect(known.has(route.section.trim())).toBe(true);
    }
  });

  it('collectKnownSectionNames includes every role-based production section variant', () => {
    const known = collectKnownSectionNames(routes);

    for (const route of routes) {
      if (!route.section || typeof route.section !== 'object') {
        continue;
      }

      for (const value of Object.values(route.section)) {
        if (typeof value === 'string' && value.trim()) {
          expect(known.has(value.trim())).toBe(true);
        }
      }
    }
  });

  it('collectKnownSectionNames deduplicates role variants into a unique set', () => {
    const known = collectKnownSectionNames([
      { section: { creator: 'dashboard-creator', fan: 'dashboard-creator', default: 'dashboard-global' } },
    ]);

    expect(known).toEqual(new Set(['dashboard-creator', 'dashboard-global']));
  });

  it('every production section has an i18n folder or is listed as an intentional gap', () => {
    const known = collectKnownSectionNames(routes);

    for (const sectionName of known) {
      if (I18N_FOLDER_INTENTIONAL_GAPS.has(sectionName)) {
        continue;
      }

      expect(sectionI18nFolderExists(sectionName)).toBe(true);
    }
  });

  it('validateI18n reports missing route section folders as warnings for intentional gaps only', () => {
    const result = validateI18n({
      projectRoot: getProjectRoot(),
      warnOnMissingRouteSectionFolders: true,
    });

    const missingFolderWarnings = result.warnings.filter((warning) =>
      warning.includes('has no public/i18n/section-'),
    );

    for (const warning of missingFolderWarnings) {
      const matchesGap = [...I18N_FOLDER_INTENTIONAL_GAPS].some((gap) =>
        warning.includes(`section-${gap}`),
      );
      expect(matchesGap).toBe(true);
    }
  });
});
