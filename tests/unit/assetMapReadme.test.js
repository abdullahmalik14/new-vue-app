import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const readmePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/config/assetMap.README.md',
);

describe('assetMap.README (B-05)', () => {
  it('documents production baseline, inheritance, and relative vs absolute URLs', () => {
    const text = readFileSync(readmePath, 'utf8');

    expect(text).toContain('production');
    expect(text).toContain('inherit');
    expect(text).toContain('Relative');
    expect(text).toContain('validateAssetMap');
    expect(text).toContain('src/config/assetMap.json');
  });
});
