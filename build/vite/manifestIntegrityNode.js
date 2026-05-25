import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const MANIFEST_INTEGRITY_META = {
  section: 'section-manifest-sri'
};

export function sha256HexFromText(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function computeBufferIntegritySri(buffer) {
  const hash = createHash('sha384').update(buffer).digest('base64');
  return `sha384-${hash}`;
}

export function computeFileIntegritySri(absolutePath) {
  return computeBufferIntegritySri(readFileSync(absolutePath));
}

/**
 * Embed SHA-256 hashes for section manifests into dist/index.html meta tags.
 */
export function injectManifestIntegrityMetaTags(distPath) {
  const indexPath = join(distPath, 'index.html');

  if (!existsSync(indexPath)) {
    console.warn('[ManifestIntegrity] dist/index.html not found — skipping meta injection');
    return;
  }

  const metaTags = [];

  const sectionManifestPath = join(distPath, 'section-manifest.json');
  if (existsSync(sectionManifestPath)) {
    const content = readFileSync(sectionManifestPath, 'utf8');
    metaTags.push(
      `<meta name="${MANIFEST_INTEGRITY_META.section}" content="${sha256HexFromText(content)}">`
    );
  }

  if (metaTags.length === 0) {
    console.warn('[ManifestIntegrity] No manifest files found — skipping meta injection');
    return;
  }

  let html = readFileSync(indexPath, 'utf8');
  html = html.replace(/<meta name="section-manifest-sri"[^>]*>\s*/g, '');
  html = html.replace('</head>', `    ${metaTags.join('\n    ')}\n  </head>`);

  writeFileSync(indexPath, html, 'utf8');

  console.log('[ManifestIntegrity] Injected manifest integrity meta tags into index.html', {
    tagCount: metaTags.length
  });
}
