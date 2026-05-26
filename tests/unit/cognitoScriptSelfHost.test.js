import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCAL_COGNITO_PATH = '/vendor/amazon-cognito-identity-6.3.15.min.js';

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(projectRoot, relativePath), 'utf8'));
}

describe('S2 — self-hosted Cognito script', () => {
  it('vendors Cognito UMD bundle under public/vendor', () => {
    const vendorPath = join(
      projectRoot,
      'public/vendor/amazon-cognito-identity-6.3.15.min.js',
    );
    const contents = readFileSync(vendorPath, 'utf8');
    expect(contents.length).toBeGreaterThan(1000);
    expect(contents).toContain('AmazonCognitoIdentity');
  });

  it('assetMap uses same-origin Cognito script in development and production', () => {
    const assetMap = readJson('src/config/assetMap.json');

    expect(assetMap.development['script.cognito']).toBe(LOCAL_COGNITO_PATH);
    expect(assetMap.production['script.cognito']).toBe(LOCAL_COGNITO_PATH);
    expect(assetMap.development['script.cognito']).not.toContain('jsdelivr.net');
    expect(assetMap.production['script.cognito']).not.toContain('jsdelivr.net');
  });

  it('login route assetPreload references script.cognito flag, not CDN src', () => {
    const routes = readJson('src/router/routeConfig.json');
    const loginRoute = routes.find((route) => route.slug === '/log-in');
    const cognitoAsset = loginRoute.assetPreload.find((asset) => asset.type === 'script');

    expect(cognitoAsset.flag).toBe('script.cognito');
    expect(cognitoAsset.src).toBeUndefined();
    expect(JSON.stringify(loginRoute.assetPreload)).not.toContain('jsdelivr.net');
  });
});
