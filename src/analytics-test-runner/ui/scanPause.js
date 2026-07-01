import { analyticsTestState } from '../state.js';
import { lockPageForDomScan, unlockPageAfterDomScan } from './pageLock.js';

let resumeResolver = null;

/**
 * When enabled, unlocks the page and waits for the user to click Resume before each DOM scan step.
 * @param {string} stepLabel
 */
export async function waitForDomScanContinue(stepLabel) {
  if (!analyticsTestState.pauseDomScanBeforeEachStep) return;

  unlockPageAfterDomScan();
  lockPageForDomScan(`PAUSED — edit DOM if needed, then resume\n${stepLabel}`, { paused: true });

  await new Promise((resolve) => {
    resumeResolver = resolve;
  });

  resumeResolver = null;
  lockPageForDomScan(`DOM SCAN: ${stepLabel}`);
}

export function resumeDomScan() {
  if (resumeResolver) {
    resumeResolver();
  }
}

export function isDomScanWaitingForResume() {
  return resumeResolver != null;
}
