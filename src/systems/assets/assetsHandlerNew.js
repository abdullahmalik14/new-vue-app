// AssetHandler.js

/**
 * AssetHandler - Advanced DOM-based asset loading and injection
 * (Original implementation fixed for 20+ issues)
 */

class AssetHandler {
  /**
   * @param {Array<Object>} config - Array of asset configuration objects
   * @param {Object} options - Global options
   */
  constructor(config = [], options = {}) {
    this.configRaw = config;
    this.config = [];

    this.maxConcurrent = options.maxConcurrent || 3;
    this.globalVersion = options.globalVersion || null;
    this.globalNonce = options.nonce || null;
    this.debugMode = options.debug || false;
    this.checkOnline = options.checkOnline !== false;

    this.preloadHints = new Map();
    this.eventListeners = new Map();
    this.observers = [];
    this.loadedAssets = new Set();
    this.failedAssets = new Map();
    this.assetMap = new Map();
    this.inFlightAssets = new Map();

    // Readiness tracking
    this._isReady = false;
    this._readyPromise = null;
    this._readyCallbacks = [];
    this._mountBlockers = new Map();

    if (this.globalVersion && !this.isValidSemVer(this.globalVersion)) {
      throw new Error(`Invalid global version: ${this.globalVersion}`);
    }

    this.loadConfigFromJSON(config);
    this.validateConfig();
    this._markAsReady();
    this.log('Constructor end');
  }

  // === Configuration ===

  loadConfigFromJSON(json) {
    this.logGroup('Config Loading', () => {
      this.log('Loading raw config', { json });

      const raw = Array.isArray(json) ? json : [];
      const defaults = Object.freeze({
        name: null,
        url: null,
        type: null,
        flags: [],
        dependencies: [],
        priority: 'normal',
        version: null,
        location: 'head-last',
        defer: false,
        async: false,
        after: null,
        media: null,
        critical: false,
        crossOrigin: null,
        nonce: null,
        retry: 0,
        timeout: 10000
      });

      this.config = raw.map(item => {
        const asset = { ...defaults, ...item };
        if (asset.critical) asset.priority = 'critical';
        if (asset.async && asset.defer) {
          this.log('Both async and defer set; enforcing async only', { name: asset.name });
          asset.defer = false;
        }
        return asset;
      });

      this.assetMap.clear();
      this.config.forEach(asset => {
        if (asset.name) {
          this.assetMap.set(asset.name, asset);
        }
      });

      this.log('Configuration loaded', { count: this.config.length });
    });
  }

  validateConfig() {
    this.logGroup('Config Validation', () => {
      const errors = [];
      const names = new Set();

      this.config.forEach((asset, index) => {
        if (!asset.name) errors.push(`Asset at index ${index} missing name`);
        if (!asset.url) errors.push(`Asset at index ${index} missing url`);
        if (!asset.type) errors.push(`Asset at index ${index} missing type`);

        if (asset.name) {
          if (names.has(asset.name)) errors.push(`Duplicate asset name: ${asset.name}`);
          if (!this.isValidAssetName(asset.name)) errors.push(`Invalid asset name: ${asset.name}`);
          names.add(asset.name);
        }

        if (asset.version && !this.isValidSemVer(asset.version)) {
          errors.push(`Invalid version for asset ${asset.name}: ${asset.version}`);
        }
      });

      if (errors.length > 0) {
        errors.forEach(err => this.log(err));
        throw new Error(`Config validation failed: \n${errors.join('\n')}`);
      }

      this.log('Config validation complete');
    });
  }

  isValidSemVer(version) {
    const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return SEMVER_REGEX.test(version);
  }

  isValidAssetName(name) {
    const ASSET_NAME_REGEX = /^[\w-]+$/;
    return ASSET_NAME_REGEX.test(name);
  }

  /**
   * Set the global version for all assets
   * @param {string} version - Version string (must be valid semver)
   */
  setGlobalVersion(version) {
    if (version && !this.isValidSemVer(version)) {
      throw new Error(`Invalid global version: ${version}`);
    }
    this.globalVersion = version;
    this.log('Global version set', { version });
  }

  // === Readiness API ===

  /**
   * Mark the AssetHandler as ready for use
   * @private
   */
  _markAsReady() {
    this._isReady = true;
    this._readyCallbacks.forEach(callback => callback());
    this._readyCallbacks = [];
    this.log('AssetHandler marked as ready');
  }

  /**
   * Check if AssetHandler is ready
   * @returns {boolean}
   */
  isReady() {
    return this._isReady;
  }

  /**
   * Wait for AssetHandler to be ready
   * @returns {Promise<void>}
   */
  async whenReady() {
    if (this._isReady) {
      return Promise.resolve();
    }

    if (!this._readyPromise) {
      this._readyPromise = new Promise((resolve) => {
        this._readyCallbacks.push(resolve);
      });
    }

    return this._readyPromise;
  }

  /**
   * Enhanced isAssetAlreadyInDOM with optional type parameter
   * @param {string} name - Asset name
   * @param {string} [type] - Optional asset type for additional validation
   * @returns {boolean}
   */
  isAssetAlreadyInDOM(name, type = null) {
    const selector = `[data-asset-name="${CSS.escape(name)}"]`;
    const element = document.querySelector(selector);

    if (!element) return false;

    // If type is provided, validate it matches
    if (type) {
      const asset = this.assetMap.get(name);
      if (asset && asset.type !== type) {
        this.log('Asset found but type mismatch', { name, expectedType: type, actualType: asset.type });
        return false;
      }
    }

    return true;
  }

  // === Public API ===

  loadAssetsForEvent(eventName, callback) {
    this.logGroup(`Public API › loadAssetsForEvent (${eventName})`, () => {
      const handler = async (e) => {
        try {
          this.log('Event fired', { eventName, event: e });
          const assets = this.getAssetsByFlags([eventName]);
          const results = await this._loadAssetsWithPipeline(assets);
          if (typeof callback === 'function') callback(results);
        } catch (error) {
          this.log(`Event handler error for ${eventName}`, { error });
          if (typeof callback === 'function') callback({ error: error.message });
        }
      };

      window.addEventListener(eventName, handler);
      this.eventListeners.set(eventName, handler);
      this.log('Event listener registered', { eventName });
    });
  }

  async preloadAssetsByFlag(...flags) {
    return this.logGroup('Public API › preloadAssetsByFlag', async () => {
      await this.whenReady();
      this.log('Flags for preload', { flags });

      try {
        const assets = this.getAssetsByFlags(flags);
        const results = await this._loadAssetsWithPipeline(assets);
        this.log('Preload complete', { results });
        return results;
      } catch (error) {
        this.log('Preload error', { error });
        throw error;
      }
    });
  }

  /**
   * Load assets required before a route/template mounts
   * @param {Object} routeDefinition - Route definition with assetDependencies
   * @param {Object} options - Loading options
   * @returns {Promise<Object>} Load results
   */
  async loadAssetsBeforeMount(routeDefinition, options = {}) {
    return this.logGroup('Public API › loadAssetsBeforeMount', async () => {
      await this.whenReady();

      const routeName = routeDefinition?.name || routeDefinition?.path || 'unknown';
      this.log('Loading assets before mount', { route: routeName, definition: routeDefinition });

      // Register this route as a mount blocker
      const blockerId = `mount:${routeName}:${Date.now()}`;
      this._mountBlockers.set(blockerId, { route: routeName, startTime: Date.now() });

      try {
        const result = await this.ensureAssetsForDefinition(routeDefinition, {
          ...options,
          strict: options.strict !== false // Default to strict mode
        });

        this.log('Assets loaded before mount', { route: routeName, result });
        this._mountBlockers.delete(blockerId);

        return result;
      } catch (error) {
        this.log('Failed to load assets before mount', { route: routeName, error });
        this._mountBlockers.delete(blockerId);
        throw error;
      }
    });
  }

  /**
   * Check if any routes are currently blocking mount
   * @returns {boolean}
   */
  hasPendingMountBlockers() {
    return this._mountBlockers.size > 0;
  }

  /**
   * Get information about pending mount blockers
   * @returns {Array<Object>}
   */
  getPendingMountBlockers() {
    return Array.from(this._mountBlockers.values());
  }

  async loadAssetsImmediatelyForSelector(selector, callback) {
    return this.logGroup(`Public API › loadAssetsImmediatelyForSelector (${selector})`, async () => {
      this.log('Querying DOM for selector', { selector });
      const elements = document.querySelectorAll(selector);
      this.log('Elements found', { count: elements.length });
      if (elements.length === 0) {
        this.log('No elements found; exiting');
        return [];
      }

      const flags = Array.from(elements)
        .map(el => el.getAttribute('data-asset-flag'))
        .filter(Boolean);

      const assets = this.getAssetsByFlags(flags);
      const results = await this._loadAssetsWithPipeline(assets);

      if (typeof callback === 'function') callback(results);
      return results;
    });
  }

  observeLazyAssets(container = document) {
    return this.logGroup('Public API › observeLazyAssets', () => {
      this.log('Setting up IntersectionObserver', { container });

      const observerOptions = container === document ? {} : { root: container };
      const observer = new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const flag = entry.target.getAttribute('data-asset-flag');
          if (!flag) continue;
          observer.unobserve(entry.target);

          try {
            const assets = this.getAssetsByFlags([flag]);
            await this._loadAssetsWithPipeline(assets);
          } catch (error) {
            this.log('Lazy-load error', { error, flag });
          }
        }
      }, observerOptions);

      const targets = container.querySelectorAll('[data-asset-flag]');
      targets.forEach(el => observer.observe(el));
      this.observers.push(observer);
      this.log('Observer attached to targets', { count: targets.length });
      return observer;
    });
  }

  dispatchAssetLoadEvent(name, detail = null) {
    return this.logGroup(`Public API › dispatchAssetLoadEvent (${name})`, () => {
      this.log('Dispatching custom event', { name, detail });
      const event = detail ? new CustomEvent(name, { detail }) : new Event(name);
      window.dispatchEvent(event);
    });
  }

  // === Pipeline ===

  async _loadAssetsWithPipeline(assets) {
    if (this.checkOnline && typeof navigator !== 'undefined' && !navigator.onLine) {
      this.log('Offline detected, skipping asset load');
      return [];
    }

    let sorted = this.sortByPriority(assets);
    sorted = this.resolveDependencies(sorted);
    sorted.forEach(a => this.registerPreloadHint(a));
    this.log('Loading assets through pipeline', { assets: sorted.map(a => a.name) });
    return this.loadAssetsInParallelWithThrottle(sorted, this.maxConcurrent);
  }

  _normalizeDependencyInput(dependencies = []) {
    const names = new Set();
    const flags = new Set();

    dependencies.forEach(dep => {
      if (!dep) return;
      if (typeof dep === 'string') {
        const value = dep.trim();
        if (!value) return;
        if (value.startsWith('flag:')) {
          flags.add(value.slice(5).trim());
        } else if (value.startsWith('name:')) {
          names.add(value.slice(5).trim());
        } else {
          names.add(value);
        }
      } else if (typeof dep === 'object') {
        const type = dep.type || (dep.flag ? 'flag' : dep.name ? 'name' : null);
        const value = dep.value ?? dep.flag ?? dep.name ?? dep.asset;
        if (!type || !value) return;
        const trimmed = String(value).trim();
        if (!trimmed) return;
        if (type === 'flag') {
          flags.add(trimmed);
        } else {
          names.add(trimmed);
        }
      }
    });

    names.delete('');
    flags.delete('');

    const normalized = { names: Array.from(names), flags: Array.from(flags) };
    this.log('Normalized dependency input', normalized);
    return normalized;
  }

  getAssetByName(name) {
    return this.assetMap.get(name) || null;
  }

  areAssetDependenciesReady(dependencies = []) {
    return this.logGroup('Dependencies › areAssetDependenciesReady', () => {
      const { names, flags } = this._normalizeDependencyInput(dependencies);
      const pending = new Set();

      names.forEach(name => {
        if (!this.assetMap.has(name)) return;
        if (!this.isAssetAlreadyInDOM(name) && !this.loadedAssets.has(name)) {
          pending.add(name);
        }
      });

      flags.forEach(flag => {
        const assets = this.getAssetsByFlags([flag]);
        assets.forEach(asset => {
          if (!this.isAssetAlreadyInDOM(asset.name) && !this.loadedAssets.has(asset.name)) {
            pending.add(asset.name);
          }
        });
      });

      const summary = {
        ready: pending.size === 0,
        pending: Array.from(pending)
      };
      this.log('Dependency readiness check', summary);
      return summary;
    });
  }

  async ensureAssetDependencies(dependencies = [], options = {}) {
    return this.logGroup('Dependencies › ensureAssetDependencies', async () => {
      this.log('Ensuring dependencies', { dependencies, options });
      const { names, flags } = this._normalizeDependencyInput(dependencies);
      const assetsByName = new Map();

      names.forEach(name => {
        if (this.assetMap.has(name)) {
          assetsByName.set(name, this.assetMap.get(name));
        } else {
          this.log(`Unknown asset dependency "${name}"`);
        }
      });

      flags.forEach(flag => {
        const assets = this.getAssetsByFlags([flag]);
        if (assets.length === 0) {
          this.log(`No assets registered for flag "${flag}"`);
        }
        assets.forEach(asset => assetsByName.set(asset.name, asset));
      });

      if (assetsByName.size === 0) {
        this.log('No matching assets found for dependency request');
        return {
          satisfied: [],
          failed: [],
          alreadyReady: [],
          attempted: [],
          triggeredLoads: [],
          skipped: true
        };
      }

      const alreadyReady = [];
      const inFlightPromises = [];
      const toLoad = [];

      assetsByName.forEach((asset, name) => {
        const ready = this.isAssetAlreadyInDOM(name) || this.loadedAssets.has(name);
        if (ready) {
          alreadyReady.push(name);
        } else if (this.inFlightAssets.has(name)) {
          inFlightPromises.push(this.inFlightAssets.get(name));
          this.log('Waiting for in-flight asset', { name });
        } else {
          toLoad.push(asset);
        }
      });

      this.log('Dependency evaluation summary', {
        alreadyReady,
        toLoad: toLoad.map(a => a.name),
        waiting: inFlightPromises.length
      });

      let loadResults = [];
      if (toLoad.length > 0) {
        this.log('Triggering asset loads for dependencies', { assets: toLoad.map(a => a.name) });
        const loadPromise = this._loadAssetsWithPipeline(toLoad)
          .then(results => {
            loadResults = results;
            return results;
          })
          .finally(() => {
            toLoad.forEach(asset => this.inFlightAssets.delete(asset.name));
            this.log('Asset loads completed for dependencies', { assets: toLoad.map(a => a.name) });
          });

        toLoad.forEach(asset => this.inFlightAssets.set(asset.name, loadPromise));
        inFlightPromises.push(loadPromise);
      }

      if (inFlightPromises.length > 0) {
        this.log('Waiting for dependency assets to finish loading', { count: inFlightPromises.length });
        await Promise.allSettled(inFlightPromises);
      }

      const satisfied = [];
      const failed = [];

      assetsByName.forEach((asset, name) => {
        const ready = this.isAssetAlreadyInDOM(name) || this.loadedAssets.has(name);
        if (ready) {
          satisfied.push(name);
        } else {
          failed.push(name);
        }
      });

      const resultFailures = (loadResults || [])
        .filter(item => item && item.error)
        .map(item => item.asset)
        .filter(Boolean);

      resultFailures.forEach(name => {
        if (!failed.includes(name)) failed.push(name);
      });

      if (failed.length > 0 && options.strict) {
        this.log('Dependency loading failed in strict mode', { failed });
        throw new Error(`Asset dependencies not satisfied: ${failed.join(', ')}`);
      }

      const summary = {
        satisfied: Array.from(new Set(satisfied)),
        failed: Array.from(new Set(failed)),
        alreadyReady: Array.from(new Set(alreadyReady)),
        attempted: Array.from(assetsByName.keys()),
        triggeredLoads: toLoad.map(asset => asset.name)
      };
      this.log('Dependency ensure completed', summary);
      return summary;
    });
  }

  async ensureAssetsForDefinition(definition, options = {}) {
    const dependencies = definition?.assetDependencies;
    if (!dependencies || dependencies.length === 0) {
      this.log('ensureAssetsForDefinition: no assetDependencies declared');
      return {
        satisfied: [],
        failed: [],
        alreadyReady: [],
        attempted: [],
        triggeredLoads: [],
        skipped: true
      };
    }
    return this.ensureAssetDependencies(dependencies, options);
  }

  areAssetsReadyForDefinition(definition) {
    const dependencies = definition?.assetDependencies;
    if (!dependencies || dependencies.length === 0) {
      return { ready: true, pending: [] };
    }
    return this.areAssetDependenciesReady(dependencies);
  }

  sortByPriority(assets) {
    const weights = { critical: 3, high: 2, normal: 1, low: 0 };
    return this.logGroup('Helper › sortByPriority', () => {
      return assets.slice().sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
    });
  }

  getAssetsByFlags(flags, matchAll = false) {
    return this.logGroup('Helper › getAssetsByFlags', () => {
      if (matchAll) {
        return this.config.filter(asset => flags.every(f => asset.flags.includes(f)));
      }
      return this.config.filter(asset => asset.flags.some(f => flags.includes(f)));
    });
  }

  resolveDependencies(assets) {
    return this.logGroup('Helper › resolveDependencies', () => {
      const sorted = [];
      const visited = new Set();

      const visit = (asset, stack = []) => {
        if (visited.has(asset.name)) return;
        stack.push(asset.name);

        for (const depName of asset.dependencies) {
          const dep = this.config.find(a => a.name === depName);
          if (!dep) {
            this.log(`Missing dependency "${depName}" for asset ${asset.name}`);
            continue;
          }
          if (stack.includes(depName)) {
            this.log('Circular dependency detected', { stack, depName });
            continue;
          }
          visit(dep, stack.slice());
        }

        visited.add(asset.name);
        sorted.push(asset);
      };

      assets.forEach(asset => visit(asset));
      return sorted;
    });
  }

  async loadAssetsInParallelWithThrottle(assets, maxConcurrent) {
    return this.logGroup('Helper › loadAssetsInParallelWithThrottle', async () => {
      const results = [];
      const queue = assets.slice();
      const running = [];

      const enqueue = () => {
        while (running.length < maxConcurrent && queue.length) {
          const asset = queue.shift();
          const p = this.loadAsset(asset)
            .then(res => results.push(res))
            .catch(err => results.push({ error: err.message, asset: asset.name }))
            .finally(() => {
              running.splice(running.indexOf(p), 1);
            });
          running.push(p);
        }
      };

      enqueue();
      while (running.length) {
        await Promise.race(running);
        enqueue();
      }
      return results;
    });
  }

  async loadAsset(asset, retryCount = 0) {
    return this.logGroup(`Helper › loadAsset (${asset.name})`, async () => {
      try {
        this.log('Starting asset load', { name: asset.name, attempt: retryCount + 1 });
        const loadPromise = this._loadAssetCore(asset);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Load timeout')), asset.timeout || 10000)
        );

        const result = await Promise.race([loadPromise, timeoutPromise]);
        this.loadedAssets.add(asset.name);
        this.failedAssets.delete(asset.name);
        this.log('Asset load completed', { name: asset.name, url: result.url, skipped: result.skipped });
        return result;
      } catch (error) {
        this.log('Asset load failed', { name: asset.name, error: error.message, attempt: retryCount + 1 });
        const maxRetries = asset.retry || 0;
        if (retryCount < maxRetries) {
          const backoff = Math.pow(2, retryCount) * 1000;
          this.log('Scheduling retry for asset', { name: asset.name, backoff });
          await new Promise(resolve => setTimeout(resolve, backoff));
          return this.loadAsset(asset, retryCount + 1);
        }
        this.failedAssets.set(asset.name, retryCount);
        throw error;
      }
    });
  }

  async _loadAssetCore(asset) {
    let url = this.normalizeUrl(asset.url);
    url = this.applyVersioning(url, asset);

    if (this.isAssetAlreadyInDOM(asset.name)) {
      return { name: asset.name, type: asset.type, url, skipped: true };
    }

    const el = this.createElementForAsset({ ...asset, url });
    const inserted = this.insertAssetElement(el, asset);
    if (!inserted.success && inserted.fallback) {
      this.log('Failed to insert after selector, used fallback', { name: asset.name });
    }

    return new Promise((resolve, reject) => {
      el.onload = () => resolve({ name: asset.name, type: asset.type, url });
      el.onerror = () => reject(new Error(`Failed to load ${asset.name}`));
    });
  }

  removeAssetFromDOM(name) {
    return this.logGroup('Helper › removeAssetFromDOM', () => {
      const el = document.querySelector(`[data-asset-name="${CSS.escape(name)}"]`);
      if (el) {
        el.remove();
        this.loadedAssets.delete(name);
        this.log('Asset removed', { name });
      } else {
        this.log('Asset element not found', { name });
      }
    });
  }

  normalizeUrl(url) {
    this.log('normalizeUrl', { url });
    try {
      const urlObj = new URL(url, window.location.origin);
      urlObj.search = '';
      return urlObj.href.replace(window.location.origin, '');
    } catch (error) {
      return url.split('?')[0];
    }
  }

  applyVersioning(url, asset) {
    return this.logGroup('Helper › applyVersioning', () => {
      try {
        const urlObj = new URL(url, window.location.origin);
        const params = new URLSearchParams(urlObj.search);
        const version = asset.version || this.globalVersion;
        if (version) params.set('ver', version);
        if (asset.critical) params.set('critical', '1');
        urlObj.search = params.toString();
        return urlObj.href.replace(window.location.origin, '');
      } catch (error) {
        this.log('applyVersioning fallback', { error });
        return url;
      }
    });
  }

  createElementForAsset(asset) {
    return this.logGroup('Helper › createElementForAsset', () => {
      let el;
      switch (asset.type) {
        case 'script':
          el = document.createElement('script');
          el.src = asset.url;
          el.async = false;
          el.defer = false;
          if (asset.defer) el.defer = true;
          if (asset.async) el.async = true;
          if (asset.nonce || this.globalNonce) el.nonce = asset.nonce || this.globalNonce;
          break;
        case 'css':
        case 'style':
          el = document.createElement('link');
          el.rel = 'stylesheet';
          el.href = asset.url;
          if (asset.media) el.media = asset.media;
          if (asset.nonce || this.globalNonce) el.nonce = asset.nonce || this.globalNonce;
          break;
        case 'image':
          el = document.createElement('img');
          el.src = asset.url;
          if (asset.imagesrcset) {
            el.srcset = asset.imagesrcset;
            el.sizes = asset.imagesizes;
          }
          if (asset.crossOrigin) el.crossOrigin = asset.crossOrigin;
          break;
        case 'video':
          el = document.createElement('video');
          el.src = asset.url;
          if (asset.crossOrigin) el.crossOrigin = asset.crossOrigin;
          break;
        case 'font':
          el = document.createElement('link');
          el.rel = 'preload';
          el.as = 'font';
          el.href = asset.url;
          el.crossOrigin = asset.crossOrigin || 'anonymous';
          break;
        case 'icon':
          el = document.createElement('link');
          el.rel = 'icon';
          el.href = asset.url;
          break;
        case 'svg':
          el = document.createElement('object');
          el.data = asset.url;
          el.type = 'image/svg+xml';
          break;
        case 'object':
        case 'embed':
          el = document.createElement(asset.type);
          if (asset.type === 'object') {
            el.data = asset.url;
          } else {
            el.src = asset.url;
          }
          break;
        default:
          this.log('Unknown asset type, defaulting to script', { type: asset.type });
          el = document.createElement('script');
          el.src = asset.url;
      }

      el.setAttribute('data-asset-name', asset.name);
      return el;
    });
  }

  insertAssetElement(el, asset) {
    return this.logGroup('Helper › insertAssetElement', () => {
      let assetInfo = asset;
      let location = 'head-last';
      let afterSelector;

      if (typeof asset === 'string') {
        location = asset || 'head-last';
        assetInfo = { location };
      } else if (asset && typeof asset === 'object') {
        location = asset.location || 'head-last';
        afterSelector = asset.after;
      } else {
        assetInfo = { location };
      }

      let success = false;
      let fallback = false;

      if (afterSelector) {
        const refEl = document.querySelector(afterSelector);
        if (refEl) {
          refEl.insertAdjacentElement('afterend', el);
          success = true;
        } else {
          this.log('`after` selector not found; using location fallback', { selector: afterSelector });
          fallback = true;
        }
      }

      if (!success) {
        if ((location.startsWith('footer') || location === 'body') && !document.body) {
          this.log('document.body not ready; appending to head-last');
          document.head.appendChild(el);
        } else {
          switch (location) {
            case 'head-first':
              document.head.insertBefore(el, document.head.firstChild);
              break;
            case 'head-last':
              document.head.appendChild(el);
              break;
            case 'footer-first':
            case 'body-first':
              document.body.insertBefore(el, document.body.firstChild);
              break;
            case 'footer-last':
            case 'body-last':
              document.body.appendChild(el);
              break;
            default:
              this.log('Unknown location; defaulting to head-last', { location });
              document.head.appendChild(el);
          }
        }
        success = true;
      }

      this.log('Element inserted', { name: assetInfo.name, location, after: afterSelector });
      return { success, fallback };
    });
  }

  registerPreloadHint(asset) {
    return this.logGroup('Advanced › registerPreloadHint', () => {
      let url = this.normalizeUrl(asset.url);
      url = this.applyVersioning(url, asset);

      const key = `${asset.type}:${url}`;
      if (this.preloadHints.has(key)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = asset.type === 'css' || asset.type === 'style' ? 'style' : asset.type;
      link.href = url;
      if (asset.type === 'image' && asset.imagesrcset) {
        link.imagesrcset = asset.imagesrcset;
        link.imagesizes = asset.imagesizes;
      }
      if (asset.crossOrigin) link.crossOrigin = asset.crossOrigin;
      if (asset.nonce || this.globalNonce) link.nonce = asset.nonce || this.globalNonce;

      document.head.appendChild(link);
      this.preloadHints.set(key, link);
      this.log('Preload hint injected', { link, url });
    });
  }

  warmCacheForAssets(...flags) {
    this.logGroup('Advanced › warmCacheForAssets', () => {
      this.log('Warming cache (stub)', { flags });
    });
  }

  dispose() {
    this.logGroup('Lifecycle › dispose', () => {
      this.eventListeners.forEach((handler, eventName) => {
        window.removeEventListener(eventName, handler);
      });
      this.eventListeners.clear();

      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];

      this.preloadHints.clear();
      this.inFlightAssets.clear();
      this.log('Disposed AssetHandler resources');
    });
  }

  getStatistics() {
    return {
      totalAssets: this.config.length,
      loadedAssets: this.loadedAssets.size,
      failedAssets: this.failedAssets.size,
      inFlightAssets: this.inFlightAssets.size,
      preloadHints: this.preloadHints.size,
      eventListeners: this.eventListeners.size,
      observers: this.observers.length,
      loadedList: Array.from(this.loadedAssets),
      failedList: Array.from(this.failedAssets.keys())
    };
  }

  logGroup(groupName, fn) {
    if (!this.debugMode) {
      try {
        return fn();
      } catch (err) {
        console.error(`AssetHandler: Error in group ${groupName}`, err);
        throw err;
      }
    }
    const group = console.group || console.log;
    const groupEnd = console.groupEnd || (() => { });
    group(`AssetHandler: ${groupName}`);
    try {
      const result = fn();
      groupEnd();
      return result;
    } catch (err) {
      console.error(`AssetHandler: Error in group ${groupName}`, err);
      groupEnd();
      throw err;
    }
  }

  log(message, data = {}) {
    if (this.debugMode) console.log(`AssetHandler: ${message}`, data);
  }
}

export default AssetHandler;
