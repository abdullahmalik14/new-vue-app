/**
 * Translation asset validation for CI (F-10).
 * Dependency-free except localeConstants (B-09).
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { SUPPORTED_LOCALES } from './localeConstants.js';

const SUPPORTED_LOCALE_SET = new Set(SUPPORTED_LOCALES);

const DEFAULT_OPTIONS = {
  projectRoot: process.cwd(),
  i18nRoot: 'public/i18n',
  srcRoot: 'src',
  routeConfigPath: 'src/router/routeConfig.json',
  /** Locales that must match English key shape when present in a bundle folder. */
  parityLocales: ['vi'],
  /** Route sections without a section folder are reported as warnings until scaffolded. */
  warnOnMissingRouteSectionFolders: true,
};

const TRANSLATION_KEY_PATTERN =
  /(?:\$t|\bi18n\.t|[^a-zA-Z0-9_]t)\s*\(\s*['"`]([^'"`\\]+)['"`]/g;
const DATA_TRANSLATE_PATTERN = /data-translate\s*=\s*['"`]([^'"`\\]+)['"`]/g;

/**
 * @param {Array<object>} routes
 * @returns {Set<string>}
 */
export function collectKnownSectionNames(routes) {
  const known = new Set();

  for (const route of routes) {
    if (!route?.section) {
      continue;
    }

    if (typeof route.section === 'string') {
      const name = route.section.trim();
      if (name) {
        known.add(name);
      }
      continue;
    }

    if (typeof route.section === 'object' && route.section !== null) {
      for (const value of Object.values(route.section)) {
        if (typeof value === 'string' && value.trim()) {
          known.add(value.trim());
        }
      }
    }
  }

  return known;
}

/**
 * @param {string} componentPath
 * @returns {string}
 */
export function normalizeComponentPath(componentPath) {
  return componentPath.replace(/^@\//, 'src/').replace(/\\/g, '/').toLowerCase();
}

/**
 * @param {Array<object>} routes
 * @returns {Map<string, Set<string>>}
 */
export function buildComponentSectionMap(routes) {
  const map = new Map();

  for (const route of routes) {
    if (typeof route.componentPath !== 'string' || !route.componentPath.trim()) {
      continue;
    }

    const sections = collectKnownSectionNames([route]);
    const normalizedPath = normalizeComponentPath(route.componentPath);

    if (!map.has(normalizedPath)) {
      map.set(normalizedPath, new Set());
    }

    for (const section of sections) {
      map.get(normalizedPath).add(section);
    }
  }

  return map;
}

/**
 * @param {unknown} value
 * @param {string} [prefix]
 * @returns {Map<string, string>}
 */
export function flattenTranslationKeys(value, prefix = '') {
  const entries = new Map();

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return entries;
  }

  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (child && typeof child === 'object' && !Array.isArray(child)) {
      for (const [nestedKey, nestedValue] of flattenTranslationKeys(child, path)) {
        entries.set(nestedKey, nestedValue);
      }
      continue;
    }

    if (typeof child === 'string') {
      entries.set(path, child);
    }
  }

  return entries;
}

/**
 * @param {string} value
 * @returns {string[]}
 */
export function extractPlaceholders(value) {
  if (typeof value !== 'string') {
    return [];
  }

  const matches = value.match(/\{(\d+|[a-zA-Z_][a-zA-Z0-9_]*)\}/g) || [];
  return [...new Set(matches)].sort();
}

/**
 * @param {object} tree
 * @param {string} keyPath
 * @returns {boolean}
 */
export function hasTranslationKey(tree, keyPath) {
  const parts = keyPath.split('.');
  let node = tree;

  for (const part of parts) {
    if (!node || typeof node !== 'object' || !(part in node)) {
      return false;
    }
    node = node[part];
  }

  return typeof node === 'string';
}

/**
 * @param {object[]} trees
 * @returns {object}
 */
export function mergeTranslationTrees(trees) {
  const merged = {};

  for (const tree of trees) {
    if (!tree || typeof tree !== 'object') {
      continue;
    }

    for (const [key, value] of Object.entries(tree)) {
      if (
        value
        && typeof value === 'object'
        && !Array.isArray(value)
        && merged[key]
        && typeof merged[key] === 'object'
      ) {
        merged[key] = mergeTranslationTrees([merged[key], value]);
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

/**
 * @param {string} content
 * @returns {Set<string>}
 */
export function extractVueTranslationKeys(content) {
  const keys = new Set();

  for (const pattern of [TRANSLATION_KEY_PATTERN, DATA_TRANSLATE_PATTERN]) {
    pattern.lastIndex = 0;
    let match = pattern.exec(content);
    while (match) {
      keys.add(match[1]);
      match = pattern.exec(content);
    }
  }

  return keys;
}

/**
 * @param {string} dir
 * @param {string[]} files
 * @returns {Generator<string>}
 */
function* walkVueFiles(dir, files = []) {
  for (const entry of files) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      yield* walkVueFiles(fullPath, readdirSync(fullPath));
      continue;
    }

    if (entry.endsWith('.vue')) {
      yield fullPath;
    }
  }
}

/**
 * @param {string} bundleLabel
 * @param {string} folderPath
 * @param {object} options
 * @param {{ errors: string[], warnings: string[] }} report
 */
function validateTranslationBundleFolder(bundleLabel, folderPath, options, report) {
  if (!existsSync(folderPath)) {
    report.errors.push(`${bundleLabel}: folder missing (${folderPath})`);
    return;
  }

  const files = readdirSync(folderPath).filter((file) => file.endsWith('.json'));
  const localeFiles = files.map((file) => file.replace(/\.json$/, ''));

  if (!localeFiles.includes('en')) {
    report.errors.push(`${bundleLabel}: missing required en.json`);
    return;
  }

  let englishTree;
  try {
    englishTree = JSON.parse(readFileSync(join(folderPath, 'en.json'), 'utf8'));
  } catch (error) {
    report.errors.push(`${bundleLabel}/en.json: invalid JSON (${error.message})`);
    return;
  }

  const englishKeys = flattenTranslationKeys(englishTree);

  for (const locale of localeFiles) {
    if (!SUPPORTED_LOCALE_SET.has(locale)) {
      report.errors.push(
        `${bundleLabel}/${locale}.json: unsupported locale filename (not in SUPPORTED_LOCALES)`,
      );
      continue;
    }

    if (locale === 'en') {
      continue;
    }

    let localeTree;
    try {
      localeTree = JSON.parse(readFileSync(join(folderPath, `${locale}.json`), 'utf8'));
    } catch (error) {
      report.errors.push(`${bundleLabel}/${locale}.json: invalid JSON (${error.message})`);
      continue;
    }

    const localeKeys = flattenTranslationKeys(localeTree);

    for (const key of localeKeys.keys()) {
      if (!englishKeys.has(key)) {
        report.errors.push(`${bundleLabel}/${locale}.json: extra key not in en.json → ${key}`);
      }
    }

    if (!options.parityLocales.includes(locale)) {
      continue;
    }

    for (const key of englishKeys.keys()) {
      if (!localeKeys.has(key)) {
        report.errors.push(`${bundleLabel}/${locale}.json: missing key from en.json → ${key}`);
      }
    }

    for (const [key, englishValue] of englishKeys) {
      if (!localeKeys.has(key)) {
        continue;
      }

      const englishTokens = extractPlaceholders(englishValue);
      const localeTokens = extractPlaceholders(localeKeys.get(key));

      if (englishTokens.join('|') !== localeTokens.join('|')) {
        report.errors.push(
          `${bundleLabel}/${locale}.json: placeholder mismatch for ${key} (en: ${englishTokens.join(', ') || 'none'}; ${locale}: ${localeTokens.join(', ') || 'none'})`,
        );
      }
    }
  }
}

/**
 * @param {Partial<typeof DEFAULT_OPTIONS>} [userOptions]
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
export function validateI18n(userOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  const projectRoot = options.projectRoot;
  const i18nRoot = join(projectRoot, options.i18nRoot);
  const srcRoot = join(projectRoot, options.srcRoot);
  const report = { errors: [], warnings: [] };

  const routes = JSON.parse(
    readFileSync(join(projectRoot, options.routeConfigPath), 'utf8'),
  );
  const routeSections = collectKnownSectionNames(routes);
  const componentSectionMap = buildComponentSectionMap(routes);

  const sectionDirs = existsSync(i18nRoot)
    ? readdirSync(i18nRoot).filter((entry) => entry.startsWith('section-'))
    : [];

  const sectionNamesFromDisk = new Set(
    sectionDirs.map((dir) => dir.replace(/^section-/, '')),
  );

  if (options.warnOnMissingRouteSectionFolders) {
    for (const section of routeSections) {
      if (!sectionNamesFromDisk.has(section)) {
        report.warnings.push(
          `Route section "${section}" has no public/i18n/section-${section}/ folder yet`,
        );
      }
    }
  }

  for (const sectionDir of sectionDirs) {
    const sectionName = sectionDir.replace(/^section-/, '');
    if (!routeSections.has(sectionName)) {
      report.warnings.push(
        `Orphan translation folder "${sectionDir}" is not declared in routeConfig.json`,
      );
    }

    validateTranslationBundleFolder(
      sectionDir,
      join(i18nRoot, sectionDir),
      options,
      report,
    );
  }

  validateTranslationBundleFolder('base', join(i18nRoot, 'base'), options, report);

  if (existsSync(i18nRoot)) {
    for (const entry of readdirSync(i18nRoot)) {
      if (entry.endsWith('.json')) {
        report.errors.push(
          `Legacy root translation file public/i18n/${entry} must not exist — use public/i18n/base/ or public/i18n/section-*/ (F-11)`,
        );
      }
    }
  }

  const sectionEnglishTrees = new Map();
  for (const sectionDir of sectionDirs) {
    const enPath = join(i18nRoot, sectionDir, 'en.json');
    if (existsSync(enPath)) {
      sectionEnglishTrees.set(
        sectionDir.replace(/^section-/, ''),
        JSON.parse(readFileSync(enPath, 'utf8')),
      );
    }
  }

  let baseEnglish = {};
  const baseEnPath = join(i18nRoot, 'base', 'en.json');
  if (existsSync(baseEnPath)) {
    baseEnglish = JSON.parse(readFileSync(baseEnPath, 'utf8'));
  }

  const mergedEnglish = mergeTranslationTrees([
    baseEnglish,
    ...sectionEnglishTrees.values(),
  ]);

  if (existsSync(srcRoot)) {
    for (const vuePath of walkVueFiles(srcRoot, readdirSync(srcRoot))) {
      const relPath = relative(projectRoot, vuePath).split(sep).join('/');
      const normalizedPath = relPath.toLowerCase();
      const content = readFileSync(vuePath, 'utf8');
      const keys = extractVueTranslationKeys(content);

      if (keys.size === 0) {
        continue;
      }

      const mappedSections = componentSectionMap.get(normalizedPath) || new Set();
      const scopedEnglish = mergedEnglish;

      for (const key of keys) {
        if (!hasTranslationKey(scopedEnglish, key)) {
          const scopeHint =
            mappedSections.size > 0
              ? `route sections: ${[...mappedSections].join(', ')} (merged with base + all section en.json)`
              : 'merged base + all section en.json files';
          report.errors.push(
            `${relPath}: missing English translation key "${key}" (checked ${scopeHint})`,
          );
        }
      }
    }
  }

  return {
    ok: report.errors.length === 0,
    errors: report.errors,
    warnings: report.warnings,
  };
}
