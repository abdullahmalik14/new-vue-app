import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetHandler from '../../src/systems/assets/assetHandler.js';

const config = [
  { name: 'script-asset', url: '/script.js', type: 'script' },
  { name: 'style-asset', url: '/style.css', type: 'css' },
  { name: 'font-asset', url: '/font.woff2', type: 'font' },
];

function createHandler() {
  return new AssetHandler(config);
}

describe('AssetHandler DOM helpers', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.CSS = { escape: (value) => String(value) };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when an asset is not in the DOM', () => {
    const handler = createHandler();

    expect(handler.isAssetAlreadyInDOM('script-asset')).toBe(false);
  });

  it('returns true when a matching asset element is present', () => {
    const handler = createHandler();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'script-asset');
    document.head.appendChild(script);

    expect(handler.isAssetAlreadyInDOM('script-asset')).toBe(true);
  });

  it('returns false when the requested type does not match', () => {
    const handler = createHandler();
    const link = document.createElement('link');
    link.setAttribute('data-asset-name', 'style-asset');
    document.head.appendChild(link);

    expect(handler.isAssetAlreadyInDOM('style-asset', 'script')).toBe(false);
  });

  it('removes an asset element from the DOM and clears loaded state', () => {
    const handler = createHandler();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'script-asset');
    document.head.appendChild(script);
    handler.loadedAssets.add('script-asset');

    handler.removeAssetFromDOM('script-asset');

    expect(document.querySelector('[data-asset-name="script-asset"]')).toBeNull();
    expect(handler.loadedAssets.has('script-asset')).toBe(false);
  });

  it('leaves state unchanged when the asset element is missing', () => {
    const handler = createHandler();
    handler.loadedAssets.add('script-asset');

    handler.removeAssetFromDOM('missing-asset');

    expect(handler.loadedAssets.has('script-asset')).toBe(true);
  });

  it('removeAssetFromDOM is a no-op for missing elements', () => {
    const handler = createHandler();

    expect(() => handler.removeAssetFromDOM('missing-asset')).not.toThrow();
  });

  it('creates a script element with script-specific attributes', () => {
    const handler = createHandler();
    const el = handler.createElementForAsset({
      name: 'script-asset',
      url: '/script.js',
      type: 'script',
      async: true,
      defer: true,
      nonce: 'abc123',
    });

    expect(el.tagName).toBe('SCRIPT');
    expect(el.getAttribute('data-asset-name')).toBe('script-asset');
    expect(el.src).toContain('/script.js');
    expect(el.async).toBe(true);
    expect(el.defer).toBe(true);
    expect(el.nonce).toBe('abc123');
  });

  it('creates a stylesheet link for css assets', () => {
    const handler = createHandler();
    const el = handler.createElementForAsset({
      name: 'style-asset',
      url: '/style.css',
      type: 'css',
      media: 'print',
    });

    expect(el.tagName).toBe('LINK');
    expect(el.rel).toBe('stylesheet');
    expect(el.href).toContain('/style.css');
    expect(el.media).toBe('print');
  });

  it('creates a preload link for font assets', () => {
    const handler = createHandler();
    const el = handler.createElementForAsset({
      name: 'font-asset',
      url: '/font.woff2',
      type: 'font',
    });

    expect(el.tagName).toBe('LINK');
    expect(el.rel).toBe('preload');
    expect(el.as).toBe('font');
    expect(el.crossOrigin).toBe('anonymous');
  });

  it('appends inserted elements to head by default', () => {
    const handler = createHandler();
    const el = document.createElement('script');

    const result = handler.insertAssetElement(el, { name: 'script-asset', location: 'head-last' });

    expect(result).toEqual({ success: true, fallback: false });
    expect(document.head.lastElementChild).toBe(el);
  });

  it('inserts an element after a selector when provided', () => {
    const handler = createHandler();
    const marker = document.createElement('div');
    marker.id = 'marker';
    document.body.appendChild(marker);
    const el = document.createElement('script');

    const result = handler.insertAssetElement(el, { name: 'script-asset', after: '#marker' });

    expect(result).toEqual({ success: true, fallback: false });
    expect(marker.nextElementSibling).toBe(el);
  });
});
