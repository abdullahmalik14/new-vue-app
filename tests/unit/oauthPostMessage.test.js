import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  buildOAuthAllowedOrigins,
  getTwitterOAuthAllowedOrigins,
  isTrustedOAuthOrigin,
  postOAuthAck,
  originFromUrl,
} from '@/utils/auth/oauthPostMessage.js';

describe('oauthPostMessage (S-06)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_TWITTER_REDIRECT_URI', 'https://callback.example/auth/twitter');
    vi.stubEnv('VITE_OAUTH_ALLOWED_ORIGINS', 'https://ngrok.example');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('originFromUrl extracts origin', () => {
    expect(originFromUrl('https://callback.example/path?q=1')).toBe('https://callback.example');
  });

  it('isTrustedOAuthOrigin accepts redirect and extra origins', () => {
    const allowed = getTwitterOAuthAllowedOrigins();
    expect(isTrustedOAuthOrigin('https://callback.example', allowed)).toBe(true);
    expect(isTrustedOAuthOrigin('https://ngrok.example', allowed)).toBe(true);
    expect(isTrustedOAuthOrigin('https://evil.example', allowed)).toBe(false);
  });

  it('postOAuthAck never uses wildcard target', () => {
    const allowed = buildOAuthAllowedOrigins('https://trusted.example');
    const source = { postMessage: vi.fn() };

    expect(postOAuthAck(source, { type: 'ACK' }, 'https://trusted.example', allowed)).toBe(true);
    expect(source.postMessage).toHaveBeenCalledWith({ type: 'ACK' }, 'https://trusted.example');

    source.postMessage.mockClear();
    expect(postOAuthAck(source, { type: 'ACK' }, 'https://evil.example', allowed)).toBe(false);
    expect(source.postMessage).not.toHaveBeenCalled();
  });
});
