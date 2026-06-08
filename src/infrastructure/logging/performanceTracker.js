/**
 * PerfTracker (class)
 * Progressive performance timeline logger with console.table output.
 * Works in browser (via <script>) and Node (via require/import).
 *
 * Usage (Browser):
 *   <script>window.enabledTimeLogger = true;</script>
 *   <script src="PerfTracker.js"></script>
 *   <script>
 *     const pt = new PerfTracker('navigation'); // reads window.enabledTimeLogger
 *     pt.start();
 *     pt.step({ step:'getConfig', file:'route/index.js', method:'getRouteConfig', flag:'cache', purpose:'load config' });
 *     pt.step({ step:'processConfig', file:'route/index.js', method:'inheritFromParentConfig', flag:'merge', purpose:'apply parent rules' });
 *     console.table(pt.table());
 *   </script>
 *
 * Usage (Node/CommonJS):
 *   const PerfTracker = require('./PerfTracker');
 *   const pt = new PerfTracker('boot', { enabled: true });
 *   pt.start();
 *   pt.step({ step:'init', file:'server.js', method:'initApp', flag:'setup', purpose:'Initialize app' });
 *   console.table(pt.table());
 */

(function (global) {
  class PerfTracker {
    /**
     * @param {string} label - Session label for display.
     * @param {object} [opts]
     * @param {boolean} [opts.enabled] - Override logging toggle. Defaults to window.enabledTimeLogger in browser, true in Node if not provided.
     * @param {number}  [opts.autoResetMaxRows=1000] - Safety cap to prevent runaway tables in dev loops.
     */
    constructor(label = 'default', opts = {}) {
      this.label = String(label);
      this._hasPerf = typeof performance !== 'undefined' && typeof performance.now === 'function';
      this._now = () => (this._hasPerf ? performance.now() : Date.now());
      this._rows = [];
      this._startTs = null;
      this._lastTs = null;
      this._autoResetMaxRows = typeof opts.autoResetMaxRows === 'number' ? opts.autoResetMaxRows : 1000;

      // enabled default: browser -> window.enabledTimeLogger; node -> true
      const browserFlag =
        typeof global !== 'undefined' &&
          typeof global.enabledTimeLogger !== 'undefined'
          ? !!global.enabledTimeLogger
          : undefined;

      this.enabled =
        typeof opts.enabled === 'boolean'
          ? opts.enabled
          : (typeof window !== 'undefined' ? (browserFlag !== undefined ? browserFlag : true) : true);
    }

    /** Begin a new timing session and insert a baseline row. */
    start() {
      const t0 = this._now();
      this._startTs = t0;
      this._lastTs = t0;
      this._pushRow({
        step: 'start',
        deltaMs: 0,
        totalMs: 0,
        file: '',
        method: '',
        flag: 'baseline',
        purpose: 'session start',
      });
      this._print();
      return this;
    }

    /**
     * Record a step.
     * @param {object} e
     * @param {string} e.step    - Short label for this point in the flow.
     * @param {string} [e.file]  - Source filename (e.g., "route/index.js").
     * @param {string} [e.method]- Source method (e.g., "runRouteGuards").
     * @param {string} [e.flag]  - Short tag (e.g., "cache"|"merge"|"auth").
     * @param {string} [e.purpose]- Human-readable purpose for this step.
     */
    step({ step, file, method, flag, purpose } = {}) {
      // Silently return if tracker is disabled (no need to track anything)
      if (!this.enabled) {
        return this;
      }

      // If session hasn't been started or was reset, silently return
      // This prevents errors during rapid navigation when session may have ended
      if (this._startTs == null) {
        return this;
      }

      const tNow = this._now();
      const delta = tNow - this._lastTs;
      const total = tNow - this._startTs;

      this._pushRow({
        step: String(step ?? ''),
        deltaMs: delta,
        totalMs: total,
        file: file || '',
        method: method || '',
        flag: flag || '',
        purpose: purpose || '',
      });

      this._lastTs = tNow;

      // Safety cap
      if (this._rows.length > this._autoResetMaxRows) {
        if (this.enabled) console.warn(`[PerfTracker] Auto-reset after ${this._rows.length} rows for session "${this.label}"`);
        this.reset();
        return this;
      }

      this._print();
      return this;
    }

    /** Return a copy of the current table rows (pretty formatted). */
    table() {
      return this._rows.map(r => ({
        step: r.step,
        'Δ time': this._fmtSec(r.deltaMs),
        total: this._fmtSec(r.totalMs),
        source: this._formatSource(r.file, r.method),
        note: this._formatNote(r.flag, r.purpose),
      }));
    }

    /** Reset the session (clears all rows and timestamps). */
    reset() {
      this._rows = [];
      this._startTs = null;
      this._lastTs = null;
      return this;
    }

    // ----------------- internals -----------------

    _assertStarted() {
      if (this._startTs == null) {
        throw new Error('[PerfTracker] Session not started. Call .start() first.');
      }
    }

    _pushRow({ step, deltaMs, totalMs, file, method, flag, purpose }) {
      this._rows.push({ step, deltaMs, totalMs, file, method, flag, purpose });
    }

    _fmtSec(ms) {
      return `${(ms / 1000).toFixed(2)}s`;
    }

    _formatSource(file, method) {
      const f = String(file || '').trim();
      const m = String(method || '').trim();
      if (f && m) return `${f} → ${m}`;
      if (f) return f;
      if (m) return m;
      return '';
    }

    _formatNote(flag, purpose) {
      const f = String(flag || '').trim();
      const p = String(purpose || '').trim();
      if (f && p) return `${f} — ${p}`;
      if (f) return f;
      if (p) return p;
      return '';
    }

    _print() {
      if (!this.enabled) return;
      const table = this.table();
      try {
        console.log(`[PerfTracker] session="${this.label}" events=${table.length}`);
        console.table(table);
      } catch {
        console.log(`[PerfTracker] session="${this.label}"`);
        console.log(JSON.stringify(table, null, 2));
      }
    }

    // --------- static helpers ---------

    /**
     * Convenience: create, start, and return an instance.
     * @param {string} label
     * @param {object} opts
     */
    static create(label = 'default', opts = {}) {
      return new PerfTracker(label, opts).start();
    }
  }

  // UMD-style export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerfTracker; // Node/CommonJS
  } else if (typeof define === 'function' && define.amd) {
    // eslint-disable-next-line no-undef
    define([], () => PerfTracker);
  } else {
    global.PerfTracker = PerfTracker; // Browser global
  }
})(typeof window !== 'undefined' ? window : globalThis);

export default PerfTracker;
