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
      .dom-scan-lock-banner {
        background: #111827; color: #f9fafb; border: 2px solid #ef4444;
        border-radius: 10px; padding: 14px 20px; max-width: min(90vw, 720px);
        font: 600 14px/1.4 ui-sans-serif, system-ui, sans-serif;
        box-shadow: 0 12px 40px rgba(0,0,0,.5);
      }
      .dom-scan-lock-banner small {
        display: block; margin-top: 6px; font-weight: 400; color: #9ca3af;
      }
    </style>
    <div class="dom-scan-lock-banner">
      <span data-dom-scan-lock-title>DOM runner active</span>
      <small>Page locked — no reload. Popups and periods are opened automatically.</small>
    </div>
  `;
  document.body.appendChild(lockOverlay);
  return lockOverlay;
}

export function lockPageForDomScan(message) {
  const overlay = ensureLockOverlay();
  overlay.querySelector('[data-dom-scan-lock-title]').textContent = message;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function unlockPageAfterDomScan() {
  if (!lockOverlay) return;
  lockOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
