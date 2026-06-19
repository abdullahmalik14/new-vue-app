/**
 * section-manifest.dev.json alignment with production route sections (section test plan §0).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectKnownSectionNames } from '../../src/systems/i18n/validateI18n.js';
import {
  DEV_MANIFEST_INTENTIONAL_GAPS,
  collectPreloadIdentifiers,
  loadDevSectionManifest,
  loadProductionRouteConfig,
} from '../helpers/sectionFixtures.js';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
});

describe('section-manifest.dev.json — production alignment (Phase A §0)', () => {
  let routes;
  let manifestKeys;

  beforeEach(() => {
    routes = loadProductionRouteConfig();
    manifestKeys = new Set(Object.keys(loadDevSectionManifest()));
  });

  it('dev manifest parses as an object with section keys', () => {
    const manifest = loadDevSectionManifest();
    expect(typeof manifest).toBe('object');
    expect(Array.isArray(manifest)).toBe(false);
    expect(Object.keys(manifest).length).toBeGreaterThan(0);
  });

  it('collectKnownSectionNames from production routes matches manifest keys minus intentional gaps', () => {
    const knownSections = collectKnownSectionNames(routes);

    for (const sectionName of knownSections) {
      if (DEV_MANIFEST_INTENTIONAL_GAPS.has(sectionName)) {
        continue;
      }
      expect(manifestKeys.has(sectionName)).toBe(true);
    }
  });

  it('every resolved preLoadSections identifier maps to a manifest entry or intentional gap', async () => {
    const { resolveSectionIdentifier } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    for (const route of routes) {
      for (const identifier of collectPreloadIdentifiers(route.preLoadSections)) {
        const resolved = resolveSectionIdentifier(identifier, 'guest');
        expect(resolved).toBeTruthy();

        if (DEV_MANIFEST_INTENTIONAL_GAPS.has(resolved)) {
          continue;
        }

        expect(manifestKeys.has(resolved)).toBe(true);
      }
    }
  });

  it('direct section names used only as preLoadSections identifiers exist in manifest or gaps list', async () => {
    const knownSections = collectKnownSectionNames(routes);
    const identifiers = new Set(
      routes.flatMap((route) => collectPreloadIdentifiers(route.preLoadSections)),
    );

    for (const identifier of identifiers) {
      if (!knownSections.has(identifier)) {
        continue;
      }

      if (DEV_MANIFEST_INTENTIONAL_GAPS.has(identifier)) {
        continue;
      }

      expect(manifestKeys.has(identifier)).toBe(true);
    }
  });

  it('documented intentional manifest gaps remain absent from dev stub', () => {
    for (const gap of DEV_MANIFEST_INTENTIONAL_GAPS) {
      expect(manifestKeys.has(gap)).toBe(false);
    }
  });
});
