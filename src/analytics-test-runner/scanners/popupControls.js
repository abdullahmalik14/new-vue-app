import { markScannedElement } from '../utils/markScannedElement.js';
import { sleep } from '../utils/sleep.js';
import { periodMatchesLabel } from '../utils/periodMap.js';

export async function waitForPopupPaint(timeoutMs = 6000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const closeBtn = document.querySelector('.close-button');
    const popupRoot = closeBtn?.closest('.fixed, [class*="fixed"]');
    if (closeBtn && popupRoot) {
      await sleep(150);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return true;
    }
    await sleep(100);
  }

  return false;
}

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

/**
 * Switch popup period via the custom trends dropdown (Daily / Weekly / …).
 * @param {string} periodLabel - day | week | month | year
 */
export async function switchPopupPeriod(periodLabel) {
  const dropdown = document.querySelector('.select-dropdown');
  if (!dropdown) throw new Error(`Period dropdown not found for: ${periodLabel}`);

  const trigger = dropdown.querySelector('.trends-select, .dash-select__trigger');
  if (!trigger) throw new Error(`Period dropdown trigger not found for: ${periodLabel}`);

  markScannedElement(trigger, `Open period menu: ${periodLabel}`);
  trigger.click();
  await sleep(200);

  const optionNodes = Array.from(
    dropdown.querySelectorAll('.dash-options-container .option, .dash-options-container .option span'),
  );

  const target = optionNodes.find((element) => periodMatchesLabel(periodLabel, element.textContent));

  if (!target) {
    throw new Error(`Period option not found: ${periodLabel}`);
  }

  const clickable = target.closest('.option') || target;
  markScannedElement(clickable, `Period toggle: ${periodLabel}`);
  clickable.click();
  await sleep(250);
}
