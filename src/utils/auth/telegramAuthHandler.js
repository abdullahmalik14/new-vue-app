// vueApp-main-new/src/utils/auth/telegramAuthHandler.js

import { log } from "../common/logHandler";

/**
 * @file telegramAuthHandler.js
 * @description Telegram Login popup helper (no backend)
 * @purpose Opens a popup that hosts Telegram Login Widget and returns a state for postMessage validation
 */

function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Open Telegram Login popup.
 * Popup page is a normal Vue route: /auth/callback/social/telegram?state=...
 * @returns {Promise<{popup: Window, state: string}>}
 */
export async function initiateTelegramLogin() {
  log("telegramAuthHandler.js", "initiateTelegramLogin", "start", "Begin Telegram login popup flow", {});

  const state = generateState();
  // Use static HTML file for reliability (works even if Vue app isn't loaded on ngrok)
  // Supports using a public origin (ngrok) while the main app runs on localhost.
  const callbackOrigin = import.meta.env.VITE_TELEGRAM_CALLBACK_ORIGIN || window.location.origin;
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    throw new Error("Missing VITE_TELEGRAM_BOT_USERNAME");
  }

  const widgetVersion = import.meta.env.VITE_TELEGRAM_WIDGET_VERSION || "22";

  // Use static HTML file - more reliable for popups across different origins
  const popupPath = `/telegram-login.html?state=${encodeURIComponent(state)}&bot=${encodeURIComponent(
    botUsername
  )}&v=${encodeURIComponent(widgetVersion)}`;

  const popupUrl = `${callbackOrigin}${popupPath}`;

  const w = 520,
    h = 640;
  const left = screen.width / 2 - w / 2;
  const top = screen.height / 2 - h / 2;

  const popupWindow = window.open(
    popupUrl,
    "telegram_auth",
    `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`
  );

  if (!popupWindow) {
    throw new Error("Failed to open popup. Please allow popups for this site.");
  }

  log("telegramAuthHandler.js", "initiateTelegramLogin", "success", "Telegram popup opened", {
    state,
    popupPath
  });

  return { popup: popupWindow, state };
}


