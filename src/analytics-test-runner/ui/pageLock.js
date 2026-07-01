import { resumeDomScan } from './scanPause.js';

let lockOverlay = null;

function ensureLockOverlay() {
  if (lockOverlay) return lockOverlay;

  lockOverlay = document.createElement('div');
  lockOverlay.setAttribute('data-dom-scan-lock', 'true');
  lockOverlay.innerHTML = `
    <style>
      [data-dom-scan-lock] {
        position: fixed; inset: 0; z-index: 99990;
        background: rgba(0, 0, 0, 0.35);
        display: none; align-items: flex-start; justify-content: center;
        padding-top: 72px; pointer-events: auto;
      }
      [data-dom-scan-lock].active { display: flex; }
      [data-dom-scan-lock].paused { background: rgba(0, 0, 0, 0.15); pointer-events: none; }
      [data-dom-scan-lock].paused .dom-scan-lock-banner { pointer-events: auto; border-color: #f59e0b; }
      .dom-scan-lock-banner {
        background: #111827; color: #f9fafb; border: 2px solid #ef4444;
        border-radius: 10px; padding: 14px 20px; max-width: min(90vw, 720px);
        font: 600 14px/1.4 ui-sans-serif, system-ui, sans-serif;
        box-shadow: 0 12px 40px rgba(0,0,0,.5);
      }
      .dom-scan-lock-banner small {
        display: block; margin-top: 6px; font-weight: 400; color: #9ca3af;
        white-space: pre-wrap;
      }
      .dom-scan-lock-banner button {
        margin-top: 10px; padding: 8px 14px; border-radius: 8px;
        border: 1px solid #3b82f6; background: #2563eb; color: #fff;
        font: 600 13px/1 ui-sans-serif, system-ui, sans-serif; cursor: pointer;
      }
      .dom-scan-lock-banner button:hover { background: #1d4ed8; }
    </style>
    <div class="dom-scan-lock-banner">
      <span data-dom-scan-lock-title>DOM runner active</span>
      <small data-dom-scan-lock-subtitle>Page locked — no reload. Popups and periods are opened automatically.</small>
      <button type="button" data-dom-scan-resume hidden>Resume DOM scan</button>
    </div>
  `;
  document.body.appendChild(lockOverlay);

  lockOverlay.querySelector('[data-dom-scan-resume]').addEventListener('click', () => {
    resumeDomScan();
  });

  return lockOverlay;
}

/**
 * @param {string} message
 * @param {{ paused?: boolean }} [options]
 */
export function lockPageForDomScan(message, options = {}) {
  const overlay = ensureLockOverlay();
  const lines = String(message).split('\n');
  overlay.querySelector('[data-dom-scan-lock-title]').textContent = lines[0] || message;
  const subtitle = overlay.querySelector('[data-dom-scan-lock-subtitle]');
  subtitle.textContent = lines.slice(1).join('\n') || subtitle.textContent;

  const resumeBtn = overlay.querySelector('[data-dom-scan-resume]');
  if (options.paused) {
    overlay.classList.add('paused');
    resumeBtn.hidden = false;
    document.body.style.overflow = '';
  } else {
    overlay.classList.remove('paused');
    resumeBtn.hidden = true;
    document.body.style.overflow = 'hidden';
  }

  overlay.classList.add('active');
}

export function unlockPageAfterDomScan() {
  if (!lockOverlay) return;
  lockOverlay.classList.remove('active', 'paused');
  lockOverlay.querySelector('[data-dom-scan-resume]').hidden = true;
  document.body.style.overflow = '';
}
