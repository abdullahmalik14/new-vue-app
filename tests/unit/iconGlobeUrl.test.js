import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CORRECT_GLOBE_URL = 'https://i.ibb.co/mF9x2JG0/svgviewer-png-output-85.webp';

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(projectRoot, relativePath), 'utf8'));
}

describe('S-07 — icon.globe URL', () => {
  it('assetMap uses i.ibb.co not i.ibb.co.com', () => {
    const assetMap = readJson('src/config/assetMap.json');

    expect(assetMap.development['icon.globe']).toBe(CORRECT_GLOBE_URL);
    expect(assetMap.production['icon.globe']).toBe(CORRECT_GLOBE_URL);
    expect(assetMap.development['icon.globe']).not.toContain('i.ibb.co.com');
    expect(assetMap.production['icon.globe']).not.toContain('i.ibb.co.com');
  });

  it('public assetMap mirrors src config', () => {
    const publicMap = readJson('public/config/assetMap.json');

    expect(publicMap.development['icon.globe']).toBe(CORRECT_GLOBE_URL);
    expect(publicMap.production['icon.globe']).toBe(CORRECT_GLOBE_URL);
  });
});
