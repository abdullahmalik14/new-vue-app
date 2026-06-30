import { markScannedElement } from '../utils/markScannedElement.js';
import { sleep } from '../utils/sleep.js';

export async function closeTrendPopup() {
  const closeBtn = document.querySelector('.close-button');
  if (closeBtn) {
    markScannedElement(closeBtn, 'Close trend popup');
    closeBtn.click();
    await sleep(400);
    return;
  }

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await sleep(400);
}
