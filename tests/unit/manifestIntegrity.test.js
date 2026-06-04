import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MANIFEST_INTEGRITY_META,
  getExpectedManifestHash,
  sha256HexFromText,
  verifyManifestBodyIntegrity,
  fetchVerifiedManifest
} from '../../src/utils/build/manifestIntegrity.js';

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('manifestIntegrity (S-01)', () => {
  it('reads expected hash from embedded meta tag', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', MANIFEST_INTEGRITY_META.section);
    meta.setAttribute('content', 'abc123');
    document.head.appendChild(meta);

    expect(getExpectedManifestHash(MANIFEST_INTEGRITY_META.section)).toBe('abc123');
  });

  it('verifies manifest body against SHA-256 meta hash', async () => {
    const body = '{"sections":{"auth":{"js":"/assets/auth.js"}}}';
    const hash = await sha256HexFromText(body);

    const meta = document.createElement('meta');
    meta.setAttribute('name', MANIFEST_INTEGRITY_META.section);
    meta.setAttribute('content', hash);
    document.head.appendChild(meta);

    await expect(verifyManifestBodyIntegrity(body, MANIFEST_INTEGRITY_META.section)).resolves.toBe(true);
  });

  it('rejects tampered manifest bodies', async () => {
    const body = '{"sections":{"auth":{"js":"/assets/auth.js"}}}';
    const hash = await sha256HexFromText(body);

    const meta = document.createElement('meta');
    meta.setAttribute('name', MANIFEST_INTEGRITY_META.sectionCss);
    meta.setAttribute('content', hash);
    document.head.appendChild(meta);

    await expect(
      verifyManifestBodyIntegrity('{"sections":{"auth":{"js":"/assets/evil.js"}}}', MANIFEST_INTEGRITY_META.sectionCss)
    ).rejects.toThrow('Manifest integrity check failed');
  });

  it('fetchVerifiedManifest parses body only after integrity passes', async () => {
    const body = JSON.stringify({ auth: { js: '/assets/auth.js' } });
    const hash = await sha256HexFromText(body);

    const meta = document.createElement('meta');
    meta.setAttribute('name', MANIFEST_INTEGRITY_META.section);
    meta.setAttribute('content', hash);
    document.head.appendChild(meta);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => body
    }));

    const manifest = await fetchVerifiedManifest('/section-manifest.json', MANIFEST_INTEGRITY_META.section);

    expect(manifest.auth.js).toBe('/assets/auth.js');
    expect(fetch).toHaveBeenCalledWith('/section-manifest.json', {});

    vi.unstubAllGlobals();
  });
});
