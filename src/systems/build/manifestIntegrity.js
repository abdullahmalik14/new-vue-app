/**
 * Runtime manifest integrity verification (S-01).
 * Compares fetched manifest bodies against SHA-256 hashes embedded at build time.
 */

export const MANIFEST_INTEGRITY_META = {
  section: 'section-manifest-sri'
};

export function getExpectedManifestHash(metaName) {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(`meta[name="${metaName}"]`)?.getAttribute('content')?.trim() || null;
}

export async function sha256HexFromText(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyManifestBodyIntegrity(bodyText, metaName) {
  const expected = getExpectedManifestHash(metaName);

  if (!expected) {
    throw new Error(`Missing manifest integrity meta tag: ${metaName}`);
  }

  const actual = await sha256HexFromText(bodyText);

  if (actual !== expected.toLowerCase()) {
    throw new Error(`Manifest integrity check failed for ${metaName}`);
  }

  return true;
}

export async function fetchVerifiedManifest(url, metaName, fetchOptions = {}) {
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest ${url}: ${response.status}`);
  }

  const bodyText = await response.text();
  await verifyManifestBodyIntegrity(bodyText, metaName);
  return JSON.parse(bodyText);
}
