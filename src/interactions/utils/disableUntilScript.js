/**
 * disableUntilScript.js  —  "Disable until script in DOM" interaction
 * ─────────────────────────────────────────────────────────────────────────────
 * Keeps an element (e.g. a Login / Sign-up button) disabled and click-blocked
 * until a required third-party script is present, then enables it automatically.
 *
 * Motivation: auth submits call into an external SDK (e.g. AWS Cognito). If the
 * user clicks before that script is in the DOM / its global is defined, the
 * action silently fails. This interaction gates the element until the script is
 * ready.
 *
 * Declarative usage via the `v-interactions` directive:
 *
 *   const gate = Object.freeze([{
 *     disableUntilScript: {
 *       global: 'AmazonCognitoIdentity',          // window global to wait for
 *       selector: 'script[src*="cognito"]',       // and/or a <script> in the DOM
 *       timeout: 30000,                            // ms before giving up (stays disabled)
 *       pollInterval: 100,                         // ms between checks
 *       disabledClass: 'is-script-pending'         // optional class while pending
 *     }
 *   }])
 *
 *   <button v-interactions="gate" type="submit">Log in</button>
 *
 * Readiness = ALL specified checks pass (global defined AND selector matches).
 * At least one of `global` / `selector` must be provided, otherwise it is a no-op.
 *
 * Events dispatched on the element (bubbling):
 *   - `interactions:script-pending`  when gating starts (element disabled)
 *   - `interactions:script-ready`    when the script becomes available (enabled)
 *   - `interactions:script-timeout`  when it never arrives (stays disabled)
 */

const DEFAULT_POLL_INTERVAL = 100;
const DEFAULT_TIMEOUT = 30000;

/**
 * @param {object} cfg
 * @returns {boolean} True when every configured check currently passes.
 */
export function isScriptGateReady(cfg) {
  if (!cfg || (!cfg.global && !cfg.selector)) return true;

  if (cfg.global) {
    if (typeof window === 'undefined' || typeof window[cfg.global] === 'undefined') {
      return false;
    }
  }

  if (cfg.selector) {
    if (typeof document === 'undefined' || !document.querySelector(cfg.selector)) {
      return false;
    }
  }

  return true;
}

function setDisabledState(el, disabled, disabledClass) {
  if (disabled) {
    el.setAttribute('disabled', '');
    el.setAttribute('aria-disabled', 'true');
    if (disabledClass) el.classList.add(disabledClass);
  } else {
    el.removeAttribute('disabled');
    el.removeAttribute('aria-disabled');
    if (disabledClass) el.classList.remove(disabledClass);
  }
}

/**
 * Disable + click-block `el` until the configured script is available.
 *
 * @param {HTMLElement} el - Element to gate.
 * @param {object} cfg - { global?, selector?, timeout?, pollInterval?, disabledClass? }
 * @returns {() => void} Cleanup function (clears timers + listeners). Always safe to call.
 */
export function setupDisableUntilScript(el, cfg) {
  if (!el || !cfg || (!cfg.global && !cfg.selector)) {
    return () => {};
  }

  // Already available: never disable a working element.
  if (isScriptGateReady(cfg)) {
    return () => {};
  }

  const pollInterval = Number.isFinite(cfg.pollInterval) ? cfg.pollInterval : DEFAULT_POLL_INTERVAL;
  const timeout = Number.isFinite(cfg.timeout) ? cfg.timeout : DEFAULT_TIMEOUT;
  const disabledClass = typeof cfg.disabledClass === 'string' && cfg.disabledClass.trim()
    ? cfg.disabledClass.trim()
    : null;

  let done = false;
  let intervalId = null;
  let timeoutId = null;

  // Capture-phase guard so even non-native / component buttons can't fire while pending.
  const blockClick = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  setDisabledState(el, true, disabledClass);
  el.addEventListener('click', blockClick, true);
  el.dispatchEvent(new CustomEvent('interactions:script-pending', {
    bubbles: true,
    detail: { source: el },
  }));

  const teardownTimers = () => {
    if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
    if (timeoutId !== null) { clearTimeout(timeoutId); timeoutId = null; }
  };

  const finish = (ready) => {
    if (done) return;
    done = true;
    teardownTimers();

    if (ready) {
      el.removeEventListener('click', blockClick, true);
      setDisabledState(el, false, disabledClass);
      el.dispatchEvent(new CustomEvent('interactions:script-ready', {
        bubbles: true,
        detail: { source: el },
      }));
    } else {
      // Timeout: keep it disabled — the action would not work without the script.
      el.dispatchEvent(new CustomEvent('interactions:script-timeout', {
        bubbles: true,
        detail: { source: el },
      }));
    }
  };

  intervalId = setInterval(() => {
    if (isScriptGateReady(cfg)) finish(true);
  }, pollInterval);

  timeoutId = setTimeout(() => finish(false), timeout);

  return () => {
    done = true;
    teardownTimers();
    el.removeEventListener('click', blockClick, true);
  };
}
