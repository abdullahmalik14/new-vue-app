import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(projectRoot, relativePath), 'utf8'));
}

describe('settings.menu.item host consistency (Issue 18 follow-up)', () => {
  it('uses i.ibb.co host in source and public asset maps', () => {
    const srcMap = readJson('src/config/assetMap.json');
    const publicMap = readJson('public/config/assetMap.json');

    const srcUrl = srcMap.production?.['settings.menu.item'];
    const publicUrl = publicMap.production?.['settings.menu.item'];

    expect(srcUrl).toBe('https://i.ibb.co/YTFLKydW/svgviewer-png-output-6.webp');
    expect(publicUrl).toBe(srcUrl);
    expect(srcUrl).not.toContain('i.ibb.co.com');
  });
});
