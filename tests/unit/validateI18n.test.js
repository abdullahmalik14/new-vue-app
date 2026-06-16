import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  collectKnownSectionNames,
  extractPlaceholders,
  extractVueTranslationKeys,
  flattenTranslationKeys,
  hasTranslationKey,
  validateI18n,
} from '../../src/systems/i18n/validateI18n.js';

describe('validateI18n helpers (F-10)', () => {
  it('flattenTranslationKeys returns dotted leaf paths', () => {
    const flat = flattenTranslationKeys({ auth: { login: { title: 'Hi' } } });
    expect(flat.get('auth.login.title')).toBe('Hi');
  });

  it('extractPlaceholders finds numbered and named tokens', () => {
    expect(extractPlaceholders('Hello, {0}!')).toEqual(['{0}']);
    expect(extractPlaceholders('Hello, {name}!')).toEqual(['{name}']);
  });

  it('extractVueTranslationKeys reads $t and data-translate', () => {
    const keys = extractVueTranslationKeys(`
      <p>{{ $t('auth.login.title') }}</p>
      <span data-translate="ui.language"></span>
    `);
    expect(keys.has('auth.login.title')).toBe(true);
    expect(keys.has('ui.language')).toBe(true);
  });

  it('collectKnownSectionNames resolves role object sections', () => {
    const sections = collectKnownSectionNames([
      { section: 'auth' },
      { section: { creator: 'dashboard-creator', fan: 'dashboard-fan' } },
    ]);
    expect(sections).toEqual(new Set(['auth', 'dashboard-creator', 'dashboard-fan']));
  });

  it('hasTranslationKey walks nested objects', () => {
    const tree = { ui: { language: 'Language' } };
    expect(hasTranslationKey(tree, 'ui.language')).toBe(true);
    expect(hasTranslationKey(tree, 'ui.missing')).toBe(false);
  });
});

describe('validateI18n integration (F-10)', () => {
  it('flags unsupported locale filenames such as vif.json', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-validate-'));
    try {
      const bundleDir = join(root, 'public/i18n/section-shop');
      mkdirSync(bundleDir, { recursive: true });
      mkdirSync(join(root, 'src/router'), { recursive: true });
      writeFileSync(join(bundleDir, 'en.json'), JSON.stringify({ shop: { title: 'Shop' } }));
      writeFileSync(join(bundleDir, 'vif.json'), JSON.stringify({ shop: { title: 'Cua hang' } }));
      writeFileSync(join(root, 'src/router/routeConfig.json'), JSON.stringify([
        { slug: '/shop', section: 'shop', componentPath: '@/templates/shop/Shop.vue' },
      ]));
      mkdirSync(join(root, 'src'), { recursive: true });

      const result = validateI18n({
        projectRoot: root,
        warnOnMissingRouteSectionFolders: false,
      });

      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes('vif.json'))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects legacy root-level translation JSON files (F-11)', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-validate-'));
    try {
      const bundleDir = join(root, 'public/i18n/section-shop');
      mkdirSync(bundleDir, { recursive: true });
      mkdirSync(join(root, 'src/router'), { recursive: true });
      writeFileSync(join(bundleDir, 'en.json'), JSON.stringify({ shop: { title: 'Shop' } }));
      writeFileSync(join(root, 'public/i18n/en.json'), JSON.stringify({ legacy: true }));
      writeFileSync(join(root, 'src/router/routeConfig.json'), JSON.stringify([
        { slug: '/shop', section: 'shop', componentPath: '@/templates/shop/Shop.vue' },
      ]));
      mkdirSync(join(root, 'src'), { recursive: true });

      const result = validateI18n({
        projectRoot: root,
        warnOnMissingRouteSectionFolders: false,
      });

      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes('Legacy root translation file'))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('passes when vi.json matches en.json key shape in a section bundle', () => {
    const root = mkdtempSync(join(tmpdir(), 'i18n-validate-'));
    try {
      const bundleDir = join(root, 'public/i18n/section-shop');
      mkdirSync(bundleDir, { recursive: true });
      writeFileSync(
        join(bundleDir, 'en.json'),
        JSON.stringify({ shop: { title: 'Shop', welcome: 'Hello, {0}!' } }),
      );
      writeFileSync(
        join(bundleDir, 'vi.json'),
        JSON.stringify({ shop: { title: 'Cua hang', welcome: 'Xin chao, {0}!' } }),
      );
      mkdirSync(join(root, 'public/i18n/base'), { recursive: true });
      writeFileSync(join(root, 'public/i18n/base/en.json'), JSON.stringify({ ui: { language: 'Language' } }));
      mkdirSync(join(root, 'src/router'), { recursive: true });
      writeFileSync(join(root, 'src/router/routeConfig.json'), JSON.stringify([
        { slug: '/shop', section: 'shop', componentPath: '@/templates/shop/Shop.vue' },
      ]));
      mkdirSync(join(root, 'src'), { recursive: true });

      const result = validateI18n({
        projectRoot: root,
        warnOnMissingRouteSectionFolders: false,
      });

      expect(result.ok, result.errors.join('\n')).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
