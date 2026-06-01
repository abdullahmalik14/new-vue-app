import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const srcRoot = join(projectRoot, 'src');

function collectVueFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectVueFiles(fullPath));
      continue;
    }
    if (entry.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
  return files;
}

/** Lines that bind v-html to vue-i18n translation output (forbidden — S-03). */
const I18N_VHTML_PATTERN =
  /v-html\s*=\s*["'][^"']*(\$t\s*\(|[^a-zA-Z_]t\s*\(\s*['"`])/;

describe('translation security audit (S-03)', () => {
  it('does not use v-html with vue-i18n translation strings in src/**/*.vue', () => {
    const violations = [];

    for (const filePath of collectVueFiles(srcRoot)) {
      const lines = readFileSync(filePath, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (!line.includes('v-html')) {
          return;
        }
        if (I18N_VHTML_PATTERN.test(line)) {
          violations.push({
            file: filePath.replace(projectRoot + '\\', '').replace(projectRoot + '/', ''),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('documents known v-html usages that are not i18n-bound (informational)', () => {
    const vhtmlFiles = [];

    for (const filePath of collectVueFiles(srcRoot)) {
      const content = readFileSync(filePath, 'utf8');
      if (content.includes('v-html')) {
        vhtmlFiles.push(filePath.replace(projectRoot + '\\', '').replace(projectRoot + '/', ''));
      }
    }

    expect(vhtmlFiles.sort().map((p) => p.replace(/\\/g, '/'))).toEqual([
      'src/components/ui/card/dashboard/TierCard.vue',
      'src/templates/profileAbdullah/components/SubscriptionCard.vue',
    ]);
  });
});

describe('translation JSON integrity policy (S-04 / S-05)', () => {
  it('documents same-origin translation fetch boundary in translationLoader', () => {
    const loaderPath = join(projectRoot, 'src/utils/translation/translationLoader.js');
    const loaderSource = readFileSync(loaderPath, 'utf8');

    expect(loaderSource).toContain('encodeURIComponent(safeSectionName)');
    expect(loaderSource).toContain('encodeURIComponent(localeCode)');
    expect(loaderSource).toMatch(/S-04.*CDN|same-origin static JSON/i);
    expect(loaderSource).toMatch(/isAllowlistedSectionName|getKnownTranslationSections/);
    expect(loaderSource).toMatch(/isSupportedTranslationLocale|SUPPORTED_LOCALES/);
    expect(loaderSource).toMatch(/localeConstants\.js/);
  });
});
